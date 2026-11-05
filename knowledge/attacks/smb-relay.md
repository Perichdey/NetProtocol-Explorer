---
id: smb-relay
name: SMB / NTLM Relay Attack
protocol: smb
severity: critical
mitre_attack_id: T1557.001
affected_layers:
  - 7
indicators:
  - Conexões SMB (TCP/445) originadas de estações de trabalho para outras estações (tráfego lateral)
  - Negociação SMB sem exigência de assinatura digital (SMB Signing Disabled)
---

# SMB Relay (Retransmissão de Autenticação NTLM)

## Descrição do Ataque
Em combinação com envenenamento LLMNR/NBT-NS ou ARP Spoofing, o atacante intercepta uma tentativa de autenticação NTLMv2 via SMB e a retransmite em tempo real para outra máquina da rede na qual a vítima possui privilégios administrativos, executando comandos ou extraindo credenciais sem precisar quebrar o hash da senha.

## Mitigação Recomendada
- Habilitar **SMB Signing obrigatório** via GPO em todos os clientes e servidores do domínio.
- Priorizar autenticação **Kerberos** e restringir NTLM na rede corporativa.
