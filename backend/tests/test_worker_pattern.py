import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import subprocess
import threading
import time
from backend.app.engine.stats_engine import stats_engine
from backend.app.models.schemas import CaptureStatus

def main():
    print("[TEST] Iniciando padrão worker thread...", flush=True)
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
    print(f"[TEST] Total pacotes processados no StatsEngine: {snapshot.total_packets}", flush=True)
    print(f"[TEST] Total bytes: {snapshot.total_bytes}", flush=True)
    print(f"[TEST] Conexões ativas encontradas: {len(snapshot.recent_connections)}", flush=True)
    for conn in snapshot.recent_connections:
        print(f"  Conn: {conn.src_ip}:{conn.src_port} -> {conn.dst_ip}:{conn.dst_port} [{conn.transport} - {conn.app_protocol}] ({conn.packet_count} pkts)", flush=True)
    print("[TEST] Camadas OSI calculadas:")
    for l_id, l_data in snapshot.osi_layers.items():
        if l_data.packet_count > 0:
            print(f"  Camada {l_id} ({l_data.name}): {l_data.packet_count} pkts ({l_data.percentage_packets}%), Protos: {l_data.protocols}", flush=True)

if __name__ == "__main__":
    main()
