---
title: "Data link layer"
summary: "Covers framing, parity, Hamming distance, CRC and checksums, sliding window protocols, ALOHA, CSMA/CD and the Ethernet frame."
order: 2
sources:
  - title: "Cyclic redundancy check (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Cyclic_redundancy_check"
  - title: "Sliding window protocol (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Sliding_window_protocol"
  - title: "Carrier-sense multiple access with collision detection (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Carrier-sense_multiple_access_with_collision_detection"
  - title: "Ethernet frame (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Ethernet_frame"
---

## What the data link layer does

The data link layer moves frames between two directly connected nodes. Its jobs are framing (marking where a frame starts and ends), addressing on the local link (MAC addresses), error detection, sometimes reliable delivery and flow control (sliding window protocols), and medium access control when many stations share one channel.

### Framing

- **Byte count**: a header field gives the frame length. One corrupted count breaks synchronisation for all later frames.
- **Byte stuffing**: a flag byte marks frame boundaries; a flag or escape byte inside the data is preceded by an escape byte.
- **Bit stuffing** (HDLC): the flag is 01111110. The sender inserts a 0 after every five consecutive 1s in the data, so six 1s in a row can only be a flag. The receiver deletes any 0 that follows five 1s.

## Error detection and correction

### Parity

A single parity bit makes the count of 1s even (or odd). It detects every error that flips an odd number of bits and misses every error that flips an even number.

Two-dimensional parity arranges data in a grid with a parity bit for every row and column. It detects all 1, 2 and 3-bit errors, can correct any single-bit error (the failing row and column intersect at it), but misses some 4-bit errors (the four corners of a rectangle).

### Hamming distance

The Hamming distance between two codewords is the number of bit positions in which they differ. For a code with minimum distance $d_{min}$:

| Goal | Condition |
|---|---|
| Detect up to $s$ errors | $d_{min} \ge s + 1$ |
| Correct up to $t$ errors | $d_{min} \ge 2t + 1$ |
| Correct $t$ and detect $s > t$ together | $d_{min} \ge t + s + 1$ |

For a single-error-correcting Hamming code with $m$ data bits, the number of check bits $r$ is the smallest value with $2^r \ge m + r + 1$. Check bits sit at positions $1, 2, 4, 8, \ldots$; check bit at position $2^i$ covers every position whose binary index has bit $i$ set. The syndrome (the failing check positions added up) gives the position of the flipped bit.

### Cyclic redundancy check

Treat the bit string as a polynomial over GF(2). With a generator $G(x)$ of degree $r$:

1. Append $r$ zeros to the data.
2. Divide by the generator using XOR (no carries, no borrows).
3. The $r$-bit remainder is the CRC. Send data followed by the CRC.
4. The receiver divides the whole frame by $G(x)$; a nonzero remainder means an error.

What a CRC detects:

- All single-bit errors, if $G(x)$ has at least two terms.
- All double-bit errors, if $G(x)$ does not divide $x^k + 1$ for any $k$ up to the frame length.
- All errors with an odd number of bits, if $(x + 1)$ is a factor of $G(x)$.
- All burst errors of length $\le r$, if the $x^0$ term of $G(x)$ is 1.

### Internet checksum

Used by IP (header only), UDP and TCP. Add the data as 16-bit words in one's complement arithmetic: any carry out of bit 15 is added back to the low end. The checksum is the bitwise complement of that sum. The receiver adds all words including the checksum; the result must be 0xFFFF. It is cheap to compute but weaker than CRC (for example, it cannot detect reordered words).

## Flow and error control: sliding window protocols

Let $T_t$ be frame transmission time and $T_p$ one-way propagation delay. Define $a = T_p / T_t$.

### Stop-and-wait

Send one frame and wait for its ACK. Ignoring ACK size and processing:

$$\eta = \frac{T_t}{T_t + 2T_p} = \frac{1}{1 + 2a}$$

