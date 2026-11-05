---
id: osi
name: Modelo de Referência OSI
model: osi
protocols:
  - eth
  - arp
  - ip
  - icmp
  - tcp
  - udp
  - tls
  - http
  - dns
---

# Modelo de Interconexão de Sistemas Abertos (OSI)

O Modelo OSI (Open Systems Interconnection) foi padronizado pela ISO (ISO/IEC 7498-1) como uma arquitetura conceitual de referência para padronizar as funções de um sistema de comunicação em sete camadas abstratas:

1. **Física (Physical)**: Transmissão de bits brutos sobre o canal físico de transmissão (níveis de tensão, frequências ópticas, conectores, cabos e modulação).
2. **Enlace de Dados (Data Link)**: Detecção de erros no meio físico, controle de acesso ao meio (MAC) e transmissão de quadros entre nós no mesmo segmento de rede (Ethernet, Wi-Fi, PPP, ARP).
3. **Rede (Network)**: Endereçamento lógico hierárquico, determinação de rotas e encaminhamento de pacotes entre redes distintas (IPv4, IPv6, ICMP, IPsec, BGP, OSPF).
4. **Transporte (Transport)**: Comunicação de ponta a ponta entre processos, multiplexação por portas, controle de fluxo, ordenação e confiabilidade (TCP, UDP, SCTP).
5. **Sessão (Session)**: Estabelecimento, manutenção, sincronização e encerramento de diálogos entre aplicações remotas (RPC, NetBIOS Session).
6. **Apresentação (Presentation)**: Sintaxe, formatação, compressão e criptografia de dados (TLS/SSL, ASCII, UTF-8, ASN.1).
7. **Aplicação (Application)**: Interfaces e serviços de rede diretamente disponibilizados para softwares de usuários e processos de negócios (HTTP, DNS, SSH, DHCP, SMTP, FTP).
