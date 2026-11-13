---
title: "Computer Networks formula sheet"
summary: "Delays, sliding window, MAC, error codes, routing, IPv4 addressing and fragmentation, TCP control and HTTP timing on one page."
---

## Layering, switching and performance

Units: 1 Mbps = $10^6$ bps (rates are always decimal). File sizes: read the question; 1 KB may be 1000 or 1024 bytes.

| Layer (TCP/IP) | PDU | Address | Device |
|---|---|---|---|
| Application | message | names, URLs | host |
| Transport | segment (TCP), datagram (UDP) | port | host |
| Network | packet / datagram | IP | router |
| Link | frame | MAC | switch, bridge |
| Physical | bits | none | hub, repeater |

OSI adds session and presentation between transport and application (7 layers).

| Quantity | Formula |
|---|---|
| Transmission delay | $L/R$ |
| Propagation delay | $d/v$ ($v \approx 2 \times 10^8$ m/s in cable) |
| Bandwidth-delay product | $R \times d_{prop}$ bits in flight one way |
| Bit length on wire | $v/R$ metres |
| Traffic intensity | $La/R$; queue grows without bound if $\ge 1$ |
| Throughput over links in series | $\min(R_1, R_2, \dots)$ |
| One packet, $h$ store-and-forward links | $h(L/R + d_{prop})$ |
| $N$ packets, $h$ links, back to back | $(N + h - 1)L/R + h\,d_{prop}$ |
| Circuit switching | $t_{setup} + M/R + h\,d_{prop}$ (no per-hop store) |
| TDM circuit with $n$ slots | rate per circuit $= R/n$ |

- Smaller packets pipeline better but add header overhead; the best size balances the two. Try each option.
- Packet switching wins for bursty users (statistical multiplexing: binomial count of active users).
- Virtual circuit: setup phase, per-hop VC number swapped at each switch, packets in order on one path. Datagram: each packet routed alone, may reorder.

## Data link layer

**Error detection and correction**

| Fact | Value |
|---|---|
| Hamming distance $d$: detect | $d - 1$ errors |
| Hamming distance $d$: correct | $\lfloor (d-1)/2 \rfloor$ errors |
| Detect $s$ and correct $t$ | $d \ge s + t + 1$ with $s \ge t$ |
| Single-error-correcting check bits $r$ for $m$ data bits | smallest $r$ with $2^r \ge m + r + 1$ |
| Hamming (7,4) | parity at positions 1, 2, 4; syndrome = position of bad bit |
| Single parity bit | detects any odd number of bit errors |
| 2D parity, $p \times q$ data | $p + q + 1$ parity bits; corrects 1, detects 1, 2, 3; misses some 4 (rectangle) |
| CRC with generator of degree $r$ | append $r$ zeros, divide mod 2, send remainder ($r$ bits) |
| Internet checksum | one's complement sum of 16-bit words, carry wrapped back, then complement |

CRC guarantees: all single-bit errors if $G$ has 2 or more terms; all odd-count errors if $(x+1)$ divides $G$; all bursts of length $\le r$.

Hamming check bits: $m = 4 \to 3$, $m = 11 \to 4$, $m = 20 \to 5$, $m = 26 \to 5$, $m = 32 \to 6$.

**Flow control** ($a = T_p / T_t$, ACK time ignored unless given)

| Protocol | Utilisation | Window limits with $k$-bit sequence numbers |
|---|---|---|
| Stop-and-wait | $\dfrac{T_t}{T_t + 2T_p} = \dfrac{1}{1+2a}$ | 1 bit enough |
| Go-Back-N | $\min\left(1, \dfrac{W}{1+2a}\right)$ | $W_s \le 2^k - 1$, $W_r = 1$ |
| Selective Repeat | $\min\left(1, \dfrac{W}{1+2a}\right)$ | $W_s + W_r \le 2^k$, so $W \le 2^{k-1}$ |

- With an ACK of time $T_a$: cycle $= T_t + 2T_p + T_a$ (plus processing if given).
- Window for 100 percent use: $W \ge \lceil \text{cycle} / T_t \rceil$, then pick $k$ from the limits above.
- GBN loss: resend the lost frame and everything sent after it. SR loss: resend only the lost frame.
- Throughput $= U \times R$.

**Medium access**

