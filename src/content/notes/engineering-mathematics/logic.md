---
title: "Propositional and first order logic"
summary: "Connectives, equivalences, normal forms, inference rules, quantifiers and the validity questions GATE asks about propositional and predicate logic."
order: 1
sources:
  - title: "Propositional calculus (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Propositional_calculus"
  - title: "First-order logic (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/First-order_logic"
  - title: "GATE Overflow: propositional logic questions"
    url: "https://gateoverflow.in/tag/propositional-logic"
  - title: "GATE Overflow: first order logic questions"
    url: "https://gateoverflow.in/tag/first-order-logic"
---

GATE asks one or two questions from logic almost every year. They fall into four patterns: decide whether a formula is a tautology, find an equivalent formula, translate English into predicate logic, and decide which first order formulas are valid. All four reward a small set of identities used quickly and correctly.

## Propositional logic

### Connectives and truth tables

A proposition is a statement that is either true (T) or false (F). Formulas are built with $\lnot$, $\land$, $\lor$, $\to$ and $\leftrightarrow$.

| $p$ | $q$ | $p \land q$ | $p \lor q$ | $p \to q$ | $p \leftrightarrow q$ | $p \oplus q$ |
|---|---|---|---|---|---|---|
| T | T | T | T | T | T | F |
| T | F | F | T | F | F | T |
| F | T | F | T | T | F | T |
| F | F | F | F | T | T | F |

The only row where $p \to q$ is false is $p = T, q = F$. Almost every tautology check uses this fact: to show $A \to B$ is a tautology, assume $A$ true and $B$ false and derive a contradiction.

### Classification of formulas

- **Tautology (valid):** true in every row.
- **Contradiction (unsatisfiable):** false in every row.
- **Satisfiable:** true in at least one row.
- **Contingency:** satisfiable but not a tautology.

$A$ is a tautology exactly when $\lnot A$ is unsatisfiable. $A$ and $B$ are logically equivalent ($A \equiv B$) exactly when $A \leftrightarrow B$ is a tautology. $A$ logically implies $B$ exactly when $A \to B$ is a tautology.

### Equivalences to know by heart

| Name | Equivalence |
|---|---|
| Implication | $p \to q \equiv \lnot p \lor q$ |
| Contrapositive | $p \to q \equiv \lnot q \to \lnot p$ |
| De Morgan | $\lnot(p \land q) \equiv \lnot p \lor \lnot q$, $\lnot(p \lor q) \equiv \lnot p \land \lnot q$ |
| Negated implication | $\lnot(p \to q) \equiv p \land \lnot q$ |
| Exportation | $p \to (q \to r) \equiv (p \land q) \to r$ |
| Distribution | $p \lor (q \land r) \equiv (p \lor q) \land (p \lor r)$ |
| Absorption | $p \lor (p \land q) \equiv p$, $p \land (p \lor q) \equiv p$ |
| Biconditional | $p \leftrightarrow q \equiv (p \to q) \land (q \to p) \equiv (p \land q) \lor (\lnot p \land \lnot q)$ |
| Case split | $(p \to r) \land (q \to r) \equiv (p \lor q) \to r$ |
| | $(p \to q) \land (p \to r) \equiv p \to (q \land r)$ |

Two non-equivalences show up as distractors: $(p \to q) \to r$ is **not** the same as $p \to (q \to r)$ (implication is not associative), and $(p \to r) \lor (q \to r) \equiv (p \land q) \to r$, not $(p \lor q) \to r$.

The converse $q \to p$ and the inverse $\lnot p \to \lnot q$ are equivalent to each other but not to $p \to q$.

### Normal forms and functional completeness

Every formula has a **CNF** (AND of clauses, each an OR of literals) and a **DNF** (OR of terms, each an AND of literals). Read the DNF off the true rows of the truth table and the CNF off the false rows.

A set of connectives is **functionally complete** if it can express every Boolean function. $\{\lnot, \land\}$, $\{\lnot, \lor\}$, $\{\lnot, \to\}$, $\{\text{NAND}\}$ and $\{\text{NOR}\}$ are complete. $\{\land, \lor\}$, $\{\land, \lor, \to, \leftrightarrow\}$ and $\{\oplus, \leftrightarrow\}$ are not: the first two cannot produce F when all inputs are T, and the last can only produce affine (XOR-type) functions. Also, $\{\to, F\}$ is complete because $\lnot p \equiv p \to F$.

