---
title: "Sequential circuits"
summary: "Latches, flip-flops and their conversions, timing constraints, ripple and synchronous counters, shift registers, ring and Johnson counters, LFSRs and finite state machine design, with worked GATE problems."
order: 3
sources:
  - title: "Flip-flop (electronics) (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Flip-flop_(electronics)"
  - title: "Counter (digital) (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Counter_(digital)"
  - title: "Finite-state machine (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Finite-state_machine"
  - title: "GATE Overflow: sequential circuit questions"
    url: "https://gateoverflow.in/tag/sequential-circuit"
---

## What makes a circuit sequential

A sequential circuit has memory. Its outputs depend on the current inputs and on the stored state, and the state changes over time. In synchronous circuits all flip-flops change on the same clock edge; in asynchronous circuits (such as ripple counters) different elements change at different times.

GATE favourites: trace a counter for a few clocks, find the modulus of a counter with a reset gate, compute the maximum clock frequency, convert one flip-flop type to another, and count the states of a sequence detector.

## Latches

### SR latch

Two cross-coupled NOR gates make an SR latch with active-high inputs:

| $S$ | $R$ | $Q^+$ | Meaning |
|---|---|---|---|
| 0 | 0 | $Q$ | hold |
| 0 | 1 | 0 | reset |
| 1 | 0 | 1 | set |
| 1 | 1 | invalid | both outputs forced to 0 |

With $S = R = 1$ both NOR outputs are 0, so $Q$ and $\overline{Q}$ are no longer complements. If both inputs then return to 0 together, the final state depends on gate delays (a race), and the latch may oscillate before settling.

The NAND version has active-low inputs ($\overline{S}$, $\overline{R}$). Its forbidden input is $\overline{S} = \overline{R} = 0$, which forces both outputs to 1.

### Gated D latch

Adding an enable and setting $R = \overline{S}$ removes the invalid case. While enable is 1, $Q$ follows $D$ (the latch is transparent); while enable is 0, $Q$ holds. A latch is level-sensitive.

## Flip-flops

A flip-flop is edge-triggered: it samples its inputs at a clock edge and holds between edges. A positive edge-triggered D flip-flop is usually built as two D latches in master-slave arrangement with opposite enables.

### Characteristic equations and excitation tables

| Type | Characteristic equation | Behaviour |
|---|---|---|
| SR | $Q^+ = S + \overline{R}Q$, with $SR = 0$ | set, reset, hold |
| JK | $Q^+ = J\overline{Q} + \overline{K}Q$ | like SR, but $J=K=1$ toggles |
| D | $Q^+ = D$ | copies D |
| T | $Q^+ = T \oplus Q$ | toggles when $T = 1$ |

