import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Square, Trash2, Upload, Radio, 
  Activity, CheckCircle2, AlertTriangle, Zap, BookOpen, FastForward
} from 'lucide-react';
import { NetworkInterface, CaptureStatus } from '../../types';
import { api, SampleFile } from '../../services/api';

interface HeaderProps {
  status: CaptureStatus;
  isConnected: boolean;
  onRefresh?: () => void;
  onOpenEncyclopedia?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  status, 
  isConnected, 
  onRefresh,
  onOpenEncyclopedia 
}) => {
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [samples, setSamples] = useState<SampleFile[]>([]);
  const [selectedInterface, setSelectedInterface] = useState<string>('1');
  const [selectedSample, setSelectedSample] = useState<string>('demo_network.pcap');
  const [bpfFilter, setBpfFilter] = useState<string>('');
  const [replaySpeed, setReplaySpeed] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const loadMetadata = async () => {
    try {
      const [ifaceRes, sampleRes] = await Promise.all([
        api.getInterfaces(),
        api.getSamples()
      ]);
      setInterfaces(ifaceRes.interfaces || []);
      if (ifaceRes.interfaces?.length > 0) {
        setSelectedInterface(ifaceRes.interfaces[0].id);
      }
      setSamples(sampleRes.samples || []);
    } catch (err) {
      console.error('Erro ao carregar metadados:', err);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  const handleStartLive = async () => {
    try {
      setLoading(true);
      await api.startCapture(selectedInterface, bpfFilter || undefined, true);
      onRefresh?.();
    } catch (err) {
      alert('Erro ao iniciar captura: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    await api.stopCapture();
    onRefresh?.();
  };

  const handlePauseResume = async () => {
    if (status.is_paused) {
      await api.resumeCapture();
    } else {
      await api.pauseCapture();
    }
    onRefresh?.();
  };

  const handleClear = async () => {
    await api.clearCapture();
    onRefresh?.();
  };

  const handleLoadSample = async () => {
    try {
      setLoading(true);
      await api.loadDemo(replaySpeed, selectedSample);
      onRefresh?.();
    } catch (err) {
      alert('Erro ao carregar captura: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      await api.uploadPcap(file, replaySpeed);
      await loadMetadata();
      setSelectedSample(file.name);
      onRefresh?.();
    } catch (err) {
      alert('Erro ao carregar PCAP: ' + err);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const formatModeBadge = () => {
    if (!status.is_active) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          IDLE / PRONTO
        </span>
      );
    }
    if (status.is_paused) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Pause className="w-3 h-3 text-amber-400" />
          PAUSADO
        </span>
      );
    }
    if (status.mode === 'live') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          LIVE: {status.target}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
        <Radio className="w-3 h-3 text-cyan-400" />
        {status.mode === 'replay' ? 'REPLAY' : 'PCAP'}: {status.target}
      </span>
    );
  };

  return (
    <header className="border-b border-cyber-border bg-[#0B1120]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
      <div className="max-w-[1700px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 flex items-center justify-center glow-cyan">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white font-mono">
                  NetProtocol<span className="text-cyan-400">.Explorer</span>
                </h1>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-semibold border border-cyan-500/30">
                  v1.0 Full Suite
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Plataforma Visual & Interativa de Aprendizado de Redes e Segurança
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {formatModeBadge()}
            <div 
              title={isConnected ? "WebSocket Ativo & Sincronizado" : "Desconectado do Engine"}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-slate-900 border border-slate-800"
            >
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px]">ONLINE</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-400 text-[11px]">OFFLINE</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Interface & Capture Controls Bar */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
          {/* Botão de Enciclopédia Global */}
          <button
            onClick={onOpenEncyclopedia}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-gradient-to-r from-blue-600/30 to-cyan-600/30 hover:from-blue-600/50 hover:to-cyan-600/50 text-cyan-300 border border-cyan-500/40 transition-all glow-cyan"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            Enciclopédia & Glossário
          </button>

          {/* Seletor de Interfaces Live */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg px-2 py-1.5 text-xs">
            <label className="text-slate-400 font-mono text-[10px]">Iface:</label>
            <select
              value={selectedInterface}
              onChange={(e) => setSelectedInterface(e.target.value)}
              disabled={status.is_active}
              className="bg-transparent text-slate-200 focus:outline-none max-w-[140px] truncate cursor-pointer disabled:opacity-50"
            >
              {interfaces.map((iface) => (
                <option key={iface.id} value={iface.id} className="bg-slate-900 text-slate-200">
                  #{iface.id} — {iface.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro BPF */}
          <input
            type="text"
            placeholder="Filtro BPF..."
            value={bpfFilter}
            onChange={(e) => setBpfFilter(e.target.value)}
            disabled={status.is_active}
            className="bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/50 w-28 disabled:opacity-50"
          />

          {/* Botões de Ação Live */}
          {!status.is_active ? (
            <button
              onClick={handleStartLive}
              disabled={loading || !isConnected}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Live
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePauseResume}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all"
              >
                {status.is_paused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                {status.is_paused ? 'Retomar' : 'Pausar'}
              </button>
              <button
                onClick={handleStop}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                Parar
              </button>
            </div>
          )}

          {/* Seletor de PCAP & Replay Speed */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <select
              value={selectedSample}
              onChange={(e) => setSelectedSample(e.target.value)}
              className="bg-transparent text-emerald-300 font-mono text-[11px] focus:outline-none max-w-[130px] truncate cursor-pointer"
              title="Selecionar captura salva em samples/"
            >
              {samples.length > 0 ? (
                samples.map((s) => (
                  <option key={s.filename} value={s.filename} className="bg-slate-900 text-slate-200">
                    {s.filename}
                  </option>
                ))
              ) : (
                <option value="demo_network.pcap" className="bg-slate-900 text-slate-200">
                  demo_network.pcap
                </option>
              )}
            </select>

            <span className="text-slate-700">|</span>

            <FastForward className="w-3 h-3 text-slate-400" />
            <select
              value={replaySpeed}
              onChange={(e) => setReplaySpeed(parseFloat(e.target.value))}
              className="bg-transparent text-slate-300 font-mono text-[11px] focus:outline-none cursor-pointer"
              title="Velocidade de Reprodução do PCAP"
            >
              <option value={0} className="bg-slate-900">Instantâneo</option>
              <option value={0.5} className="bg-slate-900">Replay 0.5x</option>
              <option value={1} className="bg-slate-900">Replay 1x (Real)</option>
              <option value={2} className="bg-slate-900">Replay 2x</option>
              <option value={5} className="bg-slate-900">Replay 5x</option>
            </select>

            <button
              onClick={handleLoadSample}
              disabled={loading}
              className="ml-1 flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-mono font-semibold text-[11px] transition-all"
            >
              <Zap className="w-3 h-3" />
              Executar
            </button>
          </div>

          {/* Upload PCAP */}
          <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-all" title="Importar arquivo .pcap ou .pcapng">
            <Upload className="w-3.5 h-3.5" />
            Importar
            <input
              type="file"
              accept=".pcap,.pcapng,.cap"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Limpar estatísticas */}
          <button
            onClick={handleClear}
            title="Zerar contadores e histórico"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all border border-slate-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
