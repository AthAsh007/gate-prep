---
title: "Regular expressions and finite automata"
summary: "DFAs, NFAs, epsilon-NFAs, regular expressions, Myhill-Nerode and DFA minimization, with the counting and state-count questions GATE asks most."
order: 1
sources:
  - title: "Wikipedia: Regular language"
    url: "https://en.wikipedia.org/wiki/Regular_language"
  - title: "Wikipedia: DFA minimization"
    url: "https://en.wikipedia.org/wiki/DFA_minimization"
  - title: "GATE Overflow: regular-language tag"
    url: "https://gateoverflow.in/tag/regular-language"
---

## Why this topic matters

Regular languages give GATE its most reliable marks in Theory of Computation. Almost every paper has a minimal-DFA state count, a "which regex is equal to which" question, or a "which of these is regular" question. All three come down to one skill: knowing exactly what finite memory can and cannot remember.

## Deterministic finite automata

A DFA is a 5-tuple $M = (Q, \Sigma, \delta, q_0, F)$:

- $Q$: finite set of states
- $\Sigma$: finite input alphabet
- $\delta : Q \times \Sigma \to Q$: transition function, exactly one move per state and symbol
- $q_0 \in Q$: start state
- $F \subseteq Q$: accepting states

Extend $\delta$ to strings: $\hat\delta(q, \epsilon) = q$ and $\hat\delta(q, wa) = \delta(\hat\delta(q, w), a)$. The language is $L(M) = \{w : \hat\delta(q_0, w) \in F\}$. A language is **regular** if some DFA accepts it.

A DFA is **complete** if every state has a move on every symbol. Many textbooks and GATE keys draw partial DFAs and leave the dead (trap) state implicit. Always read whether a question counts it.

### Transition tables

GATE often gives a DFA as a table. Here is a DFA over $\{0,1\}$ for binary numbers divisible by 3, read most significant bit first. State $q_r$ means "value so far leaves remainder $r$", and reading bit $b$ moves remainder $r$ to $(2r + b) \bmod 3$. Start and accept at $q_0$.

| State | 0 | 1 |
|---|---|---|
| $\to * q_0$ | $q_0$ | $q_1$ |
| $q_1$ | $q_2$ | $q_0$ |
| $q_2$ | $q_1$ | $q_2$ |

The same idea gives a $k$-state remainder DFA for any modulus $k$, but the minimal DFA can be smaller. For divisibility by 6 the remainders $r$ and $r + 3$ always move to the same state, so only the accepting status keeps them apart, and the minimal DFA has 4 states, not 6.

## Nondeterministic finite automata

An NFA allows $\delta : Q \times \Sigma \to 2^Q$: zero, one or many moves per symbol. It accepts if **some** run ends in an accepting state. An $\epsilon$-NFA also allows moves on $\epsilon$ that consume no input. The $\epsilon$-closure $ECLOSE(q)$ is the set of states reachable from $q$ using only $\epsilon$-moves.

### Subset construction

Every NFA (with or without $\epsilon$-moves) has an equivalent DFA:

1. The DFA start state is $ECLOSE(q_0)$.
2. From a DFA state $S$ on symbol $a$, go to $ECLOSE\left(\bigcup_{q \in S} \delta(q, a)\right)$.
3. A DFA state is accepting if it contains an NFA accepting state.

With $n$ NFA states there are at most $2^n$ DFA states (including $\emptyset$, which acts as the dead state). The bound is tight: "the $n$-th symbol from the right is $a$" has an $(n+1)$-state NFA but needs $2^n$ DFA states.

So DFAs, NFAs and $\epsilon$-NFAs all accept exactly the regular languages. Nondeterminism buys succinctness, not power.

## Regular expressions

Regular expressions over $\Sigma$ are built from $\emptyset$, $\epsilon$, and each $a \in \Sigma$ using union ($+$), concatenation and Kleene star. Kleene's theorem says a language is regular if and only if some regular expression denotes it.

Useful identities (check each by asking "which strings are in it?"):

| Identity | Comment |
|---|---|
| $\epsilon + RR^* = R^*$ | definition of star |
| $(R^*)^* = R^*$ | starring twice adds nothing |
| $(a + b)^* = (a^* b^*)^* = (a^* + b^*)^*$ | all strings |
| $(ab)^* a = a(ba)^*$ | shifting brackets |
| $\emptyset^* = \epsilon$ | star of the empty set |
| $R\emptyset = \emptyset$ | concatenating with nothing |
| $(R + S)^* \ne R^* + S^*$ in general | $ab$ is in the left side only |

### Arden's rule