| Scheme | Result |
|---|---|
| Pure ALOHA | $S = G e^{-2G}$, max $1/(2e) \approx 0.184$ at $G = 0.5$ |
| Slotted ALOHA | $S = G e^{-G}$, max $1/e \approx 0.368$ at $G = 1$ |
| Slotted, $N$ stations, prob $p$ | P(success) $= Np(1-p)^{N-1}$, best $p = 1/N$ |
| CSMA/CD minimum frame | $L_{min} = 2 d R / v$ (transmission $\ge$ round-trip propagation) |
| CSMA/CD efficiency (Kurose) | $1/(1 + 5a)$; use the formula the question gives |
| Token ring, early release, $a < 1$ | $1/(1 + a/N)$ |
| Binary exponential backoff | after $n$-th collision pick $K \in \{0, \dots, 2^{\min(n,10)} - 1\}$, give up after 16 attempts |

- Two stations after collision $n$: P(same $K$) $= 1/2^n$.
- Classic Ethernet: 10 Mbps, slot 512 bit times $= 51.2\ \mu$s, frame 64 to 1518 bytes (header and CRC, no preamble), payload 46 to 1500, 6-byte MAC, 8-byte preamble with SFD.
- Token passing: no collisions, bounded wait, only the token holder sends.
- Switch: learns source MAC per port, floods unknown destinations and broadcasts, each port is its own collision domain, one broadcast domain. Hub: one collision domain.
- Bit stuffing (HDLC): insert 0 after five 1s; flag 01111110.

## Routing

| | Distance vector | Link state |
|---|---|---|
| Knows | neighbours' vectors | full topology |
| Algorithm | Bellman-Ford: $D_x(y) = \min_v \{c(x,v) + D_v(y)\}$ | Dijkstra |
| Messages | to neighbours only | flooded to all |
| Problems | count to infinity, slow on bad news | more memory and CPU |
| Example | RIP (hop count, 16 = infinity, 30 s updates) | OSPF, IS-IS |

- BGP: path vector between autonomous systems.
- Dijkstra time: $O(n^2)$ with an array, $O(E \log n)$ with a heap.
- Synchronous DV: after round $k$, every best path with at most $k + 1$ links is known.
- Good news spreads fast, bad news slowly. Split horizon: do not advertise a route back to the neighbour it came from. Poisoned reverse: advertise it as infinity.
- Two-level hierarchy, $n$ routers in $r$ regions: own region entries $+ (r - 1)$.
- Shortest path tree ties: follow the question's tie rule, otherwise list all.

## IPv4

| Fact | Value |
|---|---|
| Usable hosts in $/p$ | $2^{32-p} - 2$ (/31 point-to-point and /32 host routes are special) |
| Network address | IP AND mask |
| Broadcast | network OR inverted mask |
| Subnets from $s$ borrowed bits | $2^s$ |
| Aggregate $2^k$ aligned blocks of $/p$ | one $/(p-k)$, only if the first block is aligned to $2^k$ |
| Forwarding | longest prefix match, default route last |

Private (RFC 1918): 10.0.0.0/8, 172.16.0.0/12 (172.16 to 172.31), 192.168.0.0/16. Not private: 100.64.0.0/10 (carrier NAT), 169.254.0.0/16 (link-local), 127.0.0.0/8 (loopback).

VLSM: sort needs largest first, give each the smallest block with $2^h - 2 \ge$ hosts, place at the next aligned address.

**Header**

| Field | Note |
|---|---|
| HLEN | 4 bits, in 4-byte words: 5 to 15, header 20 to 60 bytes |
| Total length | 16 bits, header plus data, max 65535 |
| Identification | same in all fragments |
| Flags | DF, MF |
| Fragment offset | 13 bits, units of 8 bytes |
| TTL | decremented by each router; 0 means drop and send ICMP Time Exceeded |
| Checksum | header only, recomputed at every hop (TTL changes) |

**Fragmentation** (header $H$, MTU $M$)

- Data per fragment $= \lfloor (M - H)/8 \rfloor \times 8$.
- Fragments $= \lceil D / \text{data per fragment} \rceil$, offset of fragment $i$ (from 0) $= i \times \text{data}/8$.
- Last byte of a fragment $= 8 \times \text{offset} + (\text{total length} - 4 \times \text{HLEN}) - 1$.
- MF = 1 on all but the last. Reassembly only at the destination.
- DF = 1 and too big: drop, ICMP type 3 code 4 (fragmentation needed).
- Extra bytes sent $= (\text{fragments} - 1) \times H$.

**NAT (NAPT)**: rewrites source IP and port outbound, keeps a table of (inside IP, inside port) to public port, rewrites destination on replies. About 64K connections per public IP per protocol. Breaks unsolicited inbound connections.

