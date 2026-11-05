import time
import math
from datetime import datetime
from collections import deque, defaultdict
from typing import Dict, Any, List, Optional
from ..models.schemas import (
    TelemetrySnapshot, CaptureStatus, LayerStat, ProtocolStat, ConnectionItem,
    GraphData, GraphNode, GraphLink, TimeSeriesPoint
)
from ..config import settings
from .layer_mapper import layer_mapper, OSI_LAYERS_META, TCPIP_LAYERS_META
from ..security.detector import security_detector

def is_private_ip(ip: str) -> bool:
    if not ip:
        return False
    if ip.startswith("192.168.") or ip.startswith("10.") or ip.startswith("127.") or ip.startswith("fe80:") or ip.startswith("fc") or ip.startswith("fd"):
        return True
    if ip.startswith("172."):
        parts = ip.split(".")
        if len(parts) >= 2 and parts[1].isdigit():
            val = int(parts[1])
            return 16 <= val <= 31
    return False

def is_broadcast_or_multicast(ip: str) -> bool:
    if not ip:
        return False
    return (
        ip == "255.255.255.255" or 
        ip.startswith("224.") or 
        ip.startswith("239.") or 
        ip.lower().startswith("ff0") or 
        "ff:ff:ff:ff:ff:ff" in ip.lower()
    )

