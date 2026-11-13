---
title: "Parsing"
summary: "FIRST and FOLLOW sets, LL(1) tables, LR(0), SLR, LALR and CLR item sets, conflict rules and the power hierarchy of parsers."
order: 2
sources:
  - title: "LL parser (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/LL_parser"
  - title: "LR parser (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/LR_parser"
  - title: "LALR parser (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/LALR_parser"
  - title: "GATE Overflow: parsing questions"
    url: "https://gateoverflow.in/tag/parsing"
---

## What a parser decides

The parser takes the token stream and checks it against a context-free grammar. It either builds a parse tree (explicitly or implicitly through semantic actions) or reports a syntax error.

There are two families:

- **Top-down** parsers build the tree from the root, producing a leftmost derivation. Recursive descent and LL(1) are top-down.
- **Bottom-up** parsers build the tree from the leaves, producing a rightmost derivation in reverse. LR(0), SLR(1), LALR(1) and CLR(1) are bottom-up, as is operator precedence parsing.

A grammar is **ambiguous** if some string has two different parse trees (equivalently, two leftmost derivations). No ambiguous grammar is LL(k) or LR(k) for any $k$. Deciding whether an arbitrary CFG is ambiguous is undecidable.

## Preparing a grammar for top-down parsing

### Left recursion

A rule like $A \to A\alpha \mid \beta$ sends a top-down parser into an infinite loop. Replace it with

$$A \to \beta A' \qquad A' \to \alpha A' \mid \varepsilon$$

With several alternatives, $A \to A\alpha_1 \mid A\alpha_2 \mid \beta_1 \mid \beta_2$ becomes $A \to \beta_1 A' \mid \beta_2 A'$ and $A' \to \alpha_1 A' \mid \alpha_2 A' \mid \varepsilon$. Indirect left recursion ($A \to B x$, $B \to A y$) needs substitution first.

### Left factoring

If two alternatives share a prefix, $A \to \alpha\beta_1 \mid \alpha\beta_2$, a predictive parser cannot choose. Factor it: $A \to \alpha A'$, $A' \to \beta_1 \mid \beta_2$. Removing left recursion and left factoring are necessary but not sufficient for LL(1).

## FIRST and FOLLOW

$\text{FIRST}(\alpha)$ is the set of terminals that can begin a string derived from $\alpha$, plus $\varepsilon$ if $\alpha \Rightarrow^* \varepsilon$.

Rules for $\text{FIRST}(X)$:

1. If $X$ is a terminal, $\text{FIRST}(X) = \{X\}$.
2. If $X \to \varepsilon$, add $\varepsilon$.
3. If $X \to Y_1 Y_2 \cdots Y_k$, add $\text{FIRST}(Y_1) - \{\varepsilon\}$. If $Y_1$ can vanish, also add $\text{FIRST}(Y_2) - \{\varepsilon\}$, and so on. If every $Y_i$ can vanish, add $\varepsilon$.

$\text{FOLLOW}(A)$ is the set of terminals that can appear immediately to the right of $A$ in some sentential form. It never contains $\varepsilon$.

Rules for FOLLOW:

1. Put the end marker in $\text{FOLLOW}(S)$ for the start symbol $S$. In these notes the end marker is written $\text{\textdollar}$.
2. For $B \to \alpha A \beta$, add $\text{FIRST}(\beta) - \{\varepsilon\}$ to $\text{FOLLOW}(A)$.
3. For $B \to \alpha A$, or $B \to \alpha A \beta$ where $\beta \Rightarrow^* \varepsilon$, add all of $\text{FOLLOW}(B)$ to $\text{FOLLOW}(A)$.

Repeat until nothing changes. Rule 3 is where most mistakes happen: you must revisit it after other FOLLOW sets grow.

## LL(1) parsing table

For each production $A \to \alpha$:

- For each terminal $a$ in $\text{FIRST}(\alpha)$, put $A \to \alpha$ in $M[A, a]$.
- If $\varepsilon \in \text{FIRST}(\alpha)$, put $A \to \alpha$ in $M[A, b]$ for every $b \in \text{FOLLOW}(A)$, including the end marker.

The grammar is LL(1) exactly when no cell gets two productions. Equivalent test: for every pair of alternatives $A \to \alpha \mid \beta$,

1. $\text{FIRST}(\alpha) \cap \text{FIRST}(\beta) = \emptyset$;
2. at most one of $\alpha$, $\beta$ derives $\varepsilon$;
3. if $\beta \Rightarrow^* \varepsilon$ then $\text{FIRST}(\alpha) \cap \text{FOLLOW}(A) = \emptyset$.

Every left-recursive grammar and every ambiguous grammar fails this test.

## Bottom-up parsing and handles

A shift-reduce parser keeps a stack. It **shifts** input tokens onto the stack and **reduces** when the top of the stack matches the right side of a production that is a handle. A handle is the right side of the production used in the last step of a rightmost derivation of the current sentential form. Reducing handles in order gives the rightmost derivation in reverse.

