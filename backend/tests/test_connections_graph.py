import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import subprocess
import time
from backend.app.engine.stats_engine import stats_engine
from backend.app.models.schemas import CaptureStatus

def test_connections_graph():
    print("[TEST] Processando topologia multi-nó para grafo de conexões...", flush=True)
    tshark_path = r"C:\Program Files\Wireshark\tshark.exe"
    pcap_path = "samples/demo_network.pcap"

    cmd = [
        tshark_path,
        "-r", pcap_path,
        "-l",
        "-n",
        "-T", "fields",
        "-e", "frame.number",
        "-e", "frame.time_epoch",
        "-e", "frame.len",
        "-e", "frame.protocols",
        "-e", "eth.src",
        "-e", "eth.dst",
        "-e", "ip.src",
        "-e", "ip.dst",
        "-e", "ipv6.src",
        "-e", "ipv6.dst",
        "-e", "tcp.srcport",
        "-e", "tcp.dstport",
        "-e", "udp.srcport",
        "-e", "udp.dstport",
        "-e", "_ws.col.Protocol",
        "-E", "separator=/t",
    ]

    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, text=True, errors="replace", bufsize=1)
    stats_engine.reset()

    for line in p.stdout:
        parts = line.strip().split("\t")
        if len(parts) >= 4:
            while len(parts) < 15:
                parts.append("")
            frame_num = int(parts[0]) if parts[0].isdigit() else 0
            epoch = float(parts[1]) if parts[1] else time.time()
            length = int(parts[2]) if parts[2].isdigit() else 0
            proto_stack = parts[3].split(":") if parts[3] else []
            sport = int(parts[10]) if parts[10].isdigit() else (int(parts[12]) if parts[12].isdigit() else None)
            dport = int(parts[11]) if parts[11].isdigit() else (int(parts[13]) if parts[13].isdigit() else None)
            trans = "TCP" if parts[10].isdigit() else ("UDP" if parts[12].isdigit() else "OTHER")
            
            pkt = {
                "frame_num": frame_num,
                "epoch": epoch,
                "length": length,
                "protocols": proto_stack,
                "ip_src": parts[6] or parts[8],
                "ip_dst": parts[7] or parts[9],
                "src_port": sport,
                "dst_port": dport,
                "transport": trans,
                "high_level_proto": parts[14] if parts[14] else (proto_stack[-1].upper() if proto_stack else "RAW")
            }
            stats_engine.record_packet(pkt)

    p.stdout.close()
    p.wait()

    snapshot = stats_engine.get_snapshot(CaptureStatus(is_active=False))
    print(f"[TEST] Total pacotes: {snapshot.total_packets}", flush=True)
    print(f"[TEST] Total conexões: {snapshot.active_connections_count}", flush=True)
    print(f"[TEST] Total IPs únicos: {snapshot.unique_ips_count}", flush=True)
    
    print("\n[TEST] Nós do Grafo (Force-Directed Graph):", flush=True)
    for node in snapshot.graph_data.nodes:
        print(f"  - Nó: {node.id} | Categoria: {node.category} | Tamanho: {node.symbolSize}px | Volume: {node.value} bytes", flush=True)

    print("\n[TEST] Arestas do Grafo (Comunicações):", flush=True)
    for link in snapshot.graph_data.links:
        print(f"  - Link: {link.source} -> {link.target} | {link.transport} [{link.protocol}] | {link.packet_count} pkts ({link.byte_count} B)", flush=True)

    print("\n[TEST] Amostra de Conexões com Duração e Encapsulamento:", flush=True)
    for conn in snapshot.recent_connections[:5]:
        print(f"  - {conn.src_ip}:{conn.src_port} -> {conn.dst_ip}:{conn.dst_port} | Duração: {conn.duration_sec}s | Stack: {' -> '.join(conn.encapsulation)}", flush=True)

    assert len(snapshot.graph_data.nodes) >= 6, "Esperado pelo menos 6 nós no grafo"
    assert len(snapshot.graph_data.links) >= 6, "Esperado pelo menos 6 links no grafo"
    print("\n[TEST] Validação do Grafo de Conexões da Fase 3 concluída com 100% de sucesso!", flush=True)

if __name__ == "__main__":
    test_connections_graph()
