---
id: arp-spoofing
name: ARP Cache Poisoning / Spoofing
protocol: arp
severity: high
mitre_attack_id: T1557.002
affected_layers:
  - 2
indicators:
  - Múltiplos endereços IP associados ao mesmo endereço MAC na tabela ARP local
  - Respostas ARP Gratuitas repetidas sem solicitações prévias
  - Mudança repentina do endereço MAC atribuído ao IP do gateway padrão
---

# ARP Poisoning / ARP Spoofing

## Descrição do Ataque
No ARP Spoofing, um invasor presente na mesma rede local (LAN) transmite respostas ARP fraudulentas para envenenar o cache ARP de outras máquinas. Como o protocolo ARP não valida se uma resposta corresponde a uma solicitação legítima ou se o remetente realmente detém aquele IP, os computadores da rede aceitam a atualização e alteram suas tabelas de encaminhamento físico.

Ao associar seu próprio endereço MAC ao IP do gateway da rede (e vice-versa), o atacante força todo o fluxo de pacotes a passar pelo seu computador antes de ser encaminhado ao destino real. Isso permite que o atacante atue como **Man-in-the-Middle (MitM)**, capturando senhas, cookies e dados não criptografados, ou alterando o conteúdo em trânsito.

## Indicadores para Investigação
- Detecção de respostas ARP Gratuitas com alta frequência no segmento local.
- Identificação de dois IPs distintos reportando o mesmo endereço MAC.
- Alertas de duplicação de IP no sistema operacional de estações clientes.

## Mitigação Recomendada
- Habilitar **Dynamic ARP Inspection (DAI)** nos switches de acesso.
- Fixar o endereço MAC do gateway em tabelas ARP estáticas em servidores críticos.