The two conflicts:

- **Shift-reduce (S/R):** the parser cannot decide whether to shift or reduce.
- **Reduce-reduce (R/R):** two different reductions are possible.

## LR(0) items and the canonical collection

An LR(0) item is a production with a dot in its right side, such as $A \to X \cdot Y Z$. The dot marks how much of the production has been seen. $A \to \varepsilon$ has one item, $A \to \cdot$.

Build the automaton:

1. Augment the grammar with $S' \to S$. The start state is $\text{closure}(\{S' \to \cdot S\})$.
2. **Closure:** if $A \to \alpha \cdot B \beta$ is in the set, add $B \to \cdot\gamma$ for every production of $B$. Repeat.
3. **Goto:** $\text{goto}(I, X)$ is the closure of all items $A \to \alpha X \cdot \beta$ for $A \to \alpha \cdot X \beta$ in $I$.
4. Keep applying goto on every grammar symbol until no new sets appear.

When GATE asks for "the number of states", it means the number of item sets in this collection, including the start state. The state containing $S' \to S\cdot$ counts as a normal state.

## Conflict rules for each LR method

Suppose a state contains a complete item $A \to \alpha\cdot$.

| Method | Reduce by $A \to \alpha$ on | S/R conflict when | R/R conflict when |
|---|---|---|---|
| LR(0) | every terminal | the state also has any shift item | two complete items in one state |
| SLR(1) | terminals in $\text{FOLLOW}(A)$ | a shift terminal is in $\text{FOLLOW}(A)$ | two complete items with overlapping FOLLOW sets |
| CLR(1) | the item's own lookahead set | a shift terminal is in that lookahead set | two complete items share a lookahead |
| LALR(1) | lookaheads after merging same-core states | same as CLR, after merging | same as CLR, after merging |

**LR(1) items** carry a lookahead: $[A \to \alpha \cdot B \beta, a]$. The closure adds $[B \to \cdot\gamma, b]$ for each $b \in \text{FIRST}(\beta a)$.

**LALR(1)** takes the CLR(1) states and merges any states with the same core (same items ignoring lookaheads). Facts used constantly in GATE:

- The number of LALR(1) states equals the number of SLR(1) states, which equals the number of LR(0) states.
- CLR(1) can have more states than LALR(1).
- Merging can never create a new S/R conflict, because the shift actions depend only on the core. It can create a new R/R conflict.

## Power hierarchy

For grammars:

$$\text{LR}(0) \subset \text{SLR}(1) \subset \text{LALR}(1) \subset \text{LR}(1)$$

All inclusions are strict. Also every LL(1) grammar is LR(1), but an LL(1) grammar need not be LALR(1) or SLR(1). LL(1) and LALR(1) are incomparable. Operator precedence parsers handle only operator grammars (no $\varepsilon$ productions and no two adjacent nonterminals on any right side), and they can even work with some ambiguous grammars by using precedence and associativity.

For languages, LR(1) grammars generate exactly the deterministic context-free languages. LR(0) grammars generate deterministic languages with the prefix property.

## Worked examples

### Worked example 1: FIRST, FOLLOW and LL(1) table

Grammar (the expression grammar with left recursion removed):

```
E -> T R
R -> + T R | eps
T -> F Y
Y -> * F Y | eps
F -> ( E ) | id
```

FIRST sets: $\text{FIRST}(F) = \text{FIRST}(T) = \text{FIRST}(E) = \{(, \text{id}\}$, $\text{FIRST}(R) = \{+, \varepsilon\}$, $\text{FIRST}(Y) = \{*, \varepsilon\}$.

FOLLOW sets:

- $\text{FOLLOW}(E) = \{), \text{\textdollar}\}$ from $F \to (E)$ and the start rule.
- $\text{FOLLOW}(R) = \text{FOLLOW}(E) = \{), \text{\textdollar}\}$ since $R$ ends the rules for $E$ and $R$.
- $\text{FOLLOW}(T) = (\text{FIRST}(R) - \{\varepsilon\}) \cup \text{FOLLOW}(E) \cup \text{FOLLOW}(R) = \{+, ), \text{\textdollar}\}$.
- $\text{FOLLOW}(Y) = \text{FOLLOW}(T) = \{+, ), \text{\textdollar}\}$.
- $\text{FOLLOW}(F) = \{*\} \cup \text{FOLLOW}(T) = \{*, +, ), \text{\textdollar}\}$.

Table (blank cells are errors):

```
      id        +          *          (         )        $
E   E->T R                          E->T R
R             R->+ T R                        R->eps   R->eps
T   T->F Y                          T->F Y
Y             Y->eps     Y->* F Y             Y->eps   Y->eps
F   F->id                           F->( E )
```

No cell has two entries, so the grammar is LL(1). There are 13 non-empty cells.

### Worked example 2: Counting LR(0) states

Grammar:

```
S -> ( L ) | x
L -> L , S | S
```

Augment with $S' \to S$.