A 1-bit sequence number is enough to tell a new frame from a duplicate.

### Go-Back-N

The sender may have up to $W$ frames outstanding. The receiver accepts only the next in-order frame and discards everything else. On timeout the sender resends the lost frame and every frame after it. With $k$-bit sequence numbers, $W \le 2^k - 1$.

### Selective Repeat

The receiver buffers out-of-order frames, and the sender resends only frames that are lost. To avoid confusing old and new frames, sender window plus receiver window must not exceed $2^k$. With equal windows, $W \le 2^{k-1}$.

### Efficiency with a window

$$\eta = \min\left(1, \frac{W T_t}{T_t + 2T_p}\right) = \min\left(1, \frac{W}{1 + 2a}\right)$$

The window that keeps the link fully busy is $W = 1 + 2a$. The sequence number bits needed are then $\lceil \log_2(W + 1) \rceil$ for Go-Back-N and $\lceil \log_2(2W) \rceil$ for Selective Repeat.

| Protocol | Sender window | Receiver window | Retransmits | Sequence rule |
|---|---|---|---|---|
| Stop-and-wait | 1 | 1 | The one frame | $k = 1$ |
| Go-Back-N | $\le 2^k - 1$ | 1 | Lost frame and all after it | $W \le 2^k - 1$ |
| Selective Repeat | $\le 2^{k-1}$ | Same as sender | Only lost frames | $W_s + W_r \le 2^k$ |

## Medium access control

### ALOHA

In pure ALOHA a station sends whenever it has a frame. A frame is safe only if no other frame starts within one frame time before or after it, so the vulnerable period is $2T_t$. With $G$ the average number of attempts per frame time:

$$S_{pure} = G e^{-2G}, \quad \max S = \frac{1}{2e} \approx 0.184 \text{ at } G = 0.5$$

Slotted ALOHA forces transmissions to start at slot boundaries, cutting the vulnerable period to one slot:

$$S_{slotted} = G e^{-G}, \quad \max S = \frac{1}{e} \approx 0.368 \text{ at } G = 1$$

With $N$ stations each sending in a slot with probability $p$, the probability that a slot succeeds is $Np(1-p)^{N-1}$, maximised at $p = 1/N$.

### CSMA and CSMA/CD

Carrier sense means listening before sending. Collisions still happen because a signal takes $T_p$ to reach other stations. With collision detection, a station must still be transmitting when the collision news comes back, which in the worst case takes $2T_p$. So

$$T_t \ge 2T_p \quad\Rightarrow\quad L_{min} = 2 T_p R$$

After a collision, classic Ethernet uses binary exponential backoff. After the $n$-th collision, a station picks $K$ uniformly from $\{0, 1, \ldots, 2^{\min(n,10)} - 1\}$ and waits $K \times 512$ bit times (51.2 microseconds at 10 Mbps). It gives up after 16 attempts.

A commonly used efficiency formula for CSMA/CD is $\eta = 1/(1 + 6.44a)$, where $a = T_p / T_t$.

### Ethernet frame

| Field | Size (bytes) |
|---|---|
| Preamble + start frame delimiter | 7 + 1 |
| Destination MAC | 6 |
| Source MAC | 6 |
| Type or length | 2 |
| Data | 46 to 1500 |
| CRC (frame check sequence) | 4 |

The frame size counted from destination address to CRC ranges from 64 to 1518 bytes. The 64-byte minimum comes from the CSMA/CD rule for a 10 Mbps network with the standard maximum span. Short payloads are padded up to 46 bytes. A MAC address is 48 bits; all 1s is broadcast, and the least significant bit of the first byte set to 1 marks a group (multicast) address.

## Worked examples

### Worked example 1: CRC remainder

Data 110101, generator $x^3 + x^2 + 1$ (1101).

Append three zeros: 110101000. Divide by XOR, always lining the generator up under the leftmost remaining 1:

