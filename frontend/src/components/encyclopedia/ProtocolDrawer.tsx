import React, { useState, useEffect } from 'react';
import { 
  X, BookOpen, ShieldAlert, Layers, Hash, ArrowUpRight, 
  Edit3, Save, Check, RefreshCw, FileText, AlertTriangle, ExternalLink
} from 'lucide-react';
import { api, ProtocolDetail } from '../../services/api';

interface ProtocolDrawerProps {
  protocolId: string | null;
  onClose: () => void;
  onSelectAttack?: (attackId: string) => void;
  onSelectProtocol?: (protoId: string) => void;
}

export const ProtocolDrawer: React.FC<ProtocolDrawerProps> = ({
  protocolId,
  onClose,
  onSelectAttack,
  onSelectProtocol,
}) => {
  const [detail, setDetail] = useState<ProtocolDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editContent, setEditContent] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!protocolId) {
      setDetail(null);
      return;
    }

    async function loadProto() {
      try {
        setLoading(true);
        setError(null);
        setIsEditing(false);
        setSaveSuccess(false);
        const data = await api.getKnowledgeProtocol(protocolId!);
        setDetail(data);
        setEditContent(data.content);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar protocolo');
      } finally {
        setLoading(false);
      }
    }

    loadProto();
  }, [protocolId]);

  if (!protocolId) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.updateKnowledgeProtocol(protocolId, editContent);
      setSaveSuccess(true);
      setIsEditing(false);
      const updated = await api.getKnowledgeProtocol(protocolId);
      setDetail(updated);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert('Erro ao salvar arquivo Markdown: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const osiLayerColors: Record<number, string> = {
    7: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    6: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    5: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    4: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    3: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    2: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    1: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end transition-opacity duration-300">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-[#0B1120] border-l border-slate-800 h-full flex flex-col shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-[#0D1527] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white tracking-tight">
                  {detail ? detail.meta.name : protocolId.toUpperCase()}
                </h2>
                {detail?.meta.acronym && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {detail.meta.acronym}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Enciclopédia Modular de Redes • Markdown Extensível
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {detail && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                title="Editar este Markdown diretamente"
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                Editar MD
              </button>
            )}

            {isEditing && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Salvar
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1 rounded text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancelar
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-sans text-slate-200">
          {loading && !detail && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 font-mono gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Carregando ficha técnica do protocolo...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 space-y-1">
              <div className="flex items-center gap-2 font-bold font-mono">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Protocolo Não Mapeado</span>
              </div>
              <p className="text-[11px] text-slate-400">
                O protocolo <b>{protocolId}</b> foi dissecado na rede mas ainda não possui um arquivo <code className="text-cyan-300">knowledge/protocols/{protocolId.toLowerCase()}.md</code>.
                Você pode criar o arquivo na pasta correspondente e o sistema fará o reconhecimento instantâneo via Hot-Reload.
              </p>
            </div>
          )}

          {saveSuccess && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 flex items-center gap-2 font-mono text-xs animate-fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Arquivo Markdown salvo com sucesso e recarregado na base!</span>
            </div>
          )}

          {detail && !isEditing && (
            <>
              {/* Badges de Metadados Principais */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                {/* Camada OSI */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">CAMADA OSI</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border inline-block ${osiLayerColors[detail.meta.osi_layer] || 'bg-slate-800 text-slate-300'}`}>
                    Camada {detail.meta.osi_layer}
                  </span>
                </div>

                {/* Camada TCP/IP */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">CAMADA TCP/IP</span>
                  <span className="text-cyan-400 font-semibold uppercase text-xs">
                    {detail.meta.tcp_ip_layer}
                  </span>
                </div>

                {/* Transporte */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">TRANSPORTE</span>
                  <span className="text-slate-200 font-semibold text-xs">
                    {detail.meta.transport.length > 0 ? detail.meta.transport.join(', ') : '—'}
                  </span>
                </div>

                {/* Portas Padrão */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">PORTAS PADRÃO</span>
                  <div className="flex flex-wrap gap-1">
                    {detail.meta.ports.length > 0 ? (
                      detail.meta.ports.map((pt) => (
                        <span key={pt} className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                          {pt}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-xs">—</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Ataques e Vulnerabilidades Associadas */}
              {detail.meta.attacks.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs uppercase tracking-wide">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Ameaças & Ataques Associados ({detail.meta.attacks.length})</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    A presença deste protocolo na rede pode estar associada aos seguintes cenários de exploração e vulnerabilidade:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {detail.meta.attacks.map((attId) => (
                      <button
                        key={attId}
                        onClick={() => onSelectAttack?.(attId)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors"
                      >
                        <ShieldAlert className="w-3 h-3 text-rose-400" />
                        <span>{attId}</span>
                        <ArrowUpRight className="w-3 h-3 text-rose-400 opacity-70" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Protocolos Relacionados */}
              {detail.meta.related_protocols.length > 0 && (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Protocolos Relacionados & Encapsuladores:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.meta.related_protocols.map((relId) => (
                      <button
                        key={relId}
                        onClick={() => onSelectProtocol?.(relId)}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      >
                        {relId.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Conteúdo Renderizado do Markdown */}
              <div className="pt-2 border-t border-slate-800/80 space-y-3 prose prose-invert max-w-none text-slate-300 text-xs leading-relaxed">
                <div className="markdown-body space-y-3 font-sans">
                  {detail.content.split('\n\n').map((paragraph, idx) => {
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
                    if (paragraph.startsWith('- ')) {
                      return (
                        <ul key={idx} className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                          {paragraph.split('\n').map((li, lIdx) => (
                            <li key={lIdx}>{li.replace(/^- /, '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={idx} className="text-slate-300 leading-relaxed">{paragraph}</p>;
                  })}
                </div>
              </div>
            </>
          )}

          {/* Modo de Edição Direta em Markdown */}
          {isEditing && (
            <div className="space-y-3 h-full flex flex-col">
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-[11px] font-mono flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  Editor Live: Você está editando diretamente o arquivo <code className="text-white font-bold">{detail?.meta.file_path}</code>. Ao salvar, a base será atualizada em tempo real via Watchdog.
                </span>
              </div>

              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={22}
                className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none selection:bg-cyan-500/30"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
