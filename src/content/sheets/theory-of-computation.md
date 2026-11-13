---
title: "Theory of Computation formula sheet"
summary: "State counts, conversions, normal forms, closure tables and decidability facts for regular, context-free and Turing-recognisable languages on one page."
---

## Regular expressions and finite automata

**Conversions and state bounds**

| From | To | States |
|---|---|---|
| NFA with $n$ states | DFA (subset construction) | at most $2^n$, including $\emptyset$ |
| $\epsilon$-NFA with $n$ states | NFA without $\epsilon$ | $n$ (same states) |
| Regex of length $n$ | $\epsilon$-NFA (Thompson) | $O(n)$ |
| DFAs with $m$ and $n$ states | DFA for $\cap, \cup, -, \oplus$ (product) | at most $mn$ |
| Complete DFA with $n$ states | DFA for complement | $n$ (swap accepting and non-accepting) |
| DFA with $n$ states | DFA for reversal | up to $2^n$ |
| Mealy with $n$ states, output alphabet $\Delta$ | Moore | at most $n \lvert \Delta \rvert$ (plus 1 for the start) |
| Moore with $n$ states | Mealy | $n$ |

- Swapping final states complements only a **complete DFA**, never an NFA.
- Moore output for input of length $n$ has length $n + 1$; Mealy gives $n$.
- Labelled DFAs with $n$ states, $k$ symbols, fixed start: $n^{nk} \cdot 2^n$.

**Minimal complete DFA sizes** (pattern $s$ with $\lvert s \rvert = k$, alphabet $\{a,b\}$, $s$ like $abab\dots$ with no self-overlap issues)

| Language | States | Dead state? |
|---|---|---|
| Length exactly $k$ | $k + 2$ | yes |
| Length $\le k$ | $k + 2$ | yes |
| Length $\ge k$ | $k + 1$ | no |
| $k$-th symbol from the left is fixed | $k + 2$ | yes |
| $k$-th symbol from the right is fixed | $2^k$ | no |
| Starts with $s$ | $k + 2$ | yes |
| Ends with $s$ | $k + 1$ | no |
| Contains $s$ | $k + 1$ | no |
| Does not contain $s$ | $k + 1$ | yes (counted) |
| $n_a(w) \bmod m = r$ | $m$ | no |
| Length divisible by $m$ or by $n$ ($m, n$ coprime) | $mn$ | no |
| Binary, MSB first, value divisible by $n = 2^j m$ ($m$ odd) | $m + j$ | no |
| Binary, LSB first, value divisible by odd $m$ | $m$ | no |

- Partial DFA = complete DFA minus the dead state. Read whether the question counts it.
- Product states can merge after minimisation. Example: $n_a \equiv 0 \pmod 3$ and ends in $b$ needs 4 states, not 6.
- Myhill-Nerode: number of classes = states of the minimal complete DFA. Infinite index means not regular.
- Minimisation: drop unreachable states first, then merge equivalent states (Moore table filling).

**Regular expression identities**

- $(a + b)^* = (a^* b^*)^* = (a^* b)^* a^* = a^*(b a^*)^*$
- Shift rule: $(xy)^* x = x (yx)^*$
- $(r^*)^* = r^*$, $r^* r^* = r^*$, $\epsilon + r r^* = r^*$, $\emptyset^* = \epsilon$, $r \emptyset = \emptyset$
- $(a + b)^* \ne a^* + b^*$ (the right side misses $ab$)

- Arden: $R = Q + RP$ gives $R = QP^*$; $R = Q + PR$ gives $R = P^* Q$ (unique if $\epsilon \notin L(P)$).
- Binary strings of length $n$ with no $11$: $F_{n+2}$ (2, 3, 5, 8, 13, 21 for $n = 1..6$).
- $\epsilon$-closure of $q$ always contains $q$.

## Context-free grammars and PDAs

**Normal forms and counts** (string length $n \ge 1$)