class StatsEngine:
    def __init__(self):
        self.reset()

    def reset(self):
        self.total_packets: int = 0
        self.total_bytes: int = 0
        self.started_at: Optional[float] = None
        
        # Sliding window para pps/bps global e por protocolo (últimos 2.0s)
        # Cada item: (timestamp, length, set_of_norm_protocols)
        self.window_events: deque = deque()
        
        # Estatísticas cumulativas por protocolo normalizado
        self.protocol_stats: Dict[str, Dict[str, int]] = defaultdict(lambda: {"packets": 0, "bytes": 0})
        
        # Estatísticas por camada OSI (1 a 7)
        self.osi_stats: Dict[int, Dict[str, Any]] = {
            i: {"packets": 0, "bytes": 0, "protocols": set()} for i in range(1, 8)
        }
        
        # Estatísticas por camada TCP/IP
        self.tcpip_stats: Dict[str, Dict[str, Any]] = {
            k: {"packets": 0, "bytes": 0, "protocols": set()} for k in TCPIP_LAYERS_META.keys()
        }
        
        # Conexões e sessões ativas
        self.connections: Dict[str, ConnectionItem] = {}
        self.ip_traffic: Dict[str, int] = defaultdict(int)
        self.unique_ips: set[str] = set()

        # Série temporal (últimos 30 pontos)
        self.time_series: deque[TimeSeriesPoint] = deque(maxlen=30)
        self._current_bucket_sec: int = 0
        self._current_bucket_packets: int = 0
        self._current_bucket_bytes: int = 0
        self._current_bucket_protos: Dict[str, int] = defaultdict(int)

        # Reinicia detector de segurança
        security_detector.reset()

    def record_packet(self, pkt: Dict[str, Any]):
        now = time.time()
        if self.started_at is None:
            self.started_at = now

        length = pkt.get("length", 0)
        self.total_packets += 1
        self.total_bytes += length

        raw_proto_stack = pkt.get("protocols", [])
        top_app_raw = pkt.get("high_level_proto") or ""

        # Filtra pseudo-protocolos internos do Wireshark (ethertype, data, frame...)
        clean_protos: List[str] = []
        for p in raw_proto_stack:
            if not layer_mapper.is_internal(p):
                norm_p = layer_mapper.normalize_id(p)
                if not clean_protos or clean_protos[-1] != norm_p:
                    clean_protos.append(norm_p)

        # Se o TShark identificou SSL/TLS na coluna Protocol mas não no stack de frame.protocols
        if top_app_raw and not layer_mapper.is_internal(top_app_raw):
            norm_top = layer_mapper.normalize_id(top_app_raw)
            if norm_top not in clean_protos:
                clean_protos.append(norm_top)

        # Janela deslizante
        self.window_events.append((now, length, set(clean_protos)))
        cutoff = now - 2.0
        while self.window_events and self.window_events[0][0] < cutoff:
            self.window_events.popleft()

        # Atualiza série temporal (bucket por segundo ou por lote de pacotes em PCAP rápido)
        pkt_epoch = pkt.get("epoch") or now
        bucket_sec = int(pkt_epoch * 2)  # resolução de 0.5s para gráficos fluidos
        if self._current_bucket_sec == 0:
            self._current_bucket_sec = bucket_sec
        elif bucket_sec != self._current_bucket_sec:
            ts_val = self._current_bucket_sec / 2.0
            label = datetime.fromtimestamp(ts_val).strftime("%H:%M:%S")
            self.time_series.append(TimeSeriesPoint(
                timestamp=ts_val,
                time_label=label,
                packets=self._current_bucket_packets,
                bytes=self._current_bucket_bytes,
                protocols=dict(self._current_bucket_protos)
            ))
            self._current_bucket_sec = bucket_sec
            self._current_bucket_packets = 0
            self._current_bucket_bytes = 0
            self._current_bucket_protos.clear()

        self._current_bucket_packets += 1
        self._current_bucket_bytes += length
        for cp in clean_protos:
            info = layer_mapper.get_info(cp)
            if info.get("osi", 7) >= 3:
                self._current_bucket_protos[info.get("acronym") or cp.upper()] += 1

        # Rastreia IPs
        src_ip = pkt.get("ip_src")
        dst_ip = pkt.get("ip_dst")
        if src_ip:
            self.unique_ips.add(src_ip)
            self.ip_traffic[src_ip] += length
        if dst_ip:
            self.unique_ips.add(dst_ip)
            self.ip_traffic[dst_ip] += length

        # Atualiza protocolos e camadas
        seen_layers_osi = set()
        seen_layers_tcpip = set()
        seen_protos_in_pkt = set()

        for proto_key in clean_protos:
            if proto_key in seen_protos_in_pkt:
                continue
            seen_protos_in_pkt.add(proto_key)

            info = layer_mapper.get_info(proto_key)
            osi_l = info.get("osi", 7)
            tcpip_l = info.get("tcpip", "application")
            badge_label = info.get("acronym") or info.get("name") or proto_key.upper()

            self.protocol_stats[proto_key]["packets"] += 1
            self.protocol_stats[proto_key]["bytes"] += length

            if osi_l not in seen_layers_osi:
                self.osi_stats[osi_l]["packets"] += 1
                self.osi_stats[osi_l]["bytes"] += length
                seen_layers_osi.add(osi_l)
            self.osi_stats[osi_l]["protocols"].add(badge_label)

            if tcpip_l not in seen_layers_tcpip:
                self.tcpip_stats[tcpip_l]["packets"] += 1
                self.tcpip_stats[tcpip_l]["bytes"] += length
                seen_layers_tcpip.add(tcpip_l)
            self.tcpip_stats[tcpip_l]["protocols"].add(badge_label)

        # Inspeciona segurança
        security_detector.inspect_packet({
            **pkt,
            "protocols": clean_protos
        })

        # Rastreamento de Conexão / Flow
        if src_ip and dst_ip:
            sport = pkt.get("src_port") or 0
            dport = pkt.get("dst_port") or 0
            trans = pkt.get("transport", "RAW")
            app_label = clean_protos[-1].upper() if clean_protos else (top_app_raw or "RAW")
            
            flow_key = f"{src_ip}:{sport}->{dst_ip}:{dport}/{trans}"
            
            if flow_key not in self.connections:
                if len(self.connections) > 1200:
                    oldest_k = next(iter(self.connections))
                    del self.connections[oldest_k]

                self.connections[flow_key] = ConnectionItem(
                    id=flow_key,
                    src_ip=src_ip,
                    dst_ip=dst_ip,
                    src_port=sport if sport > 0 else None,
                    dst_port=dport if dport > 0 else None,
                    transport=trans,
                    app_protocol=app_label,
                    packet_count=1,
                    byte_count=length,
                    first_seen=pkt_epoch,
                    last_seen=pkt_epoch,
                    duration_sec=0.001,
                    encapsulation=[p.upper() for p in clean_protos]
                )
            else:
                conn = self.connections[flow_key]
                conn.packet_count += 1
                conn.byte_count += length
                conn.last_seen = max(conn.last_seen, pkt_epoch)
                conn.duration_sec = max(0.001, round(conn.last_seen - conn.first_seen, 3))
                if app_label and app_label not in ("RAW", "TCP", "UDP", "IPV4", "ETH"):
                    conn.app_protocol = app_label
                if len(clean_protos) > len(conn.encapsulation):
                    conn.encapsulation = [p.upper() for p in clean_protos]

    def _build_graph_data(self) -> GraphData:
        nodes_dict: Dict[str, GraphNode] = {}
        links_list: List[GraphLink] = []

        max_traffic = max(self.ip_traffic.values()) if self.ip_traffic else 1

        for ip in self.unique_ips:
            traffic = self.ip_traffic.get(ip, 0)
            if is_broadcast_or_multicast(ip):
                cat = "multicast"
            elif is_private_ip(ip):
                cat = "internal"
            else:
                cat = "external"

            ratio = (math.log(max(1, traffic)) / math.log(max(2, max_traffic))) if max_traffic > 1 else 0.5
            size = round(18 + (ratio * 30), 1)

            nodes_dict[ip] = GraphNode(
                id=ip,
                name=ip,
                category=cat,
                symbolSize=size,
                value=traffic
            )

        ip_links: Dict[tuple, Dict[str, Any]] = defaultdict(lambda: {
            "packets": 0, "bytes": 0, "protocols": set(), "transports": set()
        })

        for conn in self.connections.values():
            pair = (conn.src_ip, conn.dst_ip)
            ip_links[pair]["packets"] += conn.packet_count
            ip_links[pair]["bytes"] += conn.byte_count
            proto_name = conn.app_protocol or conn.transport
            if proto_name and proto_name != "RAW":
                ip_links[pair]["protocols"].add(proto_name)
            ip_links[pair]["transports"].add(conn.transport)

        for (src, dst), data in ip_links.items():
            if src in nodes_dict and dst in nodes_dict:
                proto_label = ", ".join(sorted(list(data["protocols"]))) if data["protocols"] else "RAW"
                trans_label = "/".join(sorted(list(data["transports"])))
                links_list.append(GraphLink(
                    source=src,
                    target=dst,
                    protocol=proto_label,
                    transport=trans_label,
                    packet_count=data["packets"],
                    byte_count=data["bytes"],
                    label=f"{proto_label} ({data['packets']} pkts)"
                ))

        return GraphData(
            nodes=list(nodes_dict.values()),
            links=links_list
        )

    def get_snapshot(self, status: CaptureStatus) -> TelemetrySnapshot:
        now = time.time()
        
        cutoff = now - 2.0
        while self.window_events and self.window_events[0][0] < cutoff:
            self.window_events.popleft()

        duration = max(0.5, (now - self.window_events[0][0])) if self.window_events else 1.0
        window_bytes = sum(b for _, b, _ in self.window_events)
        window_packets = len(self.window_events)
        
        pps = round(window_packets / duration, 1) if self.window_events else 0.0
        bps = round((window_bytes * 8) / duration, 1) if self.window_events else 0.0

        # Taxa por protocolo na janela ativa
        proto_window_pkts: Dict[str, int] = defaultdict(int)
        proto_window_bytes: Dict[str, int] = defaultdict(int)
        for _, b, p_set in self.window_events:
            for p_k in p_set:
                proto_window_pkts[p_k] += 1
                proto_window_bytes[p_k] += b

        osi_dict: Dict[str, LayerStat] = {}
        for layer_num in range(1, 8):
            st = self.osi_stats[layer_num]
            meta = OSI_LAYERS_META[layer_num]
            pct_p = round((st["packets"] / self.total_packets * 100), 2) if self.total_packets > 0 else 0.0
            pct_b = round((st["bytes"] / self.total_bytes * 100), 2) if self.total_bytes > 0 else 0.0
            osi_dict[str(layer_num)] = LayerStat(
                layer_id=layer_num,
                name=meta["name"],
                packet_count=st["packets"],
                byte_count=st["bytes"],
                percentage_packets=pct_p,
                percentage_bytes=pct_b,
                protocols=sorted(list(st["protocols"]))
            )

        tcpip_dict: Dict[str, LayerStat] = {}
        for layer_k, meta in TCPIP_LAYERS_META.items():
            st = self.tcpip_stats[layer_k]
            pct_p = round((st["packets"] / self.total_packets * 100), 2) if self.total_packets > 0 else 0.0
            pct_b = round((st["bytes"] / self.total_bytes * 100), 2) if self.total_bytes > 0 else 0.0
            tcpip_dict[layer_k] = LayerStat(
                layer_id=layer_k,
                name=meta["name"],
                packet_count=st["packets"],
                byte_count=st["bytes"],
                percentage_packets=pct_p,
                percentage_bytes=pct_b,
                protocols=sorted(list(st["protocols"]))
            )

        top_protos: List[ProtocolStat] = []
        sorted_protos = sorted(self.protocol_stats.items(), key=lambda x: x[1]["packets"], reverse=True)[:15]
        for proto_k, st in sorted_protos:
            info = layer_mapper.get_info(proto_k)
            pct_p = round((st["packets"] / self.total_packets * 100), 2) if self.total_packets > 0 else 0.0
            pct_b = round((st["bytes"] / self.total_bytes * 100), 2) if self.total_bytes > 0 else 0.0
            p_pps = round(proto_window_pkts.get(proto_k, 0) / duration, 1) if self.window_events else 0.0
            p_bps = round((proto_window_bytes.get(proto_k, 0) * 8) / duration, 1) if self.window_events else 0.0

            top_protos.append(ProtocolStat(
                protocol=proto_k,
                name=info.get("acronym") or info.get("name", proto_k.upper()),
                osi_layer=info.get("osi", 7),
                tcp_ip_layer=info.get("tcpip", "application"),
                packet_count=st["packets"],
                byte_count=st["bytes"],
                percentage_packets=pct_p,
                percentage_bytes=pct_b,
                packets_per_sec=p_pps,
                bytes_per_sec=p_bps,
            ))

        recent_conns = sorted(self.connections.values(), key=lambda c: c.packet_count, reverse=True)[:35]
        graph_data = self._build_graph_data()

        # Série temporal incluindo bucket em andamento
        series_list = list(self.time_series)
        if self._current_bucket_packets > 0:
            ts_val = self._current_bucket_sec / 2.0 if self._current_bucket_sec else now
            series_list.append(TimeSeriesPoint(
                timestamp=ts_val,
                time_label=datetime.fromtimestamp(ts_val).strftime("%H:%M:%S"),
                packets=self._current_bucket_packets,
                bytes=self._current_bucket_bytes,
                protocols=dict(self._current_bucket_protos)
            ))

        return TelemetrySnapshot(
            timestamp=now,
            status=status,
            total_packets=self.total_packets,
            total_bytes=self.total_bytes,
            packets_per_second=pps,
            bytes_per_second=bps,
            active_protocols_count=len(self.protocol_stats),
            active_connections_count=len(self.connections),
            unique_ips_count=len(self.unique_ips),
            processing_latency_ms=1.1,
            osi_layers=osi_dict,
            tcpip_layers=tcpip_dict,
            top_protocols=top_protos,
            recent_connections=recent_conns,
            graph_data=graph_data,
            time_series=series_list[-25:],
            security_alerts=security_detector.get_alerts()
        )

stats_engine = StatsEngine()
