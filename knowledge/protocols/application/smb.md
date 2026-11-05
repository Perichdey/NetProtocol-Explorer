---
id: smb
name: Server Message Block
acronym: SMB
osi_layer: 7
tcp_ip_layer: application
transport:
  - TCP
ports:
  - 445
  - 139
aliases:
  - SMB2
  - SMB3
  - CIFS
related_protocols:
  - tcp
attacks:
  - smb-relay
  - port-scanning
---

# SMB — Server Message Block

## Finalidade
O protocolo SMB (Server Message Block) — e suas evoluções SMB2 e SMB3 — fornece acesso compartilhado a arquivos, impressoras, portas seriais e comunicações entre processos (IPC / Named Pipes) em redes locais, sendo a base do compartilhamento de rede em ambientes Microsoft Windows e Samba.

## Funcionamento
Opera diretamente sobre **TCP/445** (ou historicamente sobre NetBIOS na porta TCP/139).
- Negocia a versão do dialeto (ex.: SMB 3.1.1).
- Autentica a sessão via **Kerberos** ou **NTLMv2**.
- Conecta-se a árvores de compartilhamento (*Tree Connect*, como `\\servidor\arquivos` ou `IPC$`).

## Vulnerabilidades e Ataques Relacionados
- **SMB Relay (NTLM Relay)**: Interceptação e retransmissão de desafios de autenticação NTLM para movimentação lateral quando a assinatura de pacotes (*SMB Signing*) não é exigida.
- **Exploração de Vulnerabilidades Remotas**: Falhas críticas históricas no SMBv1 (ex.: MS17-010 / *EternalBlue* explorada pelo ransomware WannaCry).

## Recomendações de Segurança
- Desabilitar permanentemente o **SMBv1**.
- Exigir **SMB Signing** e habilitar **SMB Encryption** (disponível no SMB 3.0+).
- Bloquear terminantemente a porta TCP 445 no perímetro da Internet.
