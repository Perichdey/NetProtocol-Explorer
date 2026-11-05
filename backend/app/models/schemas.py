from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class NetworkInterface(BaseModel):
    id: str
    index: int
    name: str
    description: str

class CaptureStartRequest(BaseModel):
    interface_id: str = "1"
    bpf_filter: Optional[str] = None
    promiscuous: bool = True

class CaptureStatus(BaseModel):
    is_active: bool = False
    is_paused: bool = False
    mode: str = "idle"  # idle, live, pcap, replay
    target: Optional[str] = None
    started_at: Optional[float] = None
    packets_captured: int = 0
    bytes_captured: int = 0
    tshark_path: Optional[str] = None
    error: Optional[str] = None

class LayerStat(BaseModel):
    layer_id: int | str
    name: str
    packet_count: int = 0
    byte_count: int = 0
    percentage_packets: float = 0.0
    percentage_bytes: float = 0.0
    protocols: list[str] = []

class ProtocolStat(BaseModel):
    protocol: str
    name: str
    osi_layer: int
    tcp_ip_layer: str
    packet_count: int = 0
    byte_count: int = 0
    percentage_packets: float = 0.0
    percentage_bytes: float = 0.0
    packets_per_sec: float = 0.0
    bytes_per_sec: float = 0.0

class ConnectionItem(BaseModel):
    id: str
    src_ip: str
    dst_ip: str
    src_port: Optional[int] = None
    dst_port: Optional[int] = None
    transport: str
    app_protocol: Optional[str] = None
    packet_count: int = 0
    byte_count: int = 0
    first_seen: float
    last_seen: float
    duration_sec: float = 0.0
    encapsulation: list[str] = []

class GraphNode(BaseModel):
    id: str
    name: str
    category: str  # 'internal', 'external', 'multicast', 'service'
    symbolSize: float
    value: int

class GraphLink(BaseModel):
    source: str
    target: str
    protocol: str
    transport: str
    packet_count: int
    byte_count: int
    label: str

class GraphData(BaseModel):
    nodes: List[GraphNode] = []
    links: List[GraphLink] = []

class TimeSeriesPoint(BaseModel):
    timestamp: float
    time_label: str
    packets: int
    bytes: int
    protocols: Dict[str, int] = {}

class SecurityAlert(BaseModel):
    id: str
    timestamp: float
    attack_id: str
    title: str
    protocol: str
    severity: str  # 'info', 'low', 'medium', 'high', 'critical'
    evidence: str
    hypothesis: str
    recommendation: str

class TelemetrySnapshot(BaseModel):
    timestamp: float
    status: CaptureStatus
    total_packets: int
    total_bytes: int
    packets_per_second: float
    bytes_per_second: float
    active_protocols_count: int
    active_connections_count: int
    unique_ips_count: int
    processing_latency_ms: float
    osi_layers: Dict[str, LayerStat]
    tcpip_layers: Dict[str, LayerStat]
    top_protocols: List[ProtocolStat]
    recent_connections: List[ConnectionItem]
    graph_data: GraphData = GraphData()
    time_series: List[TimeSeriesPoint] = []
    security_alerts: List[SecurityAlert] = []
