---
id: https
name: Hypertext Transfer Protocol Secure
acronym: HTTPS
osi_layer: 7
tcp_ip_layer: application
transport:
  - TCP
ports:
  - 443
  - 8443
aliases:
  - HTTP over TLS
  - HTTP Secure
related_protocols:
  - http
  - tls
  - tcp
attacks:
  - port-scanning
---

# HTTPS — Hypertext Transfer Protocol Secure

## Finalidade
O HTTPS é a implementação segura do protocolo HTTP, operando sobre uma camada criptográfica provida pelo protocolo TLS (Transport Layer Security). O objetivo primordial é prover privacidade, integridade dos dados transmitidos e autenticação da identidade do servidor (e opcionalmente do cliente via mTLS).

## Funcionamento
1. O cliente estabelece o 3-way handshake TCP convencional na porta 443.
2. Em seguida, é iniciado o handshake TLS:
   - Troca de mensagens `Client Hello` e `Server Hello` para negociar a versão do TLS (ex: TLS 1.3), cipher suite suportada e extensões (como SNI - Server Name Indication).
   - O servidor apresenta seu certificado digital X.509 emitido por uma Autoridade Certificadora (CA) confiável.
   - Troca de chaves assimétricas via Diffie-Hellman com curvas elípticas (ECDHE) para derivar chaves simétricas efêmeras.
3. Concluído o handshake TLS, o tráfego HTTP convencional é completamente criptografado antes da transmissão sobre o transporte TCP.

## Portas
- **TCP 443**: Porta padrão universal para tráfego seguro HTTPS.
- **TCP 8443**: Porta alternativa frequentemente utilizada por painéis de administração e APIs seguras.

## Características
- **Confidencialidade**: Criptografia simétrica com algoritmos modernos (AES-GCM, ChaCha20-Poly1305).
- **Integridade**: Garantia contra adulteração de pacotes por meio de tags de autenticação de mensagens (MAC/AEAD).
- **Autenticidade**: Certificados digitais com assinatura de chave pública.

## Recomendações de Segurança
- Utilizar exclusivamente TLS 1.3 ou TLS 1.2 com suites de cifras com sigilo de encaminhamento perfeito (*Forward Secrecy*).
- Desativar versões obsoletas e vulneráveis (SSL 2.0, SSL 3.0, TLS 1.0 e TLS 1.1).
- Implementar OCSP Stapling para validação ágil de revogação de certificados.
