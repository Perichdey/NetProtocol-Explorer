import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import time
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_api():
    print("[API TEST] Testando /api/health...", flush=True)
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health falhou: {r.text}"
    print("  Health:", r.json(), flush=True)

    print("[API TEST] Testando /api/interfaces...", flush=True)
    r = client.get("/api/interfaces")
    assert r.status_code == 200, f"Interfaces falhou: {r.text}"
    interfaces = r.json().get("interfaces", [])
    print(f"  Interfaces detectadas: {len(interfaces)}", flush=True)
    for i in interfaces[:3]:
        print(f"    - [{i['id']}] {i['name']} ({i['description']})", flush=True)

    print("[API TEST] Carregando PCAP demo via /api/capture/load-demo...", flush=True)
    r = client.post("/api/capture/load-demo")
    assert r.status_code == 200, f"Load demo falhou: {r.text}"
    print("  Load Demo:", r.json(), flush=True)

    # Espera a thread processar os 12 pacotes
    time.sleep(1.0)

    print("[API TEST] Testando /api/stats...", flush=True)
    r = client.get("/api/stats")
    assert r.status_code == 200, f"Stats falhou: {r.text}"
    stats = r.json()
    print(f"  Total pacotes: {stats['total_packets']}", flush=True)
    print(f"  Total bytes: {stats['total_bytes']}", flush=True)
    print(f"  Top protocolos: {[p['name'] for p in stats['top_protocols']]}", flush=True)
    print("  Camadas OSI ativas:", flush=True)
    for l_id, l_data in stats["osi_layers"].items():
        if l_data["packet_count"] > 0:
            print(f"    Camada {l_id} ({l_data['name']}): {l_data['packet_count']} pkts ({l_data['percentage_packets']}%)", flush=True)

    assert stats["total_packets"] == 12, f"Esperado 12 pacotes, obtido {stats['total_packets']}"
    print("[API TEST] Todos os testes da API passaram com 100% de sucesso!", flush=True)

if __name__ == "__main__":
    test_api()
