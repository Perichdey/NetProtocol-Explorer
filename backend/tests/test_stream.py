import subprocess
import asyncio
import time

def main():
    p = subprocess.Popen(
        [r"C:\Program Files\Wireshark\tshark.exe", "-r", "samples/demo_network.pcap", "-n", "-T", "fields", "-e", "frame.number"],
        stdout=subprocess.PIPE,
        text=True
    )
    lines = []
    for line in p.stdout:
        lines.append(line.strip())
    p.stdout.close()
    p.wait()
    print(f"Lido com sucesso: {len(lines)} pacotes.")

if __name__ == "__main__":
    main()
