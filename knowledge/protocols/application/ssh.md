---
id: ssh
name: Secure Shell
acronym: SSH
osi_layer: 7
tcp_ip_layer: application
transport:
  - TCP
ports:
  - 22
aliases:
  - SSH-2
related_protocols:
  - tcp
attacks:
  - port-scanning
---

# SSH — Secure Shell

## Finalidade
O Secure Shell (SSH) é um protocolo de rede criptográfico utilizado para acesso remoto seguro a terminais de linha de comando, execução remota de comandos e tunelamento seguro de tráfego (port forwarding e SFTP), substituindo protocolos legados inseguros como Telnet e Rlogin.

## Funcionamento
Opera sobre TCP na porta 22. O estabelecimento da sessão envolve:
1. Troca de banners com indicação de versão (ex.: `SSH-2.0-OpenSSH_9.6`).
2. Algoritmo de troca de chaves (Key Exchange - KEX) via Diffie-Hellman para estabelecer chave de sessão compartilhada e autenticar a chave do host do servidor (*Host Key*).
3. Autenticação do usuário (via par de chaves assimétricas Ed25519/RSA ou senha).
4. Abertura de canais multiplexados para sessões interativas (*pty*), subsistema SFTP ou encaminhamento de portas.

## Portas
- **TCP 22**: Porta padrão para serviços SSH.

## Recomendações de Segurança
- Desabilitar autenticação baseada puramente em senhas, exigindo chaves públicas (Ed25519 recomendada).
- Desabilitar login direto da conta de superusuário (`PermitRootLogin no`).
- Utilizar ferramentas de proteção contra força bruta como Fail2ban ou CrowdSec.
