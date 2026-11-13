---
title: "Relational algebra and tuple calculus"
summary: "The relational algebra operators including joins and division, how to count output tuples, and how to read and check safety of tuple relational calculus queries."
order: 2
sources:
  - title: "Relational algebra (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Relational_algebra"
  - title: "Tuple relational calculus (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Tuple_relational_calculus"
  - title: "GATE Overflow: relational-algebra questions"
    url: "https://gateoverflow.in/tag/relational-algebra"
---

## The relational model in one paragraph

A relation is a set of tuples over a fixed list of attributes (its schema). Because it is a set, there are no duplicate tuples and no order. Relational algebra is a procedural language: you combine operators to describe how to compute an answer. Tuple relational calculus (TRC) is declarative: you describe the tuples you want with a logical formula. Both have the same expressive power for safe queries. GATE asks you to evaluate expressions on small tables, count output tuples, and pick the expression or formula that matches an English query.

**Always assume set semantics in relational algebra unless told otherwise.** Projection removes duplicates. SQL does not, which is a frequent source of wrong answers.

## Basic operators

| Operator | Notation | Result |
|---|---|---|
| Selection | $\sigma_{c}(R)$ | Tuples of R satisfying condition c |
| Projection | $\pi_{A_1, \dots, A_k}(R)$ | Only listed attributes, duplicates removed |
| Union | $R \cup S$ | Tuples in R or S (union-compatible) |
| Difference | $R - S$ | Tuples in R not in S |
| Cartesian product | $R \times S$ | Every pairing, $\lvert R \rvert \cdot \lvert S \rvert$ tuples |
| Rename | $\rho_{T(B_1, \dots)}(R)$ | Same tuples, new names |

These six are a complete set. Everything else can be rewritten using them:

- $R \cap S = R - (R - S)$
- $R \bowtie_{c} S = \sigma_{c}(R \times S)$
- Natural join: product, select equality on common attributes, project away the duplicate columns.

**Union-compatible** means the same number of attributes with matching domains, position by position.

### Cardinality bounds

For $\lvert R \rvert = m$ and $\lvert S \rvert = n$:

| Expression | Minimum | Maximum |
|---|---|---|
| $\sigma_c(R)$ | 0 | $m$ |
| $\pi_A(R)$ | 1 if $m > 0$ | $m$ |
| $R \cup S$ | $\max(m, n)$ | $m + n$ |
| $R \cap S$ | 0 | $\min(m, n)$ |
| $R - S$ | $\max(0, m - n)$ | $m$ |
| $R \times S$ | $mn$ | $mn$ |
| $R \bowtie S$ | 0 | $mn$ |

The minimum of $R - S$ is $\max(0, m - n)$: the n tuples of S can cancel at most n tuples of R, and the bound is reached when S's tuples are all in R (or S contains all of R).

If the join attribute is the primary key of S and a non-null foreign key in R referencing S, then $\lvert R \bowtie S \rvert = m$ exactly.

## Joins

### Theta join and equijoin

$R \bowtie_{\theta} S = \sigma_{\theta}(R \times S)$. An equijoin uses only equality conditions and keeps both copies of the compared attributes.

### Natural join

$R \bowtie S$ equates all attributes with the same name and keeps one copy of each. Two edge cases:

- No common attributes: natural join becomes the Cartesian product.
- Identical schemas: natural join becomes intersection.

### Outer joins

Outer joins keep unmatched tuples and pad the missing side with NULL.

- Left outer join R ⟕ S: all of R.
- Right outer join R ⟖ S: all of S.
- Full outer join R ⟗ S: both.

Counting rule: size of R ⟕ S = size of $R \bowtie S$ + (number of R tuples with no match), and similarly for the others.

### Semijoin

$R \ltimes S = \pi_{\text{attrs}(R)}(R \bowtie S)$: the tuples of R that have at least one partner in S.

## Division

Division answers "for all" questions. If $R(A, B)$ and $S(B)$, then $R \div S$ is the set of A values that are paired in R with **every** B value in S.

$$R \div S = \pi_A(R) - \pi_A\big((\pi_A(R) \times S) - R\big)$$

Read it in three steps: build every pair an A value should have, subtract the pairs that exist to find what is missing, then remove A values that miss anything. If S is empty, every A in $\pi_A(R)$ qualifies.

## Tuple relational calculus

A TRC query has the form $\{ t \mid P(t) \}$: all tuples $t$ for which formula $P$ is true. Atoms are $t \in R$, $t[A] \; op \; s[B]$ and $t[A] \; op \; c$. Formulas combine atoms with $\wedge$, $\vee$, $\neg$, $\Rightarrow$, $\exists$ and $\forall$.

Useful identities:

- $\forall t\,(P) \equiv \neg \exists t\,(\neg P)$
- $P \Rightarrow Q \equiv \neg P \vee Q$

A "for all" query in TRC usually looks like $\forall u \in S\,(\exists v \in R\,(\dots))$, which is the calculus version of division.

### Safety

A TRC expression is **safe** if it is guaranteed to produce a finite result whose values come from the relations and constants mentioned in the query (the domain of the expression). $\{ t \mid \neg (t \in R) \}$ is unsafe: it asks for everything not in R. $\{ t \mid t \in R \wedge \neg (t \in S) \}$ is safe because $t$ is tied to R. Relational algebra expressions are always safe, and safe TRC has the same power as relational algebra.

