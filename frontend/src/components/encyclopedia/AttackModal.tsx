import React, { useState, useEffect } from 'react';
import { 
  X, ShieldAlert, AlertTriangle, Activity, Eye, CheckCircle, ExternalLink 
} from 'lucide-react';
import { api, AttackDetail } from '../../services/api';

interface AttackModalProps {
  attackId: string | null;
  onClose: () => void;
  onSelectProtocol?: (proto: string) => void;
}

export const AttackModal: React.FC<AttackModalProps> = ({ attackId, onClose, onSelectProtocol }) => {
  const [detail, setDetail] = useState<AttackDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attackId) {
      setDetail(null);
      return;
    }

    async function loadAttack() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getKnowledgeAttack(attackId!);
        setDetail(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar detalhes do ataque');
      } finally {
        setLoading(false);
      }
    }

    loadAttack();
  }, [attackId]);

  if (!attackId) return null;

  const severityBadges: Record<string, { bg: string; text: string; border: string }> = {
    critical: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/50' },
    high: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
    medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
    low: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  };

  const sevStyle = detail
    ? severityBadges[detail.meta.severity.toLowerCase()] || severityBadges.medium
    : severityBadges.medium;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B1120] border border-rose-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-mono text-white">
                  {detail ? detail.meta.name : attackId}
                </h3>
                {detail && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}>
                    Risco {detail.meta.severity}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Módulo Didático de Segurança & Hipóteses Investigativas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs font-sans text-slate-300">
          {loading && (
            <div className="py-12 text-center font-mono text-slate-400">
              Carregando dados do ataque...
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 font-mono">
              {error}
            </div>
          )}

          {detail && (
            <>
              {/* Metadados MITRE & Protocolo */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono">
                {detail.meta.protocol && (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block mb-0.5">PROTOCOLO ALVO</span>
                    <button
                      onClick={() => onSelectProtocol?.(detail.meta.protocol!)}
                      className="text-cyan-400 font-bold hover:underline uppercase text-xs"
                    >
                      {detail.meta.protocol}
                    </button>
                  </div>
                )}

                {detail.meta.mitre_attack_id && (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block mb-0.5">MITRE ATT&CK</span>
                    <span className="text-slate-200 font-bold text-xs">
                      {detail.meta.mitre_attack_id}
                    </span>
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-0.5">CAMADAS AFETADAS</span>
                  <span className="text-purple-400 font-bold text-xs">
                    {detail.meta.affected_layers.length > 0 
                      ? detail.meta.affected_layers.map(l => `Camada ${l}`).join(', ') 
                      : 'Múltiplas'}
                  </span>
                </div>
              </div>

              {/* Indicadores Observáveis */}
              {detail.meta.indicators.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Indicadores Observáveis no Tráfego</span>
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    {detail.meta.indicators.map((ind, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-mono font-bold">•</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Conteúdo Markdown Renderizado */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80 leading-relaxed text-slate-300">
                {detail.content.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('# ')) {
                    return null; // Título já no header
                  }
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h4 key={idx} className="text-sm font-bold font-mono text-white mt-3 mb-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        {paragraph.replace('## ', '')}
                      </h4>
                    );
                  }
                  if (paragraph.startsWith('- ')) {
                    return (
                      <ul key={idx} className="list-disc list-inside space-y-1 pl-2">
                        {paragraph.split('\n').map((li, lIdx) => (
                          <li key={lIdx}>{li.replace(/^- /, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={idx}>{paragraph}</p>;
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
