import React, { useState } from 'react';
import { useTelemetry } from './hooks/useTelemetry';
import { Header } from './components/layout/Header';
import { MetricCards } from './components/dashboard/MetricCards';
import { LayersExplorer } from './components/layers/LayersExplorer';
import { ProtocolDistribution } from './components/protocols/ProtocolDistribution';
import { ConnectionsTable } from './components/connections/ConnectionsTable';
import { SecurityCenter } from './components/security/SecurityCenter';
import { ProtocolDrawer } from './components/encyclopedia/ProtocolDrawer';
import { AttackModal } from './components/encyclopedia/AttackModal';
import { EncyclopediaModal } from './components/encyclopedia/EncyclopediaModal';
import { ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const { telemetry, isConnected } = useTelemetry();
  
  // Estados para a Enciclopédia Modular e Modais de Ameaça
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);
  const [selectedAttackId, setSelectedAttackId] = useState<string | null>(null);
  const [isEncyclopediaOpen, setIsEncyclopediaOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans">
      {/* Top Bar / Header */}
      <Header
        status={telemetry.status}
        isConnected={isConnected}
        onOpenEncyclopedia={() => setIsEncyclopediaOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 space-y-4">
        {/* Banner de Erro caso TShark reporte algo */}
        {telemetry.status.error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs text-rose-300 font-mono">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Aviso do Motor: {telemetry.status.error}</span>
            </div>
          </div>
        )}

        {/* 1. Resumo de Métricas / KPIs Globais */}
        <MetricCards telemetry={telemetry} />

        {/* 2. Grid Central: Arquitetura de Camadas + Distribuição e Evolução de Protocolos */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-6 xl:col-span-5 h-full">
            <LayersExplorer
              telemetry={telemetry}
              onSelectProtocol={(proto) => setSelectedProtocolId(proto)}
            />
          </div>
          <div className="lg:col-span-6 xl:col-span-7 h-full">
            <ProtocolDistribution
              telemetry={telemetry}
              onSelectProtocol={(proto) => setSelectedProtocolId(proto)}
            />
          </div>
        </div>

        {/* 3. Centro de Cibersegurança & Hipóteses Investigativas */}
        <SecurityCenter
          telemetry={telemetry}
          onSelectProtocol={(proto) => setSelectedProtocolId(proto)}
          onSelectAttack={(attId) => setSelectedAttackId(attId)}
        />

        {/* 4. Conexões, Sessões e Grafo Force-Directed em Tempo Real */}
        <ConnectionsTable
          telemetry={telemetry}
          onSelectProtocol={(proto) => setSelectedProtocolId(proto)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#0B1120] py-2.5 px-4 text-center text-xs text-slate-500 font-mono flex items-center justify-between max-w-[1700px] mx-auto w-full">
        <span>NetProtocol Explorer • Motor de Disseção TShark • Base de Conhecimento Markdown Ativa</span>
        <button
          onClick={() => setIsEncyclopediaOpen(true)}
          className="text-cyan-400 hover:underline"
        >
          Abrir Centro Educacional, Comparador & Glossário →
        </button>
      </footer>

      {/* Drawer Contextual de Protocolo */}
      <ProtocolDrawer
        protocolId={selectedProtocolId}
        onClose={() => setSelectedProtocolId(null)}
        onSelectAttack={(attId) => setSelectedAttackId(attId)}
        onSelectProtocol={(pId) => setSelectedProtocolId(pId)}
      />

      {/* Modal Didático de Ataque / Ameaça */}
      <AttackModal
        attackId={selectedAttackId}
        onClose={() => setSelectedAttackId(null)}
        onSelectProtocol={(pId) => {
          setSelectedAttackId(null);
          setSelectedProtocolId(pId);
        }}
      />

      {/* Modal de Catálogo Completo, Comparador e Glossário */}
      <EncyclopediaModal
        isOpen={isEncyclopediaOpen}
        onClose={() => setIsEncyclopediaOpen(false)}
        onSelectProtocol={(pId) => setSelectedProtocolId(pId)}
      />
    </div>
  );
};
