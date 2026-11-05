---
id: quic
name: QUIC Transport & Application Protocol
acronym: QUIC
osi_layer: 7
tcp_ip_layer: application
transport:
  - UDP
ports:
  - 443
aliases:
  - HTTP/3
related_protocols:
  - udp
  - tls
  - https
attacks: []
---

# QUIC — Protocolo Base do HTTP/3

## Finalidade
O QUIC (RFC 9000) é um protocolo moderno multiplexado e criptografado executado sobre **UDP** (porta 443), projetado para substituir a combinação TCP + TLS + HTTP/2 e servir como base para o **HTTP/3**.

## Funcionamento
- **Handshake Unificado (1-RTT e 0-RTT)**: Combina o estabelecimento de transporte e o handshake criptográfico **TLS 1.3** em um único passo, reduzindo drasticamente a latência inicial.
- **Eliminação do Head-of-Line Blocking**: Diferente do TCP, a perda de um pacote UDP no QUIC afeta apenas o fluxo (*stream*) específico ao qual aquele pacote pertence, sem travar os demais fluxos paralelos da mesma conexão.
- **Connection Migration**: Utiliza *Connection IDs* independentes da tupla IP/Porta, permitindo que dispositivos móveis alternem entre Wi-Fi e rede celular (4G/5G) sem derrubar a conexão ativa.
