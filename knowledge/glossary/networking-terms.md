# Glossário Técnico de Redes e Cibersegurança

### 3-Way Handshake
Processo de três etapas (SYN, SYN-ACK, ACK) utilizado pelo protocolo TCP para estabelecer uma conexão confiável e sincronizar números de sequência entre cliente e servidor.

### ARP (Address Resolution Protocol)
Protocolo utilizado para descobrir o endereço de camada de enlace (MAC) associado a um endereço de camada de rede (IPv4) na mesma rede local.

### BPF (Berkeley Packet Filter)
Linguagem de regras utilizada em ferramentas como Wireshark, TShark e tcpdump para filtrar pacotes em tempo real no kernel antes do processamento.

### Checksum
Código numérico calculado sobre os bytes de um cabeçalho ou payload para verificar se os dados foram corrompidos durante o transporte.

### Encapsulamento
Processo em que uma camada inferior adiciona seu cabeçalho (e opcionalmente rodapé) aos dados recebidos da camada superior, empilhando as estruturas de comunicação.

### MTU (Maximum Transmission Unit)
O maior tamanho de pacote ou quadro (em bytes) que pode ser transmitido em uma interface de rede sem necessidade de fragmentação (geralmente 1500 bytes em Ethernet).

### Promiscuous Mode (Modo Promíscuo)
Modo de operação de uma placa de rede no qual ela captura e repassa ao sistema operacional todos os quadros que trafegam no meio físico, e não apenas aqueles endereçados explicitamente ao seu próprio endereço MAC.

### RTT (Round Trip Time)
Tempo decorrido entre o envio de um pacote e o recebimento de sua confirmação correspondente.

### TTL (Time to Live)
Campo no cabeçalho IPv4 que limita a vida útil de um pacote na rede para evitar loops eternos de roteamento.
