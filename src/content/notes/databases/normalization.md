---
title: "Integrity constraints and normal forms"
summary: "Keys and integrity constraints, functional dependencies, attribute closure, minimal cover, finding candidate keys, the 1NF to BCNF tests, and lossless and dependency-preserving decomposition."
order: 4
sources:
  - title: "Database normalization (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Database_normalization"
  - title: "Functional dependency (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Functional_dependency"
  - title: "GATE Overflow: database-normalization questions"
    url: "https://gateoverflow.in/tag/database-normalization"
---

## Integrity constraints

- **Domain constraint**: each value comes from the attribute's domain (type, range, CHECK).
- **Key constraint**: no two tuples agree on a candidate key.
- **Entity integrity**: primary key attributes cannot be NULL.
- **Referential integrity**: a foreign key value must either be NULL or match the primary key of some tuple in the referenced relation. When a referenced tuple is deleted, the action can be RESTRICT/NO ACTION (reject), CASCADE (delete referencing tuples, recursively), SET NULL or SET DEFAULT.

Inserting into the referencing table and deleting from the referenced table are the operations that can violate referential integrity. Deleting from the referencing table or inserting into the referenced table never can.

## Keys

- **Superkey**: a set of attributes whose closure is the whole relation.
- **Candidate key**: a minimal superkey (no proper subset is a superkey).
- **Primary key**: the candidate key chosen by the designer.
- **Prime attribute**: an attribute that belongs to at least one candidate key. All others are non-prime.

Counting superkeys of $R$ with $n$ attributes:

- One candidate key of size $k$: $2^{n-k}$ superkeys.
- Two candidate keys $K_1$, $K_2$: $2^{n - |K_1|} + 2^{n - |K_2|} - 2^{n - |K_1 \cup K_2|}$ (inclusion-exclusion).

## Functional dependencies

$X \to Y$ holds if any two tuples that agree on $X$ also agree on $Y$. An FD is a statement about every legal instance, so a single instance can disprove an FD but cannot prove one.

### Armstrong's axioms

- Reflexivity: if $Y \subseteq X$ then $X \to Y$.
- Augmentation: if $X \to Y$ then $XZ \to YZ$.
- Transitivity: if $X \to Y$ and $Y \to Z$ then $X \to Z$.

Derived rules: union ($X \to Y$, $X \to Z$ give $X \to YZ$), decomposition ($X \to YZ$ gives $X \to Y$), pseudotransitivity ($X \to Y$, $WY \to Z$ give $WX \to Z$). Note that $XY \to Z$ does **not** imply $X \to Z$.

### Attribute closure

$X^+$ is every attribute determined by $X$. Start with $X$; repeatedly, for any FD $L \to R$ with $L \subseteq X^+$, add $R$. Stop when nothing changes. $X \to Y$ is in $F^+$ exactly when $Y \subseteq X^+$.

### Minimal (canonical) cover

A minimal cover $G$ of $F$ is equivalent to $F$ and has:

1. A single attribute on every right side.
2. No extraneous attribute on any left side: for $XA \to B$, $A$ is extraneous if $B \in X^+$ (computed with the full set).
3. No redundant FD: $X \to B$ is redundant if $B \in X^+$ computed without that FD.

Do the steps in this order. A set can have more than one minimal cover.

## Finding candidate keys

1. Attributes that appear on **no right side** must be in every key. Call this set $C$ (the core).
2. Attributes that appear **only on right sides** are in no key.
3. If $C^+$ is everything, $C$ is the only candidate key.
4. Otherwise try adding the remaining attributes to $C$, smallest sets first, and keep minimal sets whose closure is everything.
5. Shortcut: once $K$ is a key, if some FD $X \to A$ has $A \in K$, then $(K - A) \cup X$ is a superkey; reduce it to find another key.

## Normal forms

| Form | Condition |
|---|---|
| 1NF | All attribute values are atomic (no repeating groups, no sets) |
| 2NF | 1NF, and no non-prime attribute depends on a proper subset of any candidate key |
| 3NF | For every non-trivial $X \to A$: $X$ is a superkey or $A$ is prime |
| BCNF | For every non-trivial $X \to A$: $X$ is a superkey |

Each form implies the ones above it: BCNF $\Rightarrow$ 3NF $\Rightarrow$ 2NF $\Rightarrow$ 1NF.

Quick facts:

- A relation whose candidate keys are all single attributes is automatically in 2NF.
- A relation where every attribute is prime is automatically in 3NF.
- Any relation with exactly two attributes is in BCNF.
- To find the highest normal form, compute all keys first, then test BCNF, then 3NF, then 2NF, using every FD (including ones in $F^+$ that matter, such as those derived on a projection).

## Decomposition

Decompose $R$ into $R_1, \dots, R_n$ to remove redundancy. Two properties matter.

### Lossless join

Joining the parts gives back exactly $R$, with no spurious tuples. For two parts the test is:

$$R_1 \cap R_2 \to R_1 \quad \text{or} \quad R_1 \cap R_2 \to R_2$$

that is, the common attributes form a superkey of at least one side. For three or more parts, either merge two at a time using this test or use the tableau (chase) method: one row per part, distinguished symbols in that part's columns, then apply FDs to equate symbols; the decomposition is lossless if some row becomes fully distinguished.

### Dependency preservation

Let $F_i$ be the FDs of $F^+$ that use only attributes of $R_i$. The decomposition preserves dependencies if $(F_1 \cup \dots \cup F_n)^+ = F^+$. Practical check: for each $X \to Y$ in $F$, compute $X^+$ using only the projected FDs, and see if it contains $Y$.

