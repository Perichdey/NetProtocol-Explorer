---
id: tcp
name: Transmission Control Protocol
acronym: TCP
osi_layer: 4
tcp_ip_layer: transport
transport:
  - IP
ports: []
aliases:
  - TCP/IP Transport
related_protocols:
  - ip
  - udp
  - http
  - tls
attacks:
  - syn-flood
  - port-scanning
---

# TCP — Transmission Control Protocol

## Finalidade
O Transmission Control Protocol (TCP) é o protocolo fundamental orientado a conexão da camada de transporte, encarregado de garantir a entrega confiável, ordenada e sem duplicações de um fluxo de bytes entre processos em execução em hosts interconectados por redes IP.

## Funcionamento
O TCP gerencia a comunicação em três fases distintas:
1. **Estabelecimento de Conexão (3-Way Handshake)**:
   - `SYN`: O cliente envia uma flag SYN com seu Sequence Number inicial (ISN).
   - `SYN-ACK`: O servidor responde confirmando o ISN do cliente (ACK = ISN + 1) e enviando seu próprio ISN.
   - `ACK`: O cliente confirma o ISN do servidor, estabelecendo a conexão no estado `ESTABLISHED`.
2. **Transferência Confiável de Dados**:
   - Cada byte possui um número de sequência único.
   - O receptor confirma os dados recebidos via Acknowledgments (ACKs).
   - Mecanismos de retransmissão por timeout (RTO) ou ACKs duplicados (Fast Retransmit).
   - Controle de fluxo por janela deslizante (*Sliding Window*) baseado na capacidade do buffer do receptor.
   - Algoritmos avançados de controle de congestionamento (CUBIC, BBR, Reno).
3. **Encerramento de Conexão**:
   - Realizado por meio de flags `FIN` e `ACK` de forma bidirecional ou término abrupto com flag `RST` (Reset).

## Características
- **Orientado a Conexão**: Estado de controle mantido em ambas as pontas.
- **Detecção de Erros**: Checksum de 16 bits cobrindo cabeçalho e payload.
- **Multiplexação**: Uso de portas de origem e destino (0 a 65535) para direcionar fluxos a sockets de processos específicos.

## Vulnerabilidades e Ataques Relacionados
- **SYN Flood (DDoS)**: Inundação de pacotes SYN com IPs de origem forjados para esgotar a fila de conexões pendentes (*SYN backlog*) do servidor.
- **Port Scanning (SYN Stealth / FIN Scan)**: Envio seletivo de flags TCP para inferir quais serviços estão ouvindo em uma máquina alvo sem completar a conexão.
- **TCP Reset Hijacking**: Injeção forjada de pacotes com flag RST para derrubar sessões ativas (como conexões BGP ou SSH).

## Recomendações de Segurança
- Habilitar **SYN Cookies** no kernel do sistema operacional para mitigar ataques SYN flood sem alocar memória de backlog prematuramente.
- Filtrar pacotes com combinações anômalas de flags (ex: Xmas tree scan - FIN+PSH+URG).
