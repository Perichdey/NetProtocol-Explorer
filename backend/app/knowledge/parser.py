import re
import yaml
from pathlib import Path
from typing import Tuple, Dict, Any, Optional

FRONTMATTER_REGEX = re.compile(r"^---\s*\r?\n(.*?)\r?\n---\s*\r?\n", re.DOTALL)

def parse_markdown_with_frontmatter(file_path: Path) -> Tuple[Dict[str, Any], str]:
    """
    Lê um arquivo Markdown e extrai o frontmatter YAML e o corpo textual.
    Retorna (metadata_dict, content_str).
    """
    try:
        text = file_path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"[KnowledgeParser] Erro ao ler arquivo {file_path}: {e}")
        return {}, ""

    match = FRONTMATTER_REGEX.match(text)
    if match:
        raw_yaml = match.group(1)
        content = text[match.end():]
        try:
            meta = yaml.safe_load(raw_yaml) or {}
            if not isinstance(meta, dict):
                meta = {}
            return meta, content
        except Exception as e:
            print(f"[KnowledgeParser] Erro no parsing de YAML em {file_path}: {e}")
            return {}, content
    
    return {}, text

def extract_section(content: str, section_name: str) -> Optional[str]:
    """
    Extrai o texto sob um cabeçalho Markdown de nível 2 (## Nome).
    """
    pattern = rf"##\s+{re.escape(section_name)}\s*\r?\n(.*?)(?=\r?\n##\s+|\Z)"
    match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return None