## TCP and sockets

| Fact | Value |
|---|---|
| Header | 20 to 60 bytes; data offset in 4-byte words |
| Sequence number | 32 bits, counts bytes; SYN and FIN use one number each |
| ACK number | next byte expected (cumulative) |
| Window field | 16 bits, max 65535; scale shift $s$ multiplies by $2^s$ (max shift 14) |
| Max throughput | $\min(\text{cwnd}, \text{rwnd}) / \text{RTT}$ |
| Wrap-around time | $2^{32} \times 8 / R$ seconds |
| rwnd | RcvBuffer $-$ (LastByteRcvd $-$ LastByteRead) |
| Can still send | rwnd $-$ (LastByteSent $-$ LastByteAcked) |
| Sawtooth average | $0.75\,W / \text{RTT}$ |

- Handshake: SYN($x$), SYN-ACK($y$, ack $x+1$), ACK($x+1$, ack $y+1$). First data byte is ISN $+ 1$.
- Close: FIN, ACK, FIN, ACK. Active closer waits in TIME_WAIT for 2 MSL. FIN closes one direction only.

**RTT estimation** (RFC 6298, $\alpha = 1/8$, $\beta = 1/4$)

- $\text{DevRTT} = (1-\beta)\text{DevRTT} + \beta\,|\text{Sample} - \text{EstRTT}|$ (uses old EstRTT)
- $\text{EstRTT} = (1-\alpha)\text{EstRTT} + \alpha\,\text{Sample}$
- $\text{RTO} = \text{EstRTT} + 4\,\text{DevRTT}$; double RTO on each timeout.
- Karn: ignore samples from retransmitted segments.

**Congestion control**

| Event | ssthresh | cwnd next |
|---|---|---|
| Slow start (cwnd < ssthresh) | same | doubles per RTT (+1 MSS per ACK) |
| Congestion avoidance | same | +1 MSS per RTT |
| 3 duplicate ACKs, Reno | cwnd/2 | ssthresh (fast recovery) |
| 3 duplicate ACKs, Tahoe | cwnd/2 | 1 MSS |
| Timeout (both) | cwnd/2 | 1 MSS, slow start again |

- Exam traces: list cwnd round by round; cap slow start at ssthresh unless told otherwise.
- AIMD converges to a fair share between flows with the same RTT.
- Duplicate ACKs come from out-of-order arrivals; fast retransmit resends after the third duplicate.

**Socket call order**

| Side | Calls |
|---|---|
| TCP server | socket, bind, listen, accept (blocks, returns new socket), recv/send, close |
| TCP client | socket, connect (does the handshake), send/recv, close |
| UDP server | socket, bind, recvfrom, sendto |
| UDP client | socket, sendto, recvfrom |

## DNS and HTTP

**DNS**

| Fact | Value |
|---|---|
| Transport | UDP port 53; TCP 53 for zone transfers and large replies |
| A / AAAA | name to IPv4 / IPv6 |
| NS | zone to its name server |
| CNAME | alias to canonical name |
| MX | mail server for a domain |
| PTR | reverse lookup (in-addr.arpa) |
| SOA | start of zone authority |

- Iterative, nothing cached: local server queries root, TLD, authoritative: 3 queries, client to local 1 exchange.
- Recursive: each server asks the next on the requester's behalf.
- Cached NS or answer skips those steps until the TTL expires. Count only servers not yet cached.
- Answers from a cache are non-authoritative.

**HTTP timing** (page = base file + $N$ objects, transmission ignored unless given)

| Mode | Time |
|---|---|
| Non-persistent, serial | $2(N + 1)$ RTT |
| Non-persistent, $k$ parallel | $2 + 2\lceil N/k \rceil$ RTT |
| Persistent, no pipelining | $2 + N$ RTT |
| Persistent, pipelining | $3$ RTT |

- Add DNS time first if the name is not cached; add $L/R$ per object if transmission time is given.
- HTTP/1.0 closes after each response by default; HTTP/1.1 is persistent by default and needs a Host header.
- HTTP is stateless; cookies carry state.
- GET, HEAD, PUT, DELETE are idempotent; POST is not.

| Code | Meaning |
|---|---|
| 200 | OK |
| 301 / 302 | moved permanently / temporarily (Location header) |
| 304 | not modified (conditional GET) |
| 400 / 403 / 404 | bad request / forbidden / not found |
| 500 / 503 | server error / unavailable |
