import React from 'react';
import { 
  X, Layers, ArrowRight, Clock, Database, Package, Shield, ExternalLink, BookOpen 
} from 'lucide-react';
import { ConnectionItem } from '../../types';

interface EncapsulationModalProps {
  connection: ConnectionItem | null;
  onClose: () => void;
  onSelectProtocol?: (proto: string) => void;
}

export const EncapsulationModal: React.FC<EncapsulationModalProps> = ({
  connection,
  onClose,
  onSelectProtocol,
}) => {
  if (!connection) return null;

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

  // Mapeia pilha de encapsulamento para descrições didáticas
  const getLayerMeta = (protoName: string, index: number, total: number) => {
    const p = protoName.toUpperCase();
    if (p.includes('ETH')) {
      return {
        layerNum: 2,
        layerName: 'Camada de Enlace',
        color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
        desc: 'Enquadramento físico com endereços MAC no segmento local (Ethernet II).',
        proto: 'eth',
      };
    }
    if (p.includes('IP') && !p.includes('TCP')) {
      return {
        layerNum: 3,
        layerName: 'Camada de Rede',
        color: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
        desc: 'Endereçamento lógico e roteamento fim-a-fim de datagramas (IPv4/IPv6).',
        proto: 'ipv4',
      };
    }
    if (p.includes('ICMP')) {
      return {
        layerNum: 3,
        layerName: 'Camada de Rede (Controle)',
        color: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
        desc: 'Mensagens de diagnóstico e controle operacional (ICMP).',
        proto: 'icmp',
      };
    }
    if (p.includes('TCP') || p.includes('UDP')) {
      return {
        layerNum: 4,
        layerName: 'Camada de Transporte',
        color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
        desc: `Multiplexação de portas e entrega entre processos (${p}).`,
        proto: p.toLowerCase(),
      };
    }
    if (p.includes('TLS') || p.includes('SSL')) {
      return {
        layerNum: 6,
        layerName: 'Camada de Apresentação / Segurança',
        color: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
        desc: 'Negociação criptográfica e privacidade de dados em trânsito (TLS).',
        proto: 'tls',
      };
    }
    return {
      layerNum: 7,
      layerName: 'Camada de Aplicação',
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
      desc: `Serviço final consumido pelo cliente (${p}).`,
      proto: p.toLowerCase(),
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B1120] border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden glow-cyan">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-white">
                Inspeção de Conexão & Encapsulamento
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Análise da sequência de camadas da pilha protocolar
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
          {/* Card dos Endpoints */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Host de Origem</span>
                <span className="text-sm font-bold text-white">{connection.src_ip}</span>
                {connection.src_port && <span className="text-cyan-400 text-sm">:{connection.src_port}</span>}
              </div>

              <div className="flex items-center gap-2 text-cyan-400">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/10 border border-cyan-500/30">
                  {connection.transport} {connection.app_protocol ? `• ${connection.app_protocol}` : ''}
                </span>
                <ArrowRight className="w-4 h-4" />
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Host de Destino</span>
                <span className="text-sm font-bold text-white">{connection.dst_ip}</span>
                {connection.dst_port && <span className="text-cyan-400 text-sm">:{connection.dst_port}</span>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">TOTAL DE PACOTES</span>
                <span className="text-white font-bold">{connection.packet_count.toLocaleString('pt-BR')}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">VOLUME TOTAL</span>
                <span className="text-white font-bold">{formatBytes(connection.byte_count)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">DURAÇÃO DA SESSÃO</span>
                <span className="text-emerald-400 font-bold">{formatDuration(connection.duration_sec)}</span>
              </div>
            </div>
          </div>

          {/* Sequência de Encapsulamento */}
          <div>
            <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wide mb-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Sequência de Encapsulamento (Da Base ao Topo da Pilha):
            </h4>

            <div className="space-y-2">
              {connection.encapsulation.map((layerName, idx) => {
                const meta = getLayerMeta(layerName, idx, connection.encapsulation.length);
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border ${meta.color} flex items-center justify-between transition-all hover:border-cyan-400 group`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-white">
                        L{meta.layerNum}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-white uppercase">
                            {layerName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ({meta.layerName})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {meta.desc}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectProtocol?.(meta.proto);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      <BookOpen className="w-3 h-3 text-cyan-400" />
                      Enciclopédia
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
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
