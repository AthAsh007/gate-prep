---
title: "Combinational circuits"
summary: "Adders, carry lookahead, subtractors, comparators, multiplexers, decoders, encoders, code converters, NAND/NOR realizations and hazards, with timing and gate-count problems in GATE style."
order: 2
sources:
  - title: "Adder (electronics) (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Adder_(electronics)"
  - title: "Multiplexer (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Multiplexer"
  - title: "Carry-lookahead adder (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Carry-lookahead_adder"
  - title: "GATE Overflow: combinational circuit questions"
    url: "https://gateoverflow.in/tag/combinational-circuit"
---

## What a combinational circuit is

A combinational circuit has outputs that depend only on the current inputs. There is no memory and no feedback loop. Every such circuit is a set of Boolean functions, so the K-map tools from the previous topic apply directly. GATE questions here fall into four groups:

1. Identify the function a given circuit computes (multiplexer or decoder with gates around it).
2. Count components (how many 2-to-1 multiplexers, how many NAND gates).
3. Timing (delay of ripple-carry versus carry-lookahead adders).
4. Adder and subtractor behaviour, including flags.

## Adders

### Half adder and full adder

A half adder adds two bits: $S = A \oplus B$, $C = AB$.

A full adder adds $A$, $B$ and carry-in $C_{in}$:

$$S = A \oplus B \oplus C_{in}, \qquad C_{out} = AB + BC_{in} + AC_{in} = AB + C_{in}(A \oplus B)$$

$C_{out}$ is the majority function. The second form shows a full adder is two half adders plus an OR gate: the first half adder gives $A \oplus B$ and $AB$, the second adds $C_{in}$.

| $A$ | $B$ | $C_{in}$ | $S$ | $C_{out}$ |
|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 1 | 0 |
| 0 | 1 | 0 | 1 | 0 |
| 0 | 1 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 | 0 |
| 1 | 0 | 1 | 0 | 1 |
| 1 | 1 | 0 | 0 | 1 |
| 1 | 1 | 1 | 1 | 1 |

### Ripple-carry adder (RCA)

An $n$-bit RCA chains $n$ full adders; stage $i$ waits for the carry from stage $i-1$. If one stage produces its carry $t_c$ after its carry-in is ready and its sum $t_s$ after its carry-in is ready, then with all operands applied at time 0:

$$T_{RCA} = (n-1)\,t_c + \max(t_s, t_c)$$

The delay grows linearly with $n$. Be careful about whether the question wants the last sum bit, the final carry, or both.

### Carry-lookahead adder (CLA)

Define per bit a generate and a propagate signal:

$$G_i = A_iB_i, \qquad P_i = A_i \oplus B_i, \qquad C_{i+1} = G_i + P_iC_i$$

Expanding the recurrence removes the chain:

$$C_{i+1} = G_i + P_iG_{i-1} + P_iP_{i-1}G_{i-2} + \cdots + P_iP_{i-1}\cdots P_0C_0$$

With unlimited fan-in, every carry is a two-level AND-OR expression. The usual gate-delay count is: $G$ and $P$ in 1 delay, all carries 2 delays later, sums ($P_i \oplus C_i$) 1 delay after that, so 4 gate delays regardless of $n$. In practice fan-in is limited, so wide adders use 4-bit CLA blocks that either ripple carries between blocks or use a second level of lookahead.

$P_i$ is sometimes defined as $A_i + B_i$ instead of XOR. The carry equation still works with OR, but then the sum needs $A_i \oplus B_i$ separately.

### Subtraction

In 2's complement, $A - B = A + \overline{B} + 1$. An adder-subtractor feeds each $B_i$ through an XOR gate with a control $M$ and connects $M$ to $C_0$. $M = 0$ adds; $M = 1$ subtracts.

For unsigned subtraction with this circuit, final carry $C_n = 1$ means no borrow ($A \ge B$), and $C_n = 0$ means a borrow occurred. Signed overflow is $C_n \oplus C_{n-1}$.

## Comparators

A 1-bit equality test is XNOR. For $n$-bit numbers, $A = B$ when every $x_i = \overline{A_i \oplus B_i}$ is 1. For magnitude, scan from the MSB:

$$A > B = A_{n-1}\overline{B_{n-1}} + x_{n-1}A_{n-2}\overline{B_{n-2}} + x_{n-1}x_{n-2}A_{n-3}\overline{B_{n-3}} + \cdots$$

Counting fact: for two $n$-bit unsigned numbers, the number of input pairs with $A > B$ is $(4^n - 2^n)/2$.