There are $2^{2^n}$ distinct Boolean functions of $n$ variables, so $2^{2^n}$ pairwise non-equivalent formulas.

### Rules of inference

An argument with premises $P_1, \dots, P_k$ and conclusion $C$ is valid when $(P_1 \land \dots \land P_k) \to C$ is a tautology.

| Rule | From | Infer |
|---|---|---|
| Modus ponens | $p$, $p \to q$ | $q$ |
| Modus tollens | $\lnot q$, $p \to q$ | $\lnot p$ |
| Hypothetical syllogism | $p \to q$, $q \to r$ | $p \to r$ |
| Disjunctive syllogism | $p \lor q$, $\lnot p$ | $q$ |
| Resolution | $p \lor q$, $\lnot p \lor r$ | $q \lor r$ |
| Constructive dilemma | $p \to q$, $r \to s$, $p \lor r$ | $q \lor s$ |

Two classical fallacies: affirming the consequent ($q$, $p \to q$, so $p$) and denying the antecedent ($\lnot p$, $p \to q$, so $\lnot q$).

## First order (predicate) logic

### Quantifiers

$\forall x\, P(x)$ is true when $P$ holds for every element of the domain; $\exists x\, P(x)$ when it holds for at least one. On a finite domain $\{a_1, \dots, a_n\}$, $\forall$ is a big AND and $\exists$ is a big OR. That view makes most validity questions mechanical.

Negation moves quantifiers across:
$$\lnot \forall x\, P(x) \equiv \exists x\, \lnot P(x), \qquad \lnot \exists x\, P(x) \equiv \forall x\, \lnot P(x).$$

### Distribution laws

| Formula | Status |
|---|---|
| $\forall x\,(P \land Q) \leftrightarrow \forall x\, P \land \forall x\, Q$ | valid |
| $\exists x\,(P \lor Q) \leftrightarrow \exists x\, P \lor \exists x\, Q$ | valid |
| $\forall x\, P \lor \forall x\, Q \to \forall x\,(P \lor Q)$ | valid, converse not valid |
| $\exists x\,(P \land Q) \to \exists x\, P \land \exists x\, Q$ | valid, converse not valid |
| $\exists x\, \forall y\, R(x,y) \to \forall y\, \exists x\, R(x,y)$ | valid, converse not valid |
| $\forall x\, \forall y \leftrightarrow \forall y\, \forall x$, same for $\exists\exists$ | valid |

A quick memory aid: $\forall$ is AND-like, so it distributes over AND; $\exists$ is OR-like, so it distributes over OR.

When $x$ does not occur free in $Q$: $\forall x\,(P(x) \to Q) \equiv \exists x\, P(x) \to Q$ and $\exists x\,(P(x) \to Q) \equiv \forall x\, P(x) \to Q$. The quantifier flips when it moves out of the antecedent. This trips up many candidates.

### Translating English

The standard patterns:

| English | Formula |
|---|---|
| Every $A$ is $B$ | $\forall x\,(A(x) \to B(x))$ |
| Some $A$ is $B$ | $\exists x\,(A(x) \land B(x))$ |
| No $A$ is $B$ | $\forall x\,(A(x) \to \lnot B(x))$ |
| Not every $A$ is $B$ | $\exists x\,(A(x) \land \lnot B(x))$ |
| Only $A$s are $B$ | $\forall x\,(B(x) \to A(x))$ |

Rule of thumb: $\forall$ pairs with $\to$, and $\exists$ pairs with $\land$. $\exists x\,(A(x) \to B(x))$ is almost always wrong, because any $x$ outside $A$ makes it true.

## Worked examples

### Worked example 1: Tautology by contradiction

Is $\big((p \lor q) \land (p \to r) \land (q \to r)\big) \to r$ a tautology?

1. Assume it is false. Then $r = F$ and the antecedent is true.
2. $p \to r$ true with $r = F$ forces $p = F$. Likewise $q = F$.
3. Then $p \lor q = F$, contradicting the antecedent being true.