| State | Items | Reached by |
|---|---|---|
| I0 | $S' \to \cdot S$, $S \to \cdot (L)$, $S \to \cdot x$ | start |
| I1 | $S' \to S \cdot$ | I0 on S |
| I2 | $S \to (\cdot L)$, $L \to \cdot L , S$, $L \to \cdot S$, $S \to \cdot (L)$, $S \to \cdot x$ | I0, I2, I7 on ( |
| I3 | $S \to x \cdot$ | I0, I2, I7 on x |
| I4 | $S \to (L \cdot)$, $L \to L \cdot , S$ | I2 on L |
| I5 | $L \to S \cdot$ | I2 on S |
| I6 | $S \to (L) \cdot$ | I4 on ) |
| I7 | $L \to L , \cdot S$, $S \to \cdot (L)$, $S \to \cdot x$ | I4 on , |
| I8 | $L \to L , S \cdot$ | I7 on S |

Total: 9 states. No state mixes a complete item with a shift item or with another complete item, so the grammar is LR(0). It is not LL(1) because $L$ is left recursive.

### Worked example 3: SLR conflict that LALR removes

Grammar:

```
S -> A a | b A c | d c | b d a
A -> d
```

After reading `b d`, the LR(0) state is $\{A \to d\cdot,\ S \to b d \cdot a\}$. $\text{FOLLOW}(A) = \{a, c\}$ contains $a$, which is also a shift symbol. SLR(1) has a shift-reduce conflict on $a$.

With LR(1) lookaheads, the item $A \to d\cdot$ in this state was created from $S \to b \cdot A c$, so its lookahead is only $c$. Reduce on $c$, shift on $a$: no conflict. The same thing happens in the state after reading `d` from the start (lookahead $a$ for the reduction, shift on $c$). No two CLR states share a core here, so LALR(1) has the same 11 states as CLR(1) and is conflict free. The grammar is LALR(1) but not SLR(1).

### Worked example 4: Merge that creates a reduce-reduce conflict

Grammar:

```
S -> a A d | b B d | a B e | b A e
A -> c
B -> c
```

In CLR(1), after `a c` the state is $\{[A \to c\cdot, d],\ [B \to c\cdot, e]\}$, and after `b c` it is $\{[A \to c\cdot, e],\ [B \to c\cdot, d]\}$. Each state alone is fine, so the grammar is CLR(1) with 14 states.

The two states have the same core. LALR merges them into $\{[A \to c\cdot, d/e],\ [B \to c\cdot, d/e]\}$, which has a reduce-reduce conflict on both $d$ and $e$. LALR(1) has 13 states and is not conflict free. The grammar is LR(1) but not LALR(1).

### Worked example 5: Counting reductions

Using $E \to E + T \mid T$, $T \to T * F \mid F$, $F \to \text{id}$, count the reductions an LR parser makes on `id + id * id + id`.

- First `id`: $F \to \text{id}$, $T \to F$, $E \to T$ (3).
- Second `id`: $F \to \text{id}$, $T \to F$ (2). The parser does not reduce $E + T$ yet because the next token is `*`.
- Third `id`: $F \to \text{id}$, $T \to T * F$ (2), then $E \to E + T$ (1).
- Fourth `id`: $F \to \text{id}$, $T \to F$ (2), then $E \to E + T$ (1).

Total: 11 reductions. The number of reductions equals the number of interior nodes of the parse tree.

## Common traps

- Adding $\varepsilon$ to a FOLLOW set. FOLLOW contains terminals and the end marker only.
- Forgetting rule 3 for FOLLOW when the symbol after $A$ can derive $\varepsilon$.
- Thinking left factoring plus left-recursion removal guarantees LL(1). It does not.
- Assuming LL(1) implies LALR(1). It only implies LR(1).
- Saying LALR merging can introduce shift-reduce conflicts. Only reduce-reduce.
- Counting the states of the CLR(1) automaton when the question asks about LALR or SLR. Those two have the LR(0) count.
- Forgetting to count I0 or the accept state when counting LR(0) states.
- Reporting an LR(0) conflict for $S' \to S\cdot$ together with a shift item. Accepting on the end marker is not a conflict in the usual convention.

## Quick revision

- Top-down: leftmost derivation. Bottom-up: rightmost derivation in reverse.
- LL(1) cell rule: FIRST of the right side, plus FOLLOW of the left side if the right side can vanish.
- Ambiguous or left-recursive grammars are never LL(1); ambiguous grammars are never LR(k).
- LR(0) reduces on every symbol, SLR on FOLLOW, CLR on item lookaheads, LALR on merged lookaheads.
- States: LR(0) = SLR = LALR $\le$ CLR.
- $\text{LR}(0) \subset \text{SLR} \subset \text{LALR} \subset \text{CLR}$ for grammars; LL(1) is inside LR(1) only.
- Merging CLR states can only add R/R conflicts.
- Number of reductions in a bottom-up parse = number of interior nodes in the parse tree.
