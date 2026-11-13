---
title: "Digital Logic formula sheet"
summary: "Laws, counts, circuit equations, timing rules and number formats for Digital Logic on one printable page."
---

## Boolean algebra and minimization

**Laws to apply on sight**

| Law | Form |
|---|---|
| Absorption | $A + AB = A$, $A(A + B) = A$ |
| Redundant literal | $A + \overline{A}B = A + B$, $A(\overline{A} + B) = AB$ |
| Distributive (OR over AND) | $(A + B)(A + C) = A + BC$ |
| Consensus | $AB + \overline{A}C + BC = AB + \overline{A}C$ |
| Consensus (POS) | $(A + B)(\overline{A} + C)(B + C) = (A + B)(\overline{A} + C)$ |
| De Morgan | $\overline{AB} = \overline{A} + \overline{B}$, $\overline{A + B} = \overline{A}\,\overline{B}$ |
| XOR | $A \oplus B = \overline{A}B + A\overline{B}$, $A \oplus 1 = \overline{A}$, $A \oplus A = 0$ |
| XOR with AND | $A(B \oplus C) = AB \oplus AC$, $A \oplus B \oplus AB = A + B$ |
| Dual | swap $+ \leftrightarrow \cdot$ and $0 \leftrightarrow 1$, keep literals |

- Complement of $F$: take the dual and complement every literal.
- Dual of $\Sigma m(S)$ over $n$ variables: minterms $2^n - 1 - m$ for every $m \notin S$.

**Standard counts ($n$ variables)**

| Quantity | Count |
|---|---|
| Boolean functions | $2^{2^n}$ |
| Self-dual functions | $2^{2^{n-1}}$ |
| Symmetric functions | $2^{n+1}$ |
| Functions with $k$ rows fixed | $2^{2^n - k}$ |
| Neutral functions (equal 0s and 1s) | $\binom{2^n}{2^{n-1}}$ |
| Minterms covered by a $k$-literal product | $2^{n-k}$ |
| Minterms of XOR of $n$ variables | $2^{n-1}$ |

**K-map and tabular method**

- Adjacent cells differ in one bit. Gray order: 00, 01, 11, 10. Edges wrap.
- Groups have $2^k$ cells; a group of $2^k$ drops $k$ variables.
- Prime implicant (PI): group that cannot grow. Essential PI: the only PI covering some 1-cell.
- Procedure: take all EPIs, then cover the rest with the fewest PIs. Don't cares may be used, never required.
- Cyclic function: no EPI, several minimal covers (for example $\Sigma m(0,1,2,5,6,7)$, 6 PIs, 2 minimal SOPs).
- Quine-McCluskey: group minterms by number of 1s; merge terms in adjacent groups that differ in one bit and have dashes in the same places; tick merged terms; unticked terms are PIs; then build the PI chart.
- PI chart reduction: row with one X marks an EPI; drop dominated rows; drop dominating columns.
- POS: group the 0s, write the result as a product of sums.

**Functional completeness (Post)**: a set is complete iff, for each of the 5 classes, some member lies outside it: 0-preserving, 1-preserving, self-dual, monotone, linear (XOR-based).

- Complete alone: NAND, NOR, $\{\to, 0\}$, $\{\lor, \lnot\}$, $\{\land, \lnot\}$.
- Not complete: $\{\land, \lor\}$, $\{\oplus, \lnot\}$, $\{\to\}$ alone.

## Combinational circuits

**Adders and subtractors**

| Block | Outputs |
|---|---|
| Half adder | $S = A \oplus B$, $C = AB$ |
| Full adder | $S = A \oplus B \oplus C$, $C_{out} = AB + C(A \oplus B) = AB + BC + CA$ |
| Half subtractor | $D = A \oplus B$, borrow $= \overline{A}B$ |
| Full subtractor | $D = A \oplus B \oplus B_{in}$, borrow $= \overline{A}B + \overline{A}B_{in} + BB_{in}$ |
| Adder-subtractor | $B_i \oplus M$ into each stage, $C_0 = M$ |

- Ripple-carry, $n$ bits: carry ready after $n \cdot t_c$; last sum at $(n-1)t_c + t_s$.
- Carry lookahead: $G_i = A_iB_i$, $P_i = A_i \oplus B_i$, $C_{i+1} = G_i + P_iC_i$, $S_i = P_i \oplus C_i$.
- $C_2 = G_1 + P_1G_0 + P_1P_0C_0$; all carries in 2 gate levels after P/G, independent of $n$ (fan-in grows).
- Blocks of CLA chained in ripple: time $\approx$ P/G time + (number of blocks) $\times$ block carry delay + final sum delay.

**Multiplexers and decoders**

