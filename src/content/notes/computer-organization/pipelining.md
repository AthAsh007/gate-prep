---
title: "Instruction pipelining and hazards"
summary: "Pipeline timing, speedup and throughput, CPI with stalls, and how structural, data and control hazards are detected, counted and reduced."
order: 5
sources:
  - title: "Instruction pipelining (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Instruction_pipelining"
  - title: "Hazard (computer architecture) (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Hazard_(computer_architecture)"
  - title: "GATE Overflow: pipelining tag"
    url: "https://gateoverflow.in/tag/pipelining"
---

## The idea

Pipelining splits instruction execution into $k$ stages separated by pipeline registers (latches), so that up to $k$ instructions are in progress at once, each in a different stage. It does not make one instruction faster; it raises throughput. The classic RISC pipeline has five stages:

| Stage | Work |
|---|---|
| IF | fetch instruction, PC $\leftarrow$ PC $+ 4$ |
| ID | decode, read registers |
| EX | ALU operation or address calculation |
| MEM | load or store data memory access |
| WB | write result to the register file |

## Timing formulas

### Clock period

With stage delays $\tau_1, \dots, \tau_k$ and latch delay $d$:

$$t_p = \max_i \tau_i + d.$$

The slowest stage sets the clock for all stages. A non-pipelined unit doing the same work takes $t_n = \sum \tau_i$ per instruction (no latches).

### Time for $n$ instructions with no stalls

The first instruction takes $k$ cycles; each later one completes one cycle after the previous:

$$T_{pipe} = (k + n - 1)\, t_p.$$

### Speedup and efficiency

$$S = \frac{n\, t_n}{(k + n - 1)\, t_p}, \qquad S_{n \to \infty} = \frac{t_n}{t_p}.$$

With equal stages and no latch overhead, $t_n = k\, t_p$ and $S \to k$. Efficiency is $S / k = n / (k + n - 1)$ in that ideal case. Throughput is $n / T_{pipe}$, approaching $1/t_p$ instructions per second.

### CPI with stalls

$$\text{CPI} = 1 + \text{stall cycles per instruction}$$
$$\text{stall cycles per instruction} = \sum_{\text{events}} (\text{frequency}) \times (\text{penalty})$$
$$\text{time per instruction} = \text{CPI} \times t_p.$$

When comparing pipelines, always compare $\text{CPI} \times t_p$, not either factor alone. Speedup of a pipelined design over a non-pipelined one with stalls:

$$S = \frac{t_n}{\text{CPI}_{pipe} \times t_p}.$$

## Hazards

A hazard is a situation that prevents the next instruction from proceeding in its planned cycle.

### Structural hazards

Two instructions need the same hardware in the same cycle. Classic case: a single memory port shared by IF and MEM. Fixes: separate instruction and data memories (or caches), more ports, duplicate units, or pipelining the shared unit. A non-pipelined multi-cycle unit (for example a divider that takes 4 cycles) is also a structural hazard for the next instruction that needs it.

### Data hazards

For instructions $i$ before $j$:

- **RAW** (read after write, true dependence): $j$ reads what $i$ writes. The only kind that is a real data flow.
- **WAR** (write after read, anti dependence): $j$ writes what $i$ reads. A problem only if $j$ can write before $i$ reads, which needs out-of-order execution or early writes.
- **WAW** (write after write, output dependence): both write the same register. A problem only if writes can complete out of order.

In the classic in-order 5-stage pipeline (read in ID, write in WB), only RAW hazards cause stalls. WAR and WAW become hazards with multi-cycle units of different lengths or out-of-order issue, and **register renaming** removes them.

### Handling RAW hazards

**Without forwarding**, the consumer must read the register after the producer writes it. With the common split-cycle register file (write in the first half of WB, read in the second half of ID), the consumer's ID can be in the same cycle as the producer's WB. For back-to-back dependent instructions in a 5-stage pipeline, that is 2 stall cycles; with one independent instruction in between, 1 stall; with two in between, none.

**With forwarding (bypassing)**, results go from the EX/MEM and MEM/WB pipeline registers straight to the ALU inputs. ALU-to-ALU dependences then need no stall. A **load-use** hazard still costs 1 stall, because the loaded value exists only at the end of MEM, and the next instruction wants it at the start of EX in the same cycle.

Compilers reduce load-use stalls by **instruction scheduling**: moving an independent instruction between the load and its user.

### Control hazards

The pipeline fetches past a branch before knowing whether it is taken or where it goes. If the branch outcome and target are known at the end of stage $s$, the instructions fetched in the $s - 1$ cycles after the branch may be wrong:

$$\text{branch penalty} = s - 1 \text{ cycles (when the branch is resolved at the end of stage } s).$$

Techniques:

- **Stall (freeze)**: every branch pays the full penalty.
- **Predict not taken**: keep fetching sequentially; only taken branches pay (flush).
- **Predict taken**: needs the target early (branch target buffer).
- **Delayed branch**: the compiler fills the slot(s) after the branch with instructions that execute anyway.
- **Early resolution**: compute the condition and target in ID, cutting the penalty to 1.
- **Dynamic prediction**: 1-bit or 2-bit counters per branch; penalty paid only on mispredictions.

Effective CPI with branches: $1 + f_{branch} \times f_{penalised} \times \text{penalty}$, where $f_{penalised}$ is the fraction of branches that actually pay (all of them for stalling, taken ones for predict-not-taken, mispredicted ones for dynamic prediction).