If $P$ does not contain $\epsilon$, then the equation $X = PX + Q$ (or $X = Q + XP$ for the right-linear form) has the unique solution $X = P^* Q$ (respectively $X = QP^*$). This turns a DFA into a regular expression: write one equation per state describing how it can be reached, then eliminate variables.

## Myhill-Nerode theorem

For a language $L$, call strings $x$ and $y$ **equivalent** ($x \equiv_L y$) if for every suffix $z$, $xz \in L \iff yz \in L$. The theorem:

- $L$ is regular if and only if $\equiv_L$ has finitely many classes.
- The number of classes equals the number of states in the minimal **complete** DFA for $L$.

This gives the cleanest proofs in both directions. To show a lower bound of $k$ states, find $k$ prefixes that are pairwise distinguishable (each pair has a separating suffix). To show non-regularity, find infinitely many pairwise distinguishable prefixes. For $\{a^n b^n\}$, the prefixes $a^0, a^1, a^2, \dots$ work: $a^i$ and $a^j$ are separated by $b^i$.

## DFA minimization

The minimal DFA is unique up to renaming of states. Two standard procedures produce it.

**Moore (partition refinement).**

1. Remove states unreachable from the start.
2. Start with two blocks: accepting and non-accepting.
3. Split a block whenever two of its states go, on some symbol, to different blocks.
4. Repeat until no block splits. Each block is one state of the minimal DFA.

**Table filling (Myhill-Nerode).** Mark every pair (accepting, non-accepting). Then repeatedly mark a pair $(p, q)$ if for some symbol $a$ the pair $(\delta(p,a), \delta(q,a))$ is already marked. Unmarked pairs are equivalent.

Never skip step 1. An unreachable state can look distinct from everything and inflate your count.

## Building DFAs for common patterns

| Pattern | Minimal complete DFA states |
|---|---|
| strings ending with a fixed string $w$ of length $k$ | $k + 1$ |
| strings containing a fixed substring $w$ of length $k$ | $k + 1$ |
| strings starting with a fixed string $w$ of length $k$ | $k + 2$ (includes dead) |
| $k$-th symbol from the left is fixed | $k + 2$ (includes dead) |
| $k$-th symbol from the right is fixed (binary) | $2^k$ |
| length $\equiv r \pmod k$ | $k$ |
| $n_a(w) \bmod p$ and $n_b(w) \bmod q$ together | $p \cdot q$ (if accepting set does not collapse) |

The "ending with" and "containing" counts can be smaller only in degenerate cases; check by Moore refinement whenever the accepting set is unusual. For a product of two counters, the accepting set may let classes merge. For example, "$n_a \equiv n_b \pmod 3$" needs only 3 states, because only the difference matters.

## Showing a language is regular or not

**To show regular:** give a DFA, NFA or regex; or build it from known regular languages with closure (union, intersection, complement, concatenation, star, reversal, homomorphism, inverse homomorphism). Any finite language is regular.

**To show not regular:** use Myhill-Nerode (infinitely many distinguishable prefixes), the pumping lemma, or closure. The closure trick: if $L$ were regular, then $L \cap a^* b^*$ would be regular; if that intersection is $\{a^n b^n\}$, $L$ is not regular.

Quick intuition test: does recognizing the language need an unbounded counter or memory of an arbitrary prefix? If yes, it is not regular. But beware languages that look like counting yet are not, such as "number of $ab$ equals number of $ba$", which only depends on whether the first and last symbols agree.

## Worked examples

### Worked example 1: Strings ending in ab

Build the minimal complete DFA over $\{a, b\}$ for strings ending in $ab$.

Track the longest suffix of the input that is a prefix of $ab$: none, $a$, or $ab$.

| State | a | b |
|---|---|---|
| $\to p_0$ (no progress) | $p_1$ | $p_0$ |
| $p_1$ (seen $a$) | $p_1$ | $p_2$ |
| $* p_2$ (seen $ab$) | $p_1$ | $p_0$ |

Notice $p_1$ on $a$ stays in $p_1$: after $aa$, the last $a$ still starts a possible $ab$. Distinguishability: $p_2$ is the only accepting state; $p_0$ and $p_1$ are separated by the suffix $b$. Answer: **3 states**, no dead state needed.

### Worked example 2: Subset construction

NFA over $\{a, b\}$ for "second-last symbol is $a$": states $1, 2, 3$, start $1$, accept $3$. Moves: $1 \xrightarrow{a,b} 1$, $1 \xrightarrow{a} 2$, $2 \xrightarrow{a,b} 3$.

| DFA state | a | b |
|---|---|---|
| $\to \{1\}$ | $\{1,2\}$ | $\{1\}$ |
| $\{1,2\}$ | $\{1,2,3\}$ | $\{1,3\}$ |
| $* \{1,2,3\}$ | $\{1,2,3\}$ | $\{1,3\}$ |
| $* \{1,3\}$ | $\{1,2\}$ | $\{1\}$ |

