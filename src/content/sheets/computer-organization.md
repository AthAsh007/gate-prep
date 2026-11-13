---
title: "Computer Organization and Architecture formula sheet"
summary: "Addressing modes, ALU and control formulas, cache and AMAT equations, I/O overhead and pipeline timing on one page for last-minute revision."
---

## Instruction set and addressing modes

| Mode | Effective address / operand | Data memory accesses for operand | Typical use |
|---|---|---|---|
| Immediate | operand $= A$ | 0 | constants |
| Register | operand $= R$ | 0 | temporaries |
| Direct (absolute) | $EA = A$ | 1 | globals |
| Memory indirect | $EA = M[A]$ | 2 | pointers in memory |
| Register indirect | $EA = R$ | 1 | `*p` |
| Base + displacement | $EA = R + A$ | 1 | locals (frame pointer), struct fields |
| Indexed | $EA = A + R_{idx}$ (times scale) | 1 | arrays |
| PC-relative | $EA = PC_{next} + \text{offset}$ | 1 | branches, position-independent code |
| Auto-increment $(R)+$ | $EA = R$, then $R \mathrel{+}= s$ | 1 | step through array, pop |
| Auto-decrement $-(R)$ | $R \mathrel{-}= s$, then $EA = R$ | 1 | push |

- Field width for $N$ choices: $\lceil \log_2 N \rceil$ bits. Address field $=$ instruction length minus all other fields.
- Signed $n$-bit immediate or offset: $-2^{n-1}$ to $2^{n-1} - 1$. Unsigned: $0$ to $2^n - 1$.
- Branch target: $PC_{next} + \text{offset} \times \text{(instruction size, if offset counts instructions)}$. Read whether PC is already incremented.
- Expanding opcode: $k$-bit primary opcode, $X$ instructions used at that level, $a$-bit field given up: next level has at most $(2^k - X) \cdot 2^a$ instructions. Work level by level; to fit a lower level you may need to reserve whole patterns.
- Little-endian: least significant byte at the lowest address.

- $Z = A + B$: 3-address ADD Z, A, B; 2-address MOV Z, A; ADD Z, B; accumulator LOAD A; ADD B; STORE Z; stack PUSH A; PUSH B; ADD; POP Z. Stack binary ops pop $y$, then $x$, push $x$ op $y$.

## ALU and control unit design

| Item | Formula |
|---|---|
| $n$-bit two's complement range | $-2^{n-1}$ to $2^{n-1} - 1$ |
| Overflow (signed add) | $V = c_n \oplus c_{n-1}$; same-sign operands give a different-sign result |
| Carry flag (unsigned) | carry out of the top bit |
| Negate | invert all bits, add 1 |
| Sign extension | copy the sign bit into new high bits (value unchanged) |
| Arithmetic shift right by 1 | floor division by 2, sign bit kept |
| Product width | $n \times n$ bits gives $2n$ bits |

Adders:
- Ripple carry, carry delay $t_c$ per full adder, sum delay $t_s$: $c_n$ at $n t_c$, top sum at $(n-1) t_c + t_s$. Delay is $O(n)$.
- Carry lookahead: $G_i = A_i B_i$, $P_i = A_i \oplus B_i$, $C_{i+1} = G_i + P_i C_i$.
- $C_2 = G_1 + P_1 G_0 + P_1 P_0 C_0$; $C_3 = G_2 + P_2 G_1 + P_2 P_1 G_0 + P_2 P_1 P_0 C_0$.
- Single-level CLA: $P, G$ in 1 gate delay, carries 2 more, sums 1 more. Fan-in grows with $n$.
- CLA blocks in ripple: first block carry at $t_{PG} + t_{blk}$, then $+t_{blk}$ per block.
- Carry select: upper blocks compute both carry-in cases; a mux chain picks. About one block ripple plus one mux per later block.

Booth (radix 2), pair $(q_i, q_{i-1})$ with $q_{-1} = 0$: 00 or 11 shift only; 01 add multiplicand; 10 subtract multiplicand. Alternating bits are the worst case.

Control units:

