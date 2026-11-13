---
title: "IPv4"
summary: "Covers the IPv4 header, fragmentation and offsets, CIDR subnetting and supernetting, longest prefix match and network address translation."
order: 4
sources:
  - title: "RFC 791: Internet Protocol"
    url: "https://www.rfc-editor.org/rfc/rfc791"
  - title: "Classless Inter-Domain Routing (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing"
  - title: "RFC 1918: Address Allocation for Private Internets"
    url: "https://www.rfc-editor.org/rfc/rfc1918"
  - title: "Network address translation (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Network_address_translation"
---

## The IPv4 header

IPv4 gives best-effort, connectionless delivery of datagrams between hosts. The header is 20 bytes without options and at most 60 bytes with them.

| Field | Bits | Notes |
|---|---|---|
| Version | 4 | 4 for IPv4 |
| Header length (HLEN) | 4 | In 4-byte words; 5 to 15, so 20 to 60 bytes |
| Type of service / DSCP + ECN | 8 | Priority and congestion marking |
| Total length | 16 | Header + data in bytes; max 65535 |
| Identification | 16 | Same value in all fragments of one datagram |
| Flags | 3 | Reserved, DF (don't fragment), MF (more fragments) |
| Fragment offset | 13 | Position of this fragment's data, in 8-byte units |
| Time to live | 8 | Decremented at each router; packet dropped at 0 |
| Protocol | 8 | 6 = TCP, 17 = UDP, 1 = ICMP |
| Header checksum | 16 | Covers the header only; recomputed at every hop |
| Source address | 32 | |
| Destination address | 32 | |
| Options | 0 to 320 | Rarely used |

Useful facts:

- Data length $=$ total length $- 4 \times$ HLEN.
- The checksum must be recomputed at each router because TTL changes.
- When TTL reaches 0 the router drops the packet and sends an ICMP time exceeded message (this is how traceroute works).

## Fragmentation

Every link has a maximum transmission unit (MTU), the largest IP datagram it can carry (1500 bytes on Ethernet). If a datagram is bigger than the next link's MTU and DF is 0, the router splits it into fragments. Only the destination reassembles; routers never put fragments back together.

Rules for each fragment:

1. Each fragment gets its own IP header (20 bytes unless options are copied).
2. Data per fragment must be a multiple of 8 bytes, except in the last fragment. So the usable data per fragment is $\lfloor (MTU - H)/8 \rfloor \times 8$, where $H$ is the header length.
3. Fragment offset $=$ (position of the first data byte in the original data) $/ 8$.
4. MF $= 1$ on every fragment except the last. The last fragment has MF $= 0$ and offset $> 0$.
5. All fragments keep the original identification value.

A fragment with offset 0 and MF 0 is an unfragmented datagram. Offset 0 with MF 1 is the first fragment. Offset $> 0$ with MF 0 is the last.

To find which bytes a fragment carries: first byte $= 8 \times$ offset; last byte $=$ first byte $+$ data length $- 1$.

If DF is 1 and the datagram is too big, the router drops it and sends ICMP "fragmentation needed". Path MTU discovery uses this.

## Addressing and CIDR

An IPv4 address is 32 bits, written as four decimal octets. Under CIDR an address block is written $a.b.c.d/n$: the first $n$ bits are the network prefix and the remaining $32 - n$ bits identify hosts.

- Addresses in the block: $2^{32-n}$.
- Usable host addresses: $2^{32-n} - 2$ (all-zero host part is the network address, all-one host part is the directed broadcast). A /31 and /32 are special cases.
- Subnet mask: $n$ ones followed by zeros. /26 is 255.255.255.192.

### Finding network and broadcast addresses

Find the octet where the prefix ends. The block size in that octet is $2^{(\text{8 times the octet number}) - n}$, or more simply 256 minus the mask value in that octet. The network address is the largest multiple of the block size not above the given octet value. The broadcast address is network $+$ block size $- 1$, with all later octets set to 255.

Example: 10.1.77.200/19. The prefix ends in the third octet, mask value 224, block size 32. Multiples of 32: 64, 96. 77 is in 64 to 95. Network 10.1.64.0, broadcast 10.1.95.255, hosts $2^{13} - 2 = 8190$.

### Subnetting

Borrowing $s$ bits from the host part creates $2^s$ subnets, each with $2^{32-n-s} - 2$ hosts. Variable length subnet masks (VLSM) let different subnets have different sizes: allocate the largest subnets first, each on a boundary that is a multiple of its own size.

### Supernetting and route aggregation

$2^k$ contiguous blocks of the same size can be advertised as one prefix that is $k$ bits shorter, provided the first block starts on a boundary aligned to the combined size. Aggregation keeps forwarding tables small.

### Classful addresses and private ranges

Classful addressing is obsolete but still appears in questions: class A starts with 0 (first octet 0 to 127, default /8), B with 10 (128 to 191, /16), C with 110 (192 to 223, /24), D with 1110 (multicast), E with 1111 (reserved).

Private ranges (RFC 1918): 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16. 127.0.0.0/8 is loopback.

## Longest prefix match

A forwarding table holds prefixes, not individual addresses. A destination may match several entries. The router chooses the entry with the longest matching prefix, because it is the most specific. A default route 0.0.0.0/0 matches everything and is used only when nothing else matches.

To check whether address $D$ matches prefix $P/n$: AND $D$ with the /n mask and compare with $P$. Only the octet where the prefix boundary falls needs binary work.

## Network address translation

NAT lets many hosts with private addresses share one public address. The NAT router rewrites outgoing packets: the private source address becomes the public address, and the source port becomes a free port on the router (this port-based form is called NAPT or PAT). It records the mapping

(private IP, private port) $\leftrightarrow$ (public IP, public port)

and applies it in reverse to replies. Because the IP header changes, the IP checksum and the TCP or UDP checksum (which covers a pseudo-header with the addresses) are recomputed.

Consequences:

- Outside hosts cannot start connections to inside hosts unless a port is forwarded manually.
- One public address supports roughly 65000 simultaneous mappings per transport protocol.
- NAT breaks the end-to-end principle and complicates protocols that carry addresses inside their payload (old FTP, some VoIP).

## Worked examples

### Worked example 1: Fragment offsets

A 2400-byte datagram (20-byte header, 2380 bytes data) goes through a link with MTU 1000.

Max data per fragment $= 980$, rounded down to a multiple of 8: 976.

| Fragment | Data bytes | Byte range | Offset | Total length | MF |
|---|---|---|---|---|---|
| 1 | 976 | 0 to 975 | 0 | 996 | 1 |
| 2 | 976 | 976 to 1951 | 122 | 996 | 1 |
| 3 | 428 | 1952 to 2379 | 244 | 448 | 0 |

Check: $976 + 976 + 428 = 2380$.

### Worked example 2: Reading a fragment

A fragment has HLEN 5, total length 820, offset 150, MF 1. Data $= 800$ bytes, first byte $= 1200$, last byte $= 1999$. Since MF $= 1$, more fragments follow, so the original datagram carried at least 2000 data bytes.

### Worked example 3: Subnet details

Host 192.168.40.157/27. Block size in the last octet $= 32$. 157 lies in 128 to 159. Network 192.168.40.128, broadcast 192.168.40.159, first host .129, last host .158, 30 usable hosts.

### Worked example 4: Longest prefix match

Table: 12.0.0.0/8 to A, 12.34.0.0/16 to B, 12.34.192.0/18 to C, 12.34.240.0/20 to D, default to E.

Destination 12.34.200.9: third octet 200 = 11001000. /18 needs the top 2 bits 11 (192 = 11000000): match. /20 needs top 4 bits 1111 (240): 1100 does not match. Best match /18, so C.

Destination 12.34.250.1: 250 = 11111010 matches /20, so D. Destination 12.35.0.1 matches only /8, so A.

### Worked example 5: Aggregation

Blocks 172.20.32.0/22, 172.20.36.0/22, 172.20.40.0/22 and 172.20.44.0/22: four /22 blocks covering third octet 32 to 47. Four blocks $= 2^2$, so the aggregate is /20. 32 is a multiple of 16, so the block is aligned: 172.20.32.0/20.

If the blocks had started at 36, the four would cover 36 to 51, which does not fit one aligned /20, and aggregation into a single prefix would not be possible.

## Common traps

- Forgetting that offset counts 8-byte units. Divide the byte position by 8.
- Using MTU minus header as data size without rounding down to a multiple of 8.
- Subtracting header length only once when the datagram is fragmented. Every fragment has its own header.
- Forgetting that HLEN counts 4-byte words (HLEN 5 means 20 bytes).
- Assuming routers reassemble fragments. Only the destination does.
- Forgetting to subtract 2 for network and broadcast when counting hosts.
- Picking the first matching entry instead of the longest prefix.
- Saying the IP checksum covers data. It covers only the header.
- 172.16.0.0/12 ends at 172.31.255.255; 172.32.x.x is public.

## Quick revision

- Header 20 to 60 bytes; HLEN in 4-byte words; total length up to 65535.
- TTL decremented per hop; checksum on header only, recomputed per hop.
- Fragment data size: $\lfloor (MTU - 20)/8 \rfloor \times 8$; offset $=$ byte position $/ 8$; MF $= 0$ only on the last.
- Same identification in all fragments; only the destination reassembles.
- /n block: $2^{32-n}$ addresses, $2^{32-n} - 2$ hosts.
- Broadcast $=$ network $+$ block size $- 1$.
- $2^k$ aligned blocks aggregate into a prefix $k$ bits shorter.
- Longest prefix match wins; default route is /0.
- Private: 10/8, 172.16/12, 192.168/16.
- NAPT rewrites source IP and source port outbound, reverses for replies.
