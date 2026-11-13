---
title: "Turing machines and undecidability"
summary: "Turing machines and their variants, recursive, RE and co-RE languages, the halting problem, reductions, Rice's theorem, and the decidability status of standard problems for each language class."
order: 4
sources:
  - title: "Wikipedia: Turing machine"
    url: "https://en.wikipedia.org/wiki/Turing_machine"
  - title: "Wikipedia: Rice's theorem"
    url: "https://en.wikipedia.org/wiki/Rice%27s_theorem"
  - title: "Wikipedia: Halting problem"
    url: "https://en.wikipedia.org/wiki/Halting_problem"
  - title: "GATE Overflow: decidability tag"
    url: "https://gateoverflow.in/tag/decidability"
---

## The question this topic answers

Regular and context-free languages are about how much memory a machine has. Turing machines remove the memory limit, and the question changes: not "can a machine recognize this?" but "can a machine always **finish** and give the answer?". GATE asks this every year in the form "which of these problems is decidable", plus a question on RE versus recursive and one on Rice's theorem or reductions.

## Turing machines

A (deterministic, single-tape) Turing machine is $M = (Q, \Sigma, \Gamma, \delta, q_0, \sqcup, F)$:

- $Q$: finite set of states, $q_0$ the start state, $F$ the accepting (halting) states
- $\Sigma$: input alphabet; $\Gamma \supseteq \Sigma \cup \{\sqcup\}$: tape alphabet, with blank $\sqcup$
- $\delta : Q \times \Gamma \to Q \times \Gamma \times \{L, R\}$: read a symbol, write a symbol, move one cell

The tape is infinite to the right (or both ways; it does not matter). On input $w$ the machine either accepts, rejects, or runs forever. This third outcome is what makes everything here interesting.

### Variants with the same power

All of the following accept exactly the same languages as the basic TM:

- multi-tape TMs (simulated with polynomial slowdown)
- two-way infinite tape
- nondeterministic TMs (simulated by breadth-first search over computations, exponential slowdown)
- TMs with a stay-in-place move
- two-stack PDAs, queue automata, two-counter machines
- enumerators (machines that print the strings of the language)

Weaker models: a finite automaton (regular), a one-stack PDA (CFL), and a **linear bounded automaton** (a nondeterministic TM restricted to the cells holding the input), which accepts exactly the context-sensitive languages.

The **Church-Turing thesis** states that anything computable by an effective procedure is computable by a Turing machine. It is a thesis, not a theorem, because "effective procedure" is informal.

## Recursive, RE and co-RE

| Class | Definition | Machine behaviour |
|---|---|---|
| Recursive (decidable) | some TM accepts $L$ and halts on every input | always answers yes or no |
| Recursively enumerable (RE, semi-decidable, Turing-recognizable) | some TM accepts exactly $L$ | halts and accepts on members; may loop on non-members |
| co-RE | $\overline{L}$ is RE | can confirm non-members; may loop on members |

The central theorem:

$$L \text{ is recursive} \iff L \text{ is RE and } \overline{L} \text{ is RE}$$

Run the two recognizers in parallel, one step each in turn. Every input is accepted by one of them, so the combination always halts. Consequences:

- If $L$ is RE but not recursive, then $\overline{L}$ is not RE.
- Recursive = RE $\cap$ co-RE.
- There are languages that are neither RE nor co-RE, for example $\{\langle M \rangle : L(M) = \Sigma^*\}$.

### Hierarchy

$$\text{Regular} \subset \text{DCFL} \subset \text{CFL} \subset \text{CSL} \subset \text{Recursive} \subset \text{RE} \subset \text{all languages}$$

Every inclusion is proper.

### Countability

TMs have finite descriptions, so there are countably many TMs and therefore countably many RE languages. The set of all languages over even a one-letter alphabet is the power set of a countably infinite set, which is uncountable. So most languages are not RE. This counting argument shows non-RE languages exist without naming one.

## The halting problem

$HALT = \{\langle M, w \rangle : M \text{ halts on } w\}$ and $A_{TM} = \{\langle M, w \rangle : M \text{ accepts } w\}$ are both RE (simulate $M$ on $w$) and both undecidable.

