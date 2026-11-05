---
id: ipv4
name: Internet Protocol version 4
acronym: IPv4
osi_layer: 3
tcp_ip_layer: internet
transport:
  - Ethernet
ports: []
aliases:
  - IP
  - IP v4
related_protocols:
  - ipv6
  - icmp
  - tcp
  - udp
  - arp
attacks:
  - port-scanning
---

# IPv4 — Internet Protocol version 4

## Finalidade
O Internet Protocol version 4 (IPv4) é o protocolo dominante da camada de rede na pilha TCP/IP, responsável pelo endereçamento lógico e pelo encaminhamento (roteamento) de pacotes (datagramas) entre redes heterogêneas através de roteadores.

## Funcionamento
O IPv4 utiliza endereços de **32 bits** (geralmente grafados em notação decimal com pontos, como `192.168.1.1`), oferecendo um espaço teórico de aproximadamente 4,29 bilhões de endereços.
- Opera em modo sem conexão (*best-effort delivery*): não garante que os pacotes cheguem ao destino, nem na ordem de envio, nem livres de perdas. A confiabilidade é delegada às camadas superiores (como o TCP).
- Cada pacote possui um campo **TTL** (*Time to Live*), decrementado a cada roteador por onde passa. Se atingir zero, o pacote é descartado para evitar loops infinitos de roteamento, gerando uma mensagem ICMP Time Exceeded.
- Suporta fragmentação de pacotes caso o tamanho exceda a MTU (*Maximum Transmission Unit*) do enlace de saída.

## Características
- Cabeçalho base de 20 bytes (podendo chegar a 60 bytes com opções).
- Estrutura hierárquica baseada em CIDR (*Classless Inter-Domain Routing*).
- Uso extensivo de NAT (*Network Address Translation*) para contornar o esgotamento dos endereços públicos.
