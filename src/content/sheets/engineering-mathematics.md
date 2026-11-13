---
title: "Engineering Mathematics formula sheet"
summary: "Formulas, standard counts and quick rules for logic, discrete maths, linear algebra, calculus and probability, for last-day revision."
---

## Propositional and first order logic

| Law | Form |
|---|---|
| Implication | $p \to q \equiv \lnot p \lor q \equiv \lnot q \to \lnot p$ |
| Exportation | $p \to (q \to r) \equiv (p \land q) \to r$ |
| Not associative | $(p \to q) \to r \not\equiv p \to (q \to r)$ |
| Biconditional | $p \leftrightarrow q \equiv (p \to q) \land (q \to p)$ |
| De Morgan (quantifiers) | $\lnot \forall x\, P \equiv \exists x\, \lnot P$, $\lnot \exists x\, P \equiv \forall x\, \lnot P$ |
| Distribution | $\forall$ over $\land$, $\exists$ over $\lor$ (both directions only) |
| Pull out of antecedent | $\forall x (P(x) \to Q) \equiv \exists x\, P(x) \to Q$; $\exists x (P(x) \to Q) \equiv \forall x\, P(x) \to Q$ |

- Valid one way only: $\exists x \forall y\, P \to \forall y \exists x\, P$; $\forall x P \lor \forall x Q \to \forall x (P \lor Q)$; $\exists x (P \land Q) \to \exists x P \land \exists x Q$.
- "Only $A$ are $B$": $\forall x (B(x) \to A(x))$. "All $A$ are $B$": $\forall x (A(x) \to B(x))$. "Some $A$ are $B$": $\exists x (A(x) \land B(x))$.
- Boolean functions of $n$ variables: $2^{2^n}$. Self-dual ones: $2^{2^{n-1}}$.
- Functionally complete: $\{\text{NAND}\}$, $\{\text{NOR}\}$, $\{\lnot, \land\}$, $\{\lnot, \lor\}$, $\{\lnot, \to\}$, $\{\to, \mathbf{F}\}$. Not complete: $\{\land, \lor\}$, $\{\land, \lor, \to\}$ (all preserve 1), $\{\oplus, \lnot\}$ (affine).
- Inference: modus ponens, modus tollens, hypothetical syllogism, disjunctive syllogism, resolution $(p \lor q), (\lnot p \lor r) \vdash q \lor r$.
- If you see "how many assignments satisfy", count the complement or split on one variable.

## Sets, relations, functions, partial orders and lattices

Counts on an $n$-element set:

| Relations that are | Count |
|---|---|
| Any | $2^{n^2}$ |
| Reflexive (or irreflexive) | $2^{n^2 - n}$ |
| Symmetric | $2^{n(n+1)/2}$ |
| Reflexive and symmetric | $2^{n(n-1)/2}$ |
| Antisymmetric | $2^n \cdot 3^{n(n-1)/2}$ |
| Asymmetric | $3^{n(n-1)/2}$ |
| Equivalence | Bell $B_n$: $1, 1, 2, 5, 15, 52, 203, 877$ for $n = 0..7$ |
| Partial orders | $1, 3, 19, 219$ for $n = 1..4$ |

| Functions $A \to B$, $|A| = m$, $|B| = n$ | Count |
|---|---|
| All | $n^m$ |
| Injective ($m \le n$) | $n!/(n - m)!$ |
| Surjective | $\sum_{i=0}^{n} (-1)^i \binom{n}{i} (n - i)^m = n!\,S(m, n)$ |
| Bijective ($m = n$) | $n!$ |

- An equivalence relation with class sizes $k_1, \dots, k_r$ has $\sum k_i^2$ ordered pairs.
- Transitive closure: $(a, b)$ in $R^+$ iff a path of length $\ge 1$ from $a$ to $b$. Warshall is $O(n^3)$.
- $g \circ f$ injective implies $f$ injective; $g \circ f$ surjective implies $g$ surjective.
- Lattice: every pair has a lub (join) and glb (meet). Finite lattice is bounded.
- Distributive iff no sublattice $M_3$ (diamond) or $N_5$ (pentagon). In a distributive lattice complements are unique if they exist.
- Boolean lattice = complemented + distributive, $|L| = 2^k$.
- $(D_n, \mid)$: join lcm, meet gcd. Always distributive. Boolean iff $n$ is squarefree. Elements with a complement: $2^{\omega(n)}$, where $\omega(n)$ is the number of distinct primes.
- Partitions of a 3-set under refinement form $M_3$ (not distributive).
- Hasse diagram: drop reflexive and transitive edges, draw smaller below.

## Monoids and groups

| Structure | Needs |
|---|---|
| Semigroup | closure, associativity |
| Monoid | + identity |
| Group | + inverses |
| Abelian | + commutativity |

