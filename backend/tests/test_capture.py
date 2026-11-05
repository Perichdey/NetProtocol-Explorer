import asyncio
from backend.app.capture.tshark_adapter import TSharkAdapter
from backend.app.engine.stats_engine import StatsEngine
from backend.app.models.schemas import CaptureStatus

async def test_read_pcap():
    adapter = TSharkAdapter()
    engine = StatsEngine()
    status = CaptureStatus(tshark_path=adapter.tshark_path)

    assert adapter.is_available(), "TShark não encontrado!"
    print(f"[TEST] TShark localizado em: {adapter.tshark_path}")

    packets_read = 0
    async for pkt in adapter.read_pcap("samples/demo_network.pcap"):
        packets_read += 1
        engine.record_packet(pkt)
        print(f"  Frame #{pkt['frame_num']}: {pkt['protocols']} | {pkt.get('ip_src')} -> {pkt.get('ip_dst')} | Proto: {pkt.get('high_level_proto')}")

    print(f"\n[TEST] Total lido: {packets_read} pacotes.")
    assert packets_read == 12, f"Esperado 12, obteve {packets_read}"

    snapshot = engine.get_snapshot(status)
    print(f"[TEST] Total bytes: {snapshot.total_bytes}")
    print(f"[TEST] Top protocolos: {[p.name for p in snapshot.top_protocols]}")
    print(f"[TEST] Camadas OSI ativas:")
    for l_id, l_data in snapshot.osi_layers.items():
        if l_data.packet_count > 0:
            print(f"  - Camada {l_id} ({l_data.name}): {l_data.packet_count} pkts ({l_data.percentage_packets}%), {l_data.byte_count} bytes, Protos: {l_data.protocols}")

    print(f"\n[TEST] Camadas TCP/IP ativas:")
    for l_id, l_data in snapshot.tcpip_layers.items():
        if l_data.packet_count > 0:
            print(f"  - {l_data.name}: {l_data.packet_count} pkts ({l_data.percentage_packets}%), Protos: {l_data.protocols}")

if __name__ == "__main__":
    asyncio.run(test_read_pcap())