**Diagonal argument (sketch).** Suppose $H$ decides $A_{TM}$. Build $D$: on input $\langle M \rangle$, run $H$ on $\langle M, \langle M \rangle \rangle$ and do the opposite. Then $D$ on $\langle D \rangle$ accepts if and only if it does not accept. Contradiction.

So $\overline{HALT}$ and $\overline{A_{TM}}$ are co-RE and not RE.

## Reductions

$A \le_m B$ (many-one reduction) means there is a computable function $f$ with $x \in A \iff f(x) \in B$.

- If $B$ is decidable, then $A$ is decidable.
- If $B$ is RE, then $A$ is RE.
- If $A$ is undecidable, then $B$ is undecidable.
- If $A$ is not RE, then $B$ is not RE.

Information flows **upward** for hardness (from $A$ to $B$) and **downward** for easiness (from $B$ to $A$). A reduction also works for complements: $A \le_m B$ implies $\overline{A} \le_m \overline{B}$.

To prove a new problem $B$ undecidable, reduce a known undecidable problem (usually $A_{TM}$ or $HALT$) **to** $B$.

## Rice's theorem

**Statement.** Let $P$ be a property of RE languages (a set of RE languages) that is **non-trivial**: some RE language has it and some RE language does not. Then $\{\langle M \rangle : L(M) \in P\}$ is undecidable.

How to apply it:

1. Is the question about $L(M)$ only, so two machines with the same language always get the same answer? If it is about states, steps, head moves or tape contents, Rice does not apply.
2. Is it non-trivial? Find one RE language with the property and one without.
3. If both hold, the problem is undecidable.

Rice tells you "undecidable", nothing more. Whether the problem is RE, co-RE or neither needs extra reasoning. A useful guide (the Rice-Shapiro theorem): a property can be RE only if membership is witnessed by a finite set of strings. "$L(M)$ is non-empty" is RE; "$L(M)$ is infinite" and "$L(M) = \Sigma^*$" are not.

## Decidability of standard problems

D = decidable, U = undecidable. The input is a machine or grammar of the given class.

| Problem | Regular | DCFL | CFL | CSL | Recursive | RE |
|---|---|---|---|---|---|---|
| Membership: is $w \in L$? | D | D | D | D | D | U |
| Emptiness: is $L = \emptyset$? | D | D | D | U | U | U |
| Finiteness: is $L$ finite? | D | D | D | U | U | U |
| Universality: is $L = \Sigma^*$? | D | D | U | U | U | U |
| Equivalence: is $L_1 = L_2$? | D | D | U | U | U | U |
| Containment: is $L_1 \subseteq L_2$? | D | U | U | U | U | U |
| Disjointness: is $L_1 \cap L_2 = \emptyset$? | D | U | U | U | U | U |
| Is $L$ regular? | D | D | U | U | U | U |

Notes:

- DCFL equivalence was proved decidable in 1997. Older books list it as open; go with the current result.
- DCFL universality is decidable because DCFLs are closed under complement and DCFL emptiness is decidable.
- Ambiguity of a CFG is undecidable. Whether a CFG is LL(1) or LR(k) for a fixed $k$ is decidable.
- Membership for CSL is decidable because productions never shorten the sentential form; there are finitely many forms of length at most $|w|$.

### Post Correspondence Problem

Given tiles $(x_1, y_1), \dots, (x_k, y_k)$, is there a non-empty index sequence $i_1, \dots, i_m$ with $x_{i_1} \cdots x_{i_m} = y_{i_1} \cdots y_{i_m}$?

- Undecidable in general; RE (enumerate sequences).
- Decidable when the alphabet has one symbol (only lengths matter).
- PCP is the usual source for proving CFG problems undecidable: ambiguity, intersection emptiness of two CFGs, and universality.

### Problems that look undecidable but are not

- Does $M$ halt on $w$ within $k$ steps? Simulate $k$ steps.
- Does $M$ have more than $k$ states? Read the description.
- Does $M$ ever move left on input $w$? If it only moves right, after $|w| + |Q| + 1$ steps it is on blanks with a repeated state and will repeat forever.
- Does $M$ visit more than $k$ tape cells on $w$? With $k$ cells there are finitely many configurations, so either it leaves the region or it repeats a configuration.

## Worked examples

### Worked example 1: Applying Rice's theorem

Which of these are decidable for a TM $M$?

