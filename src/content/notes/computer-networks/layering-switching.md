---
title: "Layering, switching and performance"
summary: "Covers the OSI and TCP/IP layer models, circuit, packet and virtual circuit switching, and how to compute delay, throughput and bandwidth-delay product."
order: 1
sources:
  - title: "OSI model (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/OSI_model"
  - title: "Packet switching (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Packet_switching"
  - title: "Bandwidth-delay product (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Bandwidth-delay_product"
---

## Why networks are layered

A network has to solve many separate problems: putting bits on a wire, getting a frame to the next machine, finding a path across many routers, delivering data reliably to the right program, and giving that program a useful format. Layering splits these problems into a stack. Each layer uses the service of the layer below and offers a service to the layer above. A layer on one host talks to the same layer on the other host through a protocol, but physically everything travels down the stack, across the link, and up again.

The practical result is encapsulation. As data moves down, each layer adds its own header (and the link layer usually adds a trailer too). As it moves up at the receiver, each layer strips its header and hands the rest upward.

| Layer | Name of the data unit | Typical header content |
|---|---|---|
| Application | Message | HTTP request line, DNS query |
| Transport | Segment (TCP) or datagram (UDP) | Ports, sequence numbers, checksum |
| Network | Packet or datagram | Source and destination IP, TTL |
| Link | Frame | MAC addresses, type, CRC |
| Physical | Bits | None (signalling only) |

## OSI versus TCP/IP

The OSI reference model has seven layers. The TCP/IP model used on the Internet has four or five, depending on the textbook. GATE questions mostly ask which function belongs to which layer.

| OSI layer | Main job | TCP/IP equivalent |
|---|---|---|
| 7 Application | Services for users (mail, web, file transfer) | Application |
| 6 Presentation | Data representation, encryption, compression | Application |
| 5 Session | Dialogue control, checkpoints, synchronisation | Application |
| 4 Transport | End-to-end delivery between processes, ports, reliability, flow control | Transport |
| 3 Network | Logical addressing and routing across networks | Internet |
| 2 Data link | Framing, MAC addressing, error detection, access to shared medium | Link |
| 1 Physical | Encoding bits as signals, timing, connectors | Link (or physical) |

Points that are often tested:

- Hop-to-hop versus end-to-end. Link layer error control works on a single link. Transport layer error control works between the two end hosts.
- Routers work up to layer 3, switches (bridges) up to layer 2, hubs and repeaters only at layer 1. Gateways or application proxies can work at all layers.
- Port numbers identify processes and live in the transport header. IP addresses identify interfaces and live in the network header. MAC addresses identify adapters on one link.
- In TCP/IP, presentation and session functions are handled by the application itself (for example TLS for encryption).

## Switching techniques

### Circuit switching

A dedicated path is set up before any data flows. Each link on the path gives the call a fixed share of its capacity, either a time slot (TDM) or a frequency band (FDM). Once set up, the call gets a constant rate with no queuing, and the total time for a transfer is

$$T = T_{setup} + \frac{\text{file size}}{\text{circuit rate}} + T_{prop}$$

The cost is waste: if the user is silent, the reserved slot stays idle and nobody else can use it.

### Datagram packet switching

Data is cut into packets, each carrying the full destination address. Routers forward each packet independently using their forwarding table. There is no setup, links are shared on demand (statistical multiplexing), and packets can take different paths and arrive out of order. Under load, packets wait in router queues and may be dropped when buffers fill.

### Virtual circuit packet switching

A middle path. A setup phase picks a route and installs state in every switch. Data packets then carry only a short virtual circuit identifier (VCI), which each switch rewrites from the incoming value to the outgoing value. All packets follow the same path, so order is preserved, and resources can be reserved. ATM and MPLS-style label switching work this way.

| Feature | Circuit | Datagram | Virtual circuit |
|---|---|---|---|
| Setup phase | Yes | No | Yes |
| Address in each unit | None (implicit) | Full destination | Short VC number |
| Path | Fixed | Can vary per packet | Fixed |
| In-order delivery | Yes | Not guaranteed | Yes |
| Router or switch state | Per call | None per flow | Per VC |
| Effect of a switch failure | Calls broken | Packets rerouted | VCs broken |
| Bandwidth use | Reserved, can be wasted | Shared on demand | Shared or reserved |

### Store-and-forward and pipelining

Packet switches normally store and forward: a router must receive the whole packet before it starts sending it on the next link. For one packet of $L$ bits over $h$ links of rate $R$, with propagation delay $d_i$ on link $i$:

$$T = h\frac{L}{R} + \sum_{i=1}^{h} d_i$$

For a message split into $N$ packets, the links work in parallel on different packets. Ignoring propagation:

$$T = (N + h - 1)\frac{L}{R}$$

This is why splitting a long message into packets reduces end-to-end delay, until per-packet header overhead starts to dominate.

## Performance metrics

### The four delays

- **Transmission delay** $T_t = L/R$: time to push all $L$ bits onto a link of rate $R$. It depends on packet size and link rate, not on distance.
- **Propagation delay** $T_p = d/v$: time for one bit to travel distance $d$ at signal speed $v$ (about $2 \times 10^8$ m/s in copper or fibre). It depends on distance, not on packet size.
- **Queuing delay**: time spent waiting in a router buffer. It depends on load.
- **Processing delay**: time to check the header and look up the forwarding table, usually small.

