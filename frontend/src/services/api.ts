import { NetworkInterface, TelemetrySnapshot } from '../types';

const getApiBase = () => {
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return `http://${window.location.hostname}:8000/api`;
  }
  return '/api';
};

const API_BASE = getApiBase();

export interface ProtocolMetadata {
  id: string;
  name: string;
  acronym?: string;
  osi_layer: number;
  tcp_ip_layer: string;
  transport: string[];
  ports: number[];
  aliases: string[];
  related_protocols: string[];
  attacks: string[];
  file_path?: string;
}

export interface ProtocolDetail {
  meta: ProtocolMetadata;
  content: string;
  purpose?: string;
  security_notes?: string;
}

export interface AttackMetadata {
  id: string;
  name: string;
  protocol?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitre_attack_id?: string;
  affected_layers: number[];
  indicators: string[];
}

export interface AttackDetail {
  meta: AttackMetadata;
  content: string;
}

export interface SampleFile {
  filename: string;
  size_bytes: number;
}

export const api = {
  // Captura & Status
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getInterfaces(): Promise<{ interfaces: NetworkInterface[] }> {
    const res = await fetch(`${API_BASE}/interfaces`);
    return res.json();
  },

  async getSamples(): Promise<{ samples: SampleFile[] }> {
    const res = await fetch(`${API_BASE}/capture/samples`);
    return res.json();
  },

  async startCapture(interfaceId: string, bpfFilter?: string, promiscuous: boolean = true) {
    const res = await fetch(`${API_BASE}/capture/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interface_id: interfaceId, bpf_filter: bpfFilter, promiscuous }),
    });
    return res.json();
  },

  async stopCapture() {
    const res = await fetch(`${API_BASE}/capture/stop`, { method: 'POST' });
    return res.json();
  },

  async pauseCapture() {
    const res = await fetch(`${API_BASE}/capture/pause`, { method: 'POST' });
    return res.json();
  },

  async resumeCapture() {
    const res = await fetch(`${API_BASE}/capture/resume`, { method: 'POST' });
    return res.json();
  },

  async clearCapture() {
    const res = await fetch(`${API_BASE}/capture/clear`, { method: 'POST' });
    return res.json();
  },

  async loadDemo(replaySpeed: number = 0.0, filename: string = 'demo_network.pcap') {
    const res = await fetch(
      `${API_BASE}/capture/load-demo?replay_speed=${replaySpeed}&filename=${encodeURIComponent(filename)}`,
      { method: 'POST' }
    );
    return res.json();
  },

  async uploadPcap(file: File, replaySpeed: number = 0.0) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('replay_speed', replaySpeed.toString());

    const res = await fetch(`${API_BASE}/capture/upload-pcap`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  async getStats(): Promise<TelemetrySnapshot> {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },

  // Base Modular de Conhecimento
  async getKnowledgeProtocols(layer?: number): Promise<{ protocols: ProtocolMetadata[] }> {
    const url = layer !== undefined ? `${API_BASE}/knowledge/protocols?layer=${layer}` : `${API_BASE}/knowledge/protocols`;
    const res = await fetch(url);
    return res.json();
  },

  async getKnowledgeProtocol(protoId: string): Promise<ProtocolDetail> {
    const res = await fetch(`${API_BASE}/knowledge/protocols/${encodeURIComponent(protoId)}`);
    if (!res.ok) throw new Error('Protocolo não encontrado na enciclopédia');
    return res.json();
  },

  async updateKnowledgeProtocol(protoId: string, content: string, metadata?: Record<string, any>) {
    const res = await fetch(`${API_BASE}/knowledge/protocols/${encodeURIComponent(protoId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, metadata }),
    });
    return res.json();
  },

  async getKnowledgeAttacks(): Promise<{ attacks: AttackMetadata[] }> {
    const res = await fetch(`${API_BASE}/knowledge/attacks`);
    return res.json();
  },

  async getKnowledgeAttack(attackId: string): Promise<AttackDetail> {
    const res = await fetch(`${API_BASE}/knowledge/attacks/${encodeURIComponent(attackId)}`);
    if (!res.ok) throw new Error('Ataque não encontrado na base de conhecimento');
    return res.json();
  },

  async getGlossary(): Promise<{ content: string }> {
    const res = await fetch(`${API_BASE}/knowledge/glossary`);
    return res.json();
  },

  async searchKnowledge(query: string) {
    const res = await fetch(`${API_BASE}/knowledge/search?q=${encodeURIComponent(query)}`);
    return res.json();
  },
};