## Worked examples

### Worked example 1: speedup with unequal stages

Five stages of 120, 150, 100, 180 and 130 ps, latch delay 20 ps, 500 instructions, no stalls.

- $t_p = 180 + 20 = 200$ ps. $t_n = 120 + 150 + 100 + 180 + 130 = 680$ ps.
- Pipelined: $(5 + 499) \times 200 = 100800$ ps $= 100.8$ ns.
- Non-pipelined: $500 \times 680 = 340000$ ps $= 340$ ns.
- Speedup $= 340 / 100.8 \approx 3.37$. As $n \to \infty$ it tends to $680/200 = 3.4$, well below 5 because of the uneven stages and the latch.

### Worked example 2: CPI from instruction mix

25% of instructions are loads, and 40% of loads are followed immediately by a user (1 stall each). 15% are branches; the pipeline predicts not-taken with a 2-cycle penalty, and 70% of branches are taken.

$$\text{CPI} = 1 + 0.25 \times 0.4 \times 1 + 0.15 \times 0.7 \times 2 = 1 + 0.10 + 0.21 = 1.31.$$

### Worked example 3: the same code with and without forwarding

```
I1: LW  R1, 0(R2)
I2: ADD R3, R1, R4
I3: SUB R5, R3, R6
I4: SW  R5, 8(R2)
```

**No forwarding**, split-cycle register file, stalled instructions wait in ID (shown as `s`):

| Cycle | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| I1 | IF | ID | EX | MEM | WB | | | | | | | | | |
| I2 | | IF | s | s | ID | EX | MEM | WB | | | | | | |
| I3 | | | IF | | | s | s | ID | EX | MEM | WB | | | |
| I4 | | | | | | IF | | | s | s | ID | EX | MEM | WB |

I2 reads R1 in cycle 5 when I1 writes it; I3 reads R3 in cycle 8; I4 reads R5 in cycle 11. Total 14 cycles, 6 of them stalls. (I3 sits in IF during cycles 4 and 5 and I4 waits in IF behind it; those cycles are part of the same stalls.)

**Full forwarding** into EX, store data also needed at the start of EX:

| Cycle | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| I1 | IF | ID | EX | MEM | WB | | | | |
| I2 | | IF | ID | s | EX | MEM | WB | | |
| I3 | | | IF | s | ID | EX | MEM | WB | |
| I4 | | | | | IF | ID | EX | MEM | WB |

Only the load-use stall remains: R1 leaves MEM at the end of cycle 4 and reaches I2's EX in cycle 5. I3 and I4 get their operands from EX/MEM. Total 9 cycles.

### Worked example 4: resolving branches earlier

A 5-stage pipeline resolves branches in EX (stage 3), so the penalty is 2 cycles. 20% of instructions are branches and every branch stalls. Moving the comparison into ID cuts the penalty to 1 cycle without changing the clock.

- Before: CPI $= 1 + 0.2 \times 2 = 1.4$.
- After: CPI $= 1 + 0.2 \times 1 = 1.2$.
- Speedup $= 1.4 / 1.2 \approx 1.17$.

If the extra comparator in ID lengthened the clock by more than 17%, the change would not pay off. That is the kind of trade-off GATE asks about.

### Worked example 5: deeper is not always better

Design X: 4 stages, 2 ns clock, branch penalty 1, every branch pays. Design Y: 8 stages, 1.2 ns clock, branch penalty 4. 20% branches.

- X: $2 \times (1 + 0.2 \times 1) = 2.4$ ns per instruction.
- Y: $1.2 \times (1 + 0.2 \times 4) = 2.16$ ns per instruction.

Y wins by $2.4 / 2.16 \approx 1.11$, far less than the clock ratio $2 / 1.2 \approx 1.67$. With 35% branches Y would take $1.2 \times 2.4 = 2.88$ ns against X's $2 \times 1.35 = 2.7$ ns and would lose.

## Common traps

- **Forgetting the latch delay** in $t_p$, or adding it to the non-pipelined time.
- **Using $n k$ cycles** instead of $k + n - 1$.
- **Speedup limit is $t_n / t_p$**, which equals $k$ only with equal stages and no latch overhead.
- **Load-use stall survives forwarding.** One cycle in the classic 5-stage design.
- **Split-cycle register file** changes no-forwarding stall counts from 3 to 2 for adjacent dependent instructions. Read the assumption.
- **Branch penalty applies only to the branches that actually pay** under the stated policy.
- **WAR and WAW do not stall** an in-order pipeline that reads in ID and writes in WB.
- **Compare execution time, not CPI or clock alone.**

## Quick revision

- $t_p = \max \tau_i + d$; $T = (k + n - 1) t_p$.
- Speedup $= n t_n / ((k+n-1) t_p) \to t_n / t_p$; ideal limit $k$.
- Efficiency $= n / (k + n - 1)$ for an ideal pipeline.
- CPI $= 1 + \sum$ frequency $\times$ penalty; time $=$ CPI $\times t_p$.
- RAW is true dependence; WAR and WAW are name dependences removed by renaming.
- Forwarding removes ALU-to-ALU stalls; load-use still costs 1.
- Branch resolved at end of stage $s$: penalty $s - 1$.
- Predict-not-taken: only taken branches pay; stall policy: all branches pay.
