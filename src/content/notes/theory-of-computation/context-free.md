---
title: "Context-free grammars and PDAs"
summary: "Context-free grammars, derivations and ambiguity, Chomsky and Greibach normal forms, pushdown automata, deterministic CFLs, and how to decide whether a language is context-free."
order: 2
sources:
  - title: "Wikipedia: Context-free grammar"
    url: "https://en.wikipedia.org/wiki/Context-free_grammar"
  - title: "Wikipedia: Pushdown automaton"
    url: "https://en.wikipedia.org/wiki/Pushdown_automaton"
  - title: "GATE Overflow: context-free-language tag"
    url: "https://gateoverflow.in/tag/context-free-language"
---

## Where this fits

Context-free languages (CFLs) sit one level above the regular languages. A finite automaton has bounded memory; a pushdown automaton adds one stack, which is exactly enough to match nested pairs such as brackets, $a^n b^n$, or a string against its reverse. GATE questions here usually ask you to identify which languages are CFL, which are deterministic CFL, whether a grammar is ambiguous, or what a grammar or PDA generates.

## Context-free grammars

A CFG is a 4-tuple $G = (V, T, P, S)$:

- $V$: variables (non-terminals)
- $T$: terminals, disjoint from $V$
- $P$: productions of the form $A \to \alpha$, where $A \in V$ and $\alpha \in (V \cup T)^*$
- $S \in V$: start symbol

"Context-free" means the left side is a single variable, so a variable can be rewritten regardless of what surrounds it. $L(G) = \{w \in T^* : S \Rightarrow^* w\}$.

### Derivations and parse trees

A **leftmost derivation** always rewrites the leftmost variable; a **rightmost derivation** always rewrites the rightmost. Each parse tree corresponds to exactly one leftmost derivation and exactly one rightmost derivation. So the following say the same thing about a string $w$:

- $w$ has two different parse trees
- $w$ has two different leftmost derivations
- $w$ has two different rightmost derivations

Two derivations that differ only in the order of rewriting but build the same tree do **not** show ambiguity.

### Ambiguity

A grammar is **ambiguous** if some string in its language has two parse trees. A language is **inherently ambiguous** if every grammar for it is ambiguous. The standard example is

$$\{a^i b^j c^k : i = j \text{ or } j = k\}$$

because strings $a^n b^n c^n$ can be produced through either half of the union, and no grammar can avoid that for all $n$.

Deciding whether an arbitrary CFG is ambiguous is **undecidable**. In exams you show ambiguity by giving one string with two trees; you show unambiguity by arguing that each step of the derivation is forced.

Common ambiguous shapes:

- $S \to SS \mid a$ (associativity not fixed)
- $E \to E + E \mid E * E \mid id$ (neither precedence nor associativity fixed)
- $S \to aS \mid aSb \mid \epsilon$ (an extra $a$ can be emitted before or after matching)
- dangling else: $S \to \text{if } S \mid \text{if } S \text{ else } S \mid x$

## Simplifying grammars

Before converting to a normal form, clean the grammar in this order:

1. Remove $\epsilon$-productions (find nullable variables, add versions of each production with nullable variables dropped). If $\epsilon \in L$, keep $S \to \epsilon$ with a fresh start symbol.
2. Remove unit productions $A \to B$.
3. Remove useless symbols: first non-generating ones, then unreachable ones. The order matters; doing reachability first can leave useless symbols behind.

## Normal forms

### Chomsky Normal Form

Every production is $A \to BC$ or $A \to a$ (plus $S \to \epsilon$ if needed, with $S$ not on any right side). Facts used in GATE:

- A derivation of a string of length $n \ge 1$ takes exactly $2n - 1$ steps: $n - 1$ binary steps to create $n$ variables, then $n$ terminal steps.
- A parse tree is binary, so a string of length $n$ has a tree with height at least $\lceil \log_2 n \rceil + 1$.
- The CYK algorithm decides membership in $O(n^3)$ time for a fixed grammar.

### Greibach Normal Form

Every production is $A \to a\alpha$ with $a$ a terminal and $\alpha \in V^*$. Each step adds exactly one terminal, so a string of length $n$ takes exactly $n$ steps. GNF grammars have no left recursion, which is why GNF connects directly to PDAs that read one symbol per move.

## Pushdown automata

A PDA is $M = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$ where $\Gamma$ is the stack alphabet, $Z_0$ the initial stack symbol and

