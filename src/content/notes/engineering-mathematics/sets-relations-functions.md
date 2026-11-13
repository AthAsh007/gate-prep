---
title: "Sets, relations, functions, partial orders and lattices"
summary: "Set identities, properties and counts of relations, equivalence relations and partitions, function types and their counts, posets, Hasse diagrams and lattices."
order: 2
sources:
  - title: "Equivalence relation (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Equivalence_relation"
  - title: "Partially ordered set (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Partially_ordered_set"
  - title: "Lattice (order) (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Lattice_(order)"
  - title: "GATE Overflow: lattice questions"
    url: "https://gateoverflow.in/tag/lattice"
---

This topic produces counting questions (how many relations have property X, how many onto functions), property checks on a given relation, and questions on posets and lattices. The counting formulas below cover most of them.

## Sets

### Operations and identities

For sets $A, B, C$ inside a universe $U$:

- De Morgan: $\overline{A \cup B} = \bar A \cap \bar B$, $\overline{A \cap B} = \bar A \cup \bar B$.
- Distribution: $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$ and the dual.
- Difference: $A - B = A \cap \bar B$.
- Symmetric difference: $A \oplus B = (A - B) \cup (B - A)$. It is associative and $A \oplus A = \emptyset$.

Sizes:
- $|A \cup B| = |A| + |B| - |A \cap B|$
- $|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |B \cap C| - |A \cap C| + |A \cap B \cap C|$
- $|\mathcal{P}(A)| = 2^{|A|}$, $|A \times B| = |A|\,|B|$.

### Countability