- $(\mathbb{Z}, -)$ is not associative. $(\mathbb{Z}_{\ge 0}, +)$ and $(\mathcal{P}(S), \cup)$ are monoids, not groups. $(\mathbb{Z}_n \setminus \{0\}, \times_n)$ is a group iff $n$ is prime.
- Lagrange: $|H|$ and the order of every element divide $|G|$. The converse fails ($A_4$, order 12, has no subgroup of order 6).
- Order of $a$ in $\mathbb{Z}_n$: $n / \gcd(a, n)$. Generators of $\mathbb{Z}_n$: $\varphi(n)$. Subgroups of $\mathbb{Z}_n$: one per divisor, $d(n)$ total. Elements of order $d$: $\varphi(d)$.
- Order of $(a, b)$ in $G \times H$: $\operatorname{lcm}(|a|, |b|)$. $\mathbb{Z}_m \times \mathbb{Z}_n$ is cyclic iff $\gcd(m, n) = 1$.
- Prime order implies cyclic implies abelian. Every group of order $\le 5$ is abelian; smallest non-abelian is $S_3$ (order 6).
- $x^2 = e$ for all $x$ implies abelian. $(ab)^{-1} = b^{-1}a^{-1}$.
- Order of a permutation = lcm of cycle lengths. Number of $k$-cycles in $S_n$: $\binom{n}{k}(k - 1)!$.
- If you see $a * b = a + b + ab$ on $\mathbb{R} \setminus \{-1\}$: identity 0, inverse $-a/(1 + a)$.

## Graph theory

| Fact | Formula |
|---|---|
| Handshake | $\sum \deg v = 2E$; odd-degree vertices are even in number |
| Tree on $n$ vertices | $n - 1$ edges; forest with $k$ trees: $n - k$ |
| Max edges, $n$ vertices, $k$ components | $\binom{n - k + 1}{2}$ |
| Planar, simple, $n \ge 3$ | $E \le 3V - 6$; no triangles: $E \le 2V - 4$ |
| Euler formula | $V - E + F = 1 + k$ ($k$ components; $= 2$ if connected) |
| Spanning trees | $K_n$: $n^{n-2}$; $K_{m,n}$: $m^{n-1} n^{m-1}$; $C_n$: $n$ |
| Perfect matchings of $K_{2n}$ | $(2n - 1)!! = (2n)!/(2^n n!)$ |
| Hamiltonian cycles | $K_n$: $(n-1)!/2$; $K_{n,n}$: $n!\,(n-1)!/2$ |

Chromatic polynomials: $K_n$: $k(k-1)\cdots(k-n+1)$; tree on $n$ vertices: $k(k-1)^{n-1}$; $C_n$: $(k-1)^n + (-1)^n (k-1)$; wheel (hub + $C_n$): $k \cdot P(C_n, k-1)$.

- $\chi = 2$ iff bipartite with an edge iff no odd cycle. $\chi(C_n) = 2$ or 3 (odd). $\chi(W_n) = 3$ or 4 (odd rim). Petersen: $\chi = 3$, not Hamiltonian, 3-regular, 15 edges.
- $\chi \ge \omega$ (clique size) and $\chi \ge n / \alpha$. Brooks: $\chi \le \Delta$ unless complete or odd cycle. Planar: $\chi \le 4$.
- Euler circuit iff connected (ignoring isolated vertices) and all degrees even. Euler trail iff exactly 0 or 2 odd vertices.
- Hamiltonian: Dirac ($\delta \ge n/2$), Ore ($\deg u + \deg v \ge n$ for non-adjacent $u, v$). Bipartite with unequal sides: no Hamiltonian cycle.
- Non-planar: $K_5$, $K_{3,3}$ and anything containing a subdivision of them (Kuratowski).
- König (bipartite): max matching = min vertex cover. Always: $\alpha + \beta = n$ (independent set + vertex cover). No isolated vertices: max matching + min edge cover $= n$.
- Hall: bipartite $G$ has a matching saturating $X$ iff $|N(S)| \ge |S|$ for all $S \subseteq X$.

## Combinatorics

| Pattern | Count |
|---|---|
| $x_1 + \dots + x_k = n$, $x_i \ge 0$ | $\binom{n + k - 1}{k - 1}$ |
| Same, $x_i \ge 1$ | $\binom{n - 1}{k - 1}$ |
| Strictly increasing length-$r$ strings from $n$ symbols | $\binom{n}{r}$ |
| Non-decreasing | $\binom{n + r - 1}{r}$ |
| Derangements $D_n$ | $n! \sum_{i=0}^{n} (-1)^i / i!$: $1, 0, 1, 2, 9, 44, 265$ |
| Exactly $r$ fixed points | $\binom{n}{r} D_{n-r}$ |
| Catalan $C_n$ | $\frac{1}{n+1}\binom{2n}{n}$: $1, 1, 2, 5, 14, 42, 132, 429$ |
| Binary strings, no two adjacent 1s | $F_{n+2}$ (length 10: 144) |

