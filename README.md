# NetProtocol Explorer — Plataforma Visual e Interativa de Aprendizado de Redes

Uma aplicação contemporânea, de alto desempenho e didática para análise, observabilidade e estudo de protocolos de redes de computadores e cibersegurança, utilizando dados reais capturados em tempo real via **Wireshark (TShark)** ou arquivos **PCAP/PCAPNG**.

---

## ✨ Funcionalidades Completas Implementadas

1. **Motor de Captura e Dissecação Real (TShark Adapter)**:
   - Captura ao vivo em interfaces de rede locais (Ethernet, Wi-Fi, Loopback) com suporte a filtros BPF (`tcp port 443`, `dns`, `host 192.168.1.1`).
   - Importação direta de arquivos `.pcap` e `.pcapng` via upload na interface ou seleção de capturas da pasta `samples/`.
   - **Modo de Reprodução Controlada (Replay Didático)**: Velocidades ajustáveis (`Instantâneo`, `0.5x`, `1x`, `2x`, `5x`) para acompanhar o tráfego pacote a pacote.
2. **Arquitetura de Camadas Rigorosa (OSI 7 Camadas & TCP/IP 4 Camadas)**:
   - Classificação técnica fiel de protocolos sem pseudo-protocolos internos do Wireshark (`ethertype`, `frame`, `data` são filtrados automaticamente).
   - Alternância interativa entre o **Modelo OSI (Camadas 1 a 7)** e a **Arquitetura TCP/IP (4 Camadas)** com notas técnicas explicativas.
3. **Visualizações Gráficas Interativas (Apache ECharts)**:
   - **Gráfico de Rosca (Donut)**, **Barras Horizontais**, **Treemap Hierárquico** e **Evolução Temporal (Linha do Tempo por Protocolo)**.
   - 4 modos de métrica: `% por Pacotes`, `% por Bytes`, `Quantidade Absoluta` e `Taxa por Segundo (pkts/s)`.
4. **Rastreador de Fluxos e Grafo Interativo de Topologia (Force-Directed Graph)**:
   - Mapeamento automático de sessões 4-tuple (`IP Origem:Porta <-> IP Destino:Porta`), duração de fluxo, volume e **Pilha de Encapsulamento** (`ETH -> IPv4 -> UDP -> TEREDO -> IPv6 -> ICMPv6`).
   - Grafo interativo de nós (Gateway, Privado, Público, Multicast/Broadcast) com busca textual e isolamento de vizinhança em 1 clique.
5. **Centro de Cibersegurança & Hipóteses Investigativas**:
   - Correlação heurística em tempo real que gera **hipóteses investigativas educacionais** (diferenciando anomalias de ataques confirmados) com evidência observada, hipótese técnica e recomendação de mitigação.
   - Detecção didática de *Port Scanning*, *Tráfego HTTP em Texto Claro*, *Tunelamento IPv6 Teredo*, *Anomalias DNS* e *Atividade ARP*.
6. **Sistema Modular de Conhecimento em Markdown (`knowledge/`) com Hot-Reload**:
   - 22 fichas técnicas de protocolos (`dns.md`, `http.md`, `https.md`, `tls.md`, `quic.md`, `ssh.md`, `smb.md`, `teredo.md`, `ipv6.md`, `icmpv6.md`, etc.) e 8 guias de ataques (`dns-spoofing.md`, `arp-spoofing.md`, `syn-flood.md`, etc.).
   - **Editor Markdown Ao Vivo** integrado na interface e monitoramento em tempo real via `Watchdog` (qualquer arquivo `.md` adicionado ou editado atualiza o sistema sem reiniciar).
   - **Comparador Lado a Lado** de protocolos e **Glossário Técnico** integrado.

---

## 📦 Passo a Passo de Instalação em Outra Máquina

### 1. Pré-requisitos no Computador de Destino
Antes de transferir ou clonar o projeto, instale na máquina de destino:

