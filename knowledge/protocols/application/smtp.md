---
id: smtp
name: Simple Mail Transfer Protocol
acronym: SMTP
osi_layer: 7
tcp_ip_layer: application
transport:
  - TCP
ports:
  - 25
  - 465
  - 587
aliases:
  - ESMTP
related_protocols:
  - tcp
  - tls
  - dns
attacks:
  - port-scanning
---

# SMTP — Simple Mail Transfer Protocol

## Finalidade
O SMTP (RFC 5321) é o protocolo padrão da Internet para envio e roteamento de mensagens de correio eletrônico entre clientes de e-mail (MUA) e servidores de transferência de mensagens (MTA).

## Portas
- **TCP 25**: Retransmissão entre servidores de e-mail (MTA-to-MTA).
- **TCP 587**: Submissão de mensagens por clientes autenticados com upgrade TLS via `STARTTLS`.
- **TCP 465**: SMTPS (SMTP sobre TLS implícito).

## Recomendações de Segurança
- Exigir TLS obrigatório e autenticação SMTP (`SMTP AUTH`) na submissão.
- Configurar registros DNS **SPF**, **DKIM** e **DMARC** para impedir falsificação de remetente (*Email Spoofing*).
