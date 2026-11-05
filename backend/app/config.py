import os
from pathlib import Path
from pydantic import BaseModel

class Settings(BaseModel):
    # Caminhos base
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    KNOWLEDGE_DIR: Path = BASE_DIR / "knowledge"
    SAMPLES_DIR: Path = BASE_DIR / "samples"
    
    # Wireshark / TShark (Multiplataforma: Windows, Linux, macOS + variável de ambiente)
    DEFAULT_TSHARK_PATHS: list[str] = [
        os.environ.get("TSHARK_PATH", ""),
        r"C:\Program Files\Wireshark\tshark.exe",
        r"C:\Program Files (x86)\Wireshark\tshark.exe",
        "/usr/bin/tshark",
        "/usr/local/bin/tshark",
        "/Applications/Wireshark.app/Contents/MacOS/tshark",
        "/opt/homebrew/bin/tshark",
        "tshark",
    ]
    
    # Engine & Buffer
    MAX_PACKETS_BUFFER: int = 15000
    TELEMETRY_INTERVAL_SEC: float = 0.35
    DEFAULT_PPS_WINDOW_SEC: int = 1
    
    # Servidor
    HOST: str = os.environ.get("NETPROTOCOL_HOST", "127.0.0.1")
    PORT: int = int(os.environ.get("NETPROTOCOL_PORT", "8000"))

settings = Settings()
