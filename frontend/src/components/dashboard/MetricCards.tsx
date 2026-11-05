import React from 'react';
import { 
  Package, Database, Layers, Network, Globe, ShieldAlert, Cpu 
} from 'lucide-react';
import { TelemetrySnapshot } from '../../types';

interface MetricCardsProps {
  telemetry: TelemetrySnapshot;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ telemetry }) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatBps = (bps: number): string => {
    if (bps === 0) return '0 bps';
    const k = 1000;
    const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps'];
    const i = Math.floor(Math.log(bps) / Math.log(k));
    return parseFloat((bps / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const alertsCount = (telemetry.security_alerts || []).length;

  const cards = [
    {
      title: 'Total de Pacotes',
      value: telemetry.total_packets.toLocaleString('pt-BR'),
      subtext: `${telemetry.packets_per_second.toLocaleString('pt-BR')} pkts/s`,
      icon: Package,
      color: 'from-cyan-500/20 to-blue-500/10',
      textColor: 'text-cyan-400',
    },
    {
      title: 'Volume de Dados',
      value: formatBytes(telemetry.total_bytes),
      subtext: formatBps(telemetry.bytes_per_second),
      icon: Database,
      color: 'from-emerald-500/20 to-teal-500/10',
      textColor: 'text-emerald-400',
    },
    {
      title: 'Protocolos Ativos',
      value: telemetry.active_protocols_count,
      subtext: 'identificados na rede',
      icon: Layers,
      color: 'from-purple-500/20 to-indigo-500/10',
      textColor: 'text-purple-400',
    },
    {
      title: 'Sessões & Conexões',
      value: telemetry.active_connections_count,
      subtext: 'fluxos rastreados',
      icon: Network,
      color: 'from-amber-500/20 to-orange-500/10',
      textColor: 'text-amber-400',
    },
    {
      title: 'Endereços IP',
      value: telemetry.unique_ips_count,
      subtext: 'hosts mapeados',
      icon: Globe,
      color: 'from-blue-500/20 to-cyan-500/10',
      textColor: 'text-blue-400',
    },
    {
      title: 'Hipóteses & Alertas',
      value: alertsCount,
      subtext: alertsCount > 0 ? `${telemetry.processing_latency_ms}ms • analisar abaixo` : `${telemetry.processing_latency_ms}ms • nenhum indicador`,
      icon: alertsCount > 0 ? ShieldAlert : Cpu,
      color: alertsCount > 0 ? 'from-rose-500/25 to-amber-500/10' : 'from-slate-800/40 to-slate-900/20',
      textColor: alertsCount > 0 ? 'text-rose-400' : 'text-slate-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-3.5 rounded-xl border border-slate-800/90 bg-gradient-to-br ${c.color} bg-[#0D1527] relative overflow-hidden transition-all hover:border-slate-700/80 group`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-400 tracking-wide">
                {c.title}
              </span>
              <Icon className={`w-4 h-4 ${c.textColor} opacity-80 group-hover:opacity-100 transition-opacity`} />
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-bold font-mono tracking-tight text-white`}>
                {c.value}
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 truncate">
                {c.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
