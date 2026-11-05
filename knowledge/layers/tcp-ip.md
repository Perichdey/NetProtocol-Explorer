---
id: tcp-ip
name: Arquitetura da Pilha TCP/IP
model: tcpip
protocols:
  - eth
  - ip
  - tcp
  - udp
  - http
  - dns
---

# Arquitetura da Pilha de Protocolos TCP/IP

Diferente do modelo teórico OSI de 7 camadas, a arquitetura TCP/IP (desenvolvida originalmente pela DARPA e formalizada nas RFCs da IETF) adota uma abordagem mais pragmática e modular organizada em **quatro camadas fundamentais**:

1. **Acesso à Rede / Enlace (Link Layer)**:
   - Corresponde à fusão das camadas Física e de Enlace do modelo OSI.
   - Envolve drivers de placa de rede, placas de rede (NICs), protocolos de enquadramento como Ethernet (IEEE 802.3), Wi-Fi (IEEE 802.11) e mecanismos de resolução local como ARP.

2. **Internet / Rede (Internet Layer)**:
   - Núcleo da interconexão de redes (*Internetworking*).
   - Responsável pelo roteamento de datagramas de forma sem conexão e de melhor esforço (*best-effort*).
   - Protocolos principais: IPv4, IPv6, ICMP, ICMPv6, IPsec.

3. **Transporte (Transport Layer)**:
   - Fornece canais de fluxo de dados de ponta a ponta entre aplicações.
   - Define os protocolos TCP (orientado a conexão e confiável) e UDP (sem conexão e veloz).

4. **Aplicação (Application Layer)**:
   - Abrange todas as funções das camadas de Sessão, Apresentação e Aplicação do modelo OSI.
   - Trata os detalhes específicos de formato, sessão e protocolo de cada aplicação (HTTP, DNS, TLS, SSH, SMTP, DHCP).