### What can always be achieved

- **3NF synthesis** (from a minimal cover, one table per FD group, plus a key table if needed) is always lossless and dependency-preserving.
- **BCNF decomposition** is always lossless but may lose dependencies.

## Worked examples

### Worked example 1: candidate keys

$R(A, B, C, D, E)$ with $F = \{A \to B,\; BC \to E,\; ED \to A\}$.

- Never on a right side: C and D. Core $= CD$, and $\{C, D\}^+ = CD$, not a key.
- $ACD$: $A \to B$ gives B, $BC \to E$ gives E. Key.
- $BCD$: $BC \to E$, then $ED \to A$. Key.
- $CDE$: $ED \to A$, then $A \to B$. Key.

Any 4-attribute set containing C and D includes one of these, so the candidate keys are ACD, BCD, CDE. Every attribute is prime, so R is at least in 3NF. It is not in BCNF because $A \to B$ has a left side that is not a superkey.

### Worked example 2: minimal cover

$F = \{AB \to C,\; A \to D,\; D \to B,\; AD \to C\}$.

1. Right sides are already single attributes.
2. Left sides: in $AB \to C$, $A^+ = \{A, D, B, C\}$ contains C, so B is extraneous: $A \to C$. In $AD \to C$, likewise D is extraneous: $A \to C$ again, a duplicate.
3. Redundancy in $\{A \to C,\; A \to D,\; D \to B\}$: without $A \to C$, $A^+ = \{A, D, B\}$ lacks C, so keep it. The others are needed for the same reason.

Minimal cover: $\{A \to C,\; A \to D,\; D \to B\}$.

### Worked example 3: highest normal form

$R(A, B, C, D, E)$, $F = \{AB \to CDE,\; C \to A,\; D \to E\}$.

Keys: B is never on a right side. $B^+ = B$. $AB^+$ is everything; $BC^+$: $C \to A$, then $AB \to CDE$, everything. $BD^+ = BDE$, $BE^+ = BE$. Candidate keys: AB and BC. Prime: A, B, C. Non-prime: D, E.

- BCNF: $C \to A$ fails (C is not a superkey).
- 3NF: $C \to A$ is fine (A is prime), but $D \to E$ has D not a superkey and E non-prime. Fails.
- 2NF: do D or E depend on a proper subset of a key? $A^+ = A$, $B^+ = B$, $C^+ = CA$. No. Passes.

Highest normal form: 2NF.

### Worked example 4: BCNF can lose a dependency

$R(A, B, C)$, $F = \{AB \to C,\; C \to B\}$. Keys: AB and AC. All attributes are prime, so R is in 3NF. $C \to B$ violates BCNF.

Decompose on $C \to B$: $R_1(C, B)$ and $R_2(A, C)$. $R_1 \cap R_2 = C$ and $C \to B$, so C is a key of $R_1$: lossless. But $AB \to C$ cannot be checked inside either table: $R_1$ has no A, $R_2$ has no B. With only $C \to B$ available, $\{A, B\}^+ = \{A, B\}$. The dependency is lost. This is the standard reason 3NF is sometimes preferred over BCNF.

### Worked example 5: lossless test for three tables

$R(A, B, C, D, E)$, $F = \{A \to B,\; B \to C,\; C \to D,\; A \to E\}$, decomposition $\{AB,\; BCD,\; AE\}$.

Join $AB$ and $AE$ first: common A, and $A \to B$ makes A a key of AB. Lossless, giving ABE. Join ABE with BCD: common B, and $B^+ = BCD$, so B is a key of BCD. Lossless. Whole decomposition is lossless.

By contrast, $\{ABC,\; CDE\}$ under $\{A \to B,\; B \to C,\; D \to E\}$ is lossy: the common attribute C determines nothing ($C^+ = C$).

## Common traps

- Concluding an FD holds because it holds on one sample instance. An instance can only refute an FD.
- Splitting left sides: $AB \to C$ does not give $A \to C$.
- Forgetting a candidate key. Always use the core attributes and the replacement trick to find all keys before testing normal forms.
- In 2NF, checking partial dependencies of prime attributes. 2NF only restricts non-prime attributes.
- Mixing up 3NF and BCNF: 3NF allows $X \to A$ with non-superkey X when A is prime; BCNF does not.
- Assuming BCNF decomposition preserves dependencies. It is only guaranteed lossless.
- Testing losslessness for three parts by checking pairs that share nothing. Pick an order where each join has a key on one side, or use the chase.
- Removing redundant FDs before removing extraneous left attributes when computing a minimal cover.

## Quick revision

- $X^+$ by repeated firing of FDs; $X \to Y \in F^+$ iff $Y \subseteq X^+$.
- Attributes never on a right side are in every key; attributes only on right sides are in none.
- Superkeys with one key of size k in n attributes: $2^{n-k}$.
- 2NF: no partial dependency of a non-prime attribute. 3NF: LHS superkey or RHS prime. BCNF: LHS superkey.
- Two-attribute relation: always BCNF. All attributes prime: at least 3NF. All keys single-attribute: at least 2NF.
- Lossless binary split: common attributes are a key of one side.
- 3NF synthesis: lossless and dependency-preserving. BCNF: lossless, may lose dependencies.
- Minimal cover: singleton RHS, drop extraneous LHS attributes, drop redundant FDs.
