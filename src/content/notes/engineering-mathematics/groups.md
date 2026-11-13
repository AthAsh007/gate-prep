---
title: "Monoids and groups"
summary: "Algebraic structures from closure to groups, identity and inverse calculations, cyclic groups, element orders, subgroups and Lagrange's theorem."
order: 3
sources:
  - title: "Group (mathematics) (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Group_(mathematics)"
  - title: "Monoid (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Monoid"
  - title: "Lagrange's theorem (group theory) (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Lagrange%27s_theorem_(group_theory)"
  - title: "GATE Overflow: group theory questions"
    url: "https://gateoverflow.in/tag/group-theory"
---

GATE questions on groups are usually one mark and test definitions: is this structure a group, what is the identity or inverse under an unusual operation, how many generators does a cyclic group have, which orders are possible for subgroups or elements. Each needs only a few facts, applied carefully.

## The hierarchy of structures

Let $S$ be a set and $*$ a binary operation on it.

| Structure | Closure | Associative | Identity | Inverses |
|---|---|---|---|---|
| Groupoid (magma) | yes | | | |
| Semigroup | yes | yes | | |
| Monoid | yes | yes | yes | |
| Group | yes | yes | yes | yes |
| Abelian group | group axioms plus $a * b = b * a$ | | | |

Each row adds one axiom to the row above. A **monoid** is a semigroup with an identity element.

### Standard examples

| Structure | What it is | Why not higher |
|---|---|---|
| $(\mathbb{N}, +)$ with $\mathbb{N} = \{1, 2, \dots\}$ | semigroup | no identity |
| $(\mathbb{N} \cup \{0\}, +)$ | monoid | no inverses |
| $(\mathbb{Z}, -)$ | groupoid | subtraction is not associative |
| $(\mathbb{Z}, +)$, $(\mathbb{Q}, +)$, $(\mathbb{R}, +)$ | abelian groups | |
| $(\mathbb{Z}, \times)$ | monoid | only $\pm 1$ have inverses |
| $(\mathbb{Q} \setminus \{0\}, \times)$ | abelian group | |
| $(\Sigma^*, \cdot)$, strings under concatenation | monoid, identity $\varepsilon$ | no inverses, not commutative |
| $(\mathcal{P}(S), \cup)$ | monoid, identity $\emptyset$ | no inverses |
| $(\mathcal{P}(S), \oplus)$ (symmetric difference) | abelian group, identity $\emptyset$, $A^{-1} = A$ | |
| $(\mathbb{Z}_n, +_n)$ | abelian group of order $n$ | |
| $(\mathbb{Z}_n \setminus \{0\}, \times_n)$ | group iff $n$ is prime | otherwise not closed |
| $(U(n), \times_n)$, units mod $n$ | abelian group of order $\varphi(n)$ | |
| $n \times n$ invertible real matrices under multiplication | group, not abelian for $n \ge 2$ | |

### Basic facts in any group

- The identity is unique, and each element has a unique inverse.
- $(ab)^{-1} = b^{-1}a^{-1}$ (order reverses).
- Cancellation: $ab = ac \Rightarrow b = c$. So every row and every column of a group's operation table is a permutation of the elements (the Latin square property).
- If every element satisfies $a^2 = e$, the group is abelian.
- Every group with at most 5 elements is abelian. The smallest non-abelian group is $S_3$, with 6 elements.

## Identity and inverse under a custom operation

GATE likes operations such as $a * b = a + b - k$ or $a * b = a + b + ab$. The method is always the same.

1. **Identity:** solve $a * e = a$ for $e$, and confirm $e$ does not depend on $a$.
2. **Inverse:** solve $a * b = e$ for $b$.
3. **Associativity:** expand $(a * b) * c$ and $a * (b * c)$ and compare. Also check that the set is closed.

For $a * b = a + b + ab$, note $1 + (a * b) = (1 + a)(1 + b)$. This shows the operation is ordinary multiplication in disguise after the shift $x \mapsto 1 + x$, so it is associative and commutative, the identity is $0$, and $-1$ must be excluded because $1 + (-1) = 0$ has no multiplicative inverse.

## Order of elements and cyclic groups

The **order** of $a$, written $o(a)$, is the smallest $k \ge 1$ with $a^k = e$. In $(\mathbb{Z}_n, +_n)$ the "power" $a^k$ means $ka \bmod n$, and
$$o(a) = \frac{n}{\gcd(a, n)}.$$

Properties:
- $o(a) = o(a^{-1})$, and $o(ab) = o(ba)$.
- $a^m = e$ iff $o(a) \mid m$.
- $o(a^k) = \dfrac{o(a)}{\gcd(k, o(a))}$.

A group is **cyclic** if some element $g$ generates it: $G = \{g^k\}$. Facts:

- Every cyclic group is abelian. The converse fails (Klein four group $\mathbb{Z}_2 \times \mathbb{Z}_2$).
- A cyclic group of order $n$ has exactly $\varphi(n)$ generators. In $\mathbb{Z}_n$ these are the $k$ with $\gcd(k, n) = 1$.
- Every subgroup of a cyclic group is cyclic. For each divisor $d$ of $n$ there is exactly one subgroup of order $d$, and exactly $\varphi(d)$ elements of order $d$.
- Every group of prime order is cyclic.
- $\mathbb{Z}_m \times \mathbb{Z}_n$ is cyclic iff $\gcd(m, n) = 1$.