1. **Wireshark (com TShark e Npcap)**:
   - Baixe em: [https://www.wireshark.org/download.html](https://www.wireshark.org/download.html)
   - Durante a instalação no Windows, mantenha marcadas as opções **TShark** e **Install Npcap** (necessário para captura em placas de rede ao vivo).
2. **Python 3.10 ou superior (recomendado Python 3.12)**:
   - Baixe em: [https://www.python.org/downloads/](https://www.python.org/downloads/)
   - **IMPORTANTE (Windows)**: Na primeira tela do instalador do Python, marque a caixa **"Add python.exe to PATH"**.
3. **Node.js 18+ LTS** *(Opcional caso você já copie a pasta `frontend/dist` compilada; necessário apenas se desejar recompilar o código React/TypeScript)*:
   - Baixe em: [https://nodejs.org/](https://nodejs.org/)

---

### 2. Copiando os Arquivos do Projeto
Copie a pasta do projeto para a nova máquina.
> **Dica**: Não é necessário copiar as pastas `.venv` nem `frontend/node_modules` (elas são pesadas e específicas de cada sistema). Copie todo o restante, incluindo a pasta `frontend/dist` (que já contém a interface gráfica pronta para produção) e a pasta `knowledge/`.

---

### 3. Executando o Instalador Automatizado (Windows)
Na máquina de destino, abra a pasta do projeto e dê um **duplo clique** no arquivo:
- **`install.bat`** *(ou execute `.\install.ps1` no PowerShell)*

O instalador fará automaticamente:
1. A verificação do `tshark.exe` (em `C:\Program Files\Wireshark\tshark.exe` ou no `PATH` do sistema).
2. A criação do ambiente virtual Python isolado (`.venv`).
3. A instalação de todas as bibliotecas do `requirements.txt` (`fastapi`, `uvicorn`, `websockets`, `pyyaml`, `python-multipart`, `watchdog`, `httpx`).
4. A verificação do bundle `frontend/dist` (recompilando automaticamente caso necessário).

---

### 4. Iniciando a Aplicação
Após a instalação, sempre que quiser usar o **NetProtocol Explorer**:
- Dê um **duplo clique** em **`start.bat`** *(ou execute `.\start.ps1` no PowerShell)*.
- O servidor iniciará em `http://127.0.0.1:8000` e abrirá automaticamente o navegador padrão.
- **Para Captura Ao Vivo em Placas de Rede**: Caso o Windows restrinja o acesso à placa de rede, clique com o botão direito em `start.bat` e escolha **"Executar como Administrador"**.

---

### 5. Instalação Manual (Linux / macOS / Avançado)
Caso deseje instalar em Linux (Ubuntu/Debian/Kali) ou macOS:

```bash
# 1. Instalar TShark
# Ubuntu/Debian:
sudo apt update && sudo apt install -y tshark python3-venv
# macOS (Homebrew):
brew install --cask wireshark

# 2. Criar e ativar o ambiente virtual Python na raiz do projeto
python3 -m venv .venv
source .venv/bin/activate

# 3. Instalar dependências Python
pip install --upgrade pip
pip install -r requirements.txt

# 4. (Opcional) Compilar o Frontend se a pasta frontend/dist não existir
cd frontend
npm install
npm run build
cd ..

# 5. Iniciar o servidor na porta 8000
python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
Depois, basta abrir **`http://127.0.0.1:8000`** no navegador.

---

## 🏛️ Arquitetura e Engenharia do Sistema

Para entender os detalhes arquiteturais aprofundados, diagramas conceituais, fluxo de dados do motor TShark, taxonomia de camadas e integração modular de conhecimento, consulte o documento completo:

📖 **[Documentação de Arquitetura do Sistema (docs/architecture.md)](docs/architecture.md)**

---

## 📄 Licenças

- **Código-Fonte**: Distribuído sob a licença [PolyForm Noncommercial License 1.0.0](LICENSE). Permitido o uso, estudo, reprodução e modificação estritamente para fins não-comerciais.
- **Documentação & Enciclopédia (`knowledge/`)**: Licenciada sob a [Creative Commons Atribuição-NãoComercial 4.0 Internacional (CC BY-NC 4.0)](LICENSE-DOCS).