- Stirling second kind $S(n, k)$ (set partitions): $S(n, k) = S(n-1, k-1) + k\,S(n-1, k)$; $S(n, 2) = 2^{n-1} - 1$; $S(n, n-1) = \binom{n}{2}$. Row $n = 5$: $1, 15, 25, 10, 1$.
- Stirling first kind $c(n, k)$ (permutations with $k$ cycles): $c(n, k) = c(n-1, k-1) + (n-1)\,c(n-1, k)$. Row $n = 5$: $24, 50, 35, 10, 1$.
- Inclusion-exclusion: $|A \cup B \cup C| = \sum |A| - \sum |A \cap B| + |A \cap B \cap C|$. Count "none of" as total minus union.
- Pigeonhole: $n$ objects in $k$ boxes, some box has $\ge \lceil n/k \rceil$. To force $r$ in one box: $k(r - 1) + 1$ objects.
- Recurrences: roots $r_1 \ne r_2$: $A r_1^n + B r_2^n$; double root $r$: $(A + Bn) r^n$. Fit $A, B$ to $a_0, a_1$, then check $a_2$.

| Generating function | Coefficient of $x^n$ |
|---|---|
| $1/(1 - ax)$ | $a^n$ |
| $1/(1 - x)^k$ | $\binom{n + k - 1}{k - 1}$ |
| $x/(1 - x)^2$ | $n$ |
| $(1 + x)^m$ | $\binom{m}{n}$ |
| $(1 - x^{m+1})/(1 - x)$ | $1$ for $n \le m$ |
| $1/((1-x)(1-x^2))$ | $\lfloor n/2 \rfloor + 1$ |

## Linear algebra

- $\det(AB) = \det A \det B$, $\det(A^T) = \det A$, $\det(kA) = k^n \det A$, $\det(A^{-1}) = 1/\det A$. Row swap flips sign; adding a multiple of a row changes nothing. Triangular: product of diagonal.
- $\det(aI + bJ)_{n \times n} = a^{n-1}(a + nb)$, with $J$ the all-ones matrix.
- Rank-nullity: $\operatorname{rank}(A) + \operatorname{nullity}(A) = $ number of columns. $\operatorname{rank}(AB) \le \min(\operatorname{rank} A, \operatorname{rank} B)$.

| $Ax = b$, $A$ is $m \times n$, $r = \operatorname{rank} A$ | Result |
|---|---|
| $\operatorname{rank}[A \mid b] > r$ | no solution |
| $\operatorname{rank}[A \mid b] = r = n$ | unique |
| $\operatorname{rank}[A \mid b] = r < n$ | infinitely many, $n - r$ free variables |
| $Ax = 0$, $m < n$ | always a non-zero solution |

- Eigenvalues: $\sum \lambda_i = \operatorname{tr} A$, $\prod \lambda_i = \det A$. $A^k \to \lambda^k$, $A^{-1} \to 1/\lambda$, $A + cI \to \lambda + c$, $p(A) \to p(\lambda)$. $A$ and $A^T$ share eigenvalues.
- Triangular: eigenvalues on the diagonal. Real symmetric: real eigenvalues, orthogonal eigenvectors, diagonalisable. Idempotent: $\{0, 1\}$. Nilpotent: $0$. Orthogonal: $|\lambda| = 1$.
- Distinct eigenvalues imply diagonalisable. Independent eigenvectors for $\lambda$: $n - \operatorname{rank}(A - \lambda I)$ (geometric $\le$ algebraic multiplicity).
- $2 \times 2$: $\lambda^2 - (\operatorname{tr})\lambda + \det = 0$; $A^{-1} = \frac{1}{ad - bc}\begin{bmatrix} d & -b \\ -c & a \end{bmatrix}$.
- Cayley-Hamilton: $A$ satisfies its characteristic polynomial; use it for $A^{-1}$ and high powers.
- LU (Doolittle, $L$ unit lower): $u_{1j} = a_{1j}$, $l_{i1} = a_{i1}/u_{11}$; then $l_{ij}$ are the elimination multipliers and $U$ is the echelon form. $\det A = \prod u_{ii}$. For invertible $A$, LU without row swaps exists iff every leading principal minor is non-zero.

## Calculus