Total nodal delay $= d_{proc} + d_{queue} + d_{trans} + d_{prop}$.

### Throughput and bottleneck

Throughput is the rate at which useful data actually arrives. For a path made of links in series, end-to-end throughput is limited by the slowest link:

$$\text{throughput} = \min(R_1, R_2, \ldots, R_h)$$

### Bandwidth-delay product

The bandwidth-delay product $R \times T_p$ is the number of bits that fit "in the pipe" at once. If the sender must wait for acknowledgements, it needs $R \times RTT$ bits outstanding to keep the link busy. This number drives window sizing in sliding window protocols and TCP.

### Units

GATE uses $1$ Mbps $= 10^6$ bps and $1$ Gbps $= 10^9$ bps for rates. For data sizes, read the question: 1 KB may be $1000$ or $1024$ bytes. When the question is silent, data rates are decimal and file sizes are usually given in bytes; multiply by 8 for bits.

## Worked examples

### Worked example 1: Transmission versus propagation

A 2000-byte packet goes over a 4000 km fibre link of rate 100 Mbps. Signal speed is $2 \times 10^8$ m/s.

- $T_t = 16000 / 10^8 = 0.16$ ms
- $T_p = 4 \times 10^6 / (2 \times 10^8) = 20$ ms

The last bit reaches the receiver at $T_t + T_p = 20.16$ ms. Propagation dominates. Making the link ten times faster saves only 0.144 ms; the long distance is the real cost.

### Worked example 2: Store-and-forward over several hops

A 1500-byte packet crosses 4 links, each 12 Mbps with propagation delay 1 ms. No queuing.

Per-link $T_t = 12000 / (12 \times 10^6) = 1$ ms. Total $= 4 \times (1 + 1) = 8$ ms.

If the path had been one direct link of the same total propagation (4 ms), the time would be $1 + 4 = 5$ ms. The extra 3 ms comes from re-transmitting the packet at each of the 3 routers.

### Worked example 3: Message versus packets

A 1 MB message ($8 \times 10^6$ bits) goes over 3 links of 10 Mbps. Ignore propagation and headers.

Sent as one message: $3 \times 8 \times 10^6 / 10^7 = 2.4$ s.

Split into 1000 packets of 8000 bits: $T = (1000 + 3 - 1) \times 8000 / 10^7 = 1002 \times 0.8$ ms $= 0.8016$ s.

Pipelining saves about two thirds of the time because the routers work in parallel.

### Worked example 4: Circuit switching with TDM

A 2.048 Mbps line is divided into 32 TDM slots. Setup takes 400 ms. How long to send a 256000-bit file over one slot?

Slot rate $= 2.048 \times 10^6 / 32 = 64000$ bps. Transfer $= 256000 / 64000 = 4$ s. Total $= 4.4$ s. A packet-switched transfer on the same idle link would take only $0.125$ s plus propagation, which shows the price of reserved slots.

### Worked example 5: Bandwidth-delay product

A satellite link has rate 50 Mbps and RTT 540 ms. How many bytes must the sender keep unacknowledged to keep the link fully busy?

$R \times RTT = 50 \times 10^6 \times 0.54 = 2.7 \times 10^7$ bits $= 3.375 \times 10^6$ bytes, about 3.4 MB. A TCP receive window of 64 KB is far too small for this link without window scaling.

## Common traps

- Confusing transmission and propagation delay. A longer cable increases only propagation; a bigger packet increases only transmission.
- Forgetting that store-and-forward pays the transmission delay once per link, not once per path.
- Using $(N \times h)$ instead of $(N + h - 1)$ packet times for pipelined transfers.
- Mixing bytes and bits. Rates are in bits per second; sizes are often in bytes.
- Treating 1 Mbps as $2^{20}$ bps. Rates are decimal.
- Saying circuit switching has queuing delay. Once the circuit exists, it does not.
- Assuming a virtual circuit packet carries the destination address. Only the setup message does.
- Using one-way delay when the question needs RTT, or the reverse. Read whether the question asks for bits on the link (one-way) or bits the sender must have unacknowledged (round trip).

## Quick revision

- OSI: Physical, Data link, Network, Transport, Session, Presentation, Application. TCP/IP merges the top three and the bottom two.
- Transport is end-to-end between processes; data link is hop-to-hop between adjacent nodes.
- Router: layer 3. Switch or bridge: layer 2. Hub or repeater: layer 1.
- Circuit switching: setup, reserved capacity, constant rate, no queuing, possible waste.
- Datagram: no setup, full address per packet, independent routing, may reorder.
- Virtual circuit: setup, short VC label rewritten per hop, fixed path, ordered.
- $T_t = L/R$, $T_p = d/v$.
- One packet, $h$ links: $h(L/R) + \sum d_i$.
- $N$ packets, $h$ links, no propagation: $(N + h - 1)L/R$.
- End-to-end throughput is the minimum link rate on the path.
- Bandwidth-delay product $= R \times T_p$ bits on the link; $R \times RTT$ bits needed outstanding to fill the pipe.
