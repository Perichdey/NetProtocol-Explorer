---
id: dns-spoofing
name: DNS Spoofing & Cache Poisoning
protocol: dns
severity: high
mitre_attack_id: T1557.004
affected_layers:
  - 7
indicators:
  - Respostas DNS recebidas antes do servidor autoritativo legítimo com TXIDs adivinhados
  - Alteração súbita do IP resolvido para domínios conhecidos sem mudança de TTL legítima
  - Respostas DNS contendo registros adicionais (Authority/Additional) fora da zona consultada
---

# DNS Spoofing / Cache Poisoning

## Descrição do Ataque
O DNS Spoofing (ou Envenenamento de Cache DNS) consiste em introduzir dados DNS forjados no cache de um resolvedor recursivo ou diretamente para um cliente na rede local, fazendo com que um nome de domínio legítimo seja traduzido para o endereço IP de um servidor controlado pelo atacante.

## Indicadores para Investigação
- Múltiplas respostas DNS para a mesma consulta com endereços IP divergentes.
- Ausência de assinatura **DNSSEC (RRSIG)** válida em domínios que suportam validação criptográfica.

## Mitigação Recomendada
- Habilitar validação **DNSSEC** nos resolvedores recursivos.
- Utilizar randomização de porta de origem UDP (RFC 5452) e **0x20-bit encoding** nos servidores DNS.