| | Hardwired | Microprogrammed |
|---|---|---|
| Speed | faster | slower (control memory read per step) |
| Change | redesign logic | rewrite control memory |
| Typical ISA | RISC | CISC |
| Sequencing | $\lceil \log_2 T \rceil$-bit step counter + decoder | microprogram counter + opcode mapping |

Microinstruction width, $S$ control signals:
- Horizontal: $S$ bits for control, many signals in parallel.
- Fully vertical (one signal at a time, plus a "none" code): $\lceil \log_2 (S + 1) \rceil$ bits; needs a decoder.
- Grouped encoding with mutually exclusive groups $g_1, \ldots, g_m$: $\sum_i \lceil \log_2 (g_i + 1) \rceil$ bits.
- Next-address field: $\lceil \log_2 W \rceil$ bits for $W$ control words. Condition select: $\lceil \log_2 (\text{conditions}) \rceil$ bits.
- Control memory size $= W \times$ word width.

## Memory hierarchy and cache

Address split for capacity $C$, block $B$, associativity $k$, address width $n$:

| Field | Bits |
|---|---|
| Offset | $\log_2 B$ |
| Sets | $S = C / (B k)$ |
| Index | $\log_2 S$ (0 if fully associative) |
| Tag | $n - \text{index} - \text{offset}$ |

- Tag store $=$ lines $\times$ (tag + valid + dirty + replacement bits). Lines $= C / B$.
- A $k$-way cache needs $k$ tag comparators and a $k$-to-1 mux. Exact LRU per set: $\lceil \log_2 k! \rceil$ bits.
- VIPT without aliasing: $C / k \le$ page size.
- Chips needed $= \dfrac{\text{total words}}{\text{chip words}} \times \dfrac{\text{word width}}{\text{chip width}}$.

Average access time:

| Organisation | One level | Two levels |
|---|---|---|
| Hierarchical (miss pays every level visited) | $t_c + (1 - h) t_m$ | $t_1 + m_1 (t_2 + m_2 t_m)$ |
| Simultaneous (served by the first level that has it) | $h t_c + (1 - h) t_m$ | $h_1 t_1 + m_1 h_2 t_2 + m_1 m_2 t_m$ |

- $m_2$ above is the local L2 miss rate. Global L2 miss rate $= m_1 m_2$, so hierarchical $T = t_1 + m_1 t_2 + m_{global} t_m$.
- Given a "miss penalty": $T = t_{hit} + m \times \text{penalty}$.
- Block of $w$ words, bus cycles (1 for address, 1 per word): non-interleaved $1 + w\, t_{acc} + w$; $w$-way interleaved $1 + t_{acc} + w$.
- TLB plus physical cache: $T = t_{TLB} + m_{TLB} \cdot L \cdot t_m + t_c + m_c t_m$ for an $L$-level page table walk with uncached entries.

Write policies:

| Policy | Bus traffic per reference |
|---|---|
| Write-through, no-write-allocate ($w$ bytes per write) | $f_r m_r B + f_w w$ |
| Write-back, write-allocate | $m B (1 + p_{dirty})$ |

- Usual pairs: write-through with no-write-allocate and a write buffer; write-back with write-allocate.
- Write-back read miss with dirty victim: two block transfers.

Misses (3C): compulsory depends only on distinct blocks touched; capacity on size; conflict is the extra over fully associative, cut by associativity. Larger blocks first cut misses, then raise misses and penalty.

Array loops, row-major $A[R][C]$, element size $s$, address $= base + (iC + j)s$:
- Row-wise read, cold cache: misses $= R C s / B$.
- Column-wise: if every block touched by one column stays resident until the next column, misses $= R C s / B$; if each column pass evicts its own blocks, every access misses ($R C$). Otherwise simulate.
- Two arrays exactly a multiple of the cache size apart thrash a direct-mapped cache; 2-way fixes it.

Inclusion: inclusive means every L1 block is also in L2 (L2 eviction invalidates L1); exclusive holds L1 + L2 distinct data. A victim cache keeps recent L1 evictions.

## I/O interface: interrupts and DMA

