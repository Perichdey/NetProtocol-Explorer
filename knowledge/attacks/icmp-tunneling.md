---
id: icmp-tunneling
name: ICMP Tunneling & Covert Channel
protocol: icmp
severity: medium
mitre_attack_id: T1095
affected_layers:
  - 3
indicators:
  - Pacotes ICMP Echo Request/Reply com payloads anormalmente grandes (> 128 bytes) ou variáveis
  - Assimetria entre o conteúdo enviado no Echo Request e o devolvido no Echo Reply
  - Alta frequência contínua de pacotes ICMP para um mesmo endereço externo
---

# ICMP Tunneling (Canal Encoberto via Ping)

## Descrição do Ataque
Ferramentas como `ptunnel`, `icmpsh` e `hans` encapsulam tráfego TCP/IP arbitrário ou sessões interativas de comando e controle (C2) dentro do campo de dados (*payload*) de pacotes `ICMP Echo Request` e `Echo Reply` para atravessar firewalls que permitem *ping* irrestrito.

## Mitigação Recomendada
- Limitar a taxa e o tamanho máximo de pacotes ICMP nos firewalls de perímetro e inspecionar anomalias de payload.
