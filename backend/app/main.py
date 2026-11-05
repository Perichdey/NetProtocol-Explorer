import os
import shutil
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .config import settings
from .capture.capture_manager import capture_manager
from .models.schemas import CaptureStartRequest, CaptureStatus, TelemetrySnapshot
from .knowledge.registry import knowledge_registry
from .knowledge.watcher import knowledge_watcher

app = FastAPI(
    title="NetProtocol Explorer API",
    description="Motor de Captura, Telemetria, Segurança e Enciclopédia Modular de Protocolos",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIST = settings.BASE_DIR / "frontend" / "dist"

@app.on_event("startup")
async def startup_event():
    os.makedirs(settings.SAMPLES_DIR, exist_ok=True)
    os.makedirs(settings.KNOWLEDGE_DIR, exist_ok=True)
    
    demo_path = settings.SAMPLES_DIR / "demo_network.pcap"
    if not demo_path.exists():
        from .samples.generator import generate_demo_pcap
        generate_demo_pcap(str(demo_path))

    knowledge_registry.load_all()
    knowledge_watcher.start()
    
    print(f"[NetProtocol API] Iniciado com sucesso. TShark: {capture_manager.adapter.tshark_path}")

@app.on_event("shutdown")
async def shutdown_event():
    knowledge_watcher.stop()
    capture_manager.stop()

# ==================== ENDPOINTS DE CAPTURA & STATUS ====================

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "tshark_available": capture_manager.adapter.is_available(),
        "tshark_path": capture_manager.adapter.tshark_path,
        "knowledge_protocols_count": len(knowledge_registry.protocols),
        "knowledge_attacks_count": len(knowledge_registry.attacks),
    }

@app.get("/api/interfaces")
async def get_interfaces():
    interfaces = capture_manager.adapter.list_interfaces()
    return {"interfaces": interfaces}

@app.get("/api/capture/samples")
async def list_samples():
    os.makedirs(settings.SAMPLES_DIR, exist_ok=True)
    files = []
    for f in sorted(settings.SAMPLES_DIR.iterdir()):
        if f.is_file() and f.name.lower().endswith((".pcap", ".pcapng", ".cap")):
            files.append({
                "filename": f.name,
                "size_bytes": f.stat().st_size
            })
    return {"samples": files}

@app.post("/api/capture/start")
async def start_capture(req: CaptureStartRequest):
    if not capture_manager.adapter.is_available():
        raise HTTPException(status_code=500, detail="TShark não está instalado ou configurado.")
    capture_manager.start_live(req.interface_id, req.bpf_filter, req.promiscuous)
    return {"message": "Captura iniciada", "target": capture_manager.status.target}

@app.post("/api/capture/stop")
async def stop_capture():
    capture_manager.stop()
    return {"message": "Captura parada", "status": capture_manager.status}

@app.post("/api/capture/pause")
async def pause_capture():
    capture_manager.pause()
    return {"message": "Captura pausada"}

@app.post("/api/capture/resume")
async def resume_capture():
    capture_manager.resume()
    return {"message": "Captura retomada"}

@app.post("/api/capture/clear")
async def clear_capture():
    capture_manager.clear()
    return {"message": "Estatísticas reinicializadas"}

@app.post("/api/capture/upload-pcap")
async def upload_pcap(
    file: UploadFile = File(...),
    replay_speed: float = Form(0.0)
):
    safe_name = Path(file.filename or "capture.pcap").name
    if not safe_name.lower().endswith((".pcap", ".pcapng", ".cap")):
        raise HTTPException(status_code=400, detail="Formato de arquivo inválido. Envie um arquivo .pcap ou .pcapng.")
    
    dest_path = settings.SAMPLES_DIR / safe_name
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    capture_manager.clear()
    capture_manager.start_pcap(str(dest_path), replay_speed=replay_speed)
    return {
        "message": "Arquivo PCAP carregado e análise iniciada",
        "filename": safe_name,
        "replay_speed": replay_speed
    }

@app.post("/api/capture/load-demo")
async def load_demo(replay_speed: float = 0.0, filename: str = "demo_network.pcap"):
    safe_name = Path(filename).name
    target_path = settings.SAMPLES_DIR / safe_name
    if not target_path.exists():
        if safe_name == "demo_network.pcap":
            from .samples.generator import generate_demo_pcap
            generate_demo_pcap(str(target_path))
        else:
            raise HTTPException(status_code=404, detail=f"Arquivo {safe_name} não encontrado em samples/.")
    
    capture_manager.clear()
    capture_manager.start_pcap(str(target_path), replay_speed=replay_speed)
    return {"message": f"Captura {safe_name} carregada", "target": safe_name}

@app.get("/api/stats", response_model=TelemetrySnapshot)
async def get_stats():
    return capture_manager.get_snapshot()

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await capture_manager.register_client(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        capture_manager.unregister_client(websocket)
    except Exception:
        capture_manager.unregister_client(websocket)

# ==================== ENDPOINTS DA ENCICLOPÉDIA MODULAR ====================

class ProtocolUpdateRequest(BaseModel):
    content: str
    metadata: Optional[Dict[str, Any]] = None

@app.get("/api/knowledge/protocols")
async def list_knowledge_protocols(layer: Optional[int] = None):
    results = []
    for proto in knowledge_registry.protocols.values():
        if layer is None or proto.meta.osi_layer == layer:
            results.append(proto.meta)
    return {"protocols": sorted(results, key=lambda p: (p.osi_layer, p.name))}

@app.get("/api/knowledge/protocols/{proto_id}")
async def get_knowledge_protocol(proto_id: str):
    detail = knowledge_registry.get_protocol(proto_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Protocolo '{proto_id}' não encontrado na enciclopédia.")
    return detail

@app.put("/api/knowledge/protocols/{proto_id}")
async def update_knowledge_protocol(proto_id: str, req: ProtocolUpdateRequest):
    try:
        knowledge_registry.save_protocol_content(
            proto_id=proto_id,
            new_content=req.content,
            new_meta=req.metadata
        )
        return {"message": f"Protocolo '{proto_id}' atualizado com sucesso no arquivo Markdown."}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar arquivo Markdown: {e}")

@app.get("/api/knowledge/attacks")
async def list_knowledge_attacks():
    results = [a.meta for a in knowledge_registry.attacks.values()]
    return {"attacks": results}

@app.get("/api/knowledge/attacks/{attack_id}")
async def get_knowledge_attack(attack_id: str):
    detail = knowledge_registry.get_attack(attack_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Ataque '{attack_id}' não encontrado na base de conhecimento.")
    return detail

@app.get("/api/knowledge/glossary")
async def get_knowledge_glossary():
    return {"content": knowledge_registry.glossary_content}

@app.get("/api/knowledge/search")
async def search_knowledge(q: str = Query(..., min_length=1)):
    query = q.lower().strip()
    matched_protocols = []
    matched_attacks = []

    for p in knowledge_registry.protocols.values():
        if (query in p.meta.id.lower() or 
            query in p.meta.name.lower() or 
            (p.meta.acronym and query in p.meta.acronym.lower()) or 
            any(query == str(pt) for pt in p.meta.ports)):
            matched_protocols.append(p.meta)

    for a in knowledge_registry.attacks.values():
        if query in a.meta.id.lower() or query in a.meta.name.lower() or (a.meta.protocol and query in a.meta.protocol.lower()):
            matched_attacks.append(a.meta)

    return {
        "query": q,
        "protocols": matched_protocols,
        "attacks": matched_attacks
    }

# ==================== ARQUIVOS ESTÁTICOS / SPA FRONTEND ====================

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("ws"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
