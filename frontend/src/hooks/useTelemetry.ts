import { useState, useEffect, useRef } from 'react';
import { TelemetrySnapshot } from '../types';

const INITIAL_SNAPSHOT: TelemetrySnapshot = {
  timestamp: Date.now() / 1000,
  status: {
    is_active: false,
    is_paused: false,
    mode: 'idle',
    target: null,
    started_at: null,
    packets_captured: 0,
    bytes_captured: 0,
    tshark_path: null,
    error: null,
  },
  total_packets: 0,
  total_bytes: 0,
  packets_per_second: 0,
  bytes_per_second: 0,
  active_protocols_count: 0,
  active_connections_count: 0,
  unique_ips_count: 0,
  processing_latency_ms: 0,
  osi_layers: {},
  tcpip_layers: {},
  top_protocols: [],
  recent_connections: [],
  graph_data: { nodes: [], links: [] },
  time_series: [],
  security_alerts: [],
};

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>(INITIAL_SNAPSHOT);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let unmounted = false;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.port === '3000'
        ? `${window.location.hostname}:8000`
        : window.location.host || '127.0.0.1:8000';
      const wsUrl = `${protocol}//${host}/ws/telemetry`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (unmounted) return;
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        if (unmounted) return;
        try {
          const data: TelemetrySnapshot = JSON.parse(event.data);
          setTelemetry(data);
        } catch (e) {
          console.error('[WebSocket] Erro no parsing de telemetria:', e);
        }
      };

      ws.onclose = () => {
        if (unmounted) return;
        setIsConnected(false);
        reconnectTimeoutRef.current = window.setTimeout(connect, 1500);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      unmounted = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return { telemetry, isConnected };
}
