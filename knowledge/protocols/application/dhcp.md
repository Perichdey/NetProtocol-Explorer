---
id: dhcp
name: Dynamic Host Configuration Protocol
acronym: DHCP
osi_layer: 7
tcp_ip_layer: application
transport:
  - UDP
ports:
  - 67
  - 68
aliases:
  - BOOTP
related_protocols:
  - udp
  - ip
attacks:
  - port-scanning
---

# DHCP — Dynamic Host Configuration Protocol

## Finalidade
O DHCP é responsável pela atribuição automática e dinâmica de parâmetros de configuração de rede para dispositivos (hosts), incluindo endereços IP, máscara de sub-rede, gateway padrão (*Default Gateway*), servidores DNS e domínio local.

## Funcionamento (Processo DORA)
1. **Discover (DHCPDISCOVER)**: O cliente transmite em broadcast (`255.255.255.255`) na porta UDP 67 solicitando ofertas de IP.
2. **Offer (DHCPOFFER)**: Servidores DHCP disponíveis respondem em unicast ou broadcast na porta UDP 68 oferecendo um IP e parâmetros de concessão (*Lease*).
3. **Request (DHCPREQUEST)**: O cliente solicita formalmente a concessão do endereço IP escolhido.
4. **Acknowledge (DHCPACK)**: O servidor confirma a concessão e registra a reserva do IP associada ao endereço MAC do host.

## Portas
- **UDP 67**: Servidor DHCP / Relay Agent.
- **UDP 68**: Cliente DHCP.

## Vulnerabilidades e Ataques
- **Rogue DHCP Server**: Introdução de um servidor DHCP não autorizado na rede que fornece gateway ou DNS maliciosos para interceptar tráfego (MitM).
- **DHCP Starvation**: Um atacante envia milhares de solicitações DHCPDiscover com MACs forjados para esgotar o pool de endereços IP do servidor.

## Recomendações de Segurança
- Habilitar **DHCP Snooping** nos switches de acesso da rede para descartar mensagens DHCP vindas de portas não confiáveis.
