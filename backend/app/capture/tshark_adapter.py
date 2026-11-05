import os
import shutil
import re
import time
import subprocess
import threading
from typing import Optional, List, Dict, Any, Callable
from pathlib import Path
from ..config import settings
from ..models.schemas import NetworkInterface

class TSharkAdapter:
    def __init__(self):
        self.tshark_path: Optional[str] = self._find_tshark()
        self.process: Optional[subprocess.Popen] = None
        self._stop_event = threading.Event()
        self._is_paused: bool = False
        self.current_mode: str = "idle"
        self.current_target: Optional[str] = None
        self.started_at: Optional[float] = None
        self._thread: Optional[threading.Thread] = None

    def _find_tshark(self) -> Optional[str]:
        path_in_env = shutil.which("tshark")
        if path_in_env:
            return path_in_env
            
        for p in settings.DEFAULT_TSHARK_PATHS:
            if os.path.isfile(p):
                return p
        return None

    def is_available(self) -> bool:
        return self.tshark_path is not None and os.path.isfile(self.tshark_path)

    def list_interfaces(self) -> List[NetworkInterface]:
        if not self.is_available():
            return []
        try:
            p = subprocess.run(
                [self.tshark_path, "-D"],
                capture_output=True,
                text=True,
                errors="replace",
                timeout=5
            )
            output = p.stdout or p.stderr
            interfaces: List[NetworkInterface] = []
            pattern = re.compile(r"^(\d+)\.\s+([^\s\(]+)(?:\s+\((.*?)\))?$", re.MULTILINE)
            for match in pattern.finditer(output):
                idx = int(match.group(1))
                dev_name = match.group(2)
                desc = match.group(3) or dev_name
                interfaces.append(NetworkInterface(
                    id=str(idx),
                    index=idx,
                    name=desc,
                    description=dev_name
                ))
            return interfaces
        except Exception as e:
            print(f"[TSharkAdapter] Erro ao listar interfaces: {e}")
            return []

    def start_live(
        self,
        interface_id: str,
        bpf_filter: Optional[str],
        promiscuous: bool,
        on_packet: Callable[[Dict[str, Any]], None],
        on_finish: Optional[Callable[[], None]] = None
    ):
        self.stop()

        cmd = [
            self.tshark_path,
            "-i", interface_id,
            "-l",
            "-n",
            "-T", "fields",
            "-e", "frame.number",
            "-e", "frame.time_epoch",
            "-e", "frame.len",
            "-e", "frame.protocols",
            "-e", "eth.src",
            "-e", "eth.dst",
            "-e", "ip.src",
            "-e", "ip.dst",
            "-e", "ipv6.src",
            "-e", "ipv6.dst",
            "-e", "tcp.srcport",
            "-e", "tcp.dstport",
            "-e", "udp.srcport",
            "-e", "udp.dstport",
            "-e", "_ws.col.Protocol",
            "-E", "separator=/t",
        ]

        if not promiscuous:
            cmd.append("-p")

        if bpf_filter and bpf_filter.strip():
            cmd.extend(["-f", bpf_filter.strip()])

        self._start_worker(cmd, mode="live", target=f"Interface #{interface_id}", on_packet=on_packet, on_finish=on_finish)

    def start_pcap(
        self,
        pcap_path: str,
        replay_speed: float,
        on_packet: Callable[[Dict[str, Any]], None],
        on_finish: Optional[Callable[[], None]] = None
    ):
        self.stop()

        cmd = [
            self.tshark_path,
            "-r", pcap_path,
            "-l",
            "-n",
            "-T", "fields",
            "-e", "frame.number",
            "-e", "frame.time_epoch",
            "-e", "frame.len",
            "-e", "frame.protocols",
            "-e", "eth.src",
            "-e", "eth.dst",
            "-e", "ip.src",
            "-e", "ip.dst",
            "-e", "ipv6.src",
            "-e", "ipv6.dst",
            "-e", "tcp.srcport",
            "-e", "tcp.dstport",
            "-e", "udp.srcport",
            "-e", "udp.dstport",
            "-e", "_ws.col.Protocol",
            "-E", "separator=/t",
        ]

        mode = "pcap" if replay_speed <= 0.0 else "replay"
        self._start_worker(
            cmd,
            mode=mode,
            target=Path(pcap_path).name,
            on_packet=on_packet,
            on_finish=on_finish,
            replay_speed=replay_speed
        )

    def _start_worker(
        self,
        cmd: List[str],
        mode: str,
        target: str,
        on_packet: Callable[[Dict[str, Any]], None],
        on_finish: Optional[Callable[[], None]],
        replay_speed: float = 0.0
    ):
        self._stop_event.clear()
        self._is_paused = False
        self.current_mode = mode
        self.current_target = target
        self.started_at = time.time()

        def _worker():
            try:
                self.process = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.DEVNULL,
                    text=True,
                    errors="replace",
                    bufsize=1
                )
                last_epoch = None
                for line in self.process.stdout:
                    if self._stop_event.is_set():
                        break
                    while self._is_paused and not self._stop_event.is_set():
                        time.sleep(0.1)

                    line_str = line.strip()
                    if not line_str:
                        continue

                    parsed = self._parse_fields(line_str)
                    if parsed:
                        if replay_speed > 0.0 and parsed.get("epoch"):
                            curr_epoch = parsed["epoch"]
                            if last_epoch is not None:
                                delta = (curr_epoch - last_epoch) / replay_speed
                                if 0 < delta < 2.0:
                                    time.sleep(delta)
                            last_epoch = curr_epoch
                        on_packet(parsed)

                if self.process:
                    self.process.stdout.close()
                    self.process.wait()
            except Exception as e:
                print(f"[TSharkAdapter] Exceção na thread worker: {e}")
            finally:
                self.current_mode = "idle"
                if on_finish:
                    on_finish()

        self._thread = threading.Thread(target=_worker, daemon=True)
        self._thread.start()

    def _parse_fields(self, line: str) -> Optional[Dict[str, Any]]:
        parts = line.split("\t")
        if len(parts) < 4:
            return None

        while len(parts) < 15:
            parts.append("")

        try:
            frame_num = int(parts[0]) if parts[0].isdigit() else 0
            epoch = float(parts[1]) if parts[1] else time.time()
            length = int(parts[2]) if parts[2].isdigit() else 0
            proto_stack_raw = parts[3]
            eth_src = parts[4]
            eth_dst = parts[5]
            ip_src = parts[6] or parts[8]
            ip_dst = parts[7] or parts[9]
            tcp_sport = int(parts[10]) if parts[10].isdigit() else None
            tcp_dport = int(parts[11]) if parts[11].isdigit() else None
            udp_sport = int(parts[12]) if len(parts) > 12 and parts[12].isdigit() else None
            udp_dport = int(parts[13]) if len(parts) > 13 and parts[13].isdigit() else None
            high_level_proto = parts[14] if len(parts) > 14 and parts[14] else None

            sport = tcp_sport or udp_sport
            dport = tcp_dport or udp_dport
            transport = "TCP" if tcp_sport is not None else ("UDP" if udp_sport is not None else "OTHER")
            protocols = proto_stack_raw.split(":") if proto_stack_raw else []

            return {
                "frame_num": frame_num,
                "epoch": epoch,
                "length": length,
                "protocols": protocols,
                "eth_src": eth_src,
                "eth_dst": eth_dst,
                "ip_src": ip_src,
                "ip_dst": ip_dst,
                "src_port": sport,
                "dst_port": dport,
                "transport": transport,
                "high_level_proto": high_level_proto or (protocols[-1].upper() if protocols else "RAW")
            }
        except Exception:
            return None

    def pause(self):
        self._is_paused = True

    def resume(self):
        self._is_paused = False

    def stop(self):
        self._stop_event.set()
        self._is_paused = False
        if self.process:
            try:
                self.process.terminate()
                self.process.kill()
            except Exception:
                pass
            self.process = None
        self.current_mode = "idle"
        self.current_target = None
