import React, { useState, useEffect } from 'react';
import { 
  X, BookOpen, Search, ArrowRight, ShieldAlert, GitCompare, FileText 
} from 'lucide-react';
import { api, ProtocolMetadata } from '../../services/api';

interface EncyclopediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProtocol: (protoId: string) => void;
}

type ModalTab = 'catalog' | 'compare' | 'glossary';

export const EncyclopediaModal: React.FC<EncyclopediaModalProps> = ({
  isOpen,
  onClose,
  onSelectProtocol,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('catalog');
  const [protocols, setProtocols] = useState<ProtocolMetadata[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Estados para o Comparador de Protocolos
  const [compareLeftId, setCompareLeftId] = useState<string>('tcp');
  const [compareRightId, setCompareRightId] = useState<string>('udp');

  // Estado para o Glossário
  const [glossaryBody, setGlossaryBody] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      try {
        setLoading(true);
        const res = await api.getKnowledgeProtocols(selectedLayer || undefined);
        setProtocols(res.protocols || []);
      } catch (err) {
        console.error('Erro ao carregar enciclopédia:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isOpen, selectedLayer]);

  useEffect(() => {
    if (isOpen && activeTab === 'glossary' && !glossaryBody) {
      api.getGlossary()
        .then((res) => setGlossaryBody(res.content || ''))
        .catch(() => setGlossaryBody('Erro ao carregar glossário.'));
    }
  }, [isOpen, activeTab, glossaryBody]);

  if (!isOpen) return null;

  const filtered = protocols.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.acronym && p.acronym.toLowerCase().includes(q)) ||
      p.ports.some((pt) => pt.toString().includes(q))
    );
  });

  const leftProto = protocols.find((p) => p.id === compareLeftId) || protocols[0];
  const rightProto = protocols.find((p) => p.id === compareRightId) || protocols[1] || protocols[0];

  const osiLayerColors: Record<number, string> = {
    7: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
    6: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
    5: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10',
    4: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
    3: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
    2: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    1: 'text-slate-400 border-slate-500/40 bg-slate-500/10',
  };

  const renderMarkdownText = (text: string) => {
    return text.split('\n\n').map((paragraph, idx) => {
      if (paragraph.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-base font-bold font-mono text-cyan-400 pb-1 border-b border-slate-800">
            {paragraph.replace('# ', '')}
          </h1>
        );
      }
      if (paragraph.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-sm font-bold font-mono text-white mt-4 mb-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            {paragraph.replace('## ', '')}
          </h2>
        );
      }
      if (paragraph.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xs font-bold font-mono text-cyan-300 mt-3 mb-1">
            {paragraph.replace('### ', '')}
          </h3>
        );
      }
      if (paragraph.startsWith('- ')) {
        return (
          <ul key={idx} className="list-disc list-inside space-y-1 text-slate-300 pl-2">
            {paragraph.split('\n').map((li, lIdx) => (
              <li key={lIdx}>{li.replace(/^- /, '')}</li>
            ))}
          </ul>
        );
      }
      return <p key={idx} className="text-slate-300 leading-relaxed text-xs">{paragraph}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B1120] border border-cyan-500/40 rounded-2xl max-w-5xl w-full p-6 shadow-2xl relative flex flex-col max-h-[88vh] overflow-hidden glow-cyan">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-mono text-white">
                Centro Educacional & Enciclopédia de Redes
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Base de conhecimento modular orientada a arquivos Markdown (.md) com Hot-Reload
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Abas do Centro Educacional */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-2.5 py-1 rounded font-mono transition-colors flex items-center gap-1.5 ${
                  activeTab === 'catalog'
                    ? 'bg-cyan-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Protocolos</span>
              </button>
              <button
                onClick={() => {
                  setSelectedLayer(null);
                  setActiveTab('compare');
                }}
                className={`px-2.5 py-1 rounded font-mono transition-colors flex items-center gap-1.5 ${
                  activeTab === 'compare'
                    ? 'bg-cyan-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Comparador</span>
              </button>
              <button
                onClick={() => setActiveTab('glossary')}
                className={`px-2.5 py-1 rounded font-mono transition-colors flex items-center gap-1.5 ${
                  activeTab === 'glossary'
                    ? 'bg-cyan-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Glossário</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ABA 1: CATÁLOGO DE PROTOCOLOS */}
        {activeTab === 'catalog' && (
          <>
            <div className="py-3 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por protocolo, sigla ou porta (ex: DNS, 53, HTTP, Teredo, ARP)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedLayer(null)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                    selectedLayer === null
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Todas
                </button>
                {[7, 6, 4, 3, 2].map((layerNum) => (
                  <button
                    key={layerNum}
                    onClick={() => setSelectedLayer(selectedLayer === layerNum ? null : layerNum)}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                      selectedLayer === layerNum
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    L{layerNum}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 pr-1">
              {loading ? (
                <div className="py-12 text-center text-slate-400 font-mono text-xs">
                  Carregando base de protocolos...
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered.map((proto) => {
                    const layerStyle = osiLayerColors[proto.osi_layer] || 'text-slate-300 border-slate-700 bg-slate-800';
                    return (
                      <div
                        key={proto.id}
                        onClick={() => {
                          onSelectProtocol(proto.id);
                          onClose();
                        }}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all hover:bg-slate-900 flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-mono font-bold text-white text-xs group-hover:text-cyan-400 transition-colors">
                              {proto.name}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${layerStyle}`}>
                              OSI {proto.osi_layer}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mb-2">
                            {proto.acronym && <span>{proto.acronym}</span>}
                            {proto.transport.length > 0 && <span>• {proto.transport.join('/')}</span>}
                            {proto.ports.length > 0 && (
                              <span className="text-cyan-300">
                                • Porta {proto.ports.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                          {proto.attacks.length > 0 ? (
                            <span className="flex items-center gap-1 text-rose-400">
                              <ShieldAlert className="w-3 h-3" />
                              {proto.attacks.length} ameaças associadas
                            </span>
                          ) : (
                            <span className="text-slate-500">Protocolo base</span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  Nenhum protocolo encontrado para o filtro "{search}".
                </div>
              )}
            </div>
          </>
        )}

        {/* ABA 2: COMPARADOR DE PROTOCOLOS LADO A LADO */}
        {activeTab === 'compare' && (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <div>
                <label className="block text-[10px] font-mono uppercase text-cyan-400 mb-1">
                  Protocolo A (Esquerda)
                </label>
                <select
                  value={compareLeftId}
                  onChange={(e) => setCompareLeftId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                >
                  {protocols.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.acronym || p.id.toUpperCase()} — {p.name} (OSI L{p.osi_layer})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-purple-400 mb-1">
                  Protocolo B (Direita)
                </label>
                <select
                  value={compareRightId}
                  onChange={(e) => setCompareRightId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                >
                  {protocols.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.acronym || p.id.toUpperCase()} — {p.name} (OSI L{p.osi_layer})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {leftProto && rightProto && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[leftProto, rightProto].map((proto, idx) => (
                  <div
                    key={`${proto.id}-${idx}`}
                    className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div>
                        <span className="text-base font-bold text-white">{proto.name}</span>
                        <span className="ml-2 text-cyan-400">({proto.acronym || proto.id.toUpperCase()})</span>
                      </div>
                      <button
                        onClick={() => {
                          onSelectProtocol(proto.id);
                          onClose();
                        }}
                        className="px-2 py-1 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px] hover:bg-cyan-500/25"
                      >
                        Abrir Ficha Completa
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                        <span className="text-slate-500 block">Camada OSI</span>
                        <span className="text-white font-bold">Camada {proto.osi_layer}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                        <span className="text-slate-500 block">Arquitetura TCP/IP</span>
                        <span className="text-white font-bold uppercase">{proto.tcp_ip_layer}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                        <span className="text-slate-500 block">Transporte</span>
                        <span className="text-cyan-300 font-bold">
                          {proto.transport.length > 0 ? proto.transport.join(' / ') : 'N/A (Direto)'}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                        <span className="text-slate-500 block">Portas Padrão</span>
                        <span className="text-emerald-300 font-bold">
                          {proto.ports.length > 0 ? proto.ports.join(', ') : 'Sem porta fixa'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-500 block text-[10px] uppercase mb-1">
                        Protocolos Relacionados
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {proto.related_protocols.length > 0 ? (
                          proto.related_protocols.map((rp) => (
                            <span
                              key={rp}
                              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] uppercase"
                            >
                              {rp}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[11px]">Nenhum especificado</span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-500 block text-[10px] uppercase mb-1">
                        Vetores de Ameaça Associados ({proto.attacks.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {proto.attacks.length > 0 ? (
                          proto.attacks.map((att) => (
                            <span
                              key={att}
                              className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px]"
                            >
                              {att}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[11px]">Sem vetores diretos listados</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 3: GLOSSÁRIO TÉCNICO DE REDES */}
        {activeTab === 'glossary' && (
          <div className="flex-1 overflow-y-auto py-4 px-2">
            <div className="space-y-3 font-sans bg-slate-900/50 p-5 rounded-xl border border-slate-800">
              {renderMarkdownText(glossaryBody || 'Carregando glossário técnico...')}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-mono text-slate-400">
          <span>{protocols.length} protocolos indexados em tempo de execução (Hot-Reload Ativo)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
