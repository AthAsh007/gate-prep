---
title: "ALU and control unit design"
summary: "Adder delays, carry lookahead, overflow, Booth multiplication, and how hardwired and microprogrammed control units are built and sized."
order: 2
sources:
  - title: "Carry-lookahead adder (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Carry-lookahead_adder"
  - title: "Booth's multiplication algorithm (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Booth%27s_multiplication_algorithm"
  - title: "Microcode (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Microcode"
  - title: "GATE Overflow: microprogramming tag"
    url: "https://gateoverflow.in/tag/microprogramming"
---

## The datapath and the control unit

A processor is split into two parts. The **datapath** holds the registers, the ALU, the buses and the multiplexers that move data. The **control unit** decides, cycle by cycle, which control signals are active: which register drives the bus, which register loads, which ALU operation runs, whether memory reads or writes. GATE asks about both halves: adder timing and arithmetic algorithms on the ALU side, and control word sizes and the hardwired versus microprogrammed trade-off on the control side.

## ALU design

An ALU combines an adder with logic units (AND, OR, XOR, NOT) and a multiplexer that selects the result. Subtraction reuses the adder: $A - B = A + \overline{B} + 1$, done by inverting $B$ and setting the carry-in to 1. Status flags are produced alongside the result: zero (all result bits 0), sign (top bit), carry (carry out of the top bit) and overflow.

### Ripple-carry adder

An $n$-bit ripple-carry adder chains $n$ full adders. A full adder computes

$$S_i = A_i \oplus B_i \oplus C_i, \qquad C_{i+1} = A_i B_i + C_i (A_i \oplus B_i).$$

The carry has to pass through every stage, so delay grows linearly. If each stage produces its carry $t_c$ after its carry-in is ready and its sum $t_s$ after the carry-in is ready, and all operand bits are ready at time 0:

- carry into stage $i$ is ready at $i \cdot t_c$,
- the last sum bit $S_{n-1}$ is ready at $(n-1) t_c + t_s$,
- the final carry out $C_n$ is ready at $n \cdot t_c$.

The worst-case add time is the larger of the last two. Read the question carefully for whether it asks for the carry, the sum, or both.

### Carry-lookahead adder

Define for each bit

$$G_i = A_i B_i \quad (\text{generate}), \qquad P_i = A_i \oplus B_i \quad (\text{propagate}).$$

Then $C_{i+1} = G_i + P_i C_i$. Expanding removes the chain:

$$C_1 = G_0 + P_0 C_0$$
$$C_2 = G_1 + P_1 G_0 + P_1 P_0 C_0$$
$$C_3 = G_2 + P_2 G_1 + P_2 P_1 G_0 + P_2 P_1 P_0 C_0$$
$$C_4 = G_3 + P_3 G_2 + P_3 P_2 G_1 + P_3 P_2 P_1 G_0 + P_3 P_2 P_1 P_0 C_0$$

Every carry is now a two-level AND-OR expression. With one gate delay for $G$ and $P$, every carry of a 4-bit block is ready after 3 gate delays, and every sum (one more XOR) after 4, independent of bit position. The cost is fan-in: $C_4$ needs a 5-input OR and a 5-input AND. That is why wide adders are built from 4-bit lookahead blocks, either rippled between blocks or with a second lookahead level using block generate and propagate signals.

### Overflow in two's complement

Adding two $n$-bit two's complement numbers overflows when the true sum does not fit in $n$ bits. Equivalent tests:

- the operands have the same sign and the result has the other sign,
- $c_n \oplus c_{n-1} = 1$, where $c_{n-1}$ is the carry into the sign bit and $c_n$ the carry out.

A carry out of the sign bit alone is not overflow. Adding $-1$ and $+1$ produces a carry out and the correct result 0.

### Booth's multiplication

Booth's algorithm multiplies two's complement numbers. Append $q_{-1} = 0$ to the right of the multiplier and scan pairs $(q_i, q_{i-1})$ from $i = 0$ upward:

