---
title: "TCP and sockets"
summary: "Covers the TCP header, connection setup and teardown, sequence numbers, flow control, congestion control (slow start, congestion avoidance, fast retransmit), timeouts and the socket API call order."
order: 5
sources:
  - title: "RFC 9293: Transmission Control Protocol"
    url: "https://www.rfc-editor.org/rfc/rfc9293"
  - title: "RFC 5681: TCP Congestion Control"
    url: "https://www.rfc-editor.org/rfc/rfc5681"
  - title: "TCP congestion control (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/TCP_congestion_control"
  - title: "Berkeley sockets (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Berkeley_sockets"
---

## What TCP provides

TCP gives a reliable, in-order, full-duplex byte stream between two processes. It is connection oriented, uses cumulative acknowledgements, retransmits lost data, controls the sender's rate so the receiver is not overrun (flow control) and so the network is not overloaded (congestion control). UDP, by contrast, sends independent datagrams with only ports and a checksum.

## The TCP header

| Field | Bits | Notes |
|---|---|---|
| Source port, destination port | 16 each | Identify the processes |
| Sequence number | 32 | Number of the first data byte in this segment |
| Acknowledgement number | 32 | Next byte expected from the other side (cumulative) |
| Header length (data offset) | 4 | In 4-byte words; 20 to 60 bytes |
| Flags | 6 classic | URG, ACK, PSH, RST, SYN, FIN |
| Receive window | 16 | Bytes the receiver can still accept; max 65535 without scaling |
| Checksum | 16 | Over a pseudo-header, the TCP header and data |
| Urgent pointer | 16 | Used with URG |
| Options | 0 to 40 bytes | MSS, window scale, SACK, timestamps |

Sequence numbers count bytes, not segments. SYN and FIN each consume one sequence number; pure ACKs consume none. The 32-bit space wraps after $2^{32}$ bytes; at high speeds this happens quickly, which is why the timestamp option exists for protection against wrapped sequence numbers.

## Connection management

### Three-way handshake

1. Client sends SYN with initial sequence number $x$.
2. Server replies SYN+ACK with its own ISN $y$ and ACK $= x + 1$.
3. Client sends ACK $= y + 1$. Data may ride on this segment.

The client's first data byte has sequence number $x + 1$. Random ISNs protect against old duplicate segments and spoofing.

### Teardown

Either side sends FIN; the other ACKs it. Each direction is closed separately, so a normal close uses four segments (FIN, ACK, FIN, ACK), though the middle two can be combined. The side that closes first enters TIME_WAIT for $2 \times$ MSL so that a lost final ACK can be resent and old segments die out.

## Flow control

The receiver advertises a window rwnd equal to its free buffer space. The sender keeps

$$\text{LastByteSent} - \text{LastByteAcked} \le \min(\text{rwnd}, \text{cwnd})$$

If rwnd is 0, the sender stops and periodically sends a one-byte probe so that it learns when the window reopens. With a window of $W$ bytes and round trip time RTT, throughput is at most $W/\text{RTT}$, no matter how fast the link is. The window scale option multiplies the 16-bit field by $2^s$ (up to $s = 14$) for high bandwidth-delay paths.

## Retransmission timeout

TCP estimates RTT with exponentially weighted moving averages:

$$\text{EstRTT} = (1 - \alpha)\,\text{EstRTT} + \alpha\,\text{SampleRTT}, \quad \alpha = 1/8$$

$$\text{DevRTT} = (1 - \beta)\,\text{DevRTT} + \beta\,|\text{SampleRTT} - \text{EstRTT}|, \quad \beta = 1/4$$

$$\text{RTO} = \text{EstRTT} + 4\,\text{DevRTT}$$

Karn's rule: do not take RTT samples from retransmitted segments, because the ACK could belong to either copy. After a timeout, RTO is doubled (exponential backoff) until a fresh ACK arrives.

## Congestion control

The sender keeps a congestion window cwnd and a threshold ssthresh. Its effective window is $\min(\text{cwnd}, \text{rwnd})$. GATE questions usually measure cwnd in MSS and assume a full window is sent and acknowledged every RTT.

### Slow start

Start with cwnd $= 1$ MSS (newer stacks use larger initial windows, but follow the question). For every ACK, add 1 MSS, which doubles cwnd every RTT. Slow start continues until cwnd reaches ssthresh. Many GATE questions say that cwnd is capped at ssthresh when doubling would overshoot it; follow whatever the question states.

### Congestion avoidance

Once cwnd $\ge$ ssthresh, add about 1 MSS per RTT (each ACK adds MSS $\times$ MSS / cwnd). This is the additive increase part of AIMD.

### Reaction to loss

| Event | TCP Tahoe | TCP Reno |
|---|---|---|
| Timeout | ssthresh $=$ cwnd/2, cwnd $= 1$, slow start | Same as Tahoe |
| 3 duplicate ACKs | ssthresh $=$ cwnd/2, cwnd $= 1$, slow start (after fast retransmit) | Fast retransmit; ssthresh $=$ cwnd/2; cwnd $=$ ssthresh $+ 3$; fast recovery, then cwnd $=$ ssthresh and congestion avoidance |

