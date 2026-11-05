import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { PieChart, BarChart2, Grid, Activity } from 'lucide-react';
import { TelemetrySnapshot, ProtocolStat } from '../../types';

interface ProtocolDistributionProps {
  telemetry: TelemetrySnapshot;
  onSelectProtocol?: (proto: string) => void;
}

type MetricMode = 'pct_packets' | 'pct_bytes' | 'abs_count' | 'rate_sec';
type ChartView = 'donut' | 'bar' | 'treemap' | 'timeline';

export const ProtocolDistribution: React.FC<ProtocolDistributionProps> = ({ telemetry, onSelectProtocol }) => {
  const [chartType, setChartType] = useState<ChartView>('donut');
  const [metric, setMetric] = useState<MetricMode>('pct_packets');

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const protocols = telemetry.top_protocols || [];
  const timeSeries = telemetry.time_series || [];

  const getMetricValue = (p: ProtocolStat): number => {
    switch (metric) {
      case 'pct_packets':
        return p.percentage_packets;
      case 'pct_bytes':
        return p.percentage_bytes;
      case 'abs_count':
        return p.packet_count;
      case 'rate_sec':
        return p.packets_per_sec || 0;
    }
  };

  const formatMetricDisplay = (p: ProtocolStat): string => {
    switch (metric) {
      case 'pct_packets':
        return `${p.percentage_packets}% (${p.packet_count} pkts)`;
      case 'pct_bytes':
        return `${p.percentage_bytes}% (${formatBytes(p.byte_count)})`;
      case 'abs_count':
        return `${p.packet_count} pkts (${formatBytes(p.byte_count)})`;
      case 'rate_sec':
        return `${p.packets_per_sec || 0} pkts/s`;
    }
  };

  const formatShortBadge = (p: ProtocolStat): string => {
    switch (metric) {
      case 'pct_packets':
        return `${p.percentage_packets}%`;
      case 'pct_bytes':
        return `${p.percentage_bytes}%`;
      case 'abs_count':
        return `${p.packet_count}`;
      case 'rate_sec':
        return `${p.packets_per_sec || 0}/s`;
    }
  };

  // Dados para os gráficos
  const chartData = protocols.map((p) => ({
    name: p.name,
    value: getMetricValue(p),
    protocol: p.protocol,
    osi: p.osi_layer,
    raw: p,
  }));

  const cyberPalette = [
    '#38BDF8', '#818CF8', '#C084FC', '#F472B6', '#FB7185',
    '#34D399', '#4ADE80', '#FBBF24', '#F87171', '#60A5FA',
    '#A78BFA', '#2DD4BF', '#22D3EE', '#E879F9', '#94A3B8'
  ];

  // Opções para o Donut Chart
  const getDonutOption = () => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 },
      formatter: (params: any) => {
        const p: ProtocolStat | undefined = params.data?.raw;
        if (!p) return `<b>${params.name}</b>: ${params.value}`;
        return `<b>${p.name} (Camada OSI ${p.osi_layer})</b><br/>${formatMetricDisplay(p)}`;
      },
    },
    series: [
      {
        name: 'Protocolos',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#0D1527',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'outside',
          color: '#94A3B8',
          fontSize: 11,
          fontFamily: 'JetBrains Mono',
          formatter: '{b}: {d}%',
        },
        labelLine: {
          show: true,
          lineStyle: { color: '#334155' },
        },
        data: chartData,
        color: cyberPalette,
      },
    ],
  });

  // Opções para o Bar Chart
  const getBarOption = () => {
    const sorted = [...chartData].reverse();
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#0F172A',
        borderColor: '#334155',
        textStyle: { color: '#F8FAFC', fontFamily: 'JetBrains Mono', fontSize: 12 },
        formatter: (params: any) => {
          const item = params[0];
          const p: ProtocolStat | undefined = item?.data?.raw;
          if (!p) return `<b>${item.name}</b>: ${item.value}`;
          return `<b>${p.name}</b><br/>${formatMetricDisplay(p)}`;
        },
      },
      grid: { left: '3%', right: '8%', bottom: '3%', top: '5%', containLabel: true },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#1E293B' } },
        axisLabel: { color: '#64748B', fontFamily: 'JetBrains Mono', fontSize: 10 },
      },
      yAxis: {
        type: 'category',
        data: sorted.map((d) => d.name),
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#CBD5E1', fontFamily: 'JetBrains Mono', fontSize: 11 },
      },
      series: [
        {
          type: 'bar',
          data: sorted.map((d, idx) => ({
            value: d.value,
            protocol: d.protocol,
            raw: d.raw,
            itemStyle: {
              color: cyberPalette[idx % cyberPalette.length],
              borderRadius: [0, 4, 4, 0],
            },
          })),
        },
      ],
    };
  };

  // Opções para Treemap
  const getTreemapOption = () => ({
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontFamily: 'JetBrains Mono', fontSize: 12 },
      formatter: (params: any) => {
        const p: ProtocolStat | undefined = params.data?.raw;
        if (!p) return `<b>${params.name}</b>: ${params.value}`;
        return `<b>${p.name}</b><br/>${formatMetricDisplay(p)}`;
      },
    },
    series: [
      {
        type: 'treemap',
        data: chartData,
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: {
          show: true,
          fontFamily: 'JetBrains Mono',
          fontSize: 11,
          color: '#FFFFFF',
        },
        itemStyle: {
          borderColor: '#0D1527',
          borderWidth: 2,
          gapWidth: 2,
        },
        levels: [
          {
            color: cyberPalette,
            itemStyle: { borderWidth: 2, borderColor: '#0D1527' },
          },
        ],
      },
    ],
  });

  // Opções para Evolução Temporal (Timeline)
  const getTimelineOption = () => {
    const topKeys = protocols.slice(0, 5).map((p) => p.protocol);
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0F172A',
        borderColor: '#334155',
        textStyle: { color: '#F8FAFC', fontFamily: 'JetBrains Mono', fontSize: 11 },
      },
      legend: {
        top: 0,
        textStyle: { color: '#94A3B8', fontFamily: 'JetBrains Mono', fontSize: 10 },
      },
      grid: { left: '3%', right: '5%', bottom: '5%', top: '16%', containLabel: true },
      xAxis: {
        type: 'category',
        data: timeSeries.map((pt) => pt.timestamp),
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#64748B', fontFamily: 'JetBrains Mono', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#1E293B' } },
        axisLabel: { color: '#64748B', fontFamily: 'JetBrains Mono', fontSize: 10 },
      },
      series: topKeys.map((protoKey, idx) => ({
        name: protoKey.toUpperCase(),
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: cyberPalette[idx % cyberPalette.length] },
        areaStyle: {
          color: cyberPalette[idx % cyberPalette.length],
          opacity: 0.08,
        },
        data: timeSeries.map((pt) => pt.protocols[protoKey] || 0),
      })),
    };
  };

  const onChartClick = (params: any) => {
    if (params.data && params.data.protocol) {
      onSelectProtocol?.(params.data.protocol);
    } else if (params.seriesName && chartType === 'timeline') {
      onSelectProtocol?.(params.seriesName.toLowerCase());
    }
  };

  return (
    <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-full">
      {/* Header do Card com Controles */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
            Distribuição & Evolução de Protocolos
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 4 Modos de Métrica do Item 3.3 */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setMetric('pct_packets')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                metric === 'pct_packets'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Percentual por quantidade de pacotes"
            >
              % Pacotes
            </button>
            <button
              onClick={() => setMetric('pct_bytes')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                metric === 'pct_bytes'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Percentual por volume de bytes"
            >
              % Bytes
            </button>
            <button
              onClick={() => setMetric('abs_count')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                metric === 'abs_count'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Quantidade absoluta acumulada"
            >
              Absoluto
            </button>
            <button
              onClick={() => setMetric('rate_sec')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                metric === 'rate_sec'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Taxa de tráfego por segundo"
            >
              Taxa /s
            </button>
          </div>

          {/* Tipo de Visualização: Donut, Barras, Treemap, Evolução Temporal */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setChartType('donut')}
              title="Gráfico de Rosca"
              className={`p-1.5 rounded transition-all ${
                chartType === 'donut' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              title="Gráfico de Barras Horizontais"
              className={`p-1.5 rounded transition-all ${
                chartType === 'bar' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('treemap')}
              title="Treemap Hierárquico"
              className={`p-1.5 rounded transition-all ${
                chartType === 'treemap' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('timeline')}
              title="Evolução Temporal por Protocolo"
              className={`p-1.5 rounded transition-all ${
                chartType === 'timeline' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Área do Gráfico */}
      <div className="flex-1 min-h-[260px] relative">
        {chartData.length > 0 ? (
          <ReactECharts
            option={
              chartType === 'donut'
                ? getDonutOption()
                : chartType === 'bar'
                ? getBarOption()
                : chartType === 'treemap'
                ? getTreemapOption()
                : getTimelineOption()
            }
            style={{ height: '100%', width: '100%' }}
            onEvents={{ click: onChartClick }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 font-mono text-xs">
            <span>Aguardando captura de pacotes para gerar gráficos...</span>
          </div>
        )}
      </div>

      {/* Mini Ranking Inferior */}
      <div className="pt-3 border-t border-slate-800/80 mt-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          <span>RANKING DOS PROTOCOLOS MAIS UTILIZADOS (CLIQUE PARA INSPECIONAR)</span>
          <span>VALOR</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {protocols.slice(0, 6).map((p, i) => (
            <div
              key={p.protocol}
              onClick={() => onSelectProtocol?.(p.protocol)}
              className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all text-xs"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[10px] font-mono font-bold text-slate-500">#{i + 1}</span>
                <span className="font-mono font-medium text-slate-200 truncate">{p.name}</span>
              </div>
              <span className="font-mono text-cyan-400 text-[11px] font-semibold pl-1">
                {formatShortBadge(p)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
