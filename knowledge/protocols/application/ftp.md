---
id: ftp
name: File Transfer Protocol
acronym: FTP
osi_layer: 7
tcp_ip_layer: application
transport:
  - TCP
ports:
  - 20
  - 21
aliases: []
related_protocols:
  - tcp
  - ssh
attacks:
  - port-scanning
---

# FTP — File Transfer Protocol

## Finalidade
Protocolo legado (RFC 959) utilizado para transferência de arquivos entre cliente e servidor, utilizando duas conexões TCP separadas: **Canal de Controle (Porta 21)** para comandos e credenciais, e **Canal de Dados (Porta 20 ou efêmera no modo passivo)** para o conteúdo dos arquivos.

## Recomendações de Segurança
- Como o FTP transmite usuário, senha e dados em **texto claro**, deve ser substituído por **SFTP** (sobre SSH/22) ou **FTPS** (FTP sobre TLS).
