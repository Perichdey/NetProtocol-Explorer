import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import asyncio
from backend.app.capture.tshark_adapter import TSharkAdapter
from backend.app.engine.stats_engine import stats_engine
from backend.app.models.schemas import CaptureStatus

async def main():
    print("[TEST] Iniciando teste de captura...", flush=True)
    adapter = TSharkAdapter()
    print(f"[TEST] TShark localizado em: {adapter.tshark_path}", flush=True)
    
    count = 0
    pcap_file = os.path.abspath("samples/demo_network.pcap")
    async for pkt in adapter.read_pcap(pcap_file):
        count += 1
        stats_engine.record_packet(pkt)
        print(f"  Frame #{pkt['frame_num']}: {pkt['protocols']} | {pkt['transport']} {pkt.get('high_level_proto')}", flush=True)
    
    print(f"\n[TEST] Sucesso! Total de pacotes lidos: {count}", flush=True)
    snapshot = stats_engine.get_snapshot(CaptureStatus(is_active=False))
    print(f"[TEST] Total Bytes processados: {snapshot.total_bytes}", flush=True)
    print(f"[TEST] Top Protocolos: {[p.name for p in snapshot.top_protocols]}", flush=True)
    print(f"[TEST] Camadas OSI ativas:")
    for l_id, l_data in snapshot.osi_layers.items():
        if l_data.packet_count > 0:
            print(f"  - Camada {l_id} ({l_data.name}): {l_data.packet_count} pacotes ({l_data.percentage_packets}%), {l_data.byte_count} bytes, Protos: {l_data.protocols}", flush=True)
    print("[TEST] Concluído com sucesso!", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