| Limit | Value |
|---|---|
| $\frac{\sin x}{x}$, $\frac{\tan x}{x}$, $\frac{e^x - 1}{x}$, $\frac{\ln(1+x)}{x}$ as $x \to 0$ | 1 |
| $\frac{1 - \cos x}{x^2}$ | $1/2$ |
| $\frac{\sin x - x}{x^3}$ | $-1/6$ |
| $(1 + x)^{1/x}$ as $x \to 0$; $(1 + a/n)^n$ | $e$; $e^a$ |
| $\frac{a^x - 1}{x}$ | $\ln a$ |

- L'Hospital for $0/0$ or $\infty/\infty$. Convert $0 \cdot \infty$, $1^\infty$, $0^0$, $\infty^0$ with logs.
- Differentiable implies continuous, not conversely ($|x|$ at 0). $x^n \sin(1/x)$, $f(0) = 0$: continuous for $n \ge 1$, differentiable at 0 for $n \ge 2$.
- Rolle: continuous on $[a, b]$, differentiable on $(a, b)$, $f(a) = f(b)$ gives $f'(c) = 0$. MVT: $f'(c) = \frac{f(b) - f(a)}{b - a}$. For $x^2$ on $[a, b]$, $c = (a+b)/2$.
- Extrema: $f' = 0$, then $f'' > 0$ min, $f'' < 0$ max. On a closed interval also check endpoints. Distance problems: minimise the squared distance.
- $\int_0^{\pi/2} \sin^n x\,dx = \frac{n-1}{n} \cdot \frac{n-3}{n-2} \cdots$, ending in $\frac{\pi}{2}$ ($n$ even) or 1 ($n$ odd).
- $\int_0^a f(x)\,dx = \int_0^a f(a - x)\,dx$. Odd $f$ on $[-a, a]$: 0. Even: $2\int_0^a$.
- $\int x e^{ax} dx = \frac{e^{ax}}{a^2}(ax - 1)$; by parts $\int u\,dv = uv - \int v\,du$.
- $p$-test: $\int_1^\infty x^{-p}$ converges iff $p > 1$; $\int_0^1 x^{-p}$ converges iff $p < 1$.
- $|f|$ integrals: split at the roots of $f$.

## Probability and statistics

| Distribution | $P$ or density | Mean | Variance |
|---|---|---|---|
| Binomial$(n, p)$ | $\binom{n}{k} p^k q^{n-k}$ | $np$ | $npq$ |
| Geometric (trials to 1st success) | $q^{k-1}p$ | $1/p$ | $q/p^2$ |
| Poisson$(\lambda)$ | $e^{-\lambda}\lambda^k / k!$ | $\lambda$ | $\lambda$ |
| Uniform$(a, b)$ | $1/(b - a)$ | $(a+b)/2$ | $(b-a)^2/12$ |
| Exponential$(\lambda)$ | $\lambda e^{-\lambda x}$ | $1/\lambda$ | $1/\lambda^2$ |
| Normal$(\mu, \sigma^2)$ | $\frac{1}{\sigma\sqrt{2\pi}} e^{-(x-\mu)^2/2\sigma^2}$ | $\mu$ | $\sigma^2$ |

- Exponential: $P(X > t) = e^{-\lambda t}$, memoryless, median $\ln 2/\lambda$. Geometric is the discrete memoryless one.
- Normal: $Z = (X - \mu)/\sigma$ (divide by $\sigma$, not $\sigma^2$). $P(|Z| < 1, 2, 3) \approx 0.683, 0.954, 0.997$. $\Phi(1.645) = 0.95$, $\Phi(1.96) = 0.975$. $aX + b \sim N(a\mu + b, a^2\sigma^2)$.
- Poisson approximation: Binomial with $n$ large, $p$ small: $\lambda = np$. Sum of independent Poissons is Poisson with $\lambda_1 + \lambda_2$.
- $E[aX + b] = aE[X] + b$; $\operatorname{Var}(aX + b) = a^2 \operatorname{Var}(X)$; $\operatorname{Var}(X) = E[X^2] - E[X]^2$; $\operatorname{Var}(X + Y) = \operatorname{Var} X + \operatorname{Var} Y + 2\operatorname{Cov}(X, Y)$.
- Total probability: $P(B) = \sum P(B \mid A_i) P(A_i)$. Bayes: $P(A_j \mid B) = P(B \mid A_j) P(A_j) / P(B)$. Multi-stage: compute each branch's joint probability, then divide one branch by the sum.
- Conditional expectation over a finite equally likely event: average the value over the outcomes in the event. $E[X] = E[E[X \mid Y]]$.
- Two uniforms on $[0, 1]$: probabilities are areas in the unit square; $P(|X - Y| < a) = 1 - (1 - a)^2$.
- Mean, median, mode: right-skewed usually gives mode $<$ median $<$ mean. Empirical: mean $-$ mode $\approx 3$(mean $-$ median).