| Quantity | Value |
|---|---|
| CNF derivation steps | $2n - 1$ |
| CNF parse tree: variable nodes / all nodes | $2n - 1$ / $3n - 1$ |
| CNF parse tree height (edges) | min $\lceil \log_2 n \rceil + 1$, max $n$ |
| GNF derivation steps | $n$ |
| CYK table cells | $n(n+1)/2$ |
| CYK time | $O(n^3 \lvert G \rvert)$ |
| Parse trees of $a \circ a \circ \dots$ with $k$ operators in $E \to E \circ E \mid a$ | Catalan $C_k$: 1, 1, 2, 5, 14, 42, 132 |
| Strings of length $2n$ from $S \to aSbS \mid bSaS \mid \epsilon$ | $\binom{2n}{n}$ |
| Balanced strings ($S \to aSb \mid SS \mid \epsilon$) of length $2n$ | $C_n$ |

- Simplification order: remove $\epsilon$-productions, then unit productions, then useless symbols (non-generating first, then unreachable).
- Palindromes of length $n$ over $\{a,b\}$: $2^{\lceil n/2 \rceil}$.

**PDA facts**

| Model | Accepts |
|---|---|
| NPDA, final state | CFL |
| NPDA, empty stack | CFL (same class) |
| DPDA, final state | DCFL |
| DPDA, empty stack | DCFLs with the prefix property |
| PDA with bounded stack | regular |
| PDA with 2 stacks / queue automaton | RE (same as TM) |

**DCFL or not**

| Deterministic CFL | CFL, not deterministic |
|---|---|
| $\{wcw^R\}$ | $\{ww^R\}$ |
| $\{a^n b^n\}$, $\{a^n b^{2n}\}$ | $\{a^n b^n\} \cup \{a^n b^{2n}\}$ |
| $\{a^n b^m : n \ne m\}$ | $\{a^i b^j c^k : i = j \text{ or } j = k\}$ (inherently ambiguous) |
| every regular language | $\{w : w \ne w^R\}$ |

- Ambiguity is a property of a grammar; inherent ambiguity is a property of a language. Every DCFL and every regular language has an unambiguous grammar.
- Dangling else: $S \to aS \mid aSbS \mid \epsilon$ is ambiguous ($aab$ has 2 trees).

## Pumping lemma and closure properties

- Regular, $s = xyz$: $\lvert xy \rvert \le p$, $\lvert y \rvert \ge 1$, $xy^iz \in L$ for all $i \ge 0$.
- CFL, $s = uvxyz$: $\lvert vxy \rvert \le p$, $\lvert vy \rvert \ge 1$, $uv^ixy^iz \in L$ for all $i \ge 0$.

- The lemma only proves non-membership. Passing it proves nothing.
- $n$-state DFA: $L$ non-empty iff it accepts a string of length $< n$; $L$ infinite iff it accepts one of length in $[n, 2n - 1]$.
- Unary CFLs are regular. So $\{a^{n^2}\}$, $\{a^{2^n}\}$, $\{a^p : p \text{ prime}\}$ are not CFL.
- For $a^{n^2}$: pumping up gives length strictly between $p^2$ and $(p+1)^2$.

**If you see X, think Y**

| Pattern | Class |
|---|---|
| $a^n b^n$, $ww^R$, equal counts of two symbols | CFL, not regular |
| $a^n b^n c^n$, $ww$, $a^n b^m c^n d^m$ | not CFL |
| $wxw^R$ with $w, x$ non-empty | regular (first symbol = last, length $\ge 3$) |
| $\overline{\{ww\}}$, $\overline{\{a^n b^n c^n\}}$ | CFL |
| Equal counts of $ab$ and $ba$ | regular ($w = \epsilon$ or first symbol = last) |
| Bounded counter ($n \le 1000$) | finite, so regular |

**Closure table** (Y closed, N not closed)

| Operation | Reg | DCFL | CFL | CSL | Rec | RE |
|---|---|---|---|---|---|---|
| Union | Y | N | Y | Y | Y | Y |
| Intersection | Y | N | N | Y | Y | Y |
| Intersection with regular | Y | Y | Y | Y | Y | Y |
| Complement | Y | Y | N | Y | Y | N |
| Difference | Y | N | N | Y | Y | N |
| Concatenation | Y | N | Y | Y | Y | Y |
| Kleene star | Y | N | Y | Y | Y | Y |
| Reversal | Y | N | Y | Y | Y | Y |
| Homomorphism | Y | N | Y | N | N | Y |
| $\epsilon$-free homomorphism | Y | N | Y | Y | Y | Y |
| Inverse homomorphism | Y | Y | Y | Y | Y | Y |
| Right quotient with regular | Y | Y | Y | N | N | Y |