| $(q_i, q_{i-1})$ | Action before the arithmetic shift right |
|---|---|
| 00 | none |
| 11 | none |
| 10 | subtract multiplicand |
| 01 | add multiplicand |

A run of 1s in the multiplier becomes one subtraction at its low end and one addition just past its high end, because $2^{j} + \dots + 2^{i} = 2^{j+1} - 2^{i}$. Long runs of 1s save work. The worst case is an alternating pattern like `0101...`, where every pair triggers an operation.

## Control unit design

The control unit produces a sequence of control words. Each instruction is broken into micro-operations such as $MAR \leftarrow PC$, $MDR \leftarrow M[MAR]$, $IR \leftarrow MDR$, $PC \leftarrow PC + 1$. Each step (T-state) activates a set of control signals.

### Hardwired control

The control signals are produced by combinational logic whose inputs are the decoded opcode, a step counter (often a ring counter or a counter plus decoder giving $T_0, T_1, \dots$) and the status flags. Each signal is a logic expression such as $\text{PC}_{out} = T_0 + T_3 \cdot \text{BRANCH} \cdot Z$.

- Fast: signals appear after a few gate delays.
- Hard to change: adding an instruction means redesigning logic.
- Preferred in RISC processors with simple, regular instructions.

### Microprogrammed control

Each control word is stored in a **control memory** (control store, usually ROM). A **control address register** (CAR, also called micro-PC) points to the current microinstruction. Executing a machine instruction means running a short microprogram: the opcode is mapped to the starting address of its routine, and the sequencer steps through it, branching on conditions.

A microinstruction typically has:

- **control field(s)**: which signals to assert,
- **condition select field**: which status bit to test for branching (one code is usually "always true"),
- **next address field**: where to go if the condition holds (otherwise CAR increments).

Width formula:

$$W = \text{control bits} + \lceil \log_2(\text{number of conditions}) \rceil + \lceil \log_2(\text{control memory words}) \rceil.$$

Control memory size $= \text{words} \times W$.

### Horizontal versus vertical microinstructions

| | Horizontal | Vertical |
|---|---|---|
| Encoding | one bit per control signal | signals grouped and binary encoded |
| Width | wide | narrow |
| Parallelism | any combination of signals at once | only one signal per group at once |
| Decoders needed | no | yes, one per field |
| Speed | faster (no decode) | slightly slower |

For a group of $g$ mutually exclusive signals, an encoded field needs $\lceil \log_2(g + 1) \rceil$ bits if one code must mean "none of these", or $\lceil \log_2 g \rceil$ if the group always asserts exactly one signal. GATE questions state which; when they say "mutually exclusive" without more, the safe assumption is the $+1$ for a no-operation code, but read the wording.

### Comparison

| | Hardwired | Microprogrammed |
|---|---|---|
| Speed | faster | slower (control memory read per step) |
| Flexibility | low | high, change the microprogram |
| Design effort for complex ISA | high | moderate |
| Typical use | RISC | CISC, many addressing modes |

## Worked examples

### Worked example 1: ripple versus lookahead timing

A 32-bit adder. Option R: ripple-carry, where each full adder makes its carry 2 gate delays after its inputs. Option L: eight 4-bit carry-lookahead blocks with the block carries rippling from block to block. In each block, $G_i$ and $P_i$ take 1 gate delay and the block carry out is ready 2 gate delays after both its $G$, $P$ signals and its carry-in are ready. When is the final carry out ready?

- R: $32 \times 2 = 64$ gate delays.
- L: block 1 carry out at $\max(1, 0) + 2 = 3$. Block $k$ carry out at $\max(1, \text{previous}) + 2$, so each further block adds 2. Block 8: $3 + 7 \times 2 = 17$ gate delays.

The lookahead version is almost 4 times faster for the carry chain, at the cost of more gates.

