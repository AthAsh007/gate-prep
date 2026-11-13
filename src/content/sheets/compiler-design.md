---
title: "Compiler Design formula sheet"
summary: "One-page revision of scanning, FIRST/FOLLOW and LL/LR parsing, attribute grammars, runtime storage, three-address code and data flow analysis."
---

## Lexical analysis

- Token $=$ class (`id`, `num`); lexeme $=$ matched text; pattern $=$ regex for the lexemes.
- Pipeline: regex $\to$ NFA (Thompson) $\to$ DFA (subset construction, up to $2^n$ states) $\to$ minimal DFA $\to$ table-driven scanner.
- Thompson counts: symbol $= 2$; $N(r \mid s) = N(r) + N(s) + 2$; $N(rs) = N(r) + N(s) - 1$; $N(r^*) = N(r) + 2$. `(a|b)*abb` gives 11.
- Longest match first, then the pattern listed first: `ifx` is an identifier, `if` the keyword.
- Keywords: preload into the symbol table, scan with the identifier pattern.
- Sentinel `eof` per buffer half: one test per character instead of two.
- Lexical errors: illegal character, unterminated string or comment. Missing `;` is syntactic; undeclared name is semantic.
- Token counting in C: comments and whitespace give 0; a string literal is 1; `>=`, `++`, `->` are 1 each; `a+++b` is `a ++ + b`; `/*` opens a comment that ends at the first `*/`.

## Parsing

**FIRST and FOLLOW**

| Rule | Effect |
|---|---|
| $X \to Y_1 Y_2 \dots$ | add $\text{FIRST}(Y_1) - \{\varepsilon\}$; go on to $Y_2$ only if $Y_1 \Rightarrow^* \varepsilon$ |
| all $Y_i$ derive $\varepsilon$ | $\varepsilon \in \text{FIRST}(X)$ |
| start symbol | $\text{\textdollar} \in \text{FOLLOW}(S)$ |
| $A \to \alpha B \beta$ | $\text{FIRST}(\beta) - \{\varepsilon\} \subseteq \text{FOLLOW}(B)$ |
| $A \to \alpha B$, or $\beta \Rightarrow^* \varepsilon$ | $\text{FOLLOW}(A) \subseteq \text{FOLLOW}(B)$ |

**LL(1)**

- Table: put $A \to \alpha$ in $M[A, a]$ for each $a \in \text{FIRST}(\alpha)$; if $\varepsilon \in \text{FIRST}(\alpha)$, also in $M[A, b]$ for each $b \in \text{FOLLOW}(A)$ (including $\text{\textdollar}$).
- LL(1) iff no cell has two productions. For $A \to \alpha \mid \beta$: $\text{FIRST}(\alpha) \cap \text{FIRST}(\beta) = \emptyset$, at most one derives $\varepsilon$, and if $\beta \Rightarrow^* \varepsilon$ then $\text{FIRST}(\alpha) \cap \text{FOLLOW}(A) = \emptyset$.
- Never LL(1): left recursive, ambiguous, or not left factored.
- Left recursion: $A \to A\alpha \mid \beta$ becomes $A \to \beta A'$, $A' \to \alpha A' \mid \varepsilon$. Indirect: order nonterminals, substitute earlier ones, then remove immediate recursion.
- Left factoring: $A \to \alpha\beta_1 \mid \alpha\beta_2$ becomes $A \to \alpha A'$, $A' \to \beta_1 \mid \beta_2$. Dangling else still conflicts.

**LR family**

| Fact | Value |
|---|---|
| Grammar classes | LR(0) $\subset$ SLR(1) $\subset$ LALR(1) $\subset$ CLR(1) |
| State counts | LR(0) $=$ SLR $=$ LALR $\le$ CLR |
| LR(0) items of $A \to X_1 \dots X_k$ | $k + 1$ |
| Every LL(1) grammar is | LR(1), but not always LALR(1) |
| Ambiguous grammar | never LL(k) or LR(k) |
| LR(1) languages | exactly the deterministic CFLs |

| Parser | Reduce $A \to \alpha\cdot$ on | Conflict appears when |
|---|---|---|
| LR(0) | every terminal | complete item plus any other item |
| SLR(1) | $\text{FOLLOW}(A)$ | shift on $a \in \text{FOLLOW}(A)$, or FOLLOW sets overlap |
| CLR(1) | item lookahead | lookaheads collide in one state |
| LALR(1) | union of merged lookaheads | merging can add reduce-reduce, never shift-reduce |

- Bottom-up $=$ reverse rightmost derivation; top-down $=$ leftmost.
- Handle: right side of the last production of the rightmost derivation. Viable prefixes $=$ paths in the LR(0) DFA (a regular set).
- On a valid input: shifts $=$ tokens; reductions $=$ interior parse-tree nodes.
- Operator grammar: no $\varepsilon$-production, no adjacent nonterminals. $+ \lessdot *$, $* \gtrdot +$, left associative $+ \gtrdot +$, right associative $\uparrow \lessdot \uparrow$, $\text{id} \gtrdot$ any operator.
- Yacc: later `%left`/`%right` lines bind tighter; shift-reduce defaults to shift; reduce-reduce to the earlier production.

## Syntax-directed translation

| Kind | Attributes | Evaluation |
|---|---|---|
| S-attributed | synthesized only | postorder; during LR parsing on a value stack |
| L-attributed | inherited from parent's inherited attrs and LEFT siblings only | one left-to-right depth-first pass; LL parsing, or LR with markers |

