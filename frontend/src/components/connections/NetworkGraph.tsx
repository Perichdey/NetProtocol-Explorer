import React, { useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { GraphData } from '../../types';
import { ZoomIn, ZoomOut, RefreshCw, Info, Globe, Shield, Radio } from 'lucide-react';

interface NetworkGraphProps {
  graphData: GraphData;
  onSelectNode?: (ip: string) => void;
  onSelectProtocol?: (proto: string) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  graphData,
  onSelectNode,
  onSelectProtocol,
}) => {
  const chartRef = useRef<any>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const categories = [
    { name: 'Rede Local (LAN)', itemStyle: { color: '#10B981' } },     // Emerald
    { name: 'Servidor Externo', itemStyle: { color: '#38BDF8' } },     // Sky/Cyan
    { name: 'Broadcast/Multicast', itemStyle: { color: '#F59E0B' } },  // Amber
  ];

  const getCategoryIndex = (cat: string) => {
    if (cat === 'internal') return 0;
    if (cat === 'external') return 1;
    return 2;
  };

  // Mapeia nós com estilos avançados de visualização
  const nodes = (graphData.nodes || []).map((node) => {
    const catIdx = getCategoryIndex(node.category);
    return {
      id: node.id,
      name: node.name,
      value: node.value,
      symbolSize: Math.max(16, node.symbolSize),
      category: catIdx,
      label: {
        show: true,
        position: 'bottom',
        color: '#E2E8F0',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
        formatter: '{b}',
      },
      itemStyle: {
        borderColor: '#0B1120',
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: categories[catIdx].itemStyle.color,
      },
    };
  });

  // Mapeia links com pesos e setas direcionais
  const links = (graphData.links || []).map((link) => {
    return {
      source: link.source,
      target: link.target,
      value: link.byte_count,
      packet_count: link.packet_count,
      protocol: link.protocol,
      transport: link.transport,
      lineStyle: {
        width: Math.min(6, Math.max(1.5, Math.log2(link.packet_count + 1))),
        curveness: 0.15,
        color: link.transport === 'TCP' ? '#38BDF8' : link.transport === 'UDP' ? '#A855F7' : '#F59E0B',
        opacity: 0.7,
      },
      emphasis: {
        lineStyle: {
          width: 4,
          opacity: 1,
        },
      },
    };
  });

  const getOption = () => ({
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontFamily: 'JetBrains Mono', fontSize: 11 },
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const catName = categories[params.data.category]?.name || 'Host';
          return `
            <b>Host: ${params.name}</b><br/>
            Tipo: ${catName}<br/>
            Volume Trafegado: ${formatBytes(params.value)}
          `;
        }
        if (params.dataType === 'edge') {
          return `
            <b>Fluxo: ${params.data.source} → ${params.data.target}</b><br/>
            Protocolo: ${params.data.protocol} (${params.data.transport})<br/>
            Pacotes: ${params.data.packet_count}<br/>
            Volume: ${formatBytes(params.data.value)}
          `;
        }
        return '';
      },
    },
    legend: [
      {
        data: categories.map((c) => c.name),
        textStyle: { color: '#94A3B8', fontFamily: 'JetBrains Mono', fontSize: 10 },
        bottom: 5,
        left: 'center',
      },
    ],
    series: [
      {
        type: 'graph',
        layout: 'force',
        animation: true,
        roam: true,
        draggable: true,
        categories: categories,
        data: nodes,
        links: links,
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [4, 8],
        force: {
          repulsion: 300,
          gravity: 0.12,
          edgeLength: [80, 160],
          friction: 0.6,
        },
        label: {
          show: true,
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 5,
          },
        },
      },
    ],
  });

  const handleChartClick = (params: any) => {
    if (params.dataType === 'node') {
      onSelectNode?.(params.name);
    } else if (params.dataType === 'edge') {
      const proto = params.data.protocol?.split(',')[0]?.trim();
      if (proto && proto !== 'RAW') {
        onSelectProtocol?.(proto);
      }
    }
  };

  return (
    <div className="relative w-full h-[400px] bg-[#090E1A] rounded-xl border border-slate-800/80 overflow-hidden flex flex-col">
      {/* Mini Legenda e Controles Flutuantes */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-[#0B1120]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> LAN
        </span>
        <span className="flex items-center gap-1.5 ml-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" /> Internet
        </span>
        <span className="flex items-center gap-1.5 ml-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Broadcast
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-[#0B1120]/80 backdrop-blur-md p-1 rounded-lg border border-slate-800 text-xs font-mono text-slate-400">
        <span className="px-2 text-[10px] text-slate-400">Arraste os nós • Zoom scroll</span>
      </div>

      {/* Canvas ECharts */}
      {nodes.length > 0 ? (
        <ReactECharts
          ref={chartRef}
          option={getOption()}
          style={{ width: '100%', height: '100%' }}
          onEvents={{ click: handleChartClick }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 font-mono text-xs">
          <span>Aguardando tráfego de hosts para mapear topologia...</span>
        </div>
      )}
    </div>
  );
};
