---
id: syn-flood
name: SYN Flood Denial of Service
protocol: tcp
severity: high
mitre_attack_id: T1499.002
affected_layers:
  - 4
indicators:
  - Alta proporção de pacotes SYN em relação a pacotes ACK/FIN
  - Múltiplas conexões no estado SYN_RECV no servidor alvo
  - Endereços IP de origem dispersos ou forjados (spoofing) sem resposta de tráfego reverso
---

# SYN Flood (Negação de Serviço)

## Descrição do Ataque
O ataque SYN Flood explora o comportamento padrão do handshake em três vias do TCP. O atacante transmite uma tempestade de pacotes TCP com a flag `SYN` ativada em direção a uma porta aberta do servidor alvo.

Ao receber cada `SYN`, o servidor aloca recursos em sua tabela de conexões pendentes (*SYN Backlog Table*), responde com `SYN-ACK` e aguarda o `ACK` final do cliente. Como o atacante utiliza endereços IP forjados ou deliberadamente ignora a resposta do servidor, a conexão nunca é concluída, permanecendo no estado `SYN_RECV` até que o temporizador expire. O acúmulo contínuo esgota a tabela de conexões, impedindo que usuários legítimos consigam conectar-se ao serviço.

## Indicadores para Investigação
- Disparo anormal na contagem de pacotes TCP com flags `SYN` sem correspondência com `ACK`.
- Alta concentração de pacotes originados de diferentes portas efêmeras para a mesma porta de destino (ex: 80 ou 443).
- Respostas `SYN-ACK` do servidor sem confirmações subsequentes.

## Mitigação Recomendada
- Ativar **SYN Cookies** (`net.ipv4.tcp_syncookies = 1` no Linux).
- Reduzir o tempo limite de espera de SYN-ACK.
- Implementar proteção em firewalls de borda (ex: TCP Intercept / SYN Proxy).
