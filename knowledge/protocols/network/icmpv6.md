---
id: icmpv6
name: Internet Control Message Protocol v6
acronym: ICMPv6
osi_layer: 3
tcp_ip_layer: internet
transport:
  - IPv6
ports: []
aliases:
  - ICMP v6
  - NDP
related_protocols:
  - ipv6
  - icmp
  - arp
attacks:
  - icmp-tunneling
---

# ICMPv6 — Internet Control Message Protocol version 6

## Finalidade
No IPv6, o ICMPv6 (RFC 4443) possui um papel muito mais amplo e indispensável do que o ICMPv4: além de reportar erros de encaminhamento e diagnóstico (Ping), ele incorpora o **Neighbor Discovery Protocol (NDP)** — substituindo o ARP — e o **Multicast Listener Discovery (MLD)** — substituindo o IGMP.

## Funcionamento
É encapsulado com o valor `Next Header = 58` no cabeçalho IPv6. Suas mensagens dividem-se em:
- **Mensagens de Erro (Tipos 1 a 127)**: Destination Unreachable (1), Packet Too Big (2 — essencial para Path MTU Discovery), Time Exceeded (3), Parameter Problem (4).
- **Mensagens Informativas e NDP (Tipos 128 a 255)**:
  - `128 / 129`: Echo Request / Echo Reply (Ping6).
  - `133 / 134`: Router Solicitation (RS) / Router Advertisement (RA) — descoberta de gateway e prefixo SLAAC.
  - `135 / 136`: Neighbor Solicitation (NS) / Neighbor Advertisement (NA) — resolução de endereço MAC (equivalente ao ARP no IPv4) e detecção de endereço duplicado (DAD).

## Vulnerabilidades e Ataques Relacionados
- **Rogue Router Advertisement (RA Spoofing)**: Um atacante anuncia-se como roteador IPv6 padrão na LAN para interceptar tráfego (Man-in-the-Middle) mesmo em redes que usam primariamente IPv4.
- **Neighbor Spoofing**: Equivalente ao ARP Spoofing, manipulando mensagens NS/NA sem SEND (Secure Neighbor Discovery).

## Recomendações de Segurança
- Nunca bloquear todo o protocolo ICMPv6 indiscriminadamente no firewall (isso quebra o Path MTU Discovery e o funcionamento do IPv6, conforme RFC 4890).
- Habilitar **IPv6 RA Guard** e **DHCPv6 Shield** nos comutadores de acesso.