No falsifying row exists, so it is a tautology (it is the case split rule).

### Worked example 2: Counting satisfying assignments

How many assignments to $a, b, c, d$ satisfy $(a \leftrightarrow b) \land (c \oplus d)$?

The two conjuncts share no variables. $a \leftrightarrow b$ is true for 2 of the 4 assignments to $(a, b)$, and $c \oplus d$ for 2 of the 4 assignments to $(c, d)$. Answer: $2 \times 2 = 4$ out of 16.

When conjuncts share no variables, multiply counts. When they share variables, split on a shared variable and count each branch.

### Worked example 3: Negating a nested statement

Negate "for every $\varepsilon > 0$ there is a $\delta > 0$ such that for all $x$, $|x| < \delta \to |f(x)| < \varepsilon$".

Formula: $\forall \varepsilon\, \exists \delta\, \forall x\,(|x| < \delta \to |f(x)| < \varepsilon)$, with the domain restrictions on $\varepsilon, \delta$ understood.

Flip each quantifier and negate the matrix:
$$\exists \varepsilon\, \forall \delta\, \exists x\,\big(|x| < \delta \land |f(x)| \ge \varepsilon\big).$$

### Worked example 4: Validity on a small domain

Is $\forall x\, \exists y\, R(x,y) \to \exists y\, \forall x\, R(x,y)$ valid?

Try the domain $\{1, 2\}$ with $R = \{(1,1), (2,2)\}$, which is equality. Every $x$ has a partner ($y = x$), so the left side is true. No single $y$ is related to both 1 and 2, so the right side is false. The formula is not valid. To refute validity, one small counter-model is enough. To prove validity, argue from the meaning of the quantifiers as in the distribution table.

### Worked example 5: Which conclusion follows

Premises: "If it rains, the match is cancelled", "If the match is cancelled, tickets are refunded", "Tickets were not refunded". Let $r, c, f$ be the three atoms. Premises: $r \to c$, $c \to f$, $\lnot f$.

1. Hypothetical syllogism: $r \to f$.
2. Modus tollens with $\lnot f$: $\lnot r$.
3. Also $\lnot c$ by modus tollens on $c \to f$.

Valid conclusions: $\lnot r$, $\lnot c$, and anything they imply, such as $\lnot r \lor x$ for any $x$.

## Common traps

- Treating $p \to q$ as false when $p$ is false. A false antecedent makes the implication true (vacuous truth).
- Thinking $\to$ is associative. $(p \to q) \to r$ and $p \to (q \to r)$ differ at $p = F, r = F$.
- Writing $\exists x\,(A(x) \to B(x))$ for "some $A$ is $B$".
- Distributing $\forall$ over $\lor$ or $\exists$ over $\land$.
- Swapping $\exists x\, \forall y$ and $\forall y\, \exists x$. Only $\exists\forall \to \forall\exists$ is valid.
- Pulling a quantifier out of the antecedent of an implication without flipping it.
- In "only if" sentences: "$p$ only if $q$" means $p \to q$, not $q \to p$.
- "$p$ unless $q$" means $\lnot q \to p$, which is $p \lor q$.

## Quick revision

- $p \to q \equiv \lnot p \lor q \equiv \lnot q \to \lnot p$. $\lnot(p \to q) \equiv p \land \lnot q$.
- Tautology check: assume the implication false, look for a contradiction.
- Exportation: $p \to (q \to r) \equiv (p \land q) \to r$.
- $(p \to r) \land (q \to r) \equiv (p \lor q) \to r$; $(p \to r) \lor (q \to r) \equiv (p \land q) \to r$.
- $2^{2^n}$ distinct Boolean functions of $n$ variables.
- NAND and NOR alone are complete; $\{\land, \lor\}$ is not.
- $\lnot\forall \equiv \exists\lnot$, $\lnot\exists \equiv \forall\lnot$.
- $\forall$ distributes over $\land$; $\exists$ distributes over $\lor$.
- $\exists x\, \forall y \to \forall y\, \exists x$ is valid; the converse is not.
- $\forall$ goes with $\to$, $\exists$ goes with $\land$.
- One counter-model on a 2 element domain is enough to show a formula is not valid.
