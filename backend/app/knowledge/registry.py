import os
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Any
from .models import ProtocolMetadata, ProtocolDetail, AttackMetadata, AttackDetail, LayerDetail
from .parser import parse_markdown_with_frontmatter, extract_section
from ..engine.layer_mapper import layer_mapper
from ..config import settings

class KnowledgeRegistry:
    def __init__(self):
        self.protocols: Dict[str, ProtocolDetail] = {}
        self.attacks: Dict[str, AttackDetail] = {}
        self.layers: Dict[str, LayerDetail] = {}
        self.ports_index: Dict[int, List[str]] = {}
        self.alias_index: Dict[str, str] = {}
        self.glossary_content: str = ""
        self.knowledge_dir: Path = settings.KNOWLEDGE_DIR

    def load_all(self):
        """
        Carrega e indexa todos os arquivos Markdown da pasta knowledge.
        """
        self.protocols.clear()
        self.attacks.clear()
        self.layers.clear()
        self.ports_index.clear()
        self.alias_index.clear()

        if not self.knowledge_dir.exists():
            self.knowledge_dir.mkdir(parents=True, exist_ok=True)
            return

        self._load_protocols()
        self._load_attacks()
        self._load_layers()
        self._load_glossary()

        print(f"[KnowledgeRegistry] Base de conhecimento carregada: "
              f"{len(self.protocols)} protocolos, {len(self.attacks)} ataques, {len(self.layers)} camadas.")

    def _load_protocols(self):
        protocols_dir = self.knowledge_dir / "protocols"
        if not protocols_dir.exists():
            return

        for md_file in protocols_dir.rglob("*.md"):
            try:
                meta_dict, content = parse_markdown_with_frontmatter(md_file)
                proto_id = str(meta_dict.get("id") or md_file.stem).lower().strip()
                name = meta_dict.get("name") or proto_id.upper()
                acronym = meta_dict.get("acronym") or proto_id.upper()
                osi_layer = int(meta_dict.get("osi_layer", 7))
                tcp_ip_layer = str(meta_dict.get("tcp_ip_layer", "application")).lower()
                
                ports = meta_dict.get("ports", [])
                if isinstance(ports, int):
                    ports = [ports]
                ports = [int(p) for p in ports if str(p).isdigit()]

                meta = ProtocolMetadata(
                    id=proto_id,
                    name=name,
                    acronym=acronym,
                    osi_layer=osi_layer,
                    tcp_ip_layer=tcp_ip_layer,
                    transport=meta_dict.get("transport", []),
                    ports=ports,
                    aliases=meta_dict.get("aliases", []),
                    related_protocols=meta_dict.get("related_protocols", []),
                    attacks=meta_dict.get("attacks", []),
                    file_path=str(md_file)
                )

                purpose = extract_section(content, "Finalidade") or extract_section(content, "Propósito")
                sec_notes = extract_section(content, "Recomendações de segurança") or extract_section(content, "Segurança")

                detail = ProtocolDetail(
                    meta=meta,
                    content=content,
                    purpose=purpose,
                    security_notes=sec_notes
                )

                self.protocols[proto_id] = detail

                # Atualiza índices
                for p in ports:
                    if p not in self.ports_index:
                        self.ports_index[p] = []
                    self.ports_index[p].append(proto_id)

                if meta.acronym:
                    self.alias_index[meta.acronym.lower()] = proto_id
                self.alias_index[name.lower()] = proto_id
                for alias in meta.aliases:
                    self.alias_index[str(alias).lower()] = proto_id

                # Sincroniza dinamicamente com o LayerMapper
                layer_mapper.register_protocol(
                    proto_id=proto_id,
                    name=name,
                    osi=osi_layer,
                    tcpip=tcp_ip_layer,
                    acronym=acronym,
                    notes=purpose
                )

            except Exception as e:
                print(f"[KnowledgeRegistry] Erro ao carregar protocolo de {md_file}: {e}")

    def _load_attacks(self):
        attacks_dir = self.knowledge_dir / "attacks"
        if not attacks_dir.exists():
            return

        for md_file in attacks_dir.rglob("*.md"):
            try:
                meta_dict, content = parse_markdown_with_frontmatter(md_file)
                attack_id = str(meta_dict.get("id") or md_file.stem).lower().strip()
                name = meta_dict.get("name") or attack_id.replace("-", " ").title()

                meta = AttackMetadata(
                    id=attack_id,
                    name=name,
                    protocol=meta_dict.get("protocol"),
                    severity=meta_dict.get("severity", "medium"),
                    mitre_attack_id=meta_dict.get("mitre_attack_id"),
                    affected_layers=meta_dict.get("affected_layers", []),
                    indicators=meta_dict.get("indicators", [])
                )

                self.attacks[attack_id] = AttackDetail(meta=meta, content=content)
            except Exception as e:
                print(f"[KnowledgeRegistry] Erro ao carregar ataque de {md_file}: {e}")

    def _load_layers(self):
        layers_dir = self.knowledge_dir / "layers"
        if not layers_dir.exists():
            return

        for md_file in layers_dir.rglob("*.md"):
            try:
                meta_dict, content = parse_markdown_with_frontmatter(md_file)
                layer_id = str(meta_dict.get("id") or md_file.stem).lower()
                name = meta_dict.get("name") or layer_id.title()
                model = meta_dict.get("model", "osi")

                self.layers[layer_id] = LayerDetail(
                    id=layer_id,
                    name=name,
                    model=model,
                    content=content,
                    protocols=meta_dict.get("protocols", [])
                )
            except Exception as e:
                print(f"[KnowledgeRegistry] Erro ao carregar camada de {md_file}: {e}")

    def _load_glossary(self):
        glossary_file = self.knowledge_dir / "glossary" / "networking-terms.md"
        if glossary_file.exists():
            try:
                _, content = parse_markdown_with_frontmatter(glossary_file)
                self.glossary_content = content
            except Exception:
                self.glossary_content = ""

    def get_protocol(self, key: str) -> Optional[ProtocolDetail]:
        k = layer_mapper.normalize_id(key)
        if k in self.protocols:
            return self.protocols[k]
        raw_k = key.lower().strip()
        if raw_k in self.alias_index:
            return self.protocols.get(self.alias_index[raw_k])
        if k in self.alias_index:
            return self.protocols.get(self.alias_index[k])
        for p_id, p_val in self.protocols.items():
            if raw_k == p_val.meta.name.lower() or raw_k in p_id or (p_val.meta.acronym and raw_k == p_val.meta.acronym.lower()):
                return p_val
        return None

    def get_attack(self, attack_id: str) -> Optional[AttackDetail]:
        return self.attacks.get(attack_id.lower().strip())

    def get_protocols_by_port(self, port: int) -> List[ProtocolDetail]:
        proto_ids = self.ports_index.get(port, [])
        return [self.protocols[p] for p in proto_ids if p in self.protocols]

    def save_protocol_content(self, proto_id: str, new_content: str, new_meta: Optional[Dict[str, Any]] = None):
        p = self.get_protocol(proto_id)
        if not p or not p.meta.file_path:
            raise FileNotFoundError(f"Arquivo do protocolo {proto_id} não encontrado.")

        target_file = Path(p.meta.file_path)
        meta_dict = new_meta or p.meta.model_dump(exclude={"file_path"})
        
        frontmatter = yaml.dump(meta_dict, sort_keys=False, allow_unicode=True)
        new_text = f"---\n{frontmatter}---\n\n{new_content.strip()}\n"
        target_file.write_text(new_text, encoding="utf-8")
        
        self.load_all()

knowledge_registry = KnowledgeRegistry()
