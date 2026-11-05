from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ProtocolMetadata(BaseModel):
    id: str
    name: str
    acronym: Optional[str] = None
    osi_layer: int = 7
    tcp_ip_layer: str = "application"
    transport: List[str] = Field(default_factory=list)
    ports: List[int] = Field(default_factory=list)
    aliases: List[str] = Field(default_factory=list)
    related_protocols: List[str] = Field(default_factory=list)
    attacks: List[str] = Field(default_factory=list)
    file_path: Optional[str] = None

class ProtocolDetail(BaseModel):
    meta: ProtocolMetadata
    content: str
    summary: Optional[str] = None
    purpose: Optional[str] = None
    security_notes: Optional[str] = None

class AttackMetadata(BaseModel):
    id: str
    name: str
    protocol: Optional[str] = None
    severity: str = "medium"  # low, medium, high, critical
    mitre_attack_id: Optional[str] = None
    affected_layers: List[int] = Field(default_factory=list)
    indicators: List[str] = Field(default_factory=list)

class AttackDetail(BaseModel):
    meta: AttackMetadata
    content: str

class LayerDetail(BaseModel):
    id: int | str
    name: str
    model: str  # osi ou tcpip
    content: str
    protocols: List[str] = Field(default_factory=list)
