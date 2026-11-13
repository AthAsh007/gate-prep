---
title: "Local optimisation and data flow analysis"
summary: "Local optimisations inside a basic block and the data flow framework for constant propagation, liveness, reaching definitions and common subexpression elimination, including register counts from liveness."
order: 6
sources:
  - title: "Data-flow analysis (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Data-flow_analysis"
  - title: "Live-variable analysis (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Live-variable_analysis"
  - title: "Common subexpression elimination (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Common_subexpression_elimination"
  - title: "GATE Overflow: code optimization questions"
    url: "https://gateoverflow.in/tag/code-optimization"
---

## Local versus global

- **Local** optimisation works inside one basic block. Control enters at the top and leaves at the bottom, so facts flow in a straight line and no merging is needed.
- **Global** optimisation works over the whole control flow graph of a procedure. Facts from different paths meet at join points, and loops force an iterative fixpoint computation.
- **Peephole** optimisation slides a small window over the final code and replaces short patterns, such as a load right after a store to the same place.

Every transformation must preserve the program's observable behaviour.

## Local transformations

| Transformation | Before | After |
|---|---|---|
| Constant folding | `x = 4 * 8` | `x = 32` |
| Constant propagation | `a = 5; b = a + 1` | `a = 5; b = 6` |
| Copy propagation | `y = x; z = y + 1` | `y = x; z = x + 1` |
| Common subexpression elimination | `t1 = a*b; t2 = a*b` | `t1 = a*b; t2 = t1` |
| Dead code elimination | `x = 7` where `x` is never used again | removed |
| Algebraic simplification | `x = y * 1`, `x = y + 0` | `x = y` |
| Strength reduction | `x = y * 2`, `x = y ** 2` | `x = y + y`, `x = y * y` |

Inside a block, the DAG built from the block does CSE automatically: a repeated $(op, l, r)$ maps to an existing node. Dead code elimination on the DAG removes nodes with no live labels and no parents.

Loop optimisations (moving loop-invariant code out, induction variable elimination, strength reduction of `4 * i` into an add) are global, not local.

## The data flow framework

A data flow analysis attaches a set of facts to the entry and exit of every block, $\text{IN}[B]$ and $\text{OUT}[B]$. It is defined by:

- **Direction:** forward (facts flow along edges) or backward (facts flow against edges).
- **Meet operator:** union for "along some path" (may) questions, intersection for "along every path" (must) questions.
- **Transfer function:** usually $f_B(x) = \text{gen}_B \cup (x - \text{kill}_B)$.

Start from a safe initial value and iterate the equations until nothing changes. Because the sets only grow (or only shrink) and are finite, this always terminates.

| Analysis | Direction | Meet | Equations | Initial interior value |
|---|---|---|---|---|
| Reaching definitions | Forward | $\cup$ | $\text{OUT} = \text{gen} \cup (\text{IN} - \text{kill})$, $\text{IN} = \bigcup_{P} \text{OUT}[P]$ | $\emptyset$ |
| Live variables | Backward | $\cup$ | $\text{IN} = \text{use} \cup (\text{OUT} - \text{def})$, $\text{OUT} = \bigcup_{S} \text{IN}[S]$ | $\emptyset$ |
| Available expressions | Forward | $\cap$ | $\text{OUT} = \text{e\_gen} \cup (\text{IN} - \text{e\_kill})$, $\text{IN} = \bigcap_{P} \text{OUT}[P]$ | all expressions |
| Very busy expressions | Backward | $\cap$ | $\text{IN} = \text{use} \cup (\text{OUT} - \text{kill})$, $\text{OUT} = \bigcap_{S} \text{IN}[S]$ | all expressions |

Here $P$ ranges over predecessors and $S$ over successors.

## Liveness

A variable $v$ is **live** at a point $p$ if some path from $p$ reaches a use of $v$ with no assignment to $v$ in between. Otherwise $v$ is dead at $p$.

For a block:

- $\text{use}[B]$: variables read in $B$ before any assignment to them in $B$.
- $\text{def}[B]$: variables assigned in $B$ before any read of them in $B$. (Some texts define it as all variables assigned in $B$; for computing IN both give the same answer because a variable read first is already in use.)

Inside a block, compute liveness one instruction at a time from the bottom up: for `x = y op z`, remove `x` from the live set, then add `y` and `z`. The order matters: in `i = i + 1`, `i` is live before the instruction.

Uses of liveness:

- **Dead code elimination:** an assignment to a variable that is dead right after it can be removed (if it has no side effects).
- **Register allocation:** two variables that are never live at the same point can share a register. The minimum number of registers for a basic block (with no spilling) equals the largest number of variables live at the same time, assuming an instruction's destination may reuse the register of an operand that dies there.

## Constant propagation

Each variable at each point has one of three lattice values: undefined (no value has reached yet), a specific constant $c$, or NAC (not a constant). At a merge point:

- $c$ meet $c$ = $c$.
- $c_1$ meet $c_2$ with $c_1 \neq c_2$ = NAC.
- anything meet NAC = NAC; undefined meet $v$ = $v$.

