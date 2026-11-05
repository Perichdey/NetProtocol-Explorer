from typing import Dict, Any, Optional

OSI_LAYERS_META = {
    1: {"name": "Física", "desc": "Transmissão de bits brutos no meio físico"},
    2: {"name": "Enlace de Dados", "desc": "Endereçamento físico (MAC), quadros e controle de enlace"},
    3: {"name": "Rede", "desc": "Roteamento, endereçamento lógico (IP) e controle de pacotes"},
    4: {"name": "Transporte", "desc": "Comunicação fim-a-fim, portas, confiabilidade e fluxo"},
    5: {"name": "Sessão", "desc": "Estabelecimento, gerenciamento e término de sessões"},
    6: {"name": "Apresentação", "desc": "Formatação, compressão e criptografia de dados"},
    7: {"name": "Aplicação", "desc": "Serviços de rede diretamente acessíveis por aplicações do usuário"},
}

TCPIP_LAYERS_META = {
    "link": {"name": "Acesso à Rede / Enlace", "desc": "Camadas física e de enlace combinadas (Ethernet, Wi-Fi, ARP)"},
    "internet": {"name": "Internet / Rede", "desc": "Endereçamento lógico e roteamento (IPv4, IPv6, ICMP)"},
    "transport": {"name": "Transporte", "desc": "Entrega fim-a-fim de dados entre processos (TCP, UDP)"},
    "application": {"name": "Aplicação", "desc": "Engloba aplicação, apresentação e sessão (HTTP, DNS, SSH, TLS)"},
}

INTERNAL_PSEUDO_PROTOCOLS = {
    "frame", "ethertype", "data", "data-text-lines", "sll", "null", "raw", "pkt_comment"
}

PROTOCOL_ALIASES = {
    "ip": "ipv4",
    "ssl": "tls",
    "tlsv1": "tls",
    "tlsv1.2": "tls",
    "tlsv1.3": "tls",
    "sslv3": "tls",
    "bootp": "dhcp",
    "smb2": "smb",
    "smb3": "smb",
    "http2": "http",
}