- Regular languages are closed under quotient with **any** language, and under prefix, suffix, half, $\min$, $\{w : ww \in L\}$.
- $L_1 \cup L_2$ regular does not make $L_1, L_2$ regular. A subset of a regular language need not be regular. An infinite union of regular languages need not be regular. $L^*$ regular does not make $L$ regular ($\{a^p : p \text{ prime}\}^*$ is regular).
- CFL $\cap$ regular is CFL: use it to expose a non-CFL core, e.g. $L \cap a^*b^*c^*$.

## Turing machines and undecidability

**Hierarchy**

| Type | Grammar | Machine | Language class |
|---|---|---|---|
| 3 | right-linear | DFA / NFA | regular |
| 2 | context-free | NPDA | CFL |
| 1 | context-sensitive | LBA | CSL (all recursive) |
| 0 | unrestricted | TM | RE |

Regular $\subset$ DCFL $\subset$ CFL $\subset$ CSL $\subset$ Recursive $\subset$ RE $\subset$ all languages.

- Same power as a TM: multi-tape ($O(t^2)$ simulation), nondeterministic (exponential simulation), two-way infinite tape, multi-head, 2-stack PDA, 2-counter machine, queue automaton.
- Weaker: single-stack PDA, LBA, read-only TM (regular).

**Decidability** (D decidable, U undecidable)

| Problem | DFA / regex | CFG | CSG | TM |
|---|---|---|---|---|
| Membership $w \in L$ | D | D | D | U |
| Emptiness | D | D | U | U |
| Finiteness | D | D | U | U |
| $L = \Sigma^*$ | D | U | U | U |
| Equivalence | D | U | U | U |
| Containment | D | U | U | U |
| Intersection empty (two of the same type) | D | U | U | U |
| Ambiguity | | U | | |
| Is $L$ regular? | D | U | U | U |

- DPDA equivalence is decidable. CFG $\cap$ DFA emptiness is decidable.
- PCP: undecidable for alphabets of size $\ge 2$, decidable for a one-letter alphabet or when the solution length is bounded.

**Standard sets**

| Set | RE | co-RE |
|---|---|---|
| $A_{TM}$, $HALT$, $\{M : L(M) \ne \emptyset\}$, "accepts $\epsilon$" | Y | N |
| $\overline{A_{TM}}$, $\overline{HALT}$, $E_{TM} = \{M : L(M) = \emptyset\}$ | N | Y |
| $TOTAL$, $EQ_{TM}$, $FIN_{TM}$, $REG_{TM}$, $\{M : L(M) = \Sigma^*\}$ | N | N |

- $L$ and $\overline{L}$ both RE $\Rightarrow$ $L$ recursive. $L$ RE but not recursive $\Rightarrow$ $\overline{L}$ not RE.
- RE $\cup$ recursive is RE; it may or may not be recursive.

**Rice's theorem**

- Every non-trivial property of $L(M)$ is undecidable.
- Applies only to properties of the **language**. Does not apply to: number of states, "halts within $k$ steps", "makes more than $k$ moves", "ever moves left on blank input". Those are about the machine; many are decidable.
- Trivial property (true for all RE languages or for none): decidable.
- If some $L$ has the property but a superset of $L$ does not (not monotone), the property is not even RE.

**Reductions** ($A \le_m B$)

- $B$ decidable $\Rightarrow$ $A$ decidable; $B$ RE $\Rightarrow$ $A$ RE.
- $A$ undecidable $\Rightarrow$ $B$ undecidable; $A$ not RE $\Rightarrow$ $B$ not RE.
- Always $\overline{A} \le_m \overline{B}$.

- Standard trick: from $\langle M, w \rangle$ build $M'$ that ignores its input and runs $M$ on $w$. Then $L(M') = \Sigma^*$ or $\emptyset$. This gives $A_{TM} \le_m \{M : L(M) \ne \emptyset\}$ and $\overline{A_{TM}} \le_m E_{TM}$.

**Countability**

- Countable: $\Sigma^*$, TMs, regexes, RE languages, finite subsets of $\mathbb{N}$, $\mathbb{Q}$.
- Uncountable: $2^{\Sigma^*}$ (all languages), $\mathbb{R}$, functions $\mathbb{N} \to \{0,1\}$, infinite subsets of $\mathbb{N}$.

- Countably many TMs, uncountably many languages: non-RE languages exist.