## Multiplexers

A $2^k$-to-1 multiplexer (MUX) has $k$ select lines and outputs the data input whose index equals the select value. A 4-to-1 MUX with selects $S_1S_0$:

$$Y = \overline{S_1}\,\overline{S_0}I_0 + \overline{S_1}S_0I_1 + S_1\overline{S_0}I_2 + S_1S_0I_3$$

### Implementing functions with a MUX

- A $2^n$-to-1 MUX implements any $n$-variable function: put the variables on the selects and the truth-table column on the data inputs (0s and 1s).
- A $2^{n-1}$-to-1 MUX implements any $n$-variable function if the last variable and its complement are available: for each select value, the data input is one of $0$, $1$, $x$, $\overline{x}$.
- A single 2-to-1 MUX with constants can build NOT, AND and OR, so the 2-to-1 MUX is functionally complete. Without complemented inputs, it cannot build XOR in one unit.

### MUX trees

To build an $N$-to-1 MUX from $m$-to-1 MUXes, divide repeatedly: $\lceil N/m \rceil$ at the first level, then $\lceil \text{that}/m \rceil$, and so on down to 1. For 2-to-1 MUXes, an $N$-to-1 tree needs $N - 1$ units.

### Demultiplexers

A 1-to-$2^k$ demultiplexer sends one input to the output selected by $k$ lines. It is a decoder whose enable is the data input.

## Decoders and encoders

An $n$-to-$2^n$ decoder activates exactly one output: output $i$ is minterm $m_i$. Any function in sum-of-minterms form is a decoder plus an OR gate on the needed outputs (or a NOR or NAND on the others, for active-low parts).

Building larger decoders: a $k$-to-$2^k$ decoder with enables can be expanded into an $n$-to-$2^n$ decoder using a tree. For 6-to-64 from 3-to-8 units: one decoder takes the top 3 bits and enables one of 8 decoders that take the bottom 3 bits, total 9.

An encoder does the reverse: $2^n$ inputs, one of which is active, produce an $n$-bit index. A **priority encoder** handles several active inputs by reporting the highest-priority one and adds a valid bit $V$ that is 0 when no input is active.

## Code converters and parity

- Binary to Gray: $g_{n-1} = b_{n-1}$, $g_i = b_{i+1} \oplus b_i$. In one line, $G = B \oplus (B \gg 1)$.
- Gray to binary: $b_{n-1} = g_{n-1}$, $b_i = b_{i+1} \oplus g_i$. Each binary bit is the XOR of all Gray bits from the MSB down to that position.
- BCD to excess-3: add $0011$. Excess-3 is self-complementing: the 9's complement of a digit is its bitwise inverse.
- Parity of $n$ bits needs $n - 1$ two-input XOR gates (a chain or a tree; a tree has depth $\lceil \log_2 n \rceil$).

## NAND and NOR realizations

NAND and NOR are each universal. Useful minimum gate counts with two-input gates and only uncomplemented inputs:

| Function | Two-input NAND gates | Two-input NOR gates |
|---|---|---|
| NOT | 1 | 1 |
| AND | 2 | 3 |
| OR | 3 | 2 |
| XOR | 4 | 5 |
| XNOR | 5 | 4 |
| Half adder (sum and carry) | 5 | 5 |

A two-level AND-OR circuit becomes a two-level NAND-NAND circuit directly (same structure, every gate replaced by NAND). Likewise OR-AND becomes NOR-NOR.

## Hazards

A **static-1 hazard** is a momentary 0 on an output that should stay 1 when one input changes. In a K-map it shows up as two adjacent 1-cells that are covered by different product terms with no single term covering both. The fix is to add the consensus term that bridges the two groups. Static-0 hazards are the dual for POS circuits. Hazards matter for asynchronous circuits; synchronous designs sample after the outputs settle.

## Worked examples

### Worked example 1: Function from a 4-to-1 MUX

Implement $F(A,B,C) = \Sigma m(0,2,3,5)$ with a 4-to-1 MUX, using $A$ (MSB) and $B$ as selects.

**Solution.** For each $AB$, look at the two minterms that differ only in $C$.

| $AB$ | Minterms | $F$ for $C=0$, $C=1$ | Data input |
|---|---|---|---|
| 00 | 0, 1 | 1, 0 | $I_0 = \overline{C}$ |
| 01 | 2, 3 | 1, 1 | $I_1 = 1$ |
| 10 | 4, 5 | 0, 1 | $I_2 = C$ |
| 11 | 6, 7 | 0, 0 | $I_3 = 0$ |