- $2^n$-to-1 mux: $n$ select lines. Realises any $(n+1)$-variable function with one variable (and its complement) on the data lines.
- Residue rule: for each select value, the data input is $0$, $1$, $x$ or $\overline{x}$.
- Mux tree from $m$-to-1 units for $N$ inputs: $N/m$ in level 1, then divide by $m$ (round up) per level until 1. Example: 32-to-1 from 4-to-1 needs $8 + 2 + 1 = 11$.
- $n$-to-$2^n$ decoder: each output is one minterm. OR of chosen outputs gives $\Sigma m$; NOR of the rest gives the same $F$.
- Active-low outputs: NAND of chosen lines gives $\Sigma m$, AND gives $\Pi M$.
- Bigger decoder: 6-to-64 from 3-to-8 with enable needs $8 + 1 = 9$.
- Priority encoder: highest-priority active input wins; valid bit $V$ = OR of inputs.

**Codes, comparators, parity**

| Item | Rule |
|---|---|
| Binary to Gray | $G_{n-1} = B_{n-1}$, $G_i = B_{i+1} \oplus B_i$ |
| Gray to binary | $B_{n-1} = G_{n-1}$, $B_i = B_{i+1} \oplus G_i$ |
| Equality (bit) | $\overline{A_i \oplus B_i}$, AND over all bits |
| $A > B$ (2-bit) | $A_1\overline{B_1} + \overline{A_1 \oplus B_1}\,A_0\overline{B_0}$ |
| Parity of $n$ bits | $n - 1$ two-input XOR gates |
| $2 \times 2$ multiplier | $P_0 = A_0B_0$, $P_1 = A_1B_0 \oplus A_0B_1$, $P_2 = A_1B_1\overline{A_0B_0}$, $P_3 = A_0A_1B_0B_1$ |

**Gate counts (2-input, uncomplemented inputs)**: XOR = 4 NAND or 5 NOR; XNOR = 5 NAND or 4 NOR; NOT = 1 NAND; AND = 2 NAND; OR = 3 NAND.

**Hazards**

- Static-1 hazard in SOP: two adjacent 1-cells not inside a common product term.
- Fix: add the consensus term of each such pair. Hazard-free SOP covers every adjacent pair of 1s.
- Static-0 hazard is the POS dual. Two-level SOP has no static-0 hazard for single input changes.

## Sequential circuits

**Flip-flops**

| FF | Characteristic | Excitation ($Q \to Q^+$: 00, 01, 10, 11) |
|---|---|---|
| SR | $Q^+ = S + \overline{R}Q$, $SR = 0$ | $0X$, $10$, $01$, $X0$ |
| JK | $Q^+ = J\overline{Q} + \overline{K}Q$ | $0X$, $1X$, $X1$, $X0$ |
| D | $Q^+ = D$ | $0$, $1$, $0$, $1$ |
| T | $Q^+ = T \oplus Q$ | $0$, $1$, $1$, $0$ |

- Conversions: D from SR: $S = D$, $R = \overline{D}$. T from JK: $J = K = T$. T from D: $D = T \oplus Q$. D from JK: $J = D$, $K = \overline{D}$.
- NOR latch: $S = R = 1$ is forbidden ($Q = \overline{Q} = 0$); releasing both together races.
- Latch is level-sensitive; flip-flop is edge-triggered. JK master-slave avoids race-around.

**Counters**

| Counter | States with $n$ FFs | Notes |
|---|---|---|
| Binary (ripple or sync) | $2^n$ | mod-$N$ needs $\lceil \log_2 N \rceil$ FFs |
| Ring | $n$ | one 1 circulates; $2^n - n$ unused |
| Johnson | $2n$ | $Q_{in} = \overline{Q_{last}}$; $2^n - 2n$ unused |
| LFSR (max length) | $2^n - 1$ | all-zero state locks |

- Ripple counter settle time $n \cdot t_{pd}$, so $f_{max} = 1/(n \cdot t_{pd})$. Sync counter: $f_{max} = 1/(t_{pd} + t_{gate} + t_{su})$.
- Ripple outputs pass through false states (011 to 100 shows 010, 000).
- MSB of a mod-$N$ counter: frequency $f_{clk}/N$; a T flip-flop divides by 2.
- Asynchronous clear at state $N$: modulus $N$. Synchronous clear decoded at state $N-1$: modulus $N$. Same decode used synchronously gives one more state.
- Self-starting check: trace every unused state until it enters the main cycle.

**Timing ($\delta$ = capture clock arrives $\delta$ later than launch)**

| Check | Condition |
|---|---|
| Setup | $T \ge t_{cq} + t_{comb,max} + t_{su} - \delta$ |
| Hold | $t_{cq} + t_{comb,min} \ge t_{hold} + \delta$ |

- Hold does not involve $T$: fix it by adding delay to the short path, never by changing the clock.
- $f_{max} = 1/T_{min}$.

**State machines**