Domain relational calculus (DRC) is the same idea with variables ranging over attribute values instead of tuples.

## Worked examples

### Worked example 1: join counts

$R(A, B)$ and $S(B, C)$:

| A | B |
|---|---|
| 1 | p |
| 2 | p |
| 3 | q |
| 4 | r |

| B | C |
|---|---|
| p | 10 |
| p | 20 |
| p | 30 |
| q | 40 |
| s | 50 |

- $R \bowtie S$: A=1 and A=2 each match three p tuples (6), A=3 matches one q tuple (1). Total 7.
- R ⟕ S: add (4, r, NULL) for the unmatched R tuple. Total 8.
- R ⟖ S: add (NULL, s, 50). Total 8.
- R ⟗ S: 7 + 1 + 1 = 9.
- $\pi_B(R \bowtie S)$: {p, q}, 2 tuples, since projection removes duplicates.

### Worked example 2: division step by step

$Supplies(sno, pno)$ = {(s1,p1), (s1,p2), (s1,p3), (s2,p1), (s2,p3), (s3,p2), (s4,p1), (s4,p2), (s4,p3), (s4,p4)} and $Need(pno)$ = {p1, p2}. Find suppliers who supply all needed parts.

1. $\pi_{sno}(Supplies)$ = {s1, s2, s3, s4}.
2. $\pi_{sno}(Supplies) \times Need$ has 8 pairs.
3. Subtract $Supplies$: the missing pairs are (s2, p2) and (s3, p1).
4. $\pi_{sno}$ of the missing pairs = {s2, s3}.
5. {s1, s2, s3, s4} - {s2, s3} = {s1, s4}.

s4 supplies an extra part p4, which does not matter.

### Worked example 3: highest value without aggregates

Relational algebra has no MAX in its basic form, so "the largest salary" is found by removing every value that is beaten by another:

$$\pi_{sal}(Emp) - \pi_{e_1.sal}\big(\rho_{e_1}(Emp) \bowtie_{e_1.sal < e_2.sal} \rho_{e_2}(Emp)\big)$$

The join keeps every salary that has a bigger one somewhere. Subtracting leaves only the maximum. Adding $e_1.dept = e_2.dept$ to the join condition gives the maximum within each department instead, and ties all survive.

### Worked example 4: reading a TRC query

Relations $Student(sid, name)$, $Course(cid)$, $Takes(sid, cid)$.

$$\{ t \mid \exists s \in Student\,\big(t[name] = s[name] \wedge \forall c \in Course\,\exists k \in Takes\,(k[sid] = s[sid] \wedge k[cid] = c[cid])\big)\}$$

For a student $s$, the inner part says every course $c$ has a Takes tuple linking it to $s$. So the query returns names of students who take all courses: the calculus form of $Takes \div Course$ followed by a join with Student for names. If Course is empty, the $\forall$ is vacuously true and every student qualifies, which matches the algebra definition.

## Equivalence rules worth knowing

- $\sigma_{c_1 \wedge c_2}(R) = \sigma_{c_1}(\sigma_{c_2}(R))$ and selections commute.
- $\pi_{A}(\pi_{A, B}(R)) = \pi_A(R)$.
- Selection distributes over $\cup$, $\cap$ and $-$.
- Projection distributes over $\cup$ but **not** over $-$ or $\cap$.
- Join is commutative and associative (up to column order).
- $\sigma_c(R \times S) = R \bowtie_c S$.
- Push selections down toward base relations before joins: same result, smaller intermediates.

The projection-over-difference trap: with $R = \{(1, x)\}$ and $S = \{(1, y)\}$, $\pi_A(R - S) = \{1\}$ but $\pi_A(R) - \pi_A(S) = \emptyset$.

## Common traps

- Keeping duplicates after projection. Relational algebra projection returns a set.
- Treating a natural join with no common attributes as empty. It is a Cartesian product.
- Confusing "at least one" with "all". The first is a join or semijoin; the second needs division or a double negation.
- Writing division backwards: subtracting $(\pi_A(R) \times S)$ from R instead of R from it.
- Counting an outer join without adding the unmatched tuples, or adding unmatched tuples from the wrong side.
- Forgetting that $R - S$ and $R \cap S$ need union-compatible schemas.
- Calling $\{ t \mid t \notin R \}$ a valid query. It is unsafe.
- Assuming projection distributes over difference.

## Quick revision

- Complete set: $\sigma, \pi, \cup, -, \times, \rho$.
- $R \cap S = R - (R - S)$; join = select on product.
- $R \div S = \pi_A(R) - \pi_A((\pi_A(R) \times S) - R)$; it answers "for all".
- $\lvert R \cup S \rvert \in [\max(m,n),\, m+n]$; $\lvert R \bowtie S \rvert \in [0,\, mn]$.
- Outer join size = inner join size + unmatched tuples padded with NULL.
- Natural join with no shared attribute = product; with identical schemas = intersection.
- TRC: $\{t \mid P(t)\}$; $\forall$ is $\neg \exists \neg$; safe means finite and drawn from the query's domain.
- Safe TRC, safe DRC and relational algebra are equally expressive.
