---
title: "Intermediate code generation"
summary: "Syntax trees, DAGs, postfix and three-address code, quadruples and triples, SSA form, and splitting code into basic blocks with leaders."
order: 5
sources:
  - title: "Three-address code (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Three-address_code"
  - title: "Static single-assignment form (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Static_single-assignment_form"
  - title: "Basic block (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Basic_block"
  - title: "GATE Overflow: intermediate code questions"
    url: "https://gateoverflow.in/tag/intermediate-code"
---

## Why an intermediate representation

The front end (scanner, parser, semantic checks) depends on the source language. The back end (instruction selection, register allocation) depends on the target machine. An intermediate representation (IR) sits between them. With $m$ source languages and $n$ machines, a shared IR needs $m + n$ components instead of $m \times n$ full compilers. Most optimizations are also written against the IR, so they work for every source and target.

IRs come in two broad shapes:

- **High level, graph-like:** syntax trees and DAGs. Close to the source structure.
- **Low level, linear:** postfix notation and three-address code. Close to machine instructions.

## Syntax trees and DAGs

A syntax tree (abstract syntax tree) keeps only the operators and operands, dropping punctuation and chain productions from the parse tree. Each interior node is an operator; its children are the operands.

A **DAG** (directed acyclic graph) for an expression is a syntax tree where identical subexpressions share one node. Before creating a node $(op, l, r)$ the builder checks whether a node with the same operator and the same children already exists, and reuses it if so. This is the value-number method: each node gets a number and a hash on $(op, l, r)$ finds duplicates.

For `(p + q) * (p + q) - r * (p + q)` the tree has 13 nodes but the DAG has only 7: leaves $p, q, r$, then $+$, the two $*$ nodes, and $-$. The node for $p+q$ has three parents.

## Postfix notation

Operands come first, then the operator. No parentheses are needed. `(a + b) * c - d / e` becomes `a b + c * d e / -`. Postfix is what a postorder walk of the syntax tree produces, and it maps directly to a stack machine.

## Three-address code

Each instruction has at most one operator on the right side and at most three addresses (names, constants, or compiler temporaries). Common forms:

| Form | Example |
|---|---|
| Binary assignment | `x = y op z` |
| Unary assignment | `x = op y` (minus, not, conversions) |
| Copy | `x = y` |
| Unconditional jump | `goto L` |
| Conditional jump | `if x relop y goto L`, `if x goto L`, `ifFalse x goto L` |
| Procedure call | `param x1` ... `param xn`, then `call p, n` and `y = call p, n` |
| Indexed copy | `x = y[i]`, `x[i] = y` |
| Address and pointer | `x = &y`, `x = *y`, `*x = y` |

Generating three-address code from a syntax tree is a postorder walk: each interior node gets a fresh temporary that holds its value.

### Array references

For an array `A` with base address `base`, element width $w$ and row-major layout with $n_2$ columns, the address of `A[i][j]` is

$$\text{base} + (i \times n_2 + j) \times w$$

assuming indices start at 0. If they start at $low_1$ and $low_2$, replace $i$ with $i - low_1$ and $j$ with $j - low_2$.

## Quadruples, triples and indirect triples

Take `x = (a + b) * -c`. Three-address code:

```
t1 = a + b
t2 = minus c
t3 = t1 * t2
x  = t3
```

**Quadruples** store four fields: op, arg1, arg2, result.

| # | op | arg1 | arg2 | result |
|---|---|---|---|---|
| 0 | + | a | b | t1 |
| 1 | minus | c | | t2 |
| 2 | * | t1 | t2 | t3 |
| 3 | = | t3 | | x |

**Triples** drop the result field. A later instruction refers to an earlier result by its position.

| # | op | arg1 | arg2 |
|---|---|---|---|
| 0 | + | a | b |
| 1 | minus | c | |
| 2 | * | (0) | (1) |
| 3 | = | x | (2) |

**Indirect triples** keep a separate list of pointers to triples, in execution order.

Trade-offs:

- Quadruples use the most space but instructions can be moved freely, because temporaries have names. Good for optimizing compilers.
- Triples save space, but moving an instruction changes its position and breaks every reference to it.
- Indirect triples allow reordering by rearranging only the pointer list, while each triple stays in place. They also let the same triple be shared.

## Static single assignment (SSA)

In SSA form every variable is assigned exactly once in the program text. Each new assignment to `x` creates a new name `x1`, `x2`, and so on, and every use is renamed to the version that reaches it. Where control flow merges and different versions reach, a $\phi$ function picks the right one:

```
      x1 = 1
      if c goto L
      x2 = x1 + 2
L:    x3 = phi(x1, x2)
      y1 = x3 * 2
```

