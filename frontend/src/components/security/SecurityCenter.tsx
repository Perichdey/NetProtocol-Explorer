import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, AlertTriangle, Info, CheckCircle2, ArrowRight, Eye, Shield, Lock 
} from 'lucide-react';
import { TelemetrySnapshot, SecurityAlert } from '../../types';
import { api, AttackMetadata } from '../../services/api';

interface SecurityCenterProps {
  telemetry: TelemetrySnapshot;
  onSelectProtocol?: (protoId: string) => void;
  onSelectAttack?: (attackId: string) => void;
}

export const SecurityCenter: React.FC<SecurityCenterProps> = ({
  telemetry,
  onSelectProtocol,
  onSelectAttack,
}) => {
  const [activeTab, setActiveTab] = useState<'hypotheses' | 'catalog'>('hypotheses');
  const [attacksCatalog, setAttacksCatalog] = useState<AttackMetadata[]>([]);

  useEffect(() => {
    api.getKnowledgeAttacks()
      .then((res) => setAttacksCatalog(res.attacks || []))
      .catch(() => {});
  }, []);

  const alerts: SecurityAlert[] = telemetry.security_alerts || [];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          label: 'ALTA ATENÇÃO',
          style: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: ShieldAlert,
        };
      case 'medium':
        return {
          label: 'INVESTIGAR',
          style: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: AlertTriangle,
        };
      default:
        return {
          label: 'INFORMATIVO / DIDÁTICO',
          style: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: Info,
        };
    }
  };

  return (
    <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col">
      {/* Header do Painel de Segurança */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                Centro de Cibersegurança & Hipóteses Investigativas
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30">
                {alerts.length} indicadores na captura
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Nota educacional: Indicadores apontam hipóteses técnicas para investigação e não confirmam ataques automaticamente.
            </p>
          </div>
        </div>

        {/* Alternador entre Hipóteses Ativas e Matriz de Ameaças */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setActiveTab('hypotheses')}
            className={`px-3 py-1 rounded font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'hypotheses'
                ? 'bg-rose-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Hipóteses do Tráfego ({alerts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1 rounded font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'bg-rose-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Catálogo de Ameaças ({attacksCatalog.length})</span>
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      {activeTab === 'hypotheses' ? (
        alerts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {alerts.map((alert) => {
              const badge = getSeverityBadge(alert.severity);
              const Icon = badge.icon;
              return (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 flex flex-col justify-between gap-2.5 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${badge.style}`}>
                          <Icon className="w-3 h-3" />
                          {badge.label}
                        </span>
                        <button
                          onClick={() => onSelectProtocol?.(alert.protocol.toLowerCase())}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-500/40"
                        >
                          Protocolo: {alert.protocol}
                        </button>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{alert.timestamp}</span>
                    </div>

                    <h3 className="text-xs font-bold font-mono text-white mb-1.5">
                      {alert.title}
                    </h3>

                    <div className="space-y-1.5 text-[11px] font-mono">
                      <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 text-slate-300">
                        <span className="text-cyan-400 font-semibold">Evidência Observada: </span>
                        {alert.evidence}
                      </div>
                      <div className="text-slate-300 leading-relaxed">
                        <span className="text-amber-400 font-semibold">Hipótese Investigativa: </span>
                        {alert.hypothesis}
                      </div>
                      <div className="text-slate-400 leading-relaxed">
                        <span className="text-emerald-400 font-semibold">Recomendação: </span>
                        {alert.recommendation}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => onSelectProtocol?.(alert.protocol.toLowerCase())}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <span>Ver Protocolo {alert.protocol}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    {alert.attack_id && (
                      <button
                        onClick={() => onSelectAttack?.(alert.attack_id!)}
                        className="px-2.5 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-mono flex items-center gap-1 transition-colors"
                      >
                        <ShieldAlert className="w-3 h-3" />
                        <span>Estudar Vetor de Ataque</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400 font-mono text-xs">
            <CheckCircle2 className="w-7 h-7 text-emerald-400/80" />
            <span>Nenhum indicador suspeito ou hipótese de anomalia detectada no tráfego atual.</span>
            <span className="text-[11px] text-slate-500">
              Inicie uma captura ou carregue um arquivo PCAP para executar a correlação heurística.
            </span>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {attacksCatalog.map((att) => (
            <div
              key={att.id}
              onClick={() => onSelectAttack?.(att.id)}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono font-bold text-xs text-white group-hover:text-rose-400 transition-colors">
                    {att.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    {att.severity}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mb-2">
                  Camadas OSI: {(att.affected_layers || []).join(', ') || 'Geral'} • Alvo: {(att.protocol || 'Rede').toUpperCase()}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-rose-400">
                <span>Abrir guia de investigação</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
