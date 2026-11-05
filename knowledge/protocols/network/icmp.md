---
id: icmp
name: Internet Control Message Protocol
acronym: ICMP
osi_layer: 3
tcp_ip_layer: internet
transport:
  - IPv4
ports: []
aliases:
  - Ping Protocol
related_protocols:
  - ipv4
  - icmpv6
attacks:
  - port-scanning
---

# ICMP — Internet Control Message Protocol

## Finalidade
O Internet Control Message Protocol (ICMP) é um mecanismo auxiliar da camada de rede utilizado por dispositivos de rede (especialmente roteadores e hosts) para transmitir relatórios de erros operacionais e mensagens de diagnóstico e controle.

## Particularidade Arquitetural
Embora seja encapsulado diretamente dentro de datagramas IPv4 (número de protocolo 1 no cabeçalho IP), o ICMP é estritamente considerado parte integrante da **Camada de Rede (Camada 3)**, e não um protocolo de transporte como TCP ou UDP, uma vez que não transporta dados de aplicações de usuário final e atua no suporte ao próprio funcionamento da camada IP.

## Tipos e Códigos Comuns
- **Echo Request (Type 8, Code 0)** e **Echo Reply (Type 0, Code 0)**: Utilizados pelo comando `ping` para testar conectividade bidirecional e latência (RTT).
- **Destination Unreachable (Type 3)**:
  - Code 0: Network unreachable.
  - Code 1: Host unreachable.
  - Code 3: Port unreachable (comum quando um datagrama UDP atinge uma porta fechada).
  - Code 4: Fragmentation needed, but DF set (crítico para a descoberta do caminho MTU - PMTUD).
- **Time Exceeded (Type 11, Code 0)**: TTL atingiu zero em trânsito (utilizado pelo comando `traceroute`).

## Vulnerabilidades e Ataques Relacionados
- **ICMP Tunneling**: Encapsulamento de dados arbitrários e comandos dentro do payload de pacotes Echo Request/Reply para criar canais secretos de comunicação contornando firewalls.
- **Ping of Death / Ping Flood**: Envio massivo de requisições ICMP para causar negação de serviço.
- **ICMP Redirect Attack**: Atacante envia mensagens forjadas de redirecionamento para convencer um host a encaminhar seu tráfego através de um gateway controlado pelo invasor.
