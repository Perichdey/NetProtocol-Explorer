---
id: tls
name: Transport Layer Security
acronym: TLS
osi_layer: 6
tcp_ip_layer: application
transport:
  - TCP
ports:
  - 443
  - 853
  - 993
  - 995
aliases:
  - SSL
  - SSL/TLS
  - TLSv1.2
  - TLSv1.3
  - TLSv1
  - SSLv3
related_protocols:
  - tcp
  - https
  - http
attacks:
  - port-scanning
---

# TLS — Transport Layer Security

## Finalidade
O TLS é um protocolo criptográfico projetado para prover comunicações seguras sobre a Internet. No modelo conceitual OSI, atua principalmente nas funções de **Apresentação (Camada 6)** — por lidar com a criptografia, codificação e representação dos dados — operando logo acima da camada de Transporte (Camada 4) e abaixo dos protocolos de Aplicação (Camada 7).

## Funcionamento
O protocolo é composto por dois subprotocolos centrais:
1. **TLS Handshake Protocol**: Responsável por negociar parâmetros de segurança, autenticar as pontas via certificados X.509 e derivar chaves criptográficas de sessão.
2. **TLS Record Protocol**: Responsável pela fragmentação, compressão opcional, aplicação de MAC e criptografia simétrica de cada bloco de dados transmitido.

Com o advento do **TLS 1.3** (RFC 8446), a latência do handshake foi reduzida para apenas 1 RTT (Round Trip Time) ou 0-RTT (*Zero Round Trip Time Resumption*), eliminando algoritmos legados e inseguros (como RSA para troca de chaves, RC4 e MD5).

## Portas
O TLS não possui porta exclusiva, mas encapsula serviços em portas dedicadas:
- **TCP 443**: HTTPS (HTTP sobre TLS).
- **TCP 853**: DNS over TLS (DoT).
- **TCP 993**: IMAPS (IMAP seguro).
- **TCP 995**: POP3S (POP3 seguro).
- **TCP 465**: SMTPS (SMTP seguro).

## Vulnerabilidades Históricas
- Ataques de Downgrade para forçar cifras fracas (ex.: POODLE, BEAST).
- Vazamento de chaves ou buffer over-read (ex.: Heartbleed em implementações OpenSSL).
- Uso de certificados autoassinados ou expirados.