Constant propagation is a forward analysis. Unlike the gen/kill analyses above, its transfer function is not distributive: $x = a + b$ can be constant on every path even though $a$ and $b$ are NAC after the merge (for example $a = 2, b = 3$ on one path and $a = 3, b = 2$ on the other). The iterative algorithm reports NAC in such cases, which is safe but not perfect.

## Common subexpression elimination globally

An expression $x \text{ op } y$ is **available** at point $p$ if every path from the entry to $p$ computes $x \text{ op } y$ and neither $x$ nor $y$ is reassigned after the last computation. If an expression is available where it is computed again, the second computation can be replaced by a copy from a temporary. Because "every path" is required, available expressions use intersection.

## Worked examples

### Worked example 1: Liveness fixpoint

```
B1: m = a + b
    n = a - 1            -> B2
B2: if n > m goto B4     -> B3, B4
B3: m = m + 1
    a = a * 2            -> B2
B4: return m + a
```

Local sets:

| Block | use | def |
|---|---|---|
| B1 | a, b | m, n |
| B2 | m, n | none |
| B3 | m, a | m, a |
| B4 | m, a | none |

Iterate in the order B4, B3, B2, B1, starting from empty sets.

Pass 1:

- $\text{IN}[B4] = \{a, m\}$.
- $\text{OUT}[B3] = \text{IN}[B2] = \emptyset$, so $\text{IN}[B3] = \{a, m\}$.
- $\text{OUT}[B2] = \text{IN}[B3] \cup \text{IN}[B4] = \{a, m\}$, so $\text{IN}[B2] = \{m, n\} \cup \{a, m\} = \{a, m, n\}$.
- $\text{OUT}[B1] = \{a, m, n\}$, so $\text{IN}[B1] = \{a, b\} \cup \{a\} = \{a, b\}$.

Pass 2: $\text{OUT}[B3] = \{a, m, n\}$, so $\text{IN}[B3] = \{a, m\} \cup \{n\} = \{a, m, n\}$. Nothing else changes, and pass 3 confirms the fixpoint.

Final: $\text{IN}[B1] = \{a, b\}$, $\text{IN}[B2] = \text{IN}[B3] = \{a, m, n\}$, $\text{IN}[B4] = \{a, m\}$. Note that $n$ is live inside B3 only because of the loop back to B2.

### Worked example 2: Minimum registers for a block

```
x = 2
y = x + 3
z = x * y
w = y + z
v = w - x
return v + y
```

Walk backward, writing the set live just before each instruction:

| Before | Live |
|---|---|
| `return v + y` | v, y |
| `v = w - x` | w, x, y |
| `w = y + z` | x, y, z |
| `z = x * y` | x, y |
| `y = x + 3` | x |
| `x = 2` | none |

The maximum is 3 (at two points), so 3 registers suffice and are needed. At `w = y + z`, `z` dies, so `w` can take `z`'s register.

### Worked example 3: Constant propagation across a branch

```
B1: a = 3; b = 5; if p goto B3
B2: c = a + b; d = 2       -> B4
B3: c = 2 * 4; d = b - a   -> B4
B4: e = c * d
```

On the B2 path, $c = 8$ and $d = 2$. On the B3 path, $c = 8$ and $d = 5 - 3 = 2$. At the merge both agree, so $c = 8$ and $d = 2$ in B4, and $e$ folds to 16. If B3 instead set $d = b$, then $d$ would be 2 on one path and 5 on the other, so $d$ becomes NAC and $e$ is not a constant even though $c$ still is.

### Worked example 4: Which recomputations are redundant

```
t1 = a * b
t2 = t1 + c
a  = a + 1
t3 = a * b
t4 = t1 + c
t5 = a * b
```

- `t3 = a * b` is not redundant: `a` changed after `t1` was computed, so `a * b` was killed.
- `t4 = t1 + c` is redundant: neither `t1` nor `c` changed since `t2`. Replace with `t4 = t2`.
- `t5 = a * b` is redundant with `t3`, since `a` and `b` are unchanged after `t3`. Replace with `t5 = t3`.

## Common traps

- Running liveness forward. It is backward: uses later in the program make variables live earlier.
- Forgetting that `x = x + 1` uses `x`, so `x` is live before it.
- Using intersection for liveness or union for available expressions.
- Treating an expression as available after one of its operands was reassigned.
- Counting registers from the number of variables in the block instead of the peak number live at once.
- Calling loop-invariant code motion a local optimisation.
- Assuming constant propagation catches every constant. The standard algorithm loses precision at merges.

## Quick revision

- Local = one basic block; global = whole CFG with fixpoint iteration.
- Liveness: backward, union, $\text{IN} = \text{use} \cup (\text{OUT} - \text{def})$.
- Reaching definitions: forward, union. Available expressions: forward, intersection. Very busy expressions: backward, intersection.
- Constant propagation: forward, lattice undefined, constant, NAC; not distributive.
- CSE needs the expression available: computed on every path with operands unchanged.
- Minimum registers in a block = maximum number of simultaneously live variables.
- Dead code = assignment to a variable dead right after it.
