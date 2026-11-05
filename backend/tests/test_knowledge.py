import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.knowledge.registry import knowledge_registry

def test_knowledge():
    print("[TEST] Carregando knowledge_registry...", flush=True)
    knowledge_registry.load_all()
    
    print(f"[TEST] Protocolos carregados: {len(knowledge_registry.protocols)}", flush=True)
    assert len(knowledge_registry.protocols) > 0, "Nenhum protocolo carregado!"
    
    for p_id in ["dns", "http", "https", "tcp", "udp", "arp", "icmp", "tls"]:
        proto = knowledge_registry.get_protocol(p_id)
        assert proto is not None, f"Protocolo {p_id} não encontrado!"
        print(f"  [OK] {proto.meta.name} ({proto.meta.acronym}): Camada OSI {proto.meta.osi_layer}, Portas: {proto.meta.ports}, Ataques: {proto.meta.attacks}")
    
    print(f"\n[TEST] Ataques carregados: {len(knowledge_registry.attacks)}", flush=True)
    for a_id in ["dns-spoofing", "dns-tunneling", "syn-flood", "arp-spoofing"]:
        attack = knowledge_registry.get_attack(a_id)
        if attack:
            print(f"  [OK] Ataque {attack.meta.name} [Severidade: {attack.meta.severity.upper()}], Indicadores: {len(attack.meta.indicators)}")

    print(f"\n[TEST] Busca por porta 53:", flush=True)
    protos_53 = knowledge_registry.get_protocols_by_port(53)
    print(f"  Porta 53 mapeada para: {[p.meta.name for p in protos_53]}")
    assert any(p.meta.id == "dns" for p in protos_53), "DNS deve estar na porta 53"

    print("\n[TEST] Todos os testes da base modular de conhecimento passaram com 100% de sucesso!", flush=True)

if __name__ == "__main__":
    test_knowledge()