- Positions 0 to 3: 1101 XOR 1101 = 0000. The string becomes 000001000.
- The next 1 is at position 5. Positions 5 to 8 hold 1000; 1000 XOR 1101 = 0101. The string becomes 000000101.
- Fewer than 4 bits remain after the leading zeros, so stop. The remainder is the last 3 bits: 101.

So the frame sent is 110101101. Dividing 110101101 by 1101 gives remainder 000, which the receiver accepts.

### Worked example 2: Stop-and-wait versus a window

A 1 Mbps link, one-way delay 20 ms, frames of 1000 bits.

$T_t = 1$ ms, $a = 20$. Stop-and-wait: $\eta = 1/41 \approx 2.4$ percent.

To reach 100 percent, $W = 1 + 2a = 41$. Go-Back-N needs $\lceil \log_2 42 \rceil = 6$ bits. Selective Repeat needs $\lceil \log_2 82 \rceil = 7$ bits.

### Worked example 3: Throughput with a fixed window

Go-Back-N with $W = 5$, $T_t = 2$ ms, $T_p = 9$ ms, no errors.

Cycle $= T_t + 2T_p = 20$ ms. The window needs $5 \times 2 = 10$ ms, less than the cycle, so $\eta = 10/20 = 50$ percent. On a 4 Mbps link that is 2 Mbps of useful throughput.

### Worked example 4: Minimum Ethernet-style frame

A 100 Mbps CSMA/CD network spans 1 km with signal speed $2 \times 10^8$ m/s.

$T_p = 5\ \mu$s, so $L_{min} = 2 \times 5 \times 10^{-6} \times 10^8 = 1000$ bits $= 125$ bytes.

If the rate goes up 10 times with the same cable, the minimum frame also goes up 10 times. If the minimum frame is fixed, the maximum cable length must shrink 10 times.

### Worked example 5: Internet checksum

Words: 0x4500, 0xFF10, 0x0203.

0x4500 + 0xFF10 = 0x14410. Fold: 0x4410 + 0x1 = 0x4411. Add 0x0203: 0x4614. Checksum $= $ 0xFFFF $-$ 0x4614 $=$ 0xB9EB.

## Common traps

- Forgetting to append $r$ zeros before CRC division, or appending the wrong number (the degree, not the number of generator bits).
- Using $d_{min} \ge 2t$ for correction. It is $2t + 1$.
- Using $2^k$ as the Go-Back-N window. It is $2^k - 1$; Selective Repeat is $2^{k-1}$.
- Using RTT when the formula already has $2T_p$, which counts the round trip twice.
- Forgetting that efficiency is capped at 1 when the window is larger than $1 + 2a$.
- Pure ALOHA vulnerable time is two frame times, not one.
- Mixing the 46-byte minimum payload with the 64-byte minimum frame.
- Counting preamble in the frame size unless the question says so.
- Assuming 2D parity catches everything up to 4 errors.

## Quick revision

- Bit stuffing: insert 0 after five 1s; flag is 01111110.
- Detect $s$: $d_{min} \ge s + 1$. Correct $t$: $d_{min} \ge 2t + 1$.
- Hamming check bits: smallest $r$ with $2^r \ge m + r + 1$.
- CRC: append $r$ zeros, XOR divide, remainder is the CRC. $(x+1)$ factor catches all odd errors; bursts $\le r$ always caught.
- Internet checksum: one's complement sum with end-around carry, then complement.
- Stop-and-wait $\eta = 1/(1 + 2a)$; windowed $\eta = \min(1, W/(1 + 2a))$.
- GBN $W \le 2^k - 1$; SR $W \le 2^{k-1}$.
- Pure ALOHA $1/(2e) \approx 18.4$ percent; slotted $1/e \approx 36.8$ percent.
- CSMA/CD: $L_{min} = 2T_pR$.
- Ethernet: 64 to 1518 bytes, payload 46 to 1500, 48-bit MAC, 4-byte CRC.