Excitation tables give the inputs needed for each transition ($X$ = don't care):

| $Q \to Q^+$ | $S\ R$ | $J\ K$ | $D$ | $T$ |
|---|---|---|---|---|
| $0 \to 0$ | 0 X | 0 X | 0 | 0 |
| $0 \to 1$ | 1 0 | 1 X | 1 | 1 |
| $1 \to 0$ | 0 1 | X 1 | 0 | 1 |
| $1 \to 1$ | X 0 | X 0 | 1 | 0 |

The JK table has the most don't-cares, which is why JK designs often give the simplest input logic.

### Converting one flip-flop to another

To make flip-flop type Y from type X, write the characteristic equation of Y and drive X's inputs to produce it.

- T from D: $D = T \oplus Q$.
- JK from D: $D = J\overline{Q} + \overline{K}Q$.
- D from JK: $J = D$, $K = \overline{D}$.
- T from JK: $J = K = T$.
- D from T: $T = D \oplus Q$.

### Race-around

In a level-triggered JK flip-flop with $J = K = 1$, the output keeps toggling for as long as the clock is high, if the clock pulse is longer than the propagation delay. The final value is unpredictable. Fixes: master-slave construction (output changes once per clock period) or true edge triggering.

## Timing

Three parameters of a flip-flop:

- $t_{cq}$: clock-to-output delay.
- $t_{setup}$: input must be stable this long before the edge.
- $t_{hold}$: input must stay stable this long after the edge.

For a path from flip-flop 1 through combinational logic to flip-flop 2:

$$T_{clk} \ge t_{cq} + t_{comb,max} + t_{setup} - t_{skew}$$

$$t_{cq} + t_{comb,min} \ge t_{hold} + t_{skew}$$

Here $t_{skew}$ is how much later the clock reaches the capturing flip-flop than the launching one. Positive skew relaxes the setup (frequency) constraint and tightens the hold constraint. If skew is not mentioned, take it as zero. Hold violations cannot be fixed by slowing the clock.

## Counters

### Ripple (asynchronous) counters

Each flip-flop is a T flip-flop with $T = 1$ (or a JK with $J = K = 1$). The first one is clocked by the system clock; each later one is clocked by the previous output. With negative-edge flip-flops clocked from $Q$, the counter counts up. With positive-edge flip-flops clocked from $Q$, it counts down. (Clocking from $\overline{Q}$ reverses each case.)

Delay: the worst-case transition (for example 0111 to 1000) ripples through all $n$ stages, so the outputs settle after $n \cdot t_{pd}$. If the count is decoded, add the decoder delay. Maximum frequency $= 1 / (n \cdot t_{pd} + t_{decode})$.

**Mod-N with asynchronous clear.** To make a mod-N ripple counter, detect state $N$ with a gate on the bits that are 1 in $N$ and use it to clear all flip-flops. State $N$ appears briefly (a glitch) and the counter goes to 0, so the stable states are $0$ to $N-1$. If the clear is synchronous (takes effect at the next clock), you must detect $N - 1$ instead.

### Synchronous counters

All flip-flops share the clock. The binary up counter with T flip-flops uses $T_0 = 1$ and $T_i = Q_{i-1}Q_{i-2}\cdots Q_0$. The delay is one flip-flop delay plus the gate delay of the AND chain, not $n \cdot t_{pd}$.

**Design steps** for any synchronous counter or state machine:

1. List the states and transitions; choose a state assignment.
2. Write the present-state / next-state table.
3. Use the excitation table to get each flip-flop's inputs.
4. Minimize each input with a K-map, using unused states as don't-cares.
5. Check that the unused states eventually lead into the main cycle (self-starting).

### Number of flip-flops

A counter with $N$ states needs at least $\lceil \log_2 N \rceil$ flip-flops in binary encoding. A ring counter needs $N$ flip-flops for $N$ states, and a Johnson counter needs $N/2$.

## Shift registers, ring and Johnson counters

A shift register moves its contents one position per clock. Serial in, serial out (SISO): loading $n$ bits takes $n$ clocks, and at that point the first bit is already at the output; shifting the remaining bits out takes $n - 1$ more clocks, so $2n - 1$ clocks in total.

| Counter | Feedback | States used | Decoding |
|---|---|---|---|
| Ring ($n$ flip-flops) | last output to first input | $n$ | none needed (one-hot) |
| Johnson ($n$ flip-flops) | complement of last output to first input | $2n$ | one 2-input AND per state |
| Binary ($n$ flip-flops) | counting logic | $2^n$ | $n$-input AND per state |

A 4-bit Johnson counter from 0000: 0000, 1000, 1100, 1110, 1111, 0111, 0011, 0001, then back to 0000. Unused states: $2^n - 2n$.

### Linear feedback shift registers (LFSR)

An LFSR feeds back the XOR of selected bits. With the right taps an $n$-bit LFSR passes through all $2^n - 1$ nonzero states before repeating (maximal length). The all-zero state maps to itself, so it is never part of the main cycle.

## Finite state machines

- **Moore machine**: output depends only on the present state.
- **Mealy machine**: output depends on the present state and the present input.

For the same behaviour, a Mealy machine needs the same number of states or fewer. A sequence detector for a pattern of length $L$ (overlapping) needs $L$ states as Mealy and $L + 1$ as Moore. For non-overlapping detection, after a match the machine returns to the start state instead of the longest matching suffix, but the state count is the same.

**State minimization.** Two states are equivalent if, for every input sequence, they produce the same outputs. Partition refinement: start by grouping states with identical outputs, then split groups whose members go to different groups on some input, and repeat until stable. Each final group is one state.

## Worked examples

### Worked example 1: Designing a mod-6 counter with T flip-flops

Design a synchronous counter $Q_2Q_1Q_0$ that counts 0, 1, 2, 3, 4, 5, 0, ...

**Solution.** For a T flip-flop, $T = 1$ exactly when the bit changes, so $T_i = Q_i \oplus Q_i^+$.

| State | Next | $T_2T_1T_0$ |
|---|---|---|
| 000 | 001 | 001 |
| 001 | 010 | 011 |
| 010 | 011 | 001 |
| 011 | 100 | 111 |
| 100 | 101 | 001 |
| 101 | 000 | 101 |
| 110 | X | XXX |
| 111 | X | XXX |

- $T_0 = 1$ in every used state.
- $T_1 = 1$ in states 1 and 3; 0 in 5. With 6 and 7 as don't-cares: $T_1 = \overline{Q_2}Q_0$.
- $T_2 = 1$ in states 3 and 5. Using 7 as don't-care: $T_2 = Q_1Q_0 + Q_2Q_0$.

Self-start check: from 110, $T = 001$ gives 111; from 111, $T_2 = 1$, $T_1 = 0$, $T_0 = 1$ gives 010, which is in the main cycle. The counter is self-starting.

### Worked example 2: Clock frequency with skew

$t_{cq} = 5$ ns, longest logic delay 12 ns, shortest logic delay 1 ns, $t_{setup} = 3$ ns, $t_{hold} = 2$ ns. The clock reaches the capturing flip-flop 2 ns after the launching flip-flop. Find $f_{max}$ and check hold.

**Solution.** Setup: $T \ge 5 + 12 + 3 - 2 = 18$ ns, so $f_{max} = 1/18\text{ ns} \approx 55.56$ MHz.

Hold: $t_{cq} + t_{comb,min} = 5 + 1 = 6$ ns must be at least $t_{hold} + t_{skew} = 2 + 2 = 4$ ns. It is, so no hold violation.

### Worked example 3: Mod-N ripple counter

A 4-bit ripple up counter has a 2-input NAND driving its active-low asynchronous clear, with inputs $Q_3$ and $Q_1$. What is the modulus? If each flip-flop has a 10 ns delay, what is the maximum clock frequency without decoding?

**Solution.** The clear fires at the first count with $Q_3 = Q_1 = 1$, which is $1010 = 10$. Stable states are 0 to 9: a mod-10 (decade) counter.

The worst-case ripple goes through all 4 flip-flops: $4 \times 10 = 40$ ns, so $f_{max} = 25$ MHz. (A strict analysis also adds the clear path delay for the 9 to 0 transition, which questions sometimes include.)

### Worked example 4: Moore detector for 101

Design a Moore machine that outputs 1 when the last three inputs are 101 (overlapping). Trace it on input 1101011010.

**Solution.** States record the longest suffix of the input that is a prefix of 101:

| State | Meaning | Output | Next on 0 | Next on 1 |
|---|---|---|---|---|
| $S_0$ | nothing | 0 | $S_0$ | $S_1$ |
| $S_1$ | "1" | 0 | $S_2$ | $S_1$ |
| $S_2$ | "10" | 0 | $S_0$ | $S_3$ |
| $S_3$ | "101" | 1 | $S_2$ | $S_1$ |

From $S_3$, an input 0 leaves suffix "10" ($S_2$), and an input 1 leaves "1" ($S_1$). That is where overlap is handled.

Trace on 1101011010: states after each bit are $S_1, S_1, S_2, S_3, S_2, S_3, S_1, S_2, S_3, S_2$. Outputs: 0001010010. Detections end at positions 4, 6 and 9.

Four states for a 3-bit pattern, as expected for Moore ($L + 1$). The Mealy version needs 3.

### Worked example 5: Converting JK to D behaviour

A D flip-flop must behave as a JK flip-flop. What logic drives $D$?

**Solution.** The JK characteristic equation is $Q^+ = J\overline{Q} + \overline{K}Q$. A D flip-flop gives $Q^+ = D$, so $D = J\overline{Q} + \overline{K}Q$: two AND gates, one OR gate and an inverter on $K$ (using $\overline{Q}$ from the flip-flop).

## Common traps

- Counting the glitch state as part of a mod-N ripple counter with asynchronous clear. With a synchronous clear, detect $N - 1$.
- Using $n \cdot t_{pd}$ for a synchronous counter's period. That formula is for ripple counters.
- Ignoring setup time or adding hold time into the clock period.
- Getting the skew sign wrong. Late capture clock helps setup, hurts hold.
- Taking the JK $1 \to 0$ excitation as $J = 0, K = 1$. $J$ is a don't-care.
- Assuming a Johnson counter has $2^n$ or $n$ states. It has $2n$.
- Forgetting overlap when building detectors: after a match, go to the longest suffix that is still a prefix.
- Starting an LFSR in the all-zero state.

## Quick revision

- SR NOR latch: $S = R = 1$ invalid. NAND latch: $\overline{S} = \overline{R} = 0$ invalid.
- $Q^+$: SR $= S + \overline{R}Q$; JK $= J\overline{Q} + \overline{K}Q$; D $= D$; T $= T \oplus Q$.
- JK excitation: $0\to1$: $1X$; $1\to0$: $X1$.
- T from D: $D = T \oplus Q$. JK from D: $D = J\overline{Q} + \overline{K}Q$.
- $T_{clk} \ge t_{cq} + t_{comb,max} + t_{setup} - t_{skew}$; hold: $t_{cq} + t_{comb,min} \ge t_{hold} + t_{skew}$.
- Ripple counter $f_{max} = 1/(n\,t_{pd} + t_{decode})$.
- Mod-N with async clear: detect $N$; stable states $0$ to $N-1$.
- Ring: $n$ states. Johnson: $2n$ states. Binary: $2^n$. Maximal LFSR: $2^n - 1$.
- Sequence detector of length $L$: Mealy $L$ states, Moore $L+1$.
- Minimum flip-flops for $N$ states: $\lceil \log_2 N \rceil$.
