---
title: "Boolean algebra and minimization"
summary: "Boolean laws, canonical forms, counting Boolean functions, Karnaugh maps, the Quine-McCluskey method and functional completeness, with GATE-style worked problems."
order: 1
sources:
  - title: "Boolean algebra (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Boolean_algebra"
  - title: "Karnaugh map (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Karnaugh_map"
  - title: "Quine-McCluskey algorithm (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Quine%E2%80%93McCluskey_algorithm"
  - title: "GATE Overflow: k-map questions"
    url: "https://gateoverflow.in/tag/k-map"
---

## What GATE asks from this topic

Almost every GATE CS paper has one or two questions here. The common forms are: simplify an expression, find the minimal SOP or POS of a function given as a list of minterms (often with don't-cares), count prime implicants or essential prime implicants, check whether two expressions are equal, and count Boolean functions with some property. All of them reward a fast, careful K-map and a solid grip on a handful of laws.

## Boolean algebra basics

A Boolean variable takes values 0 or 1. The operations are AND ($xy$), OR ($x + y$) and NOT ($\overline{x}$). Precedence: NOT, then AND, then OR.

### Laws you must know cold

| Law | AND form | OR form |
|---|---|---|
| Identity | $x \cdot 1 = x$ | $x + 0 = x$ |
| Null | $x \cdot 0 = 0$ | $x + 1 = 1$ |
| Idempotent | $xx = x$ | $x + x = x$ |
| Complement | $x\overline{x} = 0$ | $x + \overline{x} = 1$ |
| Absorption | $x(x + y) = x$ | $x + xy = x$ |
| Redundant literal | $x(\overline{x} + y) = xy$ | $x + \overline{x}y = x + y$ |
| Distributive | $x(y + z) = xy + xz$ | $x + yz = (x + y)(x + z)$ |
| De Morgan | $\overline{xy} = \overline{x} + \overline{y}$ | $\overline{x + y} = \overline{x}\,\overline{y}$ |
| Consensus | $(x+y)(\overline{x}+z)(y+z) = (x+y)(\overline{x}+z)$ | $xy + \overline{x}z + yz = xy + \overline{x}z$ |

The second distributive law ($x + yz = (x+y)(x+z)$) has no counterpart in ordinary arithmetic, and it is the one students forget.

**Consensus.** In $xy + \overline{x}z$, the variable $x$ appears in true form in one term and complemented in the other. The consensus term is the product of the rest, $yz$. It is always redundant. The same idea in a K-map: $yz$ is a group that straddles the two groups $xy$ and $\overline{x}z$ and covers nothing new.

### Duality

The dual of an expression swaps AND with OR and swaps 0 with 1, leaving literals alone. If an identity holds, its dual also holds. Do not confuse the dual with the complement: the complement also inverts every literal (De Morgan). For example, the dual of $x + \overline{y}z$ is $x(\overline{y} + z)$, and the complement is $\overline{x}(y + \overline{z})$.

A function is **self-dual** if $f^d = f$, which is the same as $f(\overline{x_1}, \ldots, \overline{x_n}) = \overline{f(x_1, \ldots, x_n)}$. The majority function $xy + yz + zx$ and $x \oplus y \oplus z$ are self-dual.

### XOR identities

$x \oplus y = x\overline{y} + \overline{x}y$, and XNOR is its complement. Useful facts: XOR is associative and commutative, $x \oplus 0 = x$, $x \oplus 1 = \overline{x}$, $x \oplus x = 0$, and $x \oplus y \oplus xy = x + y$. A chain $x_1 \oplus \cdots \oplus x_n$ is 1 exactly when an odd number of inputs are 1.

## Canonical forms

A **minterm** of $n$ variables is a product containing every variable once, true or complemented; it is 1 for exactly one input. A **maxterm** is a sum containing every variable once; it is 0 for exactly one input.

- Sum of minterms: $F = \Sigma m(\ldots)$ lists the inputs where $F = 1$.
- Product of maxterms: $F = \Pi M(\ldots)$ lists the inputs where $F = 0$.

The two lists are complementary: $\Sigma m(1,2,6,7) = \Pi M(0,3,4,5)$ for three variables. The complement $\overline{F}$ is $\Sigma m$ of the indices missing from $F$.

Index convention: with variables $A, B, C, D$, the minterm index is $8A + 4B + 2C + D$, so $A$ is the most significant bit. Always check which variable the question treats as the MSB.

## Counting Boolean functions

These come up as 1-mark numerical questions. For $n$ variables there are $2^n$ input rows.

| Kind of function | Count |
|---|---|
| All functions | $2^{2^n}$ |
| Self-dual | $2^{2^{n-1}}$ (inputs pair up with their complements) |
| Symmetric (depends only on number of 1s) | $2^{n+1}$ |
| Neutral (equal number of 0s and 1s) | $\binom{2^n}{2^{n-1}}$ |
| Functions with $f(0,\ldots,0) = 0$ | $2^{2^n - 1}$ |

The reasoning is always the same: identify which rows are forced to agree, count the free rows $k$, answer $2^k$.

## Karnaugh maps

A K-map arranges the truth table so that cells next to each other differ in exactly one variable. Rows and columns follow Gray code order: 00, 01, 11, 10. The map wraps around: the left and right edges are adjacent, the top and bottom edges are adjacent, and in a 4-variable map the four corners form one group.

### Groups and what they mean

A group must be a rectangle of $2^k$ cells, all 1 (or don't-care). A group of $2^k$ cells in an $n$-variable map is a product term with $n - k$ literals. Bigger groups mean fewer literals.

- **Implicant**: any valid group (product term that implies $F$).
- **Prime implicant (PI)**: a group that cannot be enlarged.
- **Essential prime implicant (EPI)**: a PI that covers at least one 1-cell no other PI covers. Every minimal SOP contains every EPI.

### Procedure for minimal SOP

1. Plot the 1s and don't-cares.
2. Find all prime implicants. Start with the largest possible groups.
3. Mark the essential ones: look for 1-cells that sit in only one PI.
4. Cover the remaining 1s with as few PIs as possible, and among equal counts, the fewest literals.

Don't-cares ($d$ or $X$) can be included in a group when it helps make the group larger, and ignored otherwise. A PI that covers only don't-cares is never used. When counting prime implicants, GATE answers normally count PIs that cover at least one real 1; if a question is ambiguous, this is the reading to use.

### Minimal POS

Group the 0s instead of the 1s. This gives a minimal SOP for $\overline{F}$. Apply De Morgan to get the POS for $F$: each product term in $\overline{F}$ becomes a sum term with every literal complemented. The literal count of the minimal POS equals the literal count of the minimal SOP of $\overline{F}$.

### Cyclic maps

Some functions have no essential prime implicant at all: every 1-cell lies in exactly two PIs, arranged in a ring. $\Sigma m(1,2,3,4,5,6)$ on three variables is the standard example: six PIs, no EPIs, and two different minimal covers of three terms each. A question that asks "how many minimal SOP expressions" usually has a cyclic map underneath.

## The Quine-McCluskey (tabular) method

This is the K-map process done as a table, and it works for any number of variables.

1. Write each minterm (and don't-care) in binary. Group them by the number of 1s.
2. Compare each term in group $i$ with each term in group $i+1$. If they differ in exactly one bit, combine them, writing a dash in that bit, and tick both. Two terms with dashes can combine only if the dashes are in the same positions and exactly one other bit differs.
3. Repeat on the new list until nothing combines. Unticked terms are the prime implicants.
4. Build the prime implicant chart: rows are PIs, columns are the real minterms (not don't-cares). A column with a single mark gives an EPI.
5. Remove EPIs and the columns they cover. Use row dominance, column dominance or Petrick's method on what is left.

The tabular method is slow by hand, so GATE tests it through its rules, for example which pairs of implicants can be merged.

## Functional completeness

A set of operations is functionally complete if every Boolean function can be built from it. Quick tests:

- NAND alone and NOR alone are complete.
- $\{\text{AND}, \text{NOT}\}$ and $\{\text{OR}, \text{NOT}\}$ are complete (De Morgan gives the missing one).
- A set fails if all of its operations preserve 0 (output 0 on all-zero input), or all preserve 1, or all are monotone, or all are linear (XOR form), or all are self-dual. These are Post's five conditions. A set is complete exactly when it escapes all five.

For example $\{\text{AND}, \text{XOR}\}$ preserves 0 and is not complete, but $\{\text{AND}, \text{XOR}, 1\}$ is, since $x \oplus 1 = \overline{x}$. Implication with constant 0 is complete because $x \rightarrow 0 = \overline{x}$ and $\overline{x} \rightarrow y = x + y$.

## Worked examples

### Worked example 1: Algebraic simplification

Simplify $F = (A + B)(A + \overline{B})(\overline{A} + C)$.

**Solution.** By the second distributive law, $(A + B)(A + \overline{B}) = A + B\overline{B} = A$. Then $F = A(\overline{A} + C) = A\overline{A} + AC = AC$.

Check one row: $A = 1, B = 0, C = 0$ gives $(1)(1)(0) = 0$ in the original and $AC = 0$. Good.

### Worked example 2: K-map with don't-cares

Find the minimal SOP and minimal POS of $F(A,B,C,D) = \Sigma m(1,3,5,7,9) + d(6,12,13)$.

**Solution.** The map (rows $AB$, columns $CD$):

| $AB \backslash CD$ | 00 | 01 | 11 | 10 |
|---|---|---|---|---|
| 00 | 0 | 1 | 1 | 0 |
| 01 | 0 | 1 | 1 | X |
| 11 | X | X | 0 | 0 |
| 10 | 0 | 1 | 0 | 0 |

- $\overline{A}D$ covers 1, 3, 5, 7. It is the only PI covering 3 and 7, so it is essential.
- $\overline{C}D$ covers 1, 5, 9, 13 (13 is a don't-care). It is the only PI covering 9, so it is essential.

All 1s are covered. Minimal SOP: $F = \overline{A}D + \overline{C}D$, 4 literals.

For the POS, group the 0s (using don't-cares where they help): the 0s are 0, 2, 4, 8, 10, 11, 14, 15. $\overline{D}$ covers every even cell (0, 2, 4, 8, 10, 14, using don't-cares 6 and 12). $AC$ covers 10, 11, 14, 15. So $\overline{F} = \overline{D} + AC$ and $F = D(\overline{A} + \overline{C})$, 3 literals. Here the POS is cheaper than the SOP, which happens often enough that GATE asks for both.

Note that the don't-cares were assigned differently for the SOP (13 treated as 1) and the POS (12 and 6 treated as 0). That is allowed: each minimal form uses the assignment that suits it, but the two forms may then disagree on don't-care inputs.

### Worked example 3: Counting PIs and EPIs

For $F(A,B,C,D) = \Sigma m(0,1,2,5,6,7,8,9,10,14)$, find the number of prime implicants, the essential ones, and the minimal SOP.

**Solution.**

| $AB \backslash CD$ | 00 | 01 | 11 | 10 |
|---|---|---|---|---|
| 00 | 1 | 1 | 0 | 1 |
| 01 | 0 | 1 | 1 | 1 |
| 11 | 0 | 0 | 0 | 1 |
| 10 | 1 | 1 | 0 | 1 |

Prime implicants:

| PI | Minterms |
|---|---|
| $\overline{B}\,\overline{C}$ | 0, 1, 8, 9 |
| $\overline{B}\,\overline{D}$ | 0, 2, 8, 10 (four corners) |
| $C\overline{D}$ | 2, 6, 10, 14 |
| $\overline{A}\,\overline{C}D$ | 1, 5 |
| $\overline{A}BD$ | 5, 7 |
| $\overline{A}BC$ | 6, 7 |

That is 6 PIs. Minterm 9 is only in $\overline{B}\,\overline{C}$, and minterm 14 is only in $C\overline{D}$, so these two are essential. Minterms 0, 2, 8, 10 also lie in $\overline{B}\,\overline{D}$, but they are already covered, so that PI is not needed.

After the EPIs, minterms 5 and 7 remain. The single PI $\overline{A}BD$ covers both. Minimal SOP:

$$F = \overline{B}\,\overline{C} + C\overline{D} + \overline{A}BD$$

Answer: 6 PIs, 2 EPIs, 3 terms with 7 literals. Note that $\overline{B}\,\overline{D}$ is a 4-cell prime implicant that is not in the minimal cover. Big does not mean necessary.

### Worked example 4: Equality by consensus

Is $AB + \overline{A}C + BC\overline{D} = AB + \overline{A}C$?

**Solution.** The consensus of $AB$ and $\overline{A}C$ is $BC$. Since $BC$ is redundant, so is anything it contains: $BC\overline{D} \le BC$, so $BC\overline{D}$ is covered whenever it is 1 (if $B = C = 1$, then either $A = 1$ making $AB = 1$, or $A = 0$ making $\overline{A}C = 1$). The identity holds.

### Worked example 5: Self-dual count with a constraint

How many self-dual functions $f(A,B,C)$ satisfy $f(0,0,0) = 0$?

**Solution.** Inputs pair as (000,111), (001,110), (010,101), (011,100). Self-duality makes each pair carry complementary outputs, so there are 4 free bits. Fixing $f(000) = 0$ uses up the first pair's choice ($f(111)$ must be 1). Free bits left: 3. Answer: $2^3 = 8$.

## Common traps

- Forgetting that K-map edges wrap, especially the four corners in a 4-variable map.
- Writing K-map rows in binary order (00, 01, 10, 11) instead of Gray order. The groups then look wrong.
- Using a don't-care-only group in the final answer, or counting it as a needed term.
- Assuming the largest group is always in the minimal cover. Worked example 3 shows a 4-cell PI that is redundant.
- Mixing up the dual and the complement.
- Reading the minimal POS literal count off the SOP map. Group the 0s separately.
- Getting the MSB wrong when a question names variables in an unusual order, for example $F(D,C,B,A)$.
- In the tabular method, merging terms whose dashes are in different positions.
- Saying $\{\text{AND}, \text{OR}\}$ is complete. Without NOT (or a non-monotone gate) it is not.

## Quick revision

- Key laws: $x + \overline{x}y = x + y$; $x + yz = (x+y)(x+z)$; consensus $xy + \overline{x}z + yz = xy + \overline{x}z$.
- Dual: swap AND/OR and 0/1. Complement: dual plus invert every literal.
- $n$ variables: $2^{2^n}$ functions, $2^{2^{n-1}}$ self-dual, $2^{n+1}$ symmetric.
- A $2^k$-cell group in an $n$-variable map has $n - k$ literals.
- PI: cannot grow. EPI: only PI covering some 1-cell. Minimal SOP = all EPIs plus the cheapest cover of the rest.
- Minimal POS: group the 0s, then De Morgan.
- Cyclic maps have zero EPIs and more than one minimal cover.
- Tabular method: combine terms differing in one bit with dashes aligned; unticked terms are PIs.
- Complete sets: {NAND}, {NOR}, {AND, NOT}, {OR, NOT}, {AND, XOR, 1}, {implication, 0}.