| Quantity | Formula |
|---|---|
| Polling CPU fraction | polls per second $\times$ cycles per poll $/$ clock rate |
| Interrupt CPU fraction | $\dfrac{\text{rate}}{\text{bytes per interrupt}} \times$ cycles per interrupt $/$ clock |
| DMA CPU fraction | $\dfrac{\text{rate}}{\text{block size}} \times$ setup and completion cycles $/$ clock |
| Burst DMA, CPU off the bus | $(\text{block} / \text{bus width}) \times$ bus cycle |
| Cycle stealing, fraction of bus cycles | $\dfrac{\text{rate}}{\text{bytes per cycle}} \times$ bus cycle time |
| Max rate under a CPU budget $f$ | $f \times$ clock $/$ cycles per interrupt $\times$ bytes per interrupt |
| Serial line characters per second | bits per second $/$ bits per character |

- Programmed I/O: CPU busy-waits and moves every word. Interrupt-driven: CPU moves every word inside the ISR. DMA: CPU only sets up and handles the completion interrupt.
- Interrupts are recognised at the end of an instruction; PC and status are saved first.
- Interrupt latency for a lower-priority device (non-nested) $=$ rest of current instruction $+$ every higher ISR (entry + body + return) $+$ its own entry.
- Priority: daisy chain by position (nearest the CPU wins); software polling by polling order; vectored interrupts give the ISR address directly.
- DMA modes: burst (CPU locked out for the block), cycle stealing (one word per stolen cycle), transparent (idle bus cycles only, CPU never slowed). Bus request and grant first; interrupt at block end.
- Memory-mapped I/O uses ordinary load and store; isolated I/O uses IN/OUT and a separate address space.

## Instruction pipelining and hazards

| Quantity | Formula |
|---|---|
| Clock period | $t_p = \max_i \tau_i + d$ (latch delay $d$) |
| Non-pipelined time per instruction | $t_n = \sum_i \tau_i$ |
| $n$ instructions, $k$ stages, no stalls | $(k + n - 1)\, t_p$ |
| With stalls | $(k + n - 1 + \text{stall cycles})\, t_p$ |
| Speedup | $\dfrac{n\, t_n}{(k + n - 1)\, t_p} \to \dfrac{t_n}{t_p}$ ($= k$ if balanced, no overhead) |
| Efficiency | speedup $/ k$ |
| CPI with stalls | $1 + \sum (\text{frequency} \times \text{stall cycles})$ |
| Speedup with stalls (balanced) | depth $/ (1 + \text{stalls per instruction})$ |
| Stages needed for clock $\le T$ | smallest $k$ with $\tau / k + d \le T$ |

Branches:
- Resolved at the end of stage $s$: penalty $s - 1$ cycles if the guess is wrong.
- Predict not-taken: CPI $= 1 + f_b \cdot p_{taken} \cdot P$.
- Dynamic predictor with accuracy $a$: CPI $= 1 + f_b (1 - a) P$ (plus any cost on correct taken predictions if stated).
- Delay slot instruction always executes. Earlier resolution, BTB and filled delay slots cut the penalty; deeper front ends raise it.

Data hazards in the classic 5-stage pipeline (IF, ID, EX, MEM, WB):

| Producer to next instruction | No forwarding, split-cycle register file | No forwarding, no split | Full forwarding |
|---|---|---|---|
| ALU to ALU | 2 stalls | 3 stalls | 0 |
| Load to use | 2 stalls | 3 stalls | 1 stall |
| Producer two instructions back | 1 stall | 2 stalls | 0 (from MEM/WB) |

- Only RAW hazards occur in an in-order 5-stage pipeline. WAR and WAW appear with out-of-order or multi-cycle units; register renaming removes both.
- Structural hazard: shared resource in the same cycle, such as one memory port for IF and MEM (1 stall per load or store), or a non-pipelined multi-cycle unit (next user waits until it frees).
- Unequal stages: the slowest stage sets the clock. Splitting it helps only until another stage becomes the slowest.
- Deeper is not always better: $t_p > d$ always, and hazard penalties grow with depth.
- "Speedup for large $n$" with stalls: $t_n / (\text{CPI} \cdot t_p)$.