Euler's totient: for $n = p_1^{a_1} \cdots p_k^{a_k}$,
$$\varphi(n) = n \prod_{i}\left(1 - \frac{1}{p_i}\right).$$
Examples: $\varphi(12) = 4$, $\varphi(36) = 12$, $\varphi(60) = 16$, $\varphi(p) = p - 1$ for prime $p$.

## Subgroups and Lagrange's theorem

$H \subseteq G$ is a **subgroup** if it is a group under the same operation. Tests:
- One-step test: $H$ nonempty and $a, b \in H \Rightarrow ab^{-1} \in H$.
- For finite $H$: nonempty and closed under the operation is enough.

**Lagrange's theorem.** If $G$ is finite and $H$ is a subgroup, then $|H|$ divides $|G|$. The number of distinct cosets is $|G| / |H|$.

Consequences:
- The order of every element divides $|G|$, so $a^{|G|} = e$.
- A group of prime order has only the trivial subgroups.
- Fermat's little theorem is the case $G = U(p)$: $a^{p-1} \equiv 1 \pmod p$.

The converse of Lagrange is false in general: the alternating group $A_4$ has order 12 but no subgroup of order 6. It is true for cyclic groups.

The union of two subgroups is a subgroup only if one contains the other. The intersection of two subgroups is always a subgroup.

## Worked examples

### Worked example 1: Identity and inverse

On $\mathbb{Z}$ define $a * b = a + b - 4$. Find the identity and the inverse of 9.

1. $a * e = a + e - 4 = a$ gives $e = 4$.
2. $9 * b = 9 + b - 4 = 4$ gives $b = -1$.

Check associativity: $(a * b) * c = a + b + c - 8 = a * (b * c)$. Closure holds in $\mathbb{Z}$. So $(\mathbb{Z}, *)$ is an abelian group with identity 4, and in general $a^{-1} = 8 - a$.

### Worked example 2: Orders in a cyclic group

In $(\mathbb{Z}_{20}, +_{20})$, find the order of 8 and the number of elements of order 10.

1. $o(8) = 20 / \gcd(8, 20) = 20 / 4 = 5$. Check: $5 \cdot 8 = 40 \equiv 0$.
2. Elements of order 10: $\varphi(10) = 4$. They are $2, 6, 14, 18$, the $k$ with $\gcd(k, 20) = 2$.

### Worked example 3: Is it a group?

Is $\{1, 2, 4, 5, 7, 8\}$ under multiplication mod 9 a group?

These are exactly the residues coprime to 9, so the set is $U(9)$, which has order $\varphi(9) = 6$ and is closed. Identity is 1. Inverses: $2 \cdot 5 = 10 \equiv 1$, $4 \cdot 7 = 28 \equiv 1$, $8 \cdot 8 = 64 \equiv 1$. It is a group. Powers of 2: $2, 4, 8, 7, 5, 1$, so 2 generates it and $U(9)$ is cyclic of order 6.

### Worked example 4: Possible subgroup orders

A group $G$ has order 30. Can it have a subgroup of order 4? An element of order 15?

- $4 \nmid 30$, so no subgroup of order 4.
- $15 \mid 30$, so Lagrange does not rule out an element of order 15, and $\mathbb{Z}_{30}$ has one (the element 2). Lagrange only gives necessary conditions.

### Worked example 5: Counting monoid structure

Let $\Sigma = \{a, b\}$. Which of these are monoids: $(\Sigma^*, \cdot)$, $(\Sigma^+, \cdot)$, $(\{\text{strings of even length}\}, \cdot)$?

- $\Sigma^*$ with concatenation: associative, identity $\varepsilon$. Monoid.
- $\Sigma^+$ excludes $\varepsilon$, so there is no identity. Semigroup only.
- Even length strings: concatenation of two even strings is even, and $\varepsilon$ has length 0. Monoid. Still not a group since $ab$ has no inverse.

## Common traps

- Forgetting closure. $\{1, 2, 3, 4, 5\}$ under $\times_6$ fails because $2 \times 3 \equiv 0$.
- Assuming abelian implies cyclic. $\mathbb{Z}_2 \times \mathbb{Z}_2$ is abelian and not cyclic.
- Using the converse of Lagrange. A divisor of $|G|$ need not be a subgroup order (except in cyclic groups).
- Checking only $a * e = a$ but not that $e$ is the same for all $a$, or not checking that $e$ lies in the set.
- Writing $(ab)^{-1} = a^{-1}b^{-1}$ in a non-abelian group.
- Counting generators of $\mathbb{Z}_n$ as $n - 1$. Only elements coprime to $n$ generate; the count is $\varphi(n)$.
- Treating $(\mathbb{Z}_n \setminus \{0\}, \times_n)$ as a group for composite $n$.

## Quick revision

- Semigroup = closure + associativity. Monoid adds identity. Group adds inverses.
- Strings under concatenation: monoid. $\mathcal{P}(S)$ under $\oplus$: group.
- Identity and inverse are unique; $(ab)^{-1} = b^{-1}a^{-1}$.
- $a^2 = e$ for all $a$ implies abelian. All groups of order at most 5 are abelian.
- In $\mathbb{Z}_n$: $o(a) = n / \gcd(a, n)$; generators number $\varphi(n)$.
- Prime order implies cyclic implies abelian.
- Lagrange: subgroup order and element order divide $|G|$. Converse false in general ($A_4$).
- $\mathbb{Z}_m \times \mathbb{Z}_n$ cyclic iff $\gcd(m, n) = 1$.
- $(\mathbb{Z}_n \setminus \{0\}, \times_n)$ is a group iff $n$ is prime; $U(n)$ always is.
