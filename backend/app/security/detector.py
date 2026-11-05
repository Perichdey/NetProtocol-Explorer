import time
from collections import defaultdict
from typing import Dict, Any, List, Set
from ..models.schemas import SecurityAlert

class SecurityDetector:
    """
    Motor educacional de correlação de eventos e levantamento de hipóteses investigativas.
    Diferencia anomalias e exposições observadas nos pacotes de ataques confirmados.
    """
    def __init__(self):
        self.reset()

    def reset(self):
        # {(src_ip, dst_ip): set(dst_ports)}
        self.port_scans: Dict[tuple, Set[int]] = defaultdict(set)
        # {src_ip: count} para DNS
        self.dns_queries: Dict[str, int] = defaultdict(int)
        self.dns_max_size: Dict[str, int] = defaultdict(int)
        # {eth_src: count} para ARP
        self.arp_macs: Dict[str, int] = defaultdict(int)
        # Alertas ativos deduplicados por chave lógica
        self.alerts: Dict[str, SecurityAlert] = {}

    def inspect_packet(self, pkt: Dict[str, Any]):
        now = time.time()
        src_ip = pkt.get("ip_src") or ""
        dst_ip = pkt.get("ip_dst") or ""
        dport = pkt.get("dst_port")
        length = pkt.get("length", 0)
        transport = pkt.get("transport", "")
        protocols = [p.lower() for p in pkt.get("protocols", [])]
        eth_src = pkt.get("eth_src") or ""

        # 1. Regra: Varredura de Portas (Port Scanning)
        if src_ip and dst_ip and dport and transport == "TCP":
            pair = (src_ip, dst_ip)
            self.port_scans[pair].add(dport)
            ports_hit = sorted(list(self.port_scans[pair]))
            if len(ports_hit) >= 4:
                alert_key = f"port-scan:{src_ip}->{dst_ip}"
                ports_str = ", ".join(str(p) for p in ports_hit[:8])
                self.alerts[alert_key] = SecurityAlert(
                    id=alert_key,
                    timestamp=now,
                    attack_id="port-scanning",
                    title="Possível Varredura de Portas (Port Scanning)",
                    protocol="TCP",
                    severity="high" if len(ports_hit) >= 5 else "medium",
                    evidence=f"Host {src_ip} iniciou conexões para {len(ports_hit)} portas distintas em {dst_ip} (Portas: {ports_str}).",
                    hypothesis="Múltiplas portas de destino contatadas sequencialmente a partir da mesma origem indicam reconhecimento ativo de serviços (ex.: Nmap SYN Scan), embora também possam ocorrer em clientes multi-serviço.",
                    recommendation="Verificar se as conexões completaram o 3-way handshake ou enviaram RST imediato; validar se a origem é um scanner autorizado."
                )

        # 2. Regra: Tráfego HTTP em Texto Claro (Exposição a Sniffing / MitM)
        if "http" in protocols and "tls" not in protocols and "ssl" not in protocols:
            alert_key = f"cleartext-http:{src_ip}->{dst_ip}"
            if alert_key not in self.alerts:
                self.alerts[alert_key] = SecurityAlert(
                    id=alert_key,
                    timestamp=now,
                    attack_id="arp-spoofing",
                    title="Tráfego Web sem Criptografia (HTTP em Texto Claro)",
                    protocol="HTTP",
                    severity="medium",
                    evidence=f"Comunicação HTTP não criptografada observada entre {src_ip} e {dst_ip}:{dport or 80} ({length} bytes).",
                    hypothesis="O protocolo HTTP transmite cabeçalhos, cookies de sessão e payloads em texto puro. Em caso de interceptação na rede local (como ARP Spoofing), os dados ficam integralmente expostos.",
                    recommendation="Inspecionar se há credenciais ou tokens trafegando sem TLS e migrar o serviço para HTTPS (TCP/443) com HSTS."
                )

        # 3. Regra: Tunelamento IPv6 Teredo sobre UDPv4
        if "teredo" in protocols or dport == 3544 or pkt.get("src_port") == 3544:
            alert_key = f"teredo-tunnel:{src_ip}"
            if alert_key not in self.alerts:
                self.alerts[alert_key] = SecurityAlert(
                    id=alert_key,
                    timestamp=now,
                    attack_id="icmp-tunneling",
                    title="Encapsulamento IPv6 sobre UDPv4 Detectado (Teredo)",
                    protocol="TEREDO",
                    severity="low",
                    evidence=f"Pacotes IPv6/ICMPv6 encapsulados via túnel Teredo (UDP/3544) identificados no host {src_ip}.",
                    hypothesis="O protocolo Teredo encapsula pacotes IPv6 dentro de UDP IPv4 para atravessar NAT. Embora seja um recurso legítimo de transição do sistema operacional, túneis automáticos podem contornar regras de firewall restritas apenas a IPv4.",
                    recommendation="Verificar se a rede possui política de segurança para IPv6 e se o uso de túneis Teredo é esperado nas estações de trabalho."
                )

        # 4. Regra: Monitoramento de Consultas DNS (Anomalia de Tamanho / Frequência)
        if "dns" in protocols:
            key_ip = src_ip or "local"
            self.dns_queries[key_ip] += 1
            if length > self.dns_max_size[key_ip]:
                self.dns_max_size[key_ip] = length

            if length > 250 or self.dns_queries[key_ip] >= 10:
                alert_key = f"dns-anomaly:{key_ip}"
                self.alerts[alert_key] = SecurityAlert(
                    id=alert_key,
                    timestamp=now,
                    attack_id="dns-tunneling",
                    title="Indicador de Volume / Tamanho em Resolução DNS",
                    protocol="DNS",
                    severity="medium",
                    evidence=f"Fluxo DNS envolvendo {key_ip}: {self.dns_queries[key_ip]} pacotes (maior pacote: {self.dns_max_size[key_ip]} bytes).",
                    hypothesis="Pacotes DNS extensos ou de alta frequência podem resultar de respostas DNSSEC/EDNS0 legítimas, mas também são indicadores investigativos para DNS Tunneling ou Amplificação.",
                    recommendation="Analisar a entropia dos subdomínios consultados e a proporção de registros TXT/CNAME."
                )

        # 5. Regra: Resolução ARP no Enlace Local
        if "arp" in protocols and eth_src:
            self.arp_macs[eth_src] += 1
            if len(self.arp_macs) >= 2:
                alert_key = "arp-activity:lan"
                if alert_key not in self.alerts:
                    mac_list = ", ".join(list(self.arp_macs.keys())[:4])
                    self.alerts[alert_key] = SecurityAlert(
                        id=alert_key,
                        timestamp=now,
                        attack_id="arp-spoofing",
                        title="Monitoramento de Resolução ARP no Segmento Local",
                        protocol="ARP",
                        severity="low",
                        evidence=f"Troca de quadros ARP observada entre {len(self.arp_macs)} endereços físicos MAC ({mac_list}).",
                        hypothesis="A resolução ARP em broadcast é parte normal da operação Ethernet/IPv4. Contudo, por não possuir autenticação nativa, respostas ARP não solicitadas (Gratuitous ARP) devem ser correlacionadas para descartar ARP Poisoning.",
                        recommendation="Confirmar se cada endereço IP do gateway mantém associação única e estável na tabela ARP."
                    )

    def get_alerts(self) -> List[SecurityAlert]:
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
        return sorted(
            self.alerts.values(),
            key=lambda a: (severity_order.get(a.severity, 5), -a.timestamp)
        )

security_detector = SecurityDetector()
