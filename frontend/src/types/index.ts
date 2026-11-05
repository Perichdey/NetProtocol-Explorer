export interface NetworkInterface {
  id: string;
  index: number;
  name: string;
  description: string;
}

export interface CaptureStatus {
  is_active: boolean;
  is_paused: boolean;
  mode: 'idle' | 'live' | 'pcap' | 'replay';
  target: string | null;
  started_at: number | null;
  packets_captured: number;
  bytes_captured: number;
  tshark_path: string | null;
  error: string | null;
}

export interface LayerStat {
  layer_id: number | string;
  name: string;
  packet_count: number;
  byte_count: number;
  percentage_packets: number;
  percentage_bytes: number;
  protocols: string[];
}

export interface ProtocolStat {
  protocol: string;
  name: string;
  osi_layer: number;
  tcp_ip_layer: string;
  packet_count: number;
  byte_count: number;
  percentage_packets: number;
  percentage_bytes: number;
  packets_per_sec: number;
  bytes_per_sec: number;
}

export interface ConnectionItem {
  id: string;
  src_ip: string;
  dst_ip: string;
  src_port: number | null;
  dst_port: number | null;
  transport: string;
  app_protocol: string | null;
  packet_count: number;
  byte_count: number;
  first_seen: number;
  last_seen: number;
  duration_sec: number;
  encapsulation: string[];
}

export interface GraphNode {
  id: string;
  name: string;
  category: 'internal' | 'external' | 'multicast' | 'service';
  symbolSize: number;
  value: number;
}

export interface GraphLink {
  source: string;
  target: string;
  protocol: string;
  transport: string;
  packet_count: number;
  byte_count: number;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface TimeSeriesPoint {
  timestamp: number;
  time_label: string;
  packets: number;
  bytes: number;
  protocols: Record<string, number>;
}

export interface SecurityAlert {
  id: string;
  timestamp: number;
  attack_id: string;
  title: string;
  protocol: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  evidence: string;
  hypothesis: string;
  recommendation: string;
}

export interface TelemetrySnapshot {
  timestamp: number;
  status: CaptureStatus;
  total_packets: number;
  total_bytes: number;
  packets_per_second: number;
  bytes_per_second: number;
  active_protocols_count: number;
  active_connections_count: number;
  unique_ips_count: number;
  processing_latency_ms: number;
  osi_layers: Record<string, LayerStat>;
  tcpip_layers: Record<string, LayerStat>;
  top_protocols: ProtocolStat[];
  recent_connections: ConnectionItem[];
  graph_data: GraphData;
  time_series: TimeSeriesPoint[];
  security_alerts: SecurityAlert[];
}
