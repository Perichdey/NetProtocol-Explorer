import struct
import time
from pathlib import Path

def generate_demo_pcap(filepath: str):
    """
    Gera uma captura PCAP com múltiplos nós e fluxos para análise de grafo de conexões:
    - ARP broadcast & reply
    - ICMP Echo Ping (192.168.1.50 <-> 1.1.1.1)
    - DNS queries & replies (192.168.1.50 <-> 8.8.8.8)
    - HTTP web traffic (192.168.1.50 <-> 93.184.216.34:80)
    - HTTPS/TLS secure session (192.168.1.50 <-> 104.18.25.1:443)
    - SSH administrative session (192.168.1.50 <-> 192.168.1.10:22)
    - UDP NTP time sync (192.168.1.50 <-> 216.239.35.0:123)
    - TCP SYN port scan (192.168.1.100 -> 192.168.1.50 nas portas 21, 22, 80, 443, 3389)
    """
    pcap_path = Path(filepath)
    pcap_path.parent.mkdir(parents=True, exist_ok=True)
    
    global_header = struct.pack("=IHHiIII", 0xa1b2c3d4, 2, 4, 0, 0, 65535, 1)
    packets_data = []
    base_time = time.time() - 30

    def make_ipv4(src_ip, dst_ip, proto, payload):
        src_parts = [int(x) for x in src_ip.split(".")]
        dst_parts = [int(x) for x in dst_ip.split(".")]
        ihl_version = (4 << 4) | 5
        tot_len = 20 + len(payload)
        hdr = struct.pack("!BBHHHBBH4s4s", ihl_version, 0, tot_len, 0x1234, 0x4000, 64, proto, 0, bytes(src_parts), bytes(dst_parts))
        return hdr + payload

    def make_eth(src_mac, dst_mac, ethertype, payload):
        src_b = bytes.fromhex(src_mac.replace(":", ""))
        dst_b = bytes.fromhex(dst_mac.replace(":", ""))
        return dst_b + src_b + struct.pack("!H", ethertype) + payload

    # 1. ARP Broadcast & Reply
    arp_req = bytes.fromhex("000108000604000100155d010203c0a80132000000000000c0a80101")
    packets_data.append((base_time + 0.1, make_eth("00:15:5d:01:02:03", "ff:ff:ff:ff:ff:ff", 0x0806, arp_req)))
    arp_rep = bytes.fromhex("000108000604000200155d998877c0a8010100155d010203c0a80132")
    packets_data.append((base_time + 0.12, make_eth("00:15:5d:99:88:77", "00:15:5d:01:02:03", 0x0806, arp_rep)))

    # 2. ICMP Ping (192.168.1.50 <-> 1.1.1.1)
    icmp_req = struct.pack("!BBHHH", 8, 0, 0, 0x1a2b, 1) + b"NetProtocol ICMP Ping"
    packets_data.append((base_time + 0.3, make_eth("00:15:5d:01:02:03", "00:15:5d:99:88:77", 0x0800, make_ipv4("192.168.1.50", "1.1.1.1", 1, icmp_req))))
    icmp_rep = struct.pack("!BBHHH", 0, 0, 0, 0x1a2b, 1) + b"NetProtocol ICMP Ping"
    packets_data.append((base_time + 0.33, make_eth("00:15:5d:99:88:77", "00:15:5d:01:02:03", 0x0800, make_ipv4("1.1.1.1", "192.168.1.50", 1, icmp_rep))))

    # 3. DNS Query & Response (192.168.1.50 <-> 8.8.8.8)
    dns_query = bytes.fromhex("1a2b0100000100000000000006676f6f676c6503636f6d0000010001")
    udp_dns1 = struct.pack("!HHHH", 53210, 53, 8 + len(dns_query), 0) + dns_query
    packets_data.append((base_time + 0.5, make_eth("00:15:5d:01:02:03", "00:15:5d:99:88:77", 0x0800, make_ipv4("192.168.1.50", "8.8.8.8", 17, udp_dns1))))
    dns_resp = bytes.fromhex("1a2b8180000100010000000006676f6f676c6503636f6d0000010001c00c000100010000012c00048efae06e")
    udp_dns2 = struct.pack("!HHHH", 53, 53210, 8 + len(dns_resp), 0) + dns_resp
    packets_data.append((base_time + 0.55, make_eth("00:15:5d:99:88:77", "00:15:5d:01:02:03", 0x0800, make_ipv4("8.8.8.8", "192.168.1.50", 17, udp_dns2))))

    # 4. HTTP Session (192.168.1.50 <-> 93.184.216.34:80)
    tcp_syn = struct.pack("!HHIIBBHHH", 49200, 80, 1000, 0, (5 << 4), 0x02, 64240, 0, 0)
    packets_data.append((base_time + 0.8, make_eth("00:15:5d:01:02:03", "00:15:5d:99:88:77", 0x0800, make_ipv4("192.168.1.50", "93.184.216.34", 6, tcp_syn))))
    tcp_synack = struct.pack("!HHIIBBHHH", 80, 49200, 2000, 1001, (5 << 4), 0x12, 64240, 0, 0)
    packets_data.append((base_time + 0.83, make_eth("00:15:5d:99:88:77", "00:15:5d:01:02:03", 0x0800, make_ipv4("93.184.216.34", "192.168.1.50", 6, tcp_synack))))
    tcp_ack = struct.pack("!HHIIBBHHH", 49200, 80, 1001, 2001, (5 << 4), 0x10, 64240, 0, 0)
    packets_data.append((base_time + 0.84, make_eth("00:15:5d:01:02:03", "00:15:5d:99:88:77", 0x0800, make_ipv4("192.168.1.50", "93.184.216.34", 6, tcp_ack))))
    http_req = b"GET / HTTP/1.1\r\nHost: example.com\r\n\r\n"
    packets_data.append((base_time + 0.86, make_eth("00:15:5d:01:02:03", "00:15:5d:99:88:77", 0x0800, make_ipv4("192.168.1.50", "93.184.216.34", 6, struct.pack("!HHIIBBHHH", 49200, 80, 1001, 2001, (5 << 4), 0x18, 64240, 0, 0) + http_req))))
    http_resp = b"HTTP/1.1 200 OK\r\nContent-Length: 25\r\n\r\n<h1>NetProtocol OK</h1>"
    packets_data.append((base_time + 0.90, make_eth("00:15:5d:99:88:77", "00:15:5d:01:02:03", 0x0800, make_ipv4("93.184.216.34", "192.168.1.50", 6, struct.pack("!HHIIBBHHH", 80, 49200, 2001, 1001 + len(http_req), (5 << 4), 0x18, 64240, 0, 0) + http_resp))))

    # 5. HTTPS / TLS Handshake (192.168.1.50 <-> 104.18.25.1:443)
    tls_payload = bytes.fromhex("160301004a010000460303" + "11"*32 + "000004002f00350100")
    packets_data.append((base_time + 1.2, make_eth("00:15:5d:01:02:03", "00:15:5d:99:88:77", 0x0800, make_ipv4("192.168.1.50", "104.18.25.1", 6, struct.pack("!HHIIBBHHH", 49350, 443, 5000, 8000, (5 << 4), 0x18, 64240, 0, 0) + tls_payload))))

    # 6. SSH Session (192.168.1.50 <-> 192.168.1.10:22)
    ssh_syn = struct.pack("!HHIIBBHHH", 54300, 22, 3000, 0, (5 << 4), 0x02, 64240, 0, 0)
    packets_data.append((base_time + 1.5, make_eth("00:15:5d:01:02:03", "00:15:5d:11:22:33", 0x0800, make_ipv4("192.168.1.50", "192.168.1.10", 6, ssh_syn))))
    ssh_synack = struct.pack("!HHIIBBHHH", 22, 54300, 4000, 3001, (5 << 4), 0x12, 64240, 0, 0)
    packets_data.append((base_time + 1.52, make_eth("00:15:5d:11:22:33", "00:15:5d:01:02:03", 0x0800, make_ipv4("192.168.1.10", "192.168.1.50", 6, ssh_synack))))
    ssh_banner = b"SSH-2.0-OpenSSH_9.6\r\n"
    packets_data.append((base_time + 1.55, make_eth("00:15:5d:11:22:33", "00:15:5d:01:02:03", 0x0800, make_ipv4("192.168.1.10", "192.168.1.50", 6, struct.pack("!HHIIBBHHH", 22, 54300, 4001, 3001, (5 << 4), 0x18, 64240, 0, 0) + ssh_banner))))

    # 7. UDP NTP Time Sync (192.168.1.50 <-> 216.239.35.0:123)
    ntp_req = bytes.fromhex("1b000000000000000000000000000000000000000000000000000000000000000000000000000000e3f7a1b2c3d4e5f6")
    udp_ntp = struct.pack("!HHHH", 56789, 123, 8 + len(ntp_req), 0) + ntp_req
    packets_data.append((base_time + 2.0, make_eth("00:15:5d:01:02:03", "00:15:5d:99:88:77", 0x0800, make_ipv4("192.168.1.50", "216.239.35.0", 17, udp_ntp))))

    # 8. Port Scanning Reconnaissance (192.168.1.100 -> 192.168.1.50 nas portas 21, 22, 80, 443, 3389)
    scan_ports = [21, 22, 80, 443, 3389]
    for idx, port in enumerate(scan_ports):
        syn_scan = struct.pack("!HHIIBBHHH", 61000 + idx, port, 9999 + idx, 0, (5 << 4), 0x02, 1024, 0, 0)
        packets_data.append((base_time + 2.5 + (idx * 0.05), make_eth("00:15:5d:aa:bb:cc", "00:15:5d:01:02:03", 0x0800, make_ipv4("192.168.1.100", "192.168.1.50", 6, syn_scan))))

    with open(pcap_path, "wb") as f:
        f.write(global_header)
        for ts, p_bytes in packets_data:
            sec = int(ts)
            usec = int((ts - sec) * 1_000_000)
            pkt_len = len(p_bytes)
            f.write(struct.pack("=IIII", sec, usec, pkt_len, pkt_len))
            f.write(p_bytes)

    print(f"[DemoGenerator] Topologia de rede com {len(packets_data)} pacotes e 6 nós gerada em {pcap_path}")

if __name__ == "__main__":
    generate_demo_pcap("samples/demo_network.pcap")
