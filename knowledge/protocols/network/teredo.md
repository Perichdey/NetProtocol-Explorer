---
id: teredo
name: Teredo IPv6 Tunneling
acronym: TEREDO
osi_layer: 3
tcp_ip_layer: internet
transport:
  - UDP
ports:
  - 3544
aliases:
  - Teredo Tunneling
related_protocols:
  - ipv6
  - udp
  - ipv4
  - icmpv6
attacks:
  - port-scanning
---

# Teredo — Tunelamento IPv6 sobre UDP/IPv4

## Finalidade
O Teredo (RFC 4380) é uma tecnologia de transição para IPv6 que concede conectividade IPv6 a hosts localizados atrás de dispositivos NAT IPv4, encapsulando pacotes IPv6 dentro de datagramas **UDP IPv4** (porta padrão 3544).

## Funcionamento
1. O cliente Teredo comunica-se com um Servidor Teredo via UDP/3544 para descobrir seu endereço IPv4 público e o tipo de NAT em uso.
2. O cliente recebe um endereço IPv6 global com o prefixo reservado `2001:0000::/32`, que codifica o IP do servidor, flags de NAT, a porta UDP mapeada (ofuscada com XOR) e o endereço IPv4 público do cliente.
3. Pacotes IPv6 (incluindo solicitações ICMPv6 Router/Neighbor Solicitation) são encapsulados em UDP sobre IPv4 para atravessar roteadores NAT domésticos ou corporativos.

## Recomendações de Segurança
- Como túneis Teredo podem contornar políticas de firewall que inspecionam apenas tráfego IPv4 convencional (*Firewall Bypass*), recomenda-se desativar interfaces Teredo em ambientes corporativos que já possuam IPv6 nativo ou bloquear a porta UDP 3544 no perímetro quando não utilizada.