### Worked example 2: detecting overflow

4-bit two's complement.

- $6 + 5$: $0110 + 0101 = 1011$. Carry into bit 3 is 1, carry out is 0. They differ, so overflow. Indeed $11 > 7$.
- $-6 + (-5)$: $1010 + 1011 = 1\,0101$. Carry into bit 3 is 0, carry out is 1. Overflow, since $-11 < -8$. The 4-bit result $0101 = 5$ is wrong.
- $-6 + 5$: $1010 + 0101 = 1111 = -1$. Carry in and out are both 0. No overflow.

### Worked example 3: Booth worst case

How many add or subtract operations does Booth's algorithm perform for the 8-bit multiplier `01010101`?

Append $q_{-1} = 0$. Pairs from the right: $(1,0)$ subtract, $(0,1)$ add, $(1,0)$ subtract, $(0,1)$ add, $(1,0)$ subtract, $(0,1)$ add, $(1,0)$ subtract, $(0,1)$ add. Eight operations, 4 additions and 4 subtractions. Plain shift-and-add would need only 4 additions (one per 1 bit), so Booth is worse here. Booth helps for long runs of 1s, such as `01111110`, which needs only 2 operations.

### Worked example 4: sizing a microprogrammed control unit

A control unit generates 52 control signals. 20 of them are independent and get one bit each. The other 32 fall into three mutually exclusive groups of 12, 6 and 14 signals, each encoded with a "none" code. The sequencer can test 6 status flags plus an always-true condition, encoded. The control memory has 512 words. Find the microinstruction width and control memory size.

- Independent signals: 20 bits.
- Group of 12: $\lceil \log_2 13 \rceil = 4$. Group of 6: $\lceil \log_2 7 \rceil = 3$. Group of 14: $\lceil \log_2 15 \rceil = 4$. Total 11 bits.
- Condition select: 7 options, $\lceil \log_2 7 \rceil = 3$ bits.
- Next address: $\log_2 512 = 9$ bits.

$W = 20 + 11 + 3 + 9 = 43$ bits. Control memory $= 512 \times 43 = 22016$ bits. A fully horizontal design would use $52 + 3 + 9 = 64$ bits per word.

## Common traps

- **Sum versus carry delay.** In ripple adders the last sum bit can be later than the final carry. Compute both.
- **Carry out is not overflow** for signed addition. Use $c_n \oplus c_{n-1}$.
- **Booth pairs start at $(q_0, q_{-1})$** with $q_{-1} = 0$. Starting from the left end gives wrong counts.
- **The "none" code.** A group of 8 signals fits in 3 bits only if one of the 8 is active in every microinstruction. If the field also needs an idle code, there are 9 codes and it needs 4 bits.
- **Control memory words.** If a microprogram has 230 microinstructions, the address field is $\lceil \log_2 230 \rceil = 8$ bits, not 7.
- **Horizontal is wider, vertical is narrower.** Vertical needs decoders; horizontal allows more parallel signals.

## Quick revision

- $S = A \oplus B \oplus C$, $C_{out} = AB + C(A \oplus B)$.
- Ripple carry: carry into bit $i$ at $i \cdot t_c$; last sum at $(n-1)t_c + t_s$.
- CLA: $G_i = A_i B_i$, $P_i = A_i \oplus B_i$, $C_{i+1} = G_i + P_i C_i$, every carry in two levels.
- Overflow (signed): $c_n \oplus c_{n-1}$, or same-sign operands giving an opposite-sign result.
- Booth: 10 subtract, 01 add, 00 and 11 nothing; best for runs of 1s, worst for alternating bits.
- Hardwired: fast, rigid, RISC. Microprogrammed: flexible, slower, CISC.
- Microinstruction width $=$ control bits $+$ condition select bits $+$ next address bits.
- Encoded group of $g$ signals with idle code: $\lceil \log_2(g+1) \rceil$ bits.
