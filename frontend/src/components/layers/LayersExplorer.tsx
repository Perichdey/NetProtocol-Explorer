import React, { useState } from 'react';
import { 
  Layers, ChevronDown, ChevronRight, Info, Sparkles, Filter 
} from 'lucide-react';
import { TelemetrySnapshot, LayerStat } from '../../types';

interface LayersExplorerProps {
  telemetry: TelemetrySnapshot;
  onSelectProtocol?: (proto: string) => void;
}

export const LayersExplorer: React.FC<LayersExplorerProps> = ({ telemetry, onSelectProtocol }) => {
  const [modelType, setModelType] = useState<'osi' | 'tcpip'>('osi');
  const [metricType, setMetricType] = useState<'packets' | 'bytes'>('packets');
  const [expandedLayer, setExpandedLayer] = useState<string | number | null>('7');

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Descrições e cores para cada camada OSI
  const osiConfig: Record<number, { name: string; color: string; border: string; bg: string; desc: string }> = {
    7: { 
      name: "Aplicação", 
      color: "text-rose-400", 
      border: "border-rose-500/40", 
      bg: "bg-rose-500", 
      desc: "Serviços e protocolos diretamente consumidos por aplicações do usuário final (HTTP, DNS, SSH, DHCP)."
    },
    6: { 
      name: "Apresentação", 
      color: "text-purple-400", 
      border: "border-purple-500/40", 
      bg: "bg-purple-500", 
      desc: "Formatação, compressão, codificação e criptografia de dados (ex: TLS/SSL atuando sobre transporte)."
    },
    5: { 
      name: "Sessão", 
      color: "text-indigo-400", 
      border: "border-indigo-500/40", 
      bg: "bg-indigo-500", 
      desc: "Controle e sincronização do diálogo e conexões persistentes entre processos (RPC, NetBIOS)."
    },
    4: { 
      name: "Transporte", 
      color: "text-cyan-400", 
      border: "border-cyan-500/40", 
      bg: "bg-cyan-500", 
      desc: "Entrega confiável fim-a-fim, multiplexação por portas e controle de fluxo e congestionamento (TCP, UDP, SCTP)."
    },
    3: { 
      name: "Rede", 
      color: "text-blue-400", 
      border: "border-blue-500/40", 
      bg: "bg-blue-500", 
      desc: "Endereçamento lógico global (IP) e roteamento de pacotes entre redes distintas (IPv4, IPv6, ICMP)."
    },
    2: { 
      name: "Enlace de Dados", 
      color: "text-emerald-400", 
      border: "border-emerald-500/40", 
      bg: "bg-emerald-500", 
      desc: "Transmissão de quadros no mesmo segmento físico, endereçamento MAC e controle de acesso ao meio (Ethernet, ARP)."
    },
    1: { 
      name: "Física", 
      color: "text-slate-400", 
      border: "border-slate-500/40", 
      bg: "bg-slate-500", 
      desc: "Sinais elétricos, ópticos ou de rádio no meio físico bruto (Cabos, Fibra, Ondas de rádio Wi-Fi)."
    },
  };

  const tcpipConfig: Record<string, { name: string; color: string; border: string; bg: string; desc: string }> = {
    application: {
      name: "Aplicação",
      color: "text-rose-400",
      border: "border-rose-500/40",
      bg: "bg-rose-500",
      desc: "Engloba os serviços de aplicação, apresentação e sessão (HTTP, HTTPS, DNS, SSH, TLS, SMB)."
    },
    transport: {
      name: "Transporte",
      color: "text-cyan-400",
      border: "border-cyan-500/40",
      bg: "bg-cyan-500",
      desc: "Comunicação entre processos de ponta a ponta com endereçamento de portas (TCP, UDP)."
    },
    internet: {
      name: "Internet / Rede",
      color: "text-blue-400",
      border: "border-blue-500/40",
      bg: "bg-blue-500",
      desc: "Roteamento e empacotamento lógico de datagramas IP entre hosts (IPv4, IPv6, ICMP)."
    },
    link: {
      name: "Acesso à Rede / Enlace",
      color: "text-emerald-400",
      border: "border-emerald-500/40",
      bg: "bg-emerald-500",
      desc: "Mecanismos para envio de dados sobre a infraestrutura física e protocolos locais (Ethernet, Wi-Fi, ARP)."
    },
  };

  const toggleExpand = (layerKey: string | number) => {
    setExpandedLayer(expandedLayer === layerKey ? null : layerKey);
  };

  return (
    <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-full">
      {/* Header com Toggle OSI vs TCP/IP e Métrica */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
            Arquitetura de Camadas
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Métrica: Pacotes ou Bytes */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setMetricType('packets')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                metricType === 'packets'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pacotes
            </button>
            <button
              onClick={() => setMetricType('bytes')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                metricType === 'bytes'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bytes
            </button>
          </div>

          {/* Toggle Modelo: OSI vs TCP/IP */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setModelType('osi')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-all ${
                modelType === 'osi'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              OSI (7)
            </button>
            <button
              onClick={() => setModelType('tcpip')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-all ${
                modelType === 'tcpip'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              TCP/IP (4)
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Camadas */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
        {modelType === 'osi' ? (
          // Modelo OSI (7 até 1)
          [7, 6, 5, 4, 3, 2, 1].map((layerNum) => {
            const cfg = osiConfig[layerNum];
            const stat: LayerStat = telemetry.osi_layers[String(layerNum)] || {
              layer_id: layerNum,
              name: cfg.name,
              packet_count: 0,
              byte_count: 0,
              percentage_packets: 0,
              percentage_bytes: 0,
              protocols: [],
            };

            const percentage = metricType === 'packets' ? stat.percentage_packets : stat.percentage_bytes;
            const isExpanded = expandedLayer === layerNum;

            return (
              <div
                key={layerNum}
                className={`border rounded-lg transition-all ${
                  isExpanded ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/60'
                }`}
              >
                {/* Linha Principal da Camada */}
                <div
                  onClick={() => toggleExpand(layerNum)}
                  className="p-3 cursor-pointer select-none flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-[170px]">
                    <span className="w-5 h-5 rounded flex items-center justify-center font-mono text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {layerNum}
                    </span>
                    <div>
                      <h3 className={`text-xs font-bold font-mono tracking-tight ${cfg.color}`}>
                        {cfg.name}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Camada {layerNum}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progresso Relativa */}
                  <div className="flex-1 max-w-xs mx-2">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${cfg.bg}`}
                        style={{ width: `${Math.max(percentage, percentage > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                  </div>

                  {/* Métricas e Percentual */}
                  <div className="flex items-center gap-3 text-right">
                    <div className="font-mono text-xs font-semibold text-white">
                      {metricType === 'packets'
                        ? `${stat.packet_count.toLocaleString('pt-BR')} pkts`
                        : formatBytes(stat.byte_count)}
                    </div>
                    <span className="w-14 text-right font-mono text-xs font-bold text-slate-300">
                      {percentage.toFixed(1)}%
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Área Expandida com Protocolos e Descrição Didática */}
                {isExpanded && (
                  <div className="px-3.5 pb-3 pt-1 border-t border-slate-800/60 text-xs text-slate-300 space-y-2.5">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {cfg.desc}
                    </p>

                    <div>
                      <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 block mb-1.5">
                        Protocolos Identificados na Captura ({stat.protocols.length}):
                      </span>
                      {stat.protocols.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {stat.protocols.map((proto) => (
                            <button
                              key={proto}
                              onClick={() => onSelectProtocol?.(proto)}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border transition-all ${cfg.border} bg-slate-950/80 ${cfg.color} hover:bg-slate-800`}
                            >
                              {proto}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          Nenhum tráfego desta camada identificado até o momento.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Modelo TCP/IP (4 camadas)
          ['application', 'transport', 'internet', 'link'].map((layerKey) => {
            const cfg = tcpipConfig[layerKey];
            const stat: LayerStat = telemetry.tcpip_layers[layerKey] || {
              layer_id: layerKey,
              name: cfg.name,
              packet_count: 0,
              byte_count: 0,
              percentage_packets: 0,
              percentage_bytes: 0,
              protocols: [],
            };

            const percentage = metricType === 'packets' ? stat.percentage_packets : stat.percentage_bytes;
            const isExpanded = expandedLayer === layerKey;

            return (
              <div
                key={layerKey}
                className={`border rounded-lg transition-all ${
                  isExpanded ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/60'
                }`}
              >
                <div
                  onClick={() => toggleExpand(layerKey)}
                  className="p-3.5 cursor-pointer select-none flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-[180px]">
                    <span className="w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                      {layerKey[0]}
                    </span>
                    <div>
                      <h3 className={`text-xs font-bold font-mono tracking-tight ${cfg.color}`}>
                        {cfg.name}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Pilha TCP/IP
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 max-w-xs mx-2">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${cfg.bg}`}
                        style={{ width: `${Math.max(percentage, percentage > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div className="font-mono text-xs font-semibold text-white">
                      {metricType === 'packets'
                        ? `${stat.packet_count.toLocaleString('pt-BR')} pkts`
                        : formatBytes(stat.byte_count)}
                    </div>
                    <span className="w-14 text-right font-mono text-xs font-bold text-slate-300">
                      {percentage.toFixed(1)}%
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-800/60 text-xs text-slate-300 space-y-2.5">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {cfg.desc}
                    </p>

                    <div>
                      <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400 block mb-1.5">
                        Protocolos Ativos ({stat.protocols.length}):
                      </span>
                      {stat.protocols.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {stat.protocols.map((proto) => (
                            <button
                              key={proto}
                              onClick={() => onSelectProtocol?.(proto)}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border transition-all ${cfg.border} bg-slate-950/80 ${cfg.color} hover:bg-slate-800`}
                            >
                              {proto}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          Nenhum tráfego identificado nesta camada.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
