import asyncio
import time
from typing import Optional, Set
from fastapi import WebSocket
from ..models.schemas import CaptureStatus, TelemetrySnapshot
from .tshark_adapter import TSharkAdapter
from ..engine.stats_engine import stats_engine
from ..config import settings

class CaptureManager:
    def __init__(self):
        self.adapter = TSharkAdapter()
        self.status = CaptureStatus(tshark_path=self.adapter.tshark_path)
        self.broadcast_task: Optional[asyncio.Task] = None
        self.active_websockets: Set[WebSocket] = set()

    async def register_client(self, websocket: WebSocket):
        await websocket.accept()
        self.active_websockets.add(websocket)
        self._ensure_broadcasting()
        snapshot = self.get_snapshot()
        await websocket.send_text(snapshot.model_dump_json())

    def unregister_client(self, websocket: WebSocket):
        self.active_websockets.discard(websocket)

    def get_snapshot(self) -> TelemetrySnapshot:
        # Atualiza status da captura no snapshot
        self.status.is_active = self.adapter.current_mode != "idle"
        self.status.is_paused = self.adapter._is_paused
        self.status.mode = self.adapter.current_mode
        self.status.target = self.adapter.current_target
        self.status.started_at = self.adapter.started_at
        self.status.packets_captured = stats_engine.total_packets
        self.status.bytes_captured = stats_engine.total_bytes
        return stats_engine.get_snapshot(self.status)

    def _on_packet(self, pkt):
        stats_engine.record_packet(pkt)

    def _on_finish(self):
        self.status.is_active = False
        self.status.mode = "idle"

    def start_live(self, interface_id: str, bpf_filter: Optional[str] = None, promiscuous: bool = True):
        self.adapter.start_live(
            interface_id=interface_id,
            bpf_filter=bpf_filter,
            promiscuous=promiscuous,
            on_packet=self._on_packet,
            on_finish=self._on_finish
        )
        self.status.is_active = True
        self.status.mode = "live"
        self.status.target = f"Interface #{interface_id}"
        self.status.started_at = time.time()
        self._ensure_broadcasting()

    def start_pcap(self, pcap_path: str, replay_speed: float = 0.0):
        self.adapter.start_pcap(
            pcap_path=pcap_path,
            replay_speed=replay_speed,
            on_packet=self._on_packet,
            on_finish=self._on_finish
        )
        self.status.is_active = True
        self.status.mode = "replay" if replay_speed > 0 else "pcap"
        self.status.target = pcap_path
        self.status.started_at = time.time()
        self._ensure_broadcasting()

    def pause(self):
        self.adapter.pause()
        self.status.is_paused = True

    def resume(self):
        self.adapter.resume()
        self.status.is_paused = False

    def clear(self):
        stats_engine.reset()
        self.status.packets_captured = 0
        self.status.bytes_captured = 0

    def stop(self):
        self.adapter.stop()
        self.status.is_active = False
        self.status.is_paused = False
        self.status.mode = "idle"

    def _ensure_broadcasting(self):
        try:
            loop = asyncio.get_running_loop()
            if self.broadcast_task is None or self.broadcast_task.done():
                self.broadcast_task = loop.create_task(self._broadcast_loop())
        except RuntimeError:
            pass

    async def _broadcast_loop(self):
        while True:
            if not self.active_websockets:
                await asyncio.sleep(0.5)
                continue

            snapshot_json = self.get_snapshot().model_dump_json()
            to_remove = set()

            for ws in list(self.active_websockets):
                try:
                    await ws.send_text(snapshot_json)
                except Exception:
                    to_remove.add(ws)

            for dead_ws in to_remove:
                self.active_websockets.discard(dead_ws)

            await asyncio.sleep(settings.TELEMETRY_INTERVAL_SEC)

capture_manager = CaptureManager()
