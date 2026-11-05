---
id: arp
name: Address Resolution Protocol
acronym: ARP
osi_layer: 2
tcp_ip_layer: link
transport:
  - Ethernet
ports: []
aliases:
  - Address Resolution
related_protocols:
  - ethernet
  - ipv4
attacks:
  - arp-spoofing
---

# ARP — Address Resolution Protocol

## Finalidade
O Address Resolution Protocol (ARP) é o protocolo fundamental da camada de enlace responsável por mapear um endereço lógico da camada de rede (IPv4) em um endereço físico de hardware (endereço MAC de 48 bits) necessário para o envio de quadros na rede local Ethernet.

## Particularidade Arquitetural
O ARP atua na fronteira entre a Camada 2 (Enlace) e a Camada 3 (Rede). Ele é encapsulado diretamente em quadros Ethernet (EtherType `0x0806`), sem utilizar cabeçalho IP. Embora seu objetivo seja servir à camada de rede resolvendo IPs, seu formato e escopo de transmissão residem estritamente no segmento de enlace local.

## Funcionamento
1. **ARP Request**: Quando um host `A` precisa enviar um pacote para o IP `B` na mesma sub-rede, mas não conhece seu endereço MAC, ele transmite um quadro em broadcast (`ff:ff:ff:ff:ff:ff`): *"Quem tem o IP X.X.X.X? Responda para o MAC Y:Y:Y:Y"*.
2. **ARP Reply**: O host que detém o IP solicitado responde via unicast diretamente para o host `A`: *"Eu sou X.X.X.X e meu MAC é Z:Z:Z:Z"*.
3. **Cache ARP**: Ambos os hosts armazenam o mapeamento (IP <-> MAC) em sua tabela ARP local para evitar transmissões redundantes.

## Vulnerabilidades e Ataques Relacionados
O protocolo ARP foi projetado sem qualquer mecanismo nativo de autenticação ou validação de identidade:
- **ARP Spoofing / ARP Poisoning**: Um invasor na mesma rede local transmite respostas ARP gratuitas forjadas (*Gratuitous ARP*), associando seu próprio endereço MAC ao endereço IP do gateway padrão ou de outro host.
- **Consequências**: Interceptação completa de todo o tráfego da rede local (Man-in-the-Middle), escuta clandestina de credenciais e senhas em tráfego sem criptografia ou negação de serviço.

## Recomendações de Segurança
- Implementar **Dynamic ARP Inspection (DAI)** nos switches de acesso, validando pacotes ARP contra a tabela de associação do DHCP Snooping.
- Configurar entradas ARP estáticas para gateways críticos em ambientes de alta criticidade.