Fast retransmit: three duplicate ACKs for the same byte mean a segment is missing but later ones are arriving, so the sender resends the missing segment without waiting for the timer.

The resulting cwnd plot for Reno is a sawtooth: linear growth, halve on triple duplicate ACKs, linear growth again. For Tahoe or after a timeout, it drops to 1 and climbs exponentially again.

## The socket API

Sockets are the interface between applications and the transport layer.

| Server (TCP) | Client (TCP) |
|---|---|
| socket() | socket() |
| bind() to a well-known port | (bind optional) |
| listen() | |
| accept() blocks | connect() starts the handshake |
| read()/write() or recv()/send() | write()/read() |
| close() | close() |

accept() returns a new connected socket for each client; the listening socket stays open for further connections. connect() performs the three-way handshake. For UDP there is no listen, accept or connect requirement: the server calls socket and bind, then recvfrom and sendto; the client calls socket then sendto and recvfrom.

## Worked examples

### Worked example 1: Sequence and acknowledgement numbers

Client ISN 500, server ISN 9000. After the handshake the client sends 200 bytes, then 300 bytes. The server replies with 100 bytes after receiving both.

- SYN: seq 500. SYN+ACK: seq 9000, ack 501. ACK: seq 501, ack 9001.
- Data 1: seq 501 (bytes 501 to 700). Data 2: seq 701 (bytes 701 to 1000).
- Server reply: seq 9001, ack 1001. Client's ACK of that: ack 9101.

### Worked example 2: Window-limited throughput

rwnd $= 32$ KB (32768 bytes), RTT $= 50$ ms, link 1 Gbps. Throughput $\le 32768 \times 8 / 0.05 = 5.24$ Mbps, about half a percent of the link. To fill the link you need $10^9 \times 0.05 / 8 = 6.25$ MB of window, which requires window scaling.

### Worked example 3: cwnd evolution with a timeout

cwnd starts at 1 MSS, ssthresh $= 16$ MSS. Assume doubling is capped at ssthresh. A timeout happens in the round where cwnd $= 20$.

| Round | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| cwnd | 1 | 2 | 4 | 8 | 16 | 17 | 18 | 19 | 20 | 1 | 2 | 4 | 8 | 10 | 11 |

Timeout in round 9: ssthresh $= 10$, cwnd $= 1$. Slow start until 10 (8 doubles to 16, capped at 10), then linear.

### Worked example 4: Triple duplicate ACKs in Reno

cwnd $= 24$ MSS in congestion avoidance when three duplicate ACKs arrive. Reno sets ssthresh $= 12$, resends the missing segment, and after fast recovery continues at cwnd $= 12$, growing by 1 per RTT: 12, 13, 14, .... Tahoe would instead set cwnd to 1 and slow start up to 12.

### Worked example 5: RTO calculation

EstRTT $= 80$ ms, DevRTT $= 10$ ms. A sample of 120 ms arrives.

DevRTT $= 0.75 \times 10 + 0.25 \times |120 - 80| = 7.5 + 10 = 17.5$ ms (using the old EstRTT, as the RFC does).

EstRTT $= 0.875 \times 80 + 0.125 \times 120 = 85$ ms.

RTO $= 85 + 4 \times 17.5 = 155$ ms.

## Common traps

- Forgetting that SYN and FIN consume one sequence number each.
- Treating the ACK number as "last byte received". It is the next byte expected.
- Doubling past ssthresh when the question says to cap, or capping when it says not to.
- Halving ssthresh from the old ssthresh instead of from the current cwnd.
- Using the same reaction for timeout and triple duplicate ACKs in Reno.
- Ignoring rwnd: the sender's window is $\min(\text{cwnd}, \text{rwnd})$.
- Counting rounds off by one. Decide whether round 1 is cwnd $= 1$ and stick to it.
- Mixing the server and client socket sequences: only the server calls listen and accept.

## Quick revision

- Header 20 to 60 bytes; 32-bit seq and ack; 16-bit window; checksum over pseudo-header + segment.
- Handshake: SYN ($x$), SYN+ACK ($y$, ack $x+1$), ACK ($y+1$). First data byte $x + 1$.
- Close: FIN and ACK per direction; TIME_WAIT lasts 2 MSL.
- Flow control: window $= \min(\text{cwnd}, \text{rwnd})$; throughput $\le W/\text{RTT}$.
- Slow start doubles per RTT; congestion avoidance adds 1 MSS per RTT.
- Timeout: ssthresh $=$ cwnd/2, cwnd $= 1$.
- Reno on 3 dup ACKs: ssthresh $=$ cwnd/2, cwnd $\approx$ ssthresh, fast recovery.
- EstRTT with $\alpha = 1/8$, DevRTT with $\beta = 1/4$, RTO $=$ EstRTT $+ 4$DevRTT; double RTO on timeout.
- Server: socket, bind, listen, accept. Client: socket, connect.
