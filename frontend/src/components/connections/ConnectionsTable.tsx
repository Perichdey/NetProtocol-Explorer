import React, { useState } from 'react';
import { 
  Network, ArrowRight, Table, Share2, Clock, Search, Layers, ExternalLink, ArrowUpDown 
} from 'lucide-react';
import { TelemetrySnapshot, ConnectionItem } from '../../types';
import { NetworkGraph } from './NetworkGraph';
import { EncapsulationModal } from './EncapsulationModal';

interface ConnectionsTableProps {
  telemetry: TelemetrySnapshot;
  onSelectProtocol?: (proto: string) => void;
}

export const ConnectionsTable: React.FC<ConnectionsTableProps> = ({ telemetry, onSelectProtocol }) => {
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');
  const [filterText, setFilterText] = useState<string>('');
  const [sortBy, setSortBy] = useState<'packets' | 'bytes' | 'duration'>('packets');
  const [selectedConnection, setSelectedConnection] = useState<ConnectionItem | null>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDuration = (sec: number): string => {
    if (sec < 0.005) return '< 5 ms';
    if (sec < 1) return `${Math.round(sec * 1000)} ms`;
    if (sec < 60) return `${sec.toFixed(2)} s`;
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}m ${s}s`;
  };

  const connections = telemetry.recent_connections || [];

  const filtered = connections
    .filter((c) => {
      if (!filterText) return true;
      const q = filterText.toLowerCase();
      return (
        c.src_ip.toLowerCase().includes(q) ||
        c.dst_ip.toLowerCase().includes(q) ||
        c.transport.toLowerCase().includes(q) ||
        (c.app_protocol && c.app_protocol.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'packets') return b.packet_count - a.packet_count;
      if (sortBy === 'bytes') return b.byte_count - a.byte_count;
      return b.duration_sec - a.duration_sec;
    });

  const getTransportBadge = (transport: string) => {
    switch (transport.toUpperCase()) {
      case 'TCP':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'UDP':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'ICMP':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'ARP':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col">
      {/* Header com Toggle Tabela vs Grafo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
            Comunicações, Fluxos & Topologia ({connections.length} fluxos)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Alternância Tabela vs Grafo */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-all ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Matriz de Fluxos
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-all ${
                viewMode === 'graph'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              Grafo de Nós Interativo
            </button>
          </div>

          {/* Busca na Tabela */}
          {viewMode === 'table' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Filtrar por IP, Porta..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/50 w-48"
              />
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo: Tabela ou Grafo */}
      {viewMode === 'graph' ? (
        <NetworkGraph
          graphData={telemetry.graph_data}
          onSelectNode={(ip) => {
            setFilterText(ip);
            setViewMode('table');
          }}
          onSelectProtocol={onSelectProtocol}
        />
      ) : (
        <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-900/90 sticky top-0 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase select-none">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Origem (Host : Porta)</th>
                <th className="py-2.5 px-3 font-semibold">Destino (Host : Porta)</th>
                <th className="py-2.5 px-3 font-semibold">Transporte</th>
                <th className="py-2.5 px-3 font-semibold">Aplicação</th>
                <th 
                  onClick={() => setSortBy('packets')}
                  className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-white"
                >
                  Pacotes {sortBy === 'packets' ? '↓' : ''}
                </th>
                <th 
                  onClick={() => setSortBy('bytes')}
                  className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-white"
                >
                  Volume {sortBy === 'bytes' ? '↓' : ''}
                </th>
                <th 
                  onClick={() => setSortBy('duration')}
                  className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-white"
                >
                  Duração {sortBy === 'duration' ? '↓' : ''}
                </th>
                <th className="py-2.5 px-3 font-semibold text-center">Encapsulamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => setSelectedConnection(c)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3 text-slate-200">
                      <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors">{c.src_ip}</span>
                      {c.src_port ? <span className="text-cyan-400">:{c.src_port}</span> : ''}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors">{c.dst_ip}</span>
                        {c.dst_port ? <span className="text-cyan-400">:{c.dst_port}</span> : ''}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getTransportBadge(c.transport)}`}>
                        {c.transport}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {c.app_protocol && c.app_protocol !== 'RAW' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProtocol?.(c.app_protocol!);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
                        >
                          {c.app_protocol}
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200 font-semibold">
                      {c.packet_count.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300 font-semibold">
                      {formatBytes(c.byte_count)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">
                      {formatDuration(c.duration_sec)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedConnection(c);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 mx-auto"
                      >
                        <Layers className="w-3 h-3 text-cyan-400" />
                        Inspecionar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhuma comunicação registrada no filtro atual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Encapsulamento de Pacote */}
      <EncapsulationModal
        connection={selectedConnection}
        onClose={() => setSelectedConnection(null)}
        onSelectProtocol={onSelectProtocol}
      />
    </div>
  );
};