SSA makes def-use chains explicit, which simplifies constant propagation, dead code elimination and register allocation. In straight-line code there are no $\phi$ functions, so the number of SSA names is just the number of assignments plus the number of variables used before being assigned (the incoming values).

## Basic blocks and leaders

A **basic block** is a maximal sequence of consecutive instructions with one entry (the first instruction) and one exit (the last instruction). Control never jumps into the middle of a block and never leaves from the middle.

Finding leaders:

1. The first instruction of the program is a leader.
2. Any instruction that is the target of a jump (conditional or unconditional) is a leader.
3. Any instruction that immediately follows a jump (conditional or unconditional) is a leader.

Each block runs from one leader up to, but not including, the next leader. The number of basic blocks equals the number of leaders.

The **control flow graph** has one node per block and an edge $B_i \to B_j$ if $B_j$ can run immediately after $B_i$: either $B_i$ ends with a jump to $B_j$'s leader, or $B_j$ follows $B_i$ in order and $B_i$ does not end with an unconditional jump.

## Worked examples

### Worked example 1: Leaders and blocks

```
1  sum = 0
2  i = 0
3  if i >= n goto 9
4  t1 = 4 * i
5  t2 = A[t1]
6  sum = sum + t2
7  i = i + 1
8  goto 3
9  return sum
```

- Rule 1: instruction 1.
- Rule 2: targets 9 and 3.
- Rule 3: instruction 4 (after the jump at 3) and 9 (after the jump at 8).

Leaders: 1, 3, 4, 9. Blocks: $B_1 = \{1, 2\}$, $B_2 = \{3\}$, $B_3 = \{4, \ldots, 8\}$, $B_4 = \{9\}$. CFG edges: $B_1 \to B_2$, $B_2 \to B_3$, $B_2 \to B_4$, $B_3 \to B_2$. Four blocks and four edges.

### Worked example 2: DAG of a basic block

```
t1 = a + b
t2 = c * t1
t3 = a + b
t4 = t2 - t3
a  = t4 * t3
t5 = a + b
```

Build node by node, tracking which node each name currently points to:

1. Leaves $a_0$, $b_0$. Node $n_1 = a_0 + b_0$, labelled `t1`.
2. Leaf $c_0$. Node $n_2 = c_0 * n_1$, labelled `t2`.
3. $a_0 + b_0$ already exists as $n_1$. Attach `t3` to $n_1$. No new node.
4. $n_3 = n_2 - n_1$, labelled `t4`.
5. $n_4 = n_3 * n_1$, labelled `a`. Now `a` refers to $n_4$, not the leaf.
6. `a + b` is now $n_4 + b_0$, which is new: $n_5$, labelled `t5`.

Total nodes: 3 leaves and 5 interior nodes, so 8. The trap is step 6: because `a` was redefined, `a + b` is not the same as `t1`.

### Worked example 3: Two-dimensional array access

`x = A[i][j]` where `A` is `int A[10][20]`, 4-byte ints, row major, zero-based.

```
t1 = i * 20
t2 = t1 + j
t3 = t2 * 4
t4 = A[t3]
x  = t4
```

The offset of `A[2][3]` is $(2 \times 20 + 3) \times 4 = 172$ bytes from the base.

### Worked example 4: Counting SSA names

```
a = x + y
b = a * 2
a = b - x
c = a + b
```

SSA form: `a1 = x0 + y0`, `b1 = a1 * 2`, `a2 = b1 - x0`, `c1 = a2 + b1`. Names: four assigned versions (`a1`, `b1`, `a2`, `c1`) plus two incoming values (`x0`, `y0`). Total 6. Always check whether the question counts incoming values.

## Common traps

- Treating `a + b` after `a` is reassigned as a common subexpression. In a DAG, a reassignment moves the label, so the expression gets a new node.
- Forgetting rule 3 for leaders: the instruction right after a conditional jump is a leader.
- Thinking triples have a result field. They refer to results by position.
- Saying indirect triples save space over quadruples in every case. Their real advantage is easy reordering.
- Adding $\phi$ functions in straight-line code. They appear only at merge points.
- Using one-based indices in the address formula when the array is zero-based, or the reverse.

## Quick revision

- IR choices: syntax tree, DAG, postfix, three-address code, SSA.
- DAG = syntax tree with shared common subexpressions; check $(op, l, r)$ before creating a node.
- Three-address code: at most one operator on the right side.
- Quadruples: op, arg1, arg2, result. Triples: op, arg1, arg2 with positional references. Indirect triples: list of pointers to triples.
- SSA: one assignment per name; $\phi$ at merge points.
- Leaders: first instruction, jump targets, instructions after jumps. Blocks = leaders.
- Row-major address: $\text{base} + (i \cdot n_2 + j) \cdot w$.
