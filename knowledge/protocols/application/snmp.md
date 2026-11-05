---
id: snmp
name: Simple Network Management Protocol
acronym: SNMP
osi_layer: 7
tcp_ip_layer: application
transport:
  - UDP
ports:
  - 161
  - 162
aliases:
  - SNMPv2c
  - SNMPv3
related_protocols:
  - udp
attacks:
  - port-scanning
---

# SNMP — Simple Network Management Protocol

## Finalidade
Protocolo de gerenciamento e monitoramento de ativos de rede (roteadores, switches, firewalls, servidores), organizando variáveis de estado em uma árvore **MIB (Management Information Base)** identificada por **OIDs**.

## Portas
- **UDP 161**: Consultas e comandos (`GET`, `GETNEXT`, `GETBULK`, `SET`) recebidos pelo Agente SNMP.
- **UDP 162**: Recebimento assíncrono de alertas (`SNMP Trap` e `Inform`) pelo Gerente NMS.

## Recomendações de Segurança
- Utilizar exclusivamente **SNMPv3** com autenticação e criptografia (`authPriv`).
- Alterar ou desativar *Community Strings* padrão (`public` / `private`) presentes no SNMPv1/v2c.