$$\delta : Q \times (\Sigma \cup \{\epsilon\}) \times \Gamma \to \text{finite subsets of } Q \times \Gamma^*$$

A move reads one input symbol (or none), pops the top stack symbol, and pushes a string in its place.

Two acceptance modes:

- **By final state:** input consumed and the machine is in a state of $F$.
- **By empty stack:** input consumed and the stack is empty.

For nondeterministic PDAs the two modes accept the same class, and that class is exactly the CFLs.

### Deterministic PDAs and DCFLs

A DPDA has at most one possible move in every configuration: for each $(q, a, X)$ at most one move, and if an $\epsilon$-move exists on $(q, X)$ then no input move exists on $(q, a, X)$ for any $a$.

The **deterministic CFLs** (DCFLs) are those accepted by a DPDA by final state. Key facts:

- Regular $\subset$ DCFL $\subset$ CFL, both inclusions proper.
- $\{wcw^R\}$ is DCFL; $\{ww^R\}$ is CFL but not DCFL (the machine cannot know where the middle is).
- DPDAs accepting by empty stack accept only DCFLs with the prefix property (no string in the language is a proper prefix of another). So for DPDAs, final-state acceptance is strictly more powerful.
- DCFLs are closed under complement but not under union, intersection or reversal.
- Every DCFL has an unambiguous grammar (in fact an LR(1) grammar). The converse is false: $\{ww^R\}$ is unambiguous but not DCFL.

### Extra stacks

A PDA with two stacks can simulate a Turing machine tape (one stack holds the part left of the head, the other the part right of it). So "PDA with two stacks" is as powerful as a Turing machine, not "slightly more than a PDA".

## Identifying context-free languages

Ask what needs to be compared and how.

| Pattern | Class | Why |
|---|---|---|
| $a^n b^n$, $a^n b^{2n}$, $a^n b^m c^{m} d^{n}$ | DCFL | nested matching, single stack |
| $a^n b^m c^{n+m}$ | DCFL | push both, pop for $c$ |
| $a^i b^j$ with $i \ne j$, $i > j$, $i \le 2j$ | DCFL | one comparison, settled at the end |
| $\{w : n_a(w) = n_b(w)\}$ | DCFL | stack holds the surplus |
| $ww^R$ | CFL, not DCFL | middle must be guessed |
| $a^i b^j c^k$ with $i = j$ or $j = k$ | CFL, not DCFL | union, choice must be guessed |
| $a^n b^n c^n$ | not CFL | two comparisons at once |
| $a^n b^m c^n d^m$ | not CFL | crossing matches |
| $ww$ | not CFL | same-order copy |
| $a^{n^2}$, $a^{2^n}$, $a^p$ ($p$ prime) | not CFL | over a unary alphabet, CFL = regular |
| complement of $ww$ | CFL | guess one mismatched position |

Rules of thumb:

- **One** unbounded comparison, or several that are properly nested: CFL.
- Two comparisons that overlap or cross, or a same-order copy: not CFL.
- Over a one-letter alphabet, every CFL is regular (Parikh's theorem). So a unary language with non-periodic lengths is not even context-free.
- "Or" between comparisons is fine (union); "and" between independent comparisons over the same symbols usually is not.

## Worked examples

### Worked example 1: Writing a grammar

Give a CFG for $L = \{a^i b^j c^k : i = j + k\}$.

Rewrite the condition as $a^{k} a^{j} b^{j} c^{k}$: the outer $a$'s match the $c$'s, the inner $a$'s match the $b$'s. Nest them:

$$S \to aSc \mid T \qquad T \to aTb \mid \epsilon$$

$S$ wraps $a \dots c$ pairs around a core; $T$ builds $a^j b^j$. Each string has one derivation, so the grammar is also unambiguous. Check: $aabc$ is $a\,(ab)\,c$ with $j = k = 1$, $i = 2$.

### Worked example 2: Proving and removing ambiguity

$E \to E + E \mid E * E \mid id$. The string $id + id * id$ has two leftmost derivations:

1. $E \Rightarrow E + E \Rightarrow id + E \Rightarrow id + E * E \Rightarrow id + id * E \Rightarrow id + id * id$ ($*$ below $+$)
2. $E \Rightarrow E * E \Rightarrow E + E * E \Rightarrow id + E * E \Rightarrow id + id * E \Rightarrow id + id * id$ ($+$ below $*$)

Fix it by layering precedence and choosing left recursion for left associativity:

$$E \to E + T \mid T \qquad T \to T * F \mid F \qquad F \to id$$

Now $+$ can only appear at the $E$ level, so $*$ always binds tighter, and the tree for every string is forced.

### Worked example 3: Converting to CNF

Convert $S \to aSb \mid ab$ (language $a^n b^n$, $n \ge 1$).

1. No $\epsilon$-productions, no unit productions, no useless symbols.
2. Replace terminals in long bodies: $A \to a$, $B \to b$, giving $S \to ASB \mid AB$.
3. Break bodies longer than two: $S \to AX$, $X \to SB$.

Final CNF:

$$S \to AX \mid AB \qquad X \to SB \qquad A \to a \qquad B \to b$$

Check with $aabb$ (length 4): $S \Rightarrow AX \Rightarrow ASB \Rightarrow AABB$ then four terminal steps. Binary steps: $S \to AX$, $X \to SB$, $S \to AB$ is 3; terminal steps 4; total $7 = 2 \cdot 4 - 1$.

### Worked example 4: A PDA for equal counts

$L = \{w \in \{a,b\}^* : n_a(w) = n_b(w)\}$.

Idea: the stack holds the current surplus. If the top is the same letter as the input, or the stack is at $Z_0$, push. If the top is the opposite letter, pop.

- $\delta(q, a, Z_0) = (q, AZ_0)$, $\delta(q, b, Z_0) = (q, BZ_0)$
- $\delta(q, a, A) = (q, AA)$, $\delta(q, b, B) = (q, BB)$
- $\delta(q, a, B) = (q, \epsilon)$, $\delta(q, b, A) = (q, \epsilon)$
- $\delta(q, \epsilon, Z_0) = (f, Z_0)$ with $f$ accepting

This machine is deterministic except for the $\epsilon$-move to $f$, which can be avoided by making $q$ itself accepting whenever $Z_0$ is on top (use a separate state for "balanced"). So $L$ is a DCFL. A grammar: $S \to aSbS \mid bSaS \mid \epsilon$. There are $\binom{6}{3} = 20$ strings of length 6 in $L$.

### Worked example 5: Classifying a batch

Which are context-free?

1. $\{a^n b^m c^n : n, m \ge 0\}$: push $a$'s, ignore $b$'s, pop on $c$'s. **CFL** (in fact DCFL).
2. $\{a^n b^n c^m d^m\}$: concatenation of two CFLs. **CFL**.
3. $\{a^n b^m c^n d^m\}$: the $a$-$c$ match and the $b$-$d$ match cross. **Not CFL**; pump $a^p b^p c^p d^p$: the window $vxy$ of length at most $p$ touches at most two adjacent blocks, so it cannot change $a$ and $c$ together.
4. $\{a^i b^j c^k : i \ne j \text{ or } j \ne k\}$: union of two one-comparison languages. **CFL**. Its complement within $a^*b^*c^*$ is $a^nb^nc^n$, which shows CFLs are not closed under complement.

## Common traps

- **Different derivation orders are not ambiguity.** Only different trees (equivalently, different leftmost derivations) count.
- **Ambiguity is a grammar property; inherent ambiguity is a language property.** An ambiguous grammar may have an unambiguous equivalent.
- **DPDA by empty stack is weaker** than DPDA by final state. For NPDAs they are equal.
- **$wcw^R$ vs $ww^R$.** The marker makes it deterministic.
- **Unary languages.** A unary CFL is regular, so $\{a^{2^n}\}$ is not CFL.
- **Two stacks equal a Turing machine**, not "a bigger CFL class".
- **CNF step count is $2n - 1$, GNF is $n$.** Do not swap them.
- **Removing useless symbols:** non-generating first, then unreachable.

## Quick revision

- CFG: single variable on the left; parse trees correspond one to one with leftmost derivations.
- Ambiguous = some string with two parse trees. Ambiguity of a CFG is undecidable.
- $\{a^ib^jc^k : i = j \text{ or } j = k\}$ is inherently ambiguous.
- CNF: $A \to BC \mid a$, $2n - 1$ steps, CYK in $O(n^3)$. GNF: $A \to a\alpha$, $n$ steps.
- NPDA by final state = NPDA by empty stack = CFL.
- Regular $\subset$ DCFL $\subset$ CFL; $ww^R$ is the standard CFL that is not DCFL.
- DCFL: closed under complement; not under union, intersection, reversal.
- One comparison or nested comparisons: CFL. Crossing comparisons, same-order copies, or three-way equality: not CFL.
- Two-stack PDA = Turing machine.
