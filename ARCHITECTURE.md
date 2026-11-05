# Arquitetura do Sistema — NetProtocol Explorer

O documento oficial e completo com todos os detalhes técnicos, especificações conceituais, diagramas Mermaid de componentes e fluxo de dados encontra-se em:

👉 **[docs/architecture.md](docs/architecture.md)**

---

### Resumo dos Tópicos Cobertos:
1. **Visão Geral e Objetivos do Projeto**: Transformar tráfego de rede em observabilidade e aprendizado didático.
2. **Princípios de Design e Diretrizes da Interface**: Dark Mode contemporâneo, ECharts Canvas e telemetria WebSocket.
3. **Diagrama Geral da Arquitetura**: Visão integrada de fontes de captura, adaptadores TShark, pipeline de análise, base de conhecimento e frontend.
4. **Detalhamento dos Componentes do Backend**:
   - Ingestão via worker thread dedicada (`TSharkAdapter`).
   - Normalização e classificação em camadas OSI (1-7) e TCP/IP (1-4) (`LayerMapper`).
   - Janelas deslizantes, 4-tuples, duração de sessões e grafos de nós (`StatsEngine`).
   - Motor de correlação e hipóteses investigativas de cibersegurança (`SecurityDetector`).
   - Base modular Markdown com recarregamento a quente via Watchdog (`KnowledgeRegistry`).
5. **Detalhamento dos Componentes do Frontend (React + TypeScript + Tailwind)**:
   - Dashboard de telemetria, explorador de camadas e gráficos interativos (Donut, Barras, Treemap e Timeline).
   - Centro de Cibersegurança e matriz didática de ameaças.
   - Matriz de conexões, grafo interativo Force-Directed e inspeção da pilha de encapsulamento.
   - Enciclopédia modular, editor Markdown in-app, comparador lado a lado e glossário.
6. **Fluxo de Dados e Diagrama de Sequência**: Ciclo de vida completo da captura até a renderização na interface.
7. **Estrutura Completa do Repositório**.
8. **Considerações de Desempenho e Segurança**.