DEFAULT_PROTOCOL_MAP: Dict[str, Dict[str, Any]] = {
    # Camada 2 / Enlace
    "eth": {"id": "eth", "name": "Ethernet II", "acronym": "ETH", "osi": 2, "tcpip": "link"},
    "arp": {"id": "arp", "name": "Address Resolution Protocol", "acronym": "ARP", "osi": 2, "tcpip": "link"},
    "vlan": {"id": "vlan", "name": "802.1Q VLAN", "acronym": "VLAN", "osi": 2, "tcpip": "link"},
    "ppp": {"id": "ppp", "name": "Point-to-Point Protocol", "acronym": "PPP", "osi": 2, "tcpip": "link"},
    "lldp": {"id": "lldp", "name": "Link Layer Discovery Protocol", "acronym": "LLDP", "osi": 2, "tcpip": "link"},
    "stp": {"id": "stp", "name": "Spanning Tree Protocol", "acronym": "STP", "osi": 2, "tcpip": "link"},
    "loopback": {"id": "loopback", "name": "Loopback", "acronym": "LOOP", "osi": 2, "tcpip": "link"},
    
    # Camada 3 / Rede
    "ipv4": {"id": "ipv4", "name": "Internet Protocol v4", "acronym": "IPv4", "osi": 3, "tcpip": "internet"},
    "ipv6": {"id": "ipv6", "name": "Internet Protocol v6", "acronym": "IPv6", "osi": 3, "tcpip": "internet"},
    "icmp": {"id": "icmp", "name": "ICMP", "acronym": "ICMP", "osi": 3, "tcpip": "internet"},
    "icmpv6": {"id": "icmpv6", "name": "ICMPv6", "acronym": "ICMPv6", "osi": 3, "tcpip": "internet"},
    "igmp": {"id": "igmp", "name": "IGMP", "acronym": "IGMP", "osi": 3, "tcpip": "internet"},
    "ipsec": {"id": "ipsec", "name": "IPsec", "acronym": "IPsec", "osi": 3, "tcpip": "internet"},
    "gre": {"id": "gre", "name": "Generic Routing Encapsulation", "acronym": "GRE", "osi": 3, "tcpip": "internet"},
    "teredo": {"id": "teredo", "name": "Teredo IPv6 Tunneling", "acronym": "TEREDO", "osi": 3, "tcpip": "internet"},
    
    # Camada 4 / Transporte
    "tcp": {"id": "tcp", "name": "TCP", "acronym": "TCP", "osi": 4, "tcpip": "transport"},
    "udp": {"id": "udp", "name": "UDP", "acronym": "UDP", "osi": 4, "tcpip": "transport"},
    "sctp": {"id": "sctp", "name": "SCTP", "acronym": "SCTP", "osi": 4, "tcpip": "transport"},
    "dccp": {"id": "dccp", "name": "DCCP", "acronym": "DCCP", "osi": 4, "tcpip": "transport"},
    
    # Camada 5 / Sessão
    "nbss": {"id": "nbss", "name": "NetBIOS Session", "acronym": "NBSS", "osi": 5, "tcpip": "application"},
    "rpc": {"id": "rpc", "name": "Remote Procedure Call", "acronym": "RPC", "osi": 5, "tcpip": "application"},

    # Camada 6 / Apresentação
    "tls": {"id": "tls", "name": "TLS / SSL", "acronym": "TLS", "osi": 6, "tcpip": "application"},
    
    # Camada 7 / Aplicação
    "http": {"id": "http", "name": "HTTP", "acronym": "HTTP", "osi": 7, "tcpip": "application"},
    "https": {"id": "https", "name": "HTTPS", "acronym": "HTTPS", "osi": 7, "tcpip": "application"},
    "dns": {"id": "dns", "name": "DNS", "acronym": "DNS", "osi": 7, "tcpip": "application"},
    "mdns": {"id": "mdns", "name": "Multicast DNS", "acronym": "mDNS", "osi": 7, "tcpip": "application"},
    "llmnr": {"id": "llmnr", "name": "LLMNR", "acronym": "LLMNR", "osi": 7, "tcpip": "application"},
    "dhcp": {"id": "dhcp", "name": "DHCP", "acronym": "DHCP", "osi": 7, "tcpip": "application"},
    "ssh": {"id": "ssh", "name": "SSH", "acronym": "SSH", "osi": 7, "tcpip": "application"},
    "ftp": {"id": "ftp", "name": "FTP", "acronym": "FTP", "osi": 7, "tcpip": "application"},
    "smtp": {"id": "smtp", "name": "SMTP", "acronym": "SMTP", "osi": 7, "tcpip": "application"},
    "ntp": {"id": "ntp", "name": "NTP", "acronym": "NTP", "osi": 7, "tcpip": "application"},
    "snmp": {"id": "snmp", "name": "SNMP", "acronym": "SNMP", "osi": 7, "tcpip": "application"},
    "smb": {"id": "smb", "name": "SMB", "acronym": "SMB", "osi": 7, "tcpip": "application"},
    "quic": {"id": "quic", "name": "QUIC", "acronym": "QUIC", "osi": 7, "tcpip": "application"},
    "mqtt": {"id": "mqtt", "name": "MQTT", "acronym": "MQTT", "osi": 7, "tcpip": "application"},
    "ssdp": {"id": "ssdp", "name": "SSDP (UPnP)", "acronym": "SSDP", "osi": 7, "tcpip": "application"},
}

class LayerMapper:
    def __init__(self):
        self.protocols = dict(DEFAULT_PROTOCOL_MAP)

    def normalize_id(self, proto_name: str) -> str:
        key = proto_name.lower().strip()
        return PROTOCOL_ALIASES.get(key, key)

    def is_internal(self, proto_name: str) -> bool:
        return proto_name.lower().strip() in INTERNAL_PSEUDO_PROTOCOLS

    def register_protocol(self, proto_id: str, name: str, osi: int, tcpip: str, acronym: Optional[str] = None, notes: Optional[str] = None):
        norm_id = self.normalize_id(proto_id)
        self.protocols[norm_id] = {
            "id": norm_id,
            "name": acronym or name,
            "full_name": name,
            "acronym": acronym or norm_id.upper(),
            "osi": osi,
            "tcpip": tcpip,
            "notes": notes
        }

    def get_info(self, proto_name: str) -> Dict[str, Any]:
        norm_id = self.normalize_id(proto_name)
        if norm_id in self.protocols:
            return self.protocols[norm_id]
        
        return {
            "id": norm_id,
            "name": proto_name.upper(),
            "acronym": proto_name.upper(),
            "osi": 7,
            "tcpip": "application",
            "notes": "Protocolo identificado dinamicamente"
        }

layer_mapper = LayerMapper()
