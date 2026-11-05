---
id: dns-tunneling
name: DNS Tunneling & Data Exfiltration
protocol: dns
severity: critical
mitre_attack_id: T1071.004
affected_layers:
  - 7
indicators:
  - Subdomínios longos com alta entropia Shannon (Base64/Hex)
  - Consultas frequentes para o mesmo domínio raiz com prefixos variáveis
  - Respostas DNS volumosas utilizando registros TXT ou CNAME
---

# DNS Tunneling (Tunelamento e Exfiltração via DNS)

## Descrição do Ataque
O DNS Tunneling é uma técnica que encapsula dados arbitrários (como comandos de shell, arquivos confidenciais ou tráfego IP completo) dentro de consultas e respostas DNS legítimas.

Como quase todas as redes corporativas e perimetrais permitem que consultas DNS na porta UDP 53 saiam livremente para a Internet, invasores e malwares utilizam o canal DNS para contornar políticas de firewall, proxies e sistemas de prevenção de intrusão (IPS).

O malware codifica os dados que deseja exfiltrar em subdomínios (ex: `dados_secretos_em_base64.dominio-do-atacante.com`). Quando a consulta chega ao servidor autoritativo controlado pelo invasor, os dados são decodificados. Respostas contendo novos comandos são enviadas de volta ao malware encapsuladas em registros TXT ou CNAME.

## Indicadores para Investigação
- Nomes de host com comprimento próximo ao limite máximo de 253 caracteres.
- Taxa desproporcional de consultas DNS por segundo originadas de uma mesma estação de trabalho.
- Domínios registrados recentemente com registros autoritativos apontando para servidores de VPS não convencionais.

## Mitigação Recomendada
- Utilizar servidores DNS recursivos com proteção de reputação e Threat Intelligence (DNS Firewall / RPZ).
- Inspecionar a entropia e o tamanho médio das consultas DNS nos perímetros de rede.