So $I_0 = \overline{C}$, $I_1 = 1$, $I_2 = C$, $I_3 = 0$. Reverse problems (given the data inputs, find $F$) use the same table read backwards.

### Worked example 2: RCA delay

A 16-bit RCA uses full adders with carry delay 2 ns and sum delay 3 ns (each measured from carry-in valid). When are all outputs valid?

**Solution.** Carry into stage 15 is valid at $15 \times 2 = 30$ ns. Then $S_{15}$ is valid at 33 ns and $C_{16}$ at 32 ns. All outputs: 33 ns. Using the formula, $(16-1) \cdot 2 + \max(3, 2) = 33$.

### Worked example 3: Block CLA timing

A 32-bit adder uses eight 4-bit CLA blocks, with the carry rippling from block to block. Within a block, $G$ and $P$ take 1 gate delay, each carry takes 2 gate delays after the block's $G$, $P$ and carry-in are ready, and each sum takes 1 gate delay after its carry. Find the delay until all sums are valid.

**Solution.**

- All $G_i$, $P_i$ are ready at time 1.
- Block 0 carry-out ($C_4$): $1 + 2 = 3$.
- Each later block adds 2 to its carry-out: block $k$ produces its carry-out at $3 + 2k$.
- Block 7 receives $C_{28}$ from block 6 at $3 + 2 \cdot 6 = 15$.
- Block 7 internal carries $C_{29}, C_{30}, C_{31}$ (and $C_{32}$) are ready at $15 + 2 = 17$.
- Sums $S_{29}$ to $S_{31}$ are ready at $17 + 1 = 18$.

All sums are valid after 18 gate delays. A plain 32-bit RCA with 2 gate delays per carry would take about 64.

### Worked example 4: Half adder from NAND gates

What is the minimum number of two-input NAND gates for a half adder?

**Solution.** XOR needs 4 NAND gates: $G_1 = \overline{AB}$, $G_2 = \overline{AG_1}$, $G_3 = \overline{BG_1}$, $S = \overline{G_2G_3}$. The carry $AB$ is the complement of $G_1$, which one more NAND (used as an inverter) produces. Total 5. Sharing $G_1$ between the sum and the carry is what keeps it at 5 instead of 6.

### Worked example 5: Finding and fixing a hazard

$F = \overline{A}B + AC$. Find the hazard and fix it.

**Solution.** With $B = C = 1$, $F = \overline{A} + A = 1$. When $A$ changes, one term turns off and the other turns on; if the inverter producing $\overline{A}$ is slow, both terms can be 0 briefly, and $F$ glitches. The consensus term of $\overline{A}B$ and $AC$ is $BC$. The hazard-free form is $F = \overline{A}B + AC + BC$, which is logically the same function.

## Common traps

- Confusing which select line is the MSB. Swapping $S_1$ and $S_0$ permutes the data inputs.
- Counting MUX trees as $N/m + 1$ without recursing. For 64-to-1 from 4-to-1 the answer is $16 + 4 + 1 = 21$.
- Forgetting the last sum delay in RCA problems, or adding it to the final carry instead of taking the maximum.
- Using $C_n$ as signed overflow. Signed overflow is $C_n \oplus C_{n-1}$.
- Treating the carry-out of $A + \overline{B} + 1$ as a borrow. A carry of 1 means no borrow.
- Assuming a 2-to-1 MUX cannot implement NOT. With $I_0 = 1$ and $I_1 = 0$ it can.
- In decoder-based designs, using active-high logic on an active-low decoder.

## Quick revision

- Full adder: $S = A \oplus B \oplus C$, $C_{out} = AB + C(A \oplus B)$.
- RCA delay: $(n-1)t_c + \max(t_s, t_c)$. CLA: about 4 gate delays with unlimited fan-in.
- $C_{i+1} = G_i + P_iC_i$, $G_i = A_iB_i$, $P_i = A_i \oplus B_i$.
- Subtract with $A + \overline{B} + 1$; signed overflow $= C_n \oplus C_{n-1}$.
- $2^{n-1}$-to-1 MUX plus the last variable and its complement gives any $n$-variable function.
- $N$-to-1 from 2-to-1 MUXes: $N - 1$ units.
- Decoder output $i$ = minterm $m_i$; decoder plus OR gives any SOP.
- XOR: 4 NAND or 5 NOR. Half adder: 5 NAND.
- Gray: $G = B \oplus (B \gg 1)$. Parity of $n$ bits: $n - 1$ XOR gates.
- Static-1 hazard fix: add the consensus term.
