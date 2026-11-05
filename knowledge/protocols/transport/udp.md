---
id: udp
name: User Datagram Protocol
acronym: UDP
osi_layer: 4
tcp_ip_layer: transport
transport:
  - IP
ports: []
aliases:
  - Datagram Protocol
related_protocols:
  - ip
  - tcp
  - dns
  - dhcp
attacks:
  - port-scanning
---

# UDP — User Datagram Protocol

## Finalidade
O User Datagram Protocol (UDP) é um protocolo da camada de transporte sem conexão (*connectionless*), leve e sem garantia de entrega ou ordenação. É ideal para aplicações em que a baixa latência é mais crítica do que a recuperação de perdas ocasionais de pacotes (como streaming de voz/vídeo ao vivo, jogos online, consultas DNS e telemetria IoT).

## Funcionamento
O UDP não estabelece handshake prévio nem mantém estado de conexão. Cada datagrama é transmitido de forma independente para a rede:
- O cabeçalho possui tamanho fixo e compacto de apenas **8 bytes**:
  - Porta de Origem (2 bytes)
  - Porta de Destino (2 bytes)
  - Comprimento Total (2 bytes)
  - Checksum opcional em IPv4 / obrigatório em IPv6 (2 bytes)
- Não realiza retransmissão, controle de fluxo ou controle de congestionamento nativo. Caso a aplicação necessite de confiabilidade, ela deve implementá-la em sua própria lógica na camada de aplicação.

## Vulnerabilidades e Ataques
- **UDP Flood**: Envio massivo de datagramas UDP para portas aleatórias de um host alvo, forçando a máquina a verificar sockets e responder com pacotes ICMP "Port Unreachable", saturando a largura de banda e os recursos de CPU.
- **Ataques de Reflexão e Amplificação**: Como o UDP não valida o IP de origem por meio de handshake, atacantes forjam o IP de origem (spoofing) da vítima e enviam requisições curtas para serviços UDP públicos (como DNS, NTP ou Memcached), cujas respostas são dezenas de vezes maiores e são refletidas contra a vítima.

## Recomendações de Segurança
- Implementar limitação de taxa (*Rate Limiting*) de pacotes UDP nos firewalls de borda.
- Desabilitar servidores recursivos de DNS e servidores NTP abertos para o público externo.
