---
id: dns-amplification
name: DNS Amplification DDoS Attack
protocol: dns
severity: high
mitre_attack_id: T1498.002
affected_layers:
  - 4
  - 7
indicators:
  - Respostas DNS UDP volumosas (> 1000 bytes via EDNS0) não precedidas por consulta local
  - Alto volume de consultas do tipo ANY, TXT ou DNSSEC direcionadas a resolvedores abertos
---

# DNS Amplification (Ataque DDoS por Reflexão)

## Descrição do Ataque
Ataque distribuído de negação de serviço volumétrico no qual o atacante envia pequenas consultas DNS (com o endereço IP de origem falsificado para o IP da vítima) para servidores DNS recursivos abertos na Internet. Esses servidores respondem à vítima com pacotes dezenas de vezes maiores (fator de amplificação de até 50x), saturando o link de rede do alvo.

## Mitigação Recomendada
- Implementar **BCP 38 (Ingress Filtering)** nos provedores para bloquear pacotes com IP de origem falsificado.
- Configurar **Response Rate Limiting (RRL)** e desativar recursão aberta em servidores DNS públicos.