$\mathbb{N}$, $\mathbb{Z}$, $\mathbb{Q}$, the set of all finite strings over a finite alphabet, and a countable union of countable sets are countable. $\mathbb{R}$, $\mathcal{P}(\mathbb{N})$ and the set of all functions $\mathbb{N} \to \{0, 1\}$ are uncountable (Cantor's diagonal argument). This links to theory of computation: there are countably many Turing machines but uncountably many languages.

## Relations

A relation $R$ on a set $A$ is a subset of $A \times A$. With $|A| = n$ there are $n^2$ ordered pairs and $2^{n^2}$ relations.

### Properties

| Property | Definition | In the 0-1 matrix |
|---|---|---|
| Reflexive | $(a,a) \in R$ for all $a$ | diagonal all 1 |
| Irreflexive | $(a,a) \notin R$ for all $a$ | diagonal all 0 |
| Symmetric | $(a,b) \in R \Rightarrow (b,a) \in R$ | matrix equals its transpose |
| Antisymmetric | $(a,b), (b,a) \in R \Rightarrow a = b$ | no off-diagonal pair has both 1 |
| Asymmetric | $(a,b) \in R \Rightarrow (b,a) \notin R$ | antisymmetric and irreflexive |
| Transitive | $(a,b), (b,c) \in R \Rightarrow (a,c) \in R$ | $M^2 \le M$ (Boolean product) |

Symmetric and antisymmetric are not opposites. The empty relation and the identity relation are both. "Not reflexive" is also different from "irreflexive".

### Counting relations on an $n$-element set

The diagonal has $n$ pairs. The off-diagonal has $n^2 - n$ pairs, forming $\binom{n}{2}$ unordered pairs $\{(a,b), (b,a)\}$.

| Relations that are | Count |
|---|---|
| All | $2^{n^2}$ |
| Reflexive | $2^{n^2 - n}$ |
| Irreflexive | $2^{n^2 - n}$ |
| Symmetric | $2^{n}\cdot 2^{\binom{n}{2}} = 2^{n(n+1)/2}$ |
| Reflexive and symmetric | $2^{\binom{n}{2}}$ |
| Antisymmetric | $2^{n}\cdot 3^{\binom{n}{2}}$ |
| Asymmetric | $3^{\binom{n}{2}}$ |
| Both symmetric and antisymmetric | $2^{n}$ (subsets of the diagonal) |

The idea behind every row: decide each diagonal pair independently, then decide each unordered off-diagonal pair. For antisymmetric, each off-diagonal pair has 3 allowed states: neither, only $(a,b)$, only $(b,a)$.

There is no simple closed formula for the number of transitive relations or partial orders. For small $n$, memorise: partial orders on 1, 2, 3, 4 elements number 1, 3, 19, 219.

### Closures

- Reflexive closure: $R \cup \Delta$, where $\Delta$ is the identity relation.
- Symmetric closure: $R \cup R^{-1}$.
- Transitive closure: $R^+ = R \cup R^2 \cup \dots \cup R^n$; computed by Warshall's algorithm in $O(n^3)$.

### Equivalence relations and partitions

An equivalence relation is reflexive, symmetric and transitive. Its classes partition $A$, and every partition comes from exactly one equivalence relation. So

- the number of equivalence relations on $n$ elements is the Bell number $B_n$: $1, 2, 5, 15, 52, 203$ for $n = 1..6$;
- the number with exactly $k$ classes is the Stirling number of the second kind $S(n, k)$, with $S(n, k) = k\,S(n-1, k) + S(n-1, k-1)$.

Useful values: $S(n, 2) = 2^{n-1} - 1$, $S(n, n-1) = \binom{n}{2}$.

The intersection of two equivalence relations is an equivalence relation. The union need not be (transitivity can fail).

## Functions

$f: A \to B$ assigns exactly one element of $B$ to each element of $A$. With $|A| = m$ and $|B| = n$:

| Type | Count |
|---|---|
| All functions | $n^m$ |
| One to one (injective), $m \le n$ | $n(n-1)\cdots(n-m+1) = \frac{n!}{(n-m)!}$ |
| Onto (surjective), $m \ge n$ | $\sum_{k=0}^{n} (-1)^k \binom{n}{k}(n-k)^m = n!\,S(m, n)$ |
| Bijections, $m = n$ | $n!$ |

Composition facts used in "which is always true" questions, for $f: A \to B$, $g: B \to C$:
- $g \circ f$ injective $\Rightarrow$ $f$ injective.
- $g \circ f$ surjective $\Rightarrow$ $g$ surjective.
- Both injective $\Rightarrow$ $g \circ f$ injective; both surjective $\Rightarrow$ $g \circ f$ surjective.

A function has an inverse exactly when it is a bijection.

## Partial orders and lattices

### Posets

A partial order is reflexive, antisymmetric and transitive. A **Hasse diagram** draws only the covering pairs (no loops, no edges implied by transitivity), with larger elements higher.

Terms: **maximal** (nothing strictly above), **greatest** (above everything, unique if it exists), and the duals **minimal** and **least**. A finite poset always has at least one maximal and one minimal element, but may lack a greatest or least one. A **chain** is a totally ordered subset; an **antichain** is a set of pairwise incomparable elements.

A **topological sort** (linear extension) of a finite poset always exists.

### Lattices

A poset is a **lattice** if every pair $a, b$ has a least upper bound $a \lor b$ (join) and a greatest lower bound $a \land b$ (meet). Every finite lattice is bounded: it has a least element $0$ and a greatest element $1$.

- **Distributive:** $a \land (b \lor c) = (a \land b) \lor (a \land c)$ for all elements. A lattice is distributive iff it contains no sublattice isomorphic to $M_3$ (the diamond: 0, three incomparable atoms, 1) or $N_5$ (the pentagon).
- **Complemented:** every $a$ has some $b$ with $a \land b = 0$ and $a \lor b = 1$.
- In a distributive lattice each element has **at most one** complement.
- **Boolean algebra:** a complemented distributive lattice. Every finite Boolean algebra has $2^k$ elements and looks like $\mathcal{P}(\{1, \dots, k\})$.

Standard examples:

| Poset | Lattice? | Notes |
|---|---|---|
| $(\mathcal{P}(S), \subseteq)$ | yes | Boolean algebra, meet $\cap$, join $\cup$ |
| $(D_n, \mid)$, divisors of $n$ | yes | distributive; Boolean iff $n$ is square free |
| Any chain | yes | distributive, complemented only if at most 2 elements |
| $(\mathbb{Z}^+, \mid)$ | yes | meet $\gcd$, join $\operatorname{lcm}$; no greatest element |

## Worked examples

### Worked example 1: Counting antisymmetric relations

How many antisymmetric relations are there on $\{1, 2, 3, 4\}$?

1. Diagonal: 4 pairs, each in or out: $2^4 = 16$.
2. Unordered off-diagonal pairs: $\binom{4}{2} = 6$, each with 3 allowed states: $3^6 = 729$.
3. Total $= 16 \times 729 = 11664$.

### Worked example 2: Onto functions

How many onto functions are there from a 5-element set to a 3-element set?

Inclusion-exclusion over the codomain elements that are missed:
$$3^5 - \binom{3}{1}2^5 + \binom{3}{2}1^5 - 0 = 243 - 96 + 3 = 150.$$
Check: $3!\,S(5, 3) = 6 \times 25 = 150$.

### Worked example 3: Is the relation an equivalence?

On $\mathbb{Z}$, define $a\,R\,b$ iff $a^2 \equiv b^2 \pmod 5$.

- Reflexive and symmetric: clear.
- Transitive: $a^2 \equiv b^2$ and $b^2 \equiv c^2$ give $a^2 \equiv c^2$.

So $R$ is an equivalence relation. Squares mod 5 take values $0, 1, 4$: residue 0 gives 0; residues 1, 4 give 1; residues 2, 3 give 4. So there are 3 classes.

Any relation of the form "$a\,R\,b$ iff $h(a) = h(b)$" is an equivalence relation, with one class per value of $h$ that is actually hit.

### Worked example 4: Complements in a divisor lattice

In $D_{30}$, find the complement of 6. In $D_{12}$, does 2 have a complement?

- $30 = 2 \cdot 3 \cdot 5$ is square free. Complement of 6 is $30/6 = 5$: $\gcd(6, 5) = 1$, $\operatorname{lcm}(6, 5) = 30$.
- In $D_{12}$ we need $\gcd(2, c) = 1$ and $\operatorname{lcm}(2, c) = 12$. The lcm forces $4 \mid c$, which contradicts $\gcd = 1$. So 2 has no complement, and $D_{12}$ is not a Boolean algebra.

### Worked example 5: Is this poset a lattice?

Poset on $\{a, b, c, d\}$ with $a < c$, $a < d$, $b < c$, $b < d$, and no other strict relations.

Upper bounds of $\{a, b\}$ are $c$ and $d$, which are incomparable, so there is no least upper bound. Not a lattice. This "bowtie" shape is the smallest example where pairs have upper bounds but no join.

## Common traps

- Confusing symmetric and antisymmetric as opposites.
- Forgetting that divisibility on all nonzero integers is not antisymmetric ($2 \mid -2$ and $-2 \mid 2$).
- Using $2^{n(n-1)/2}$ for symmetric relations. That count is for reflexive and symmetric; plain symmetric is $2^{n(n+1)/2}$.
- Counting onto functions as $n^m - n$ or similar. Use inclusion-exclusion.
- Assuming a complemented lattice is distributive. The diamond $M_3$ is complemented but not distributive, and its atoms have two complements each.
- Mixing up maximal and greatest. A poset can have several maximal elements and no greatest one.
- Assuming the union of two equivalence relations is an equivalence relation.

## Quick revision

- Relations on $n$ elements: $2^{n^2}$. Reflexive: $2^{n^2 - n}$. Symmetric: $2^{n(n+1)/2}$.
- Reflexive and symmetric: $2^{n(n-1)/2}$. Antisymmetric: $2^n 3^{n(n-1)/2}$. Asymmetric: $3^{n(n-1)/2}$.
- Equivalence relations: Bell numbers $1, 2, 5, 15, 52, 203$. With $k$ classes: $S(n, k)$.
- Functions $m \to n$: $n^m$. Injective: $n!/(n-m)!$. Onto: $n!\,S(m, n)$.
- Partial orders on 3 elements: 19.
- $g \circ f$ injective forces $f$ injective; $g \circ f$ onto forces $g$ onto.
- Lattice: every pair has join and meet. Distributive iff no $M_3$ or $N_5$ sublattice.
- $D_n$ is Boolean iff $n$ is square free.
- Boolean algebra = complemented + distributive; finite ones have $2^k$ elements.
