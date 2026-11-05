---
id: eth
name: Ethernet II
acronym: ETH
osi_layer: 2
tcp_ip_layer: link
transport: []
ports: []
aliases:
  - Ethernet
  - DIX Ethernet
related_protocols:
  - arp
  - ipv4
  - ipv6
attacks: []
---

# Ethernet — Padrão IEEE 802.3 / Ethernet II

## Finalidade
O padrão Ethernet é a tecnologia cabeada predominante para redes locais (LANs), responsável pelo enquadramento de dados, detecção de erros físicos e entrega de quadros no mesmo segmento de difusão por meio de endereçamento físico MAC.

## Funcionamento
O formato dominante na Internet é o **Ethernet II (DIX)**:
- Preâmbulo (7 bytes) + SFD (1 byte)
- **MAC Destino (6 bytes)**: Endereço físico do receptor (ou broadcast `ff:ff:ff:ff:ff:ff`).
- **MAC Origem (6 bytes)**: Endereço físico do transmissor.
- **EtherType (2 bytes)**: Indica o protocolo de camada superior contido no payload (ex.: `0x0800` para IPv4, `0x86DD` para IPv6, `0x0806` para ARP, `0x8100` para VLAN 802.1Q).
- **Payload**: Entre 46 e 1500 bytes (MTU padrão).
- **FCS / CRC32 (4 bytes)**: Código de redundância cíclica para detecção de quadros corrompidos no meio físico.
