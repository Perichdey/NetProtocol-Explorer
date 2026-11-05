---
id: ntp
name: Network Time Protocol
acronym: NTP
osi_layer: 7
tcp_ip_layer: application
transport:
  - UDP
ports:
  - 123
aliases:
  - SNTP
related_protocols:
  - udp
attacks:
  - port-scanning
---

# NTP — Network Time Protocol

## Finalidade
O Network Time Protocol (RFC 5905) sincroniza os relógios de sistemas computacionais com referências de tempo de alta precisão (como relógios atômicos e GPS) através de redes de pacotes com latência variável. A sincronização temporal precisa é vital para validação de certificados TLS, Kerberos e correlação de logs de segurança (SIEM).

## Funcionamento
Organiza os servidores em níveis hierárquicos denominados **Stratum**:
- **Stratum 0**: Relógios de referência física (atômicos, GPS, rádio).
- **Stratum 1**: Servidores primários diretamente conectados aos dispositivos Stratum 0.
- **Stratum 2 a 15**: Servidores secundários sincronizados em cascata pela rede via porta **UDP 123**.

## Recomendações de Segurança
- Desabilitar o comando de diagnóstico `monlist` em servidores NTP legados para prevenir ataques DDoS de amplificação NTP (*NTP Amplification*).
- Utilizar autenticação simétrica ou **NTS (Network Time Security)** quando disponível.