Four reachable subsets, out of a possible $2^3 = 8$. The subsets correspond to the last two symbols read: $bb$, $ba$, $aa$, $ab$. All four are distinguishable, so the minimal DFA has **4 states**. In general, "$k$-th from the right" gives $2^k$.

### Worked example 3: Minimizing a table

DFA over $\{0,1\}$, start $A$, accepting $\{E\}$:

| State | 0 | 1 |
|---|---|---|
| $\to A$ | $B$ | $C$ |
| $B$ | $B$ | $D$ |
| $C$ | $B$ | $C$ |
| $D$ | $B$ | $E$ |
| $* E$ | $B$ | $C$ |

Round 0: $\{A,B,C,D\}$, $\{E\}$.

Round 1: on symbol 1, $D$ goes to $E$ while $A, B, C$ stay in the big block. Split: $\{A,B,C\}$, $\{D\}$, $\{E\}$.

Round 2: on symbol 1, $B$ goes to $D$, while $A$ and $C$ go to $C$. Split: $\{A,C\}$, $\{B\}$, $\{D\}$, $\{E\}$.

Round 3: $A$ and $C$ have identical rows ($0 \to B$, $1 \to C$), so no further split.

Result: **4 states**. The language is binary strings ending in $011$, which matches the "ending with a string of length 3" rule ($3 + 1 = 4$).

### Worked example 4: Counting strings

How many strings of length 5 over $\{a, b\}$ contain $aa$?

Count the complement. Let $f(n)$ be the number of strings with no $aa$. A valid string ends in $b$ (anything valid before it) or in $ba$ (anything valid before that), so $f(n) = f(n-1) + f(n-2)$, $f(0) = 1$, $f(1) = 2$. Then $f(2) = 3$, $f(3) = 5$, $f(4) = 8$, $f(5) = 13$.

Strings containing $aa$: $2^5 - 13 = $ **19**.

The recurrence comes from the DFA: the states "last symbol was $a$" and "last symbol was not $a$" are exactly the two terms.

### Worked example 5: DFA to regular expression with Arden

Take the remainder-mod-3 DFA from the transition table section, with $q_0$ as the start and only accepting state. Write equations for how each state is entered:

- $q_0 = \epsilon + q_0 0 + q_1 1$
- $q_1 = q_0 1 + q_2 0$
- $q_2 = q_1 0 + q_2 1$

From the third, by Arden: $q_2 = q_1 0 1^*$. Substitute: $q_1 = q_0 1 + q_1 0 1^* 0$, so $q_1 = q_0 1 (01^*0)^*$. Substitute into the first: $q_0 = \epsilon + q_0 (0 + 1(01^*0)^*1)$, so

$$q_0 = (0 + 1(01^*0)^*1)^*$$

That is the regular expression for binary multiples of 3.

## Common traps

- **Dead state convention.** "Minimal DFA" in a question that draws partial DFAs often means without the dead state. If the question says complete, include it. Languages like "starts with $ab$" differ by exactly one between the two conventions.
- **Unreachable states.** Remove them before minimizing.
- **Merging by accepting pattern.** Modular counters can collapse: length divisible by 2 or 3 needs 6 states, but $n \bmod 6 \in \{0, 3\}$ needs only 3.
- **Regex equivalence by guess.** Test small strings against both sides: $\epsilon$, single symbols, and $ab$ versus $ba$ catch most wrong options.
- **Counting strings vs counting splits.** $a^* b^* a^*$ has 22 strings of length 6, not 28, because $a^6$ has many splits.
- **Finite means regular.** $\{a^n b^n : n \le 1000\}$ is regular.
- **Subsets of regular languages are not automatically regular.** $\{a^n b^n\} \subseteq a^* b^*$.
- **NFA state bound.** Subset construction gives at most $2^n$, not $n^2$ or $2n$.

## Quick revision

- DFA, NFA and $\epsilon$-NFA accept the same class: the regular languages.
- Subset construction: at most $2^n$ DFA states from $n$ NFA states; tight.
- Kleene: regex $\iff$ finite automaton.
- Arden: $X = PX + Q$, $\epsilon \notin P$ gives $X = P^*Q$.
- Myhill-Nerode: number of classes = minimal complete DFA size; infinite classes means not regular.
- Minimize: drop unreachable, split by acceptance, refine until stable.
- Product construction: $m \times n$ states for intersection, union or difference.
- "$k$-th from right" needs $2^k$ states; "$k$-th from left" needs $k + 2$ with dead state.
- To prove non-regular: distinguishable prefixes, pumping lemma, or intersect with a regular language to reach a known non-regular one.