- Every S-attributed SDD is L-attributed. A dependency cycle means no evaluation order.
- In $A \to X B Y$, $B$'s inherited attribute may use $A$'s inherited attributes and $X$, never $Y$.
- Marker $M \to \varepsilon$ replaces an embedded action for bottom-up parsing.
- Value stack: reducing $A \to X_1 \dots X_r$, $X_i$ is at $\text{top} - r + i$.
- End-of-production actions print in postorder (infix to postfix). Embedded actions run as leaves in a left-to-right depth-first walk.
- Left recursion groups left, right recursion groups right; lower in the grammar binds tighter.
- Syntax tree nodes $=$ operators $+$ operand occurrences; a DAG shares repeats.

## Runtime environments

| Activation record field | Purpose |
|---|---|
| Parameters, return value | communication with caller |
| Control (dynamic) link | caller's record |
| Access (static) link | lexically enclosing procedure's record |
| Saved status | return address, registers |
| Locals, temporaries | callee data |

- Non-local at nesting depth $d_v$ from depth $d$: follow $d - d_v$ access links.
- Caller at depth $n_p$ calls procedure at depth $n_x$: if $n_x = n_p + 1$, access link $=$ caller; if $n_x \le n_p$, follow $n_p - n_x + 1$ links from the caller.
- Display: `display[d]` points to the latest record at depth $d$; constant-time access.
- Static allocation cannot support recursion; returning a local's address gives a dangling pointer; closures that outlive the call need the heap.
- Static scope: nearest enclosing declaration in the text. Dynamic scope: most recent active binding.

| Passing | Behaviour |
|---|---|
| Value | copy in; callee cannot change actual |
| Reference | address passed; aliasing (`p(a, a)`) visible |
| Value-result | copy in, copy back on return (order of copy-back matters) |
| Name | argument re-evaluated at every use (`swap(i, a[i])` fails) |
| Need | evaluated at first use, then cached |

`fib` with base $n \le 1$: $C(n) = 1 + C(n-1) + C(n-2) = 2F_{n+1} - 1$ calls ($F_1 = F_2 = 1$; 15 for $n = 5$); stack depth $n$.

## Intermediate code generation

| Form | Fields | Note |
|---|---|---|
| Quadruple | op, arg1, arg2, result | easy to move; needs temporaries in symbol table |
| Triple | op, arg1, arg2 | result named by position; moving breaks references |
| Indirect triple | triples plus a list of pointers | reorder by permuting the list |

- Row-major `A[n1][n2]`, width $w$, lower bounds $l_1, l_2$: $\text{base} + ((i - l_1) n_2 + (j - l_2)) w$. Column-major: $\text{base} + ((j - l_2) n_1 + (i - l_1)) w$.
- Leaders: first instruction, every jump target, every instruction right after a jump. Block $=$ leader up to the next leader.
- Flow graph edges: jump target, and fall-through unless the block ends in an unconditional jump or `return`.
- $d$ dominates $n$: every path from entry to $n$ passes $d$. Back edge $n \to h$ with $h$ dominating $n$. Natural loop $= h$ plus nodes that reach $n$ without passing $h$.

| Backpatching rule | Actions |
|---|---|
| `B -> B1 or M B2` | patch $B_1$.falselist to $M$; true $=$ merge($B_1$.t, $B_2$.t); false $= B_2$.f |
| `B -> B1 and M B2` | patch $B_1$.truelist to $M$; true $= B_2$.t; false $=$ merge($B_1$.f, $B_2$.f) |
| `B -> not B1` | swap truelist and falselist |
| `x relop y` | emit `if x relop y goto _` and `goto _`; lists $\{n\}$, $\{n+1\}$ |
| `while M1 B do M2 S1` | patch $S_1$.next to $M_1$, $B$.t to $M_2$; next $= B$.f; emit `goto` $M_1$ |

- SSA: each name assigned once; $\phi$ at the iterated dominance frontier of the blocks that assign the variable; $\phi$ picks the value by incoming edge.

## Local optimisation and data flow analysis

| Analysis | Direction | Meet | Equation | Initial |
|---|---|---|---|---|
| Reaching definitions | forward | $\cup$ | $\text{OUT} = \text{gen} \cup (\text{IN} - \text{kill})$ | $\emptyset$ |
| Available expressions | forward | $\cap$ | $\text{OUT} = \text{e\_gen} \cup (\text{IN} - \text{e\_kill})$ | entry $\emptyset$, others all |
| Live variables | backward | $\cup$ | $\text{IN} = \text{use} \cup (\text{OUT} - \text{def})$ | $\emptyset$ |
| Very busy expressions | backward | $\cap$ | $\text{IN} = \text{use} \cup (\text{OUT} - \text{kill})$ | exit $\emptyset$, others all |
| Constant propagation | forward | lattice meet | evaluate statement | UNDEF |

- Constant lattice: UNDEF $\wedge\, v = v$; $c \wedge c = c$; $c_1 \wedge c_2 = $ NAC for $c_1 \ne c_2$; NAC $\wedge\, v =$ NAC.
- Liveness $\to$ dead code, registers (minimum without spills $=$ most values live at once); available expressions $\to$ global CSE; reaching definitions $\to$ constant propagation, use-def chains.

| Optimisation | Scope |
|---|---|
| Constant folding, algebraic simplification, local CSE (DAG), copy propagation, dead code in a block | local |
| Global CSE, global constant propagation | global (data flow) |
| Loop-invariant code motion, strength reduction, induction variable elimination, unrolling | loop |
| Redundant load/store, jump-to-jump, unreachable code | peephole |

- Hoisting `x = y op z` needs: operands invariant; block dominates all exits (or $x$ dead after the loop); $x$ assigned once in the loop; uses of $x$ in the loop reached only by it.
- Strength reduction: `t = 4 * i` becomes `t = t + 4` after `i = i + 1`, with $t$ set before the loop.
- Copies left by copy propagation are removed by a separate dead code pass; iterate until nothing changes.
