import subprocess
import threading
import asyncio
import os

async def main():
    p = subprocess.Popen(
        [r"C:\Program Files\Wireshark\tshark.exe", "-r", "samples/demo_network.pcap", "-n", "-T", "fields", "-e", "frame.number", "-e", "frame.protocols"],
        stdout=subprocess.PIPE,
        text=True,
        errors="replace"
    )

    loop = asyncio.get_running_loop()
    q = asyncio.Queue(maxsize=1000)

    def reader():
        for line in p.stdout:
            loop.call_soon_threadsafe(q.put_nowait, line.strip())
        p.stdout.close()
        p.wait()
        loop.call_soon_threadsafe(q.put_nowait, None)

    th = threading.Thread(target=reader, daemon=True)
    th.start()

    packets = []
    while True:
        item = await q.get()
        if item is None:
            break
        packets.append(item)

    print(f"[AsyncQueue] Total de pacotes recebidos no asyncio: {len(packets)}")
    for p_line in packets[:3]:
        print(" ", p_line)

if __name__ == "__main__":
    asyncio.run(main())
