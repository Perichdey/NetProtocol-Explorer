---
id: http
name: Hypertext Transfer Protocol
acronym: HTTP
osi_layer: 7
tcp_ip_layer: application
transport:
  - TCP
ports:
  - 80
  - 8080
aliases:
  - Web Protocol
related_protocols:
  - tcp
  - tls
  - https
attacks:
  - port-scanning
---

# HTTP — Hypertext Transfer Protocol

## Finalidade
O Hypertext Transfer Protocol (HTTP) é um protocolo da camada de aplicação sem retenção de estado (*stateless*), fundamental para a transmissão de hipertexto, hipermídia e dados estruturados (JSON, XML) na World Wide Web e em serviços de APIs REST.

## Funcionamento
O protocolo baseia-se no paradigma cliente-servidor:
1. O cliente estabelece uma conexão TCP na porta 80 (ou alternativa).
2. O cliente envia uma mensagem de requisição contendo método (GET, POST, PUT, DELETE, PATCH, etc.), URI de destino, versão do protocolo e cabeçalhos.
3. O servidor processa o recurso solicitado e retorna uma resposta com código de status (1xx informativo, 2xx sucesso, 3xx redirecionamento, 4xx erro do cliente, 5xx erro do servidor), cabeçalhos de resposta e corpo opcional.
4. Na versão HTTP/1.1, conexões persistentes (*Keep-Alive*) são padrão, permitindo múltiplas requisições sequenciais sobre a mesma conexão TCP.

## Portas
- **TCP 80**: Porta padrão atribuída pela IANA para tráfego web sem criptografia.
- **TCP 8080, 8000, 8888**: Portas alternativas frequentemente utilizadas por servidores proxy, ambientes de homologação e microsserviços.

## Características
- **Protocolo de Texto Puro**: Mensagens codificadas em ASCII legível por humanos.
- **Sem Estado (*Stateless*)**: Cada requisição é independente; o controle de sessão depende de mecanismos como Cookies ou tokens JWT.
- **Extensível**: Headers customizados permitem controle de cache, autenticação e negociação de conteúdo.

## Vulnerabilidades e Ataques Relacionados
- **Tráfego Não Criptografado (Cleartext)**: Credenciais, cookies de sessão e dados sensíveis trafegam expostos, vulneráveis a interceptação (*sniffing*) e ataques Man-in-the-Middle (MitM).
- **Vulnerabilidades de Aplicação**: Injeção de SQL (SQLi), Cross-Site Scripting (XSS), Server-Side Request Forgery (SSRF).
- **Session Hijacking**: Sequestro de cookies de sessão interceptados na rede local.

## Recomendações de Segurança
- Migrar integralmente para **HTTPS** (HTTP encapsulado em TLS).
- Configurar cabeçalho `Strict-Transport-Security` (HSTS) para forçar conexões seguras.
- Atribuir as flags `Secure` e `HttpOnly` a cookies sensíveis.