- Moore: output from state; Mealy: from state and input. Moore often needs 1 more state.
- Sequence detector for a pattern of length $k$: usually $k$ Mealy states and $k + 1$ Moore states.
- Counting machines: tracking (count mod $p$, count mod $q$) needs $pq$ states when the output depends on both.
- State minimisation: split by output, then refine by next-state blocks until stable; states left in one block are equivalent.

## Number representation and arithmetic

**Integer ranges, $n$ bits**

| Format | Range | Zeros |
|---|---|---|
| Unsigned | $0$ to $2^n - 1$ | 1 |
| Sign-magnitude | $-(2^{n-1} - 1)$ to $2^{n-1} - 1$ | 2 |
| 1's complement | $-(2^{n-1} - 1)$ to $2^{n-1} - 1$ | 2 |
| 2's complement | $-2^{n-1}$ to $2^{n-1} - 1$ | 1 |

- 2's complement value: $-b_{n-1}2^{n-1} + \sum_{i<n-1} b_i 2^i$. Negate: invert and add 1.
- Sign extension copies the MSB. Arithmetic right shift rounds toward $-\infty$.
- Base conversion: group 3 bits for octal, 4 for hex. Fractions: multiply by the base, take integer parts.
- Unknown base: expand both sides as polynomials in $b$, solve, check every digit is less than $b$.

**Overflow (2's complement)**

- Addition: $V = C_n \oplus C_{n-1} = a\,b\,\overline{s} + \overline{a}\,\overline{b}\,s$ (sign bits).
- Opposite-sign operands never overflow on addition.
- Subtraction $A - B$: overflow iff signs of $A$ and $B$ differ and the result sign differs from $A$.
- Unsigned overflow: $C_n = 1$ on add; $C_n = 0$ on subtract via $A + \overline{B} + 1$.

**Booth recoding**

| Radix-2 $(b_i, b_{i-1})$ | Action | Radix-4 $(b_{2i+1}, b_{2i}, b_{2i-1})$ | Digit |
|---|---|---|---|
| 00 / 11 | none | 000 / 111 | $0$ |
| 10 | $-M$ | 001 / 010 | $+1$ |
| 01 | $+M$ | 011 | $+2$ |
| | | 100 | $-2$ |
| | | 101 / 110 | $-1$ |

- Append $b_{-1} = 0$. Radix-2 operations = number of bit changes in $b_{n-1} \ldots b_0 b_{-1}$. Radix-4 gives $n/2$ digits.

**Codes**

| Code | Rule |
|---|---|
| BCD | each decimal digit in 4 bits; nibbles 1010 to 1111 invalid |
| BCD add | add binary per digit; if sum > 9 or carry out, add 0110 |
| Excess-3 | digit $d$ stored as $d + 3$; self-complementing |
| Gray | consecutive values differ in one bit |

**Fixed point**: $n$-bit 2's complement with $f$ fraction bits: value = integer $/ 2^f$, step $2^{-f}$, range $-2^{n-1-f}$ to $2^{n-1-f} - 2^{-f}$. Product of formats with $f_1$ and $f_2$ fraction bits has $f_1 + f_2$ fraction bits.

**IEEE 754**: value $(-1)^s \times 1.f \times 2^{e - bias}$ for $1 \le e \le e_{max} - 1$.

| Item | Single | Double |
|---|---|---|
| Sign / exponent / fraction bits | 1 / 8 / 23 | 1 / 11 / 52 |
| Bias | 127 | 1023 |
| Smallest normal | $2^{-126}$ | $2^{-1022}$ |
| Smallest subnormal | $2^{-149}$ | $2^{-1074}$ |
| Largest finite | $(2 - 2^{-23}) \times 2^{127}$ | $(2 - 2^{-52}) \times 2^{1023}$ |
| Gap above 1 (epsilon) | $2^{-23}$ | $2^{-52}$ |
| Values in $[2^k, 2^{k+1})$ | $2^{23}$ | $2^{52}$ |

| Exponent field | Fraction | Meaning |
|---|---|---|
| all 0 | 0 | $\pm 0$ (+0 = -0 when compared) |
| all 0 | nonzero | subnormal $0.f \times 2^{1 - bias}$ |
| all 1 | 0 | $\pm\infty$ |
| all 1 | nonzero | NaN (NaN $\ne$ NaN) |

- Custom format with $k$ exponent bits and $m$ fraction bits: bias $2^{k-1} - 1$, largest $(2 - 2^{-m}) \times 2^{bias}$, smallest subnormal $2^{1 - bias - m}$.
- Exactly representable: $p/2^q$ with enough fraction bits ($0.1$, $0.2$ never are). Integers up to $2^{24}$ in single.
- Encode: write $\pm 1.f \times 2^E$, store $E + bias$. Hex shortcuts: 1.0 is 3F800000, 2.0 is 40000000, $+\infty$ is 7F800000.
- Round to nearest, ties to even; spacing at exponent $E$ is $2^{E - m}$.
