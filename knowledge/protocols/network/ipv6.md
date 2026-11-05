---
id: ipv6
name: Internet Protocol version 6
acronym: IPv6
osi_layer: 3
tcp_ip_layer: internet
transport:
  - Ethernet
ports: []
aliases:
  - IP v6
  - IPng
related_protocols:
  - ipv4
  - icmpv6
  - tcp
  - udp
  - teredo
attacks:
  - port-scanning
---

# IPv6 — Internet Protocol version 6

## Finalidade
O IPv6 (RFC 8200) é o sucessor direto do IPv4 na camada de rede, projetado para resolver definitivamente o esgotamento de endereços IP públicos, simplificar o processamento de cabeçalhos pelos roteadores e oferecer suporte nativo a autoconfiguração e mobilidade.

## Funcionamento
Utiliza endereços de **128 bits** representados em oito grupos de quatro dígitos hexadecimais separados por dois-pontos (ex.: `2001:0db8:85a3::8a2e:0370:7334`), proporcionando um espaço de $3,4 \times 10^{38}$ endereços.
- **Cabeçalho Fixo Simplificado (40 bytes)**: Remove campos variáveis e o checksum da camada de rede (delegado às camadas superiores), acelerando o encaminhamento em hardware.
- **Sem Fragmentação em Roteadores**: A fragmentação é realizada exclusivamente pelo host de origem após descoberta de Path MTU (PMTUD via ICMPv6).
- **Substituição do Broadcast por Multicast**: O IPv6 elimina o broadcast genérico, utilizando grupos multicast e o protocolo **NDP (Neighbor Discovery Protocol)** sobre ICMPv6 no lugar do ARP.

## Características
- **SLAAC (Stateless Address Autoconfiguration)**: Permite que hosts configurem seus próprios endereços IPv6 automaticamente a partir de anúncios de roteador (*Router Advertisements*).
- **Cabeçalhos de Extensão**: Funcionalidades opcionais (fragmentação, roteamento, IPsec AH/ESP) são encadeadas apenas quando necessárias.

## Recomendações de Segurança
- Monitorar anúncios de roteador ilegítimos implementando **RA Guard** (RFC 6105) nos switches de camada 2.
- Aplicar políticas de firewall equivalentes entre IPv4 e IPv6 (evitar redes *dual-stack* onde o IPv6 fica desprotegido).
