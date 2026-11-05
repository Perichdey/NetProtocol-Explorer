---
id: dns
name: Domain Name System
acronym: DNS
osi_layer: 7
tcp_ip_layer: application
transport:
  - UDP
  - TCP
ports:
  - 53
aliases:
  - Domain Name Service
related_protocols:
  - udp
  - tcp
  - tls
  - http
attacks:
  - dns-spoofing
  - dns-tunneling
  - dns-amplification
---

# DNS — Domain Name System

## Finalidade
O Domain Name System (DNS) é o serviço hierárquico e distribuído responsável por traduzir nomes de domínio legíveis por humanos (como `exemplo.com.br`) em endereços IP numéricos (IPv4 ou IPv6) necessários para o roteamento e localização de recursos de rede.

## Funcionamento
O cliente (stub resolver) envia uma consulta DNS para um servidor recursivo local ou público. Caso a resposta não esteja em cache:
1. O resolvedor consulta os servidores raiz (*Root Servers*, representados por 13 identidades de autoridade global).
2. O servidor raiz encaminha a consulta para os servidores de domínio de primeiro nível (*TLD*, como `.br` ou `.com`).
3. O servidor TLD aponta para o servidor autoritativo responsável pelo domínio pesquisado.
4. O servidor autoritativo retorna o registro de recurso (*Resource Record*) solicitado.

O protocolo opera primariamente sobre **UDP/53** para otimizar velocidade e latência, utilizando **TCP/53** quando a resposta excede o tamanho máximo de buffer UDP (512 bytes padrão ou negociado via EDNS0) ou para transferências de zona (*Zone Transfers* - AXFR/IXFR).

## Portas
- **UDP 53**: Consultas e respostas convencionais de resolução.
- **TCP 53**: Transferências de zona completas/incrementais e respostas de grande porte com truncamento (*flag TC=1*).
- **TCP 853**: DNS over TLS (DoT).
- **TCP 443**: DNS over HTTPS (DoH).

## Características
- **Estrutura de Árvore Invertida**: Nó raiz no topo, seguido por TLDs, domínios de segundo nível e subdomínios.
- **Registros Principais**:
  - `A`: Mapeia nome para IPv4 (32 bits).
  - `AAAA`: Mapeia nome para IPv6 (128 bits).
  - `CNAME`: Alias canônico para outro nome.
  - `MX`: Servidor de troca de correio eletrônico.
  - `NS`: Servidores de nome autoritativos.
  - `TXT`: Texto descritivo (usado para validações SPF, DKIM e DMARC).
  - `PTR`: Ponteiro para resolução reversa (IP -> Nome).

## Vulnerabilidades e Ataques Relacionados
- **DNS Spoofing / Cache Poisoning**: Injeção de registros fraudulentos no cache do resolvedor, redirecionando o tráfego para servidores maliciosos.
- **DNS Tunneling**: Encapsulamento de dados arbitrários em consultas e respostas DNS (comumente usando campos TXT ou subdomínios codificados em Base64/Hex) para exfiltração de dados ou canais de comando e controle (C2) contornando firewalls.
- **DNS Amplification (DDoS)**: Ataque de reflexão explorando resolvedores abertos e registros ANY/TXT volumosos com spoofing do IP da vítima.

## Indicadores para Investigação
- Consultas excessivamente frequentes ou com intervalos milimetricamente fixos (possível beaconing de malware).
- Nomes de subdomínio anormalmente longos ou com alta entropia calculada (ex.: `a8f3b9c201e7.dominio.com`).
- Respostas DNS anormalmente volumosas ou uso desproporcional de registros TXT.
- Consultas recorrentes para domínios gerados por algoritmo (DGA).

## Recomendações de Segurança
- Implementar **DNSSEC** (DNS Security Extensions) para garantir autenticidade e integridade criptográfica das respostas.
- Desabilitar recursão aberta em servidores DNS acessíveis publicamente.
- Restringir transferências de zona (AXFR) exclusivamente a endereços IP de servidores secundários autorizados.
- Monitorar e inspecionar o comprimento e a frequência de requisições DNS nos perímetros da rede.
