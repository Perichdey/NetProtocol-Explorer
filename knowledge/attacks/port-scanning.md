---
id: port-scanning
name: Reconhecimento e Port Scanning
protocol: tcp
severity: low
mitre_attack_id: T1046
affected_layers:
  - 4
indicators:
  - Pacotes SYN sequenciais direcionados a múltiplas portas de um mesmo IP de destino
  - Variação rápida de portas de destino em curtos intervalos de tempo
  - Respostas com flag RST originadas do alvo para portas fechadas
---

# Port Scanning (Varredura de Portas)

## Descrição
A varredura de portas é a técnica primordial da fase de reconhecimento em que um atacante (ou auditor de segurança) envia sondas para uma série de portas de um computador alvo para descobrir quais serviços e protocolos estão ouvindo e receptivos a conexões.

Entre os métodos mais comuns estão:
- **SYN Stealth Scan**: Envia pacotes SYN. Se receber `SYN-ACK`, a porta está aberta (e o scanner envia `RST` para não completar o handshake e evitar logs de aplicação). Se receber `RST`, a porta está fechada.
- **Connect Scan**: Completa o 3-way handshake completo usando a chamada de sistema do SO.
- **UDP Scan**: Envia datagramas UDP sem payload. Se não houver resposta, a porta pode estar aberta ou filtrada; se retornar ICMP "Port Unreachable", a porta está fechada.

## Indicadores para Investigação
- Múltiplas conexões incompletas originadas do mesmo endereço IP em direção a centenas de portas diferentes em poucos segundos.
- Pacotes com combinações raras de flags TCP (ex.: NULL scan, FIN scan, XMAS scan).