1. $L(M)$ contains $101$: about the language, non-trivial. **Undecidable.**
2. $M$ has an even number of states: not about the language. **Decidable.**
3. $L(M)$ is a context-free language: non-trivial ($\{\epsilon\}$ is CFL, $A_{TM}$ is not). **Undecidable.**
4. $L(M)$ is an RE language: every $L(M)$ is RE, so the property is trivial. **Decidable** (always yes).
5. $M$ halts on $\epsilon$ within 1000 steps: about running time. **Decidable.**

### Worked example 2: A reduction

Show $E = \{\langle M \rangle : M \text{ halts on the blank tape}\}$ is undecidable.

Reduce $HALT$ to $E$. Given $\langle M, w \rangle$, build $M_w$: erase the tape, write $w$, then run $M$. The function $\langle M, w \rangle \mapsto \langle M_w \rangle$ is computable, and $M_w$ halts on blank tape exactly when $M$ halts on $w$. If $E$ were decidable, $HALT$ would be decidable. So $E$ is undecidable. Since $HALT$ is RE and $E$ is clearly RE as well (simulate), $E$ is RE but not recursive.

### Worked example 3: Classifying RE and co-RE

Classify each set of TM encodings.

1. $L_1 = \{\langle M \rangle : M \text{ accepts at least 3 strings}\}$. Dovetail $M$ over all strings and all step counts; accept once 3 acceptances are seen. **RE**, not recursive (Rice).
2. $L_2 = \{\langle M \rangle : L(M) = \emptyset\}$. Complement of "accepts at least one string", which is RE. So $L_2$ is **co-RE**, not RE.
3. $L_3 = \{\langle M \rangle : L(M) \text{ is finite}\}$. **Neither** RE nor co-RE. It is not RE by Rice-Shapiro (finiteness is not witnessed by finitely many strings), and its complement "$L(M)$ is infinite" is not RE either.
4. $L_4 = \{\langle M \rangle : M \text{ halts on } \epsilon \text{ within } 2^{|Q_M|} \text{ steps}\}$. The bound is computed from the description of $M$, then a finite simulation answers the question. **Decidable.** Rice does not apply because two machines with the same language can have different step counts.

### Worked example 4: Closure with recursive and RE

$L_1$ is RE and not recursive; $L_2$ is recursive. What can be said about $L_2 - L_1$?

$L_2 - L_1 = L_2 \cap \overline{L_1}$. $\overline{L_1}$ is not RE. With $L_2 = \Sigma^*$, the difference is $\overline{L_1}$ itself, which is not RE. So $L_2 - L_1$ need not be RE. In contrast, $L_1 - L_2 = L_1 \cap \overline{L_2}$ is RE because $\overline{L_2}$ is recursive.

## Common traps

- **Rice needs a property of the language.** Questions about states, steps, tape cells or head moves are outside Rice and are often decidable.
- **Trivial properties are decidable.** "$L(M)$ is RE" is always true.
- **Undecidable is not the same as not RE.** $HALT$ is undecidable but RE.
- **Reduction direction.** Reduce the known hard problem to the new one.
- **CFG problems.** Membership, emptiness and finiteness are decidable; equivalence, universality, ambiguity and intersection emptiness are not.
- **CSL emptiness is undecidable** even though CSL membership is decidable.
- **Two-stack PDA and multi-tape TM** have exactly the power of a TM; an LBA does not.
- **Complement of RE.** RE is not closed under complement; recursive is.

## Quick revision

- Recursive: TM halts on all inputs. RE: TM accepts members, may loop otherwise.
- Recursive $=$ RE $\cap$ co-RE.
- $HALT$, $A_{TM}$: RE, not recursive. Their complements: co-RE, not RE.
- $\{\langle M \rangle : L(M) = \Sigma^*\}$ and "$L(M)$ finite": neither RE nor co-RE.
- $A \le_m B$: $B$ decidable gives $A$ decidable; $A$ undecidable gives $B$ undecidable.
- Rice: every non-trivial property of $L(M)$ is undecidable.
- Regular: everything decidable. CFL: membership, emptiness, finiteness only. CSL: membership only. RE: nothing in the table.
- PCP: undecidable in general, decidable over a unary alphabet.
- Countably many TMs, uncountably many languages, so non-RE languages exist.
