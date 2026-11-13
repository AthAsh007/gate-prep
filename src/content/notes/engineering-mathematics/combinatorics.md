---
title: "Combinatorics"
summary: "Counting principles, permutations and combinations, stars and bars, inclusion-exclusion, derangements, pigeonhole, recurrence relations and generating functions."
order: 5
sources:
  - title: "Stars and bars (combinatorics) (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Stars_and_bars_(combinatorics)"
  - title: "Recurrence relation (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Recurrence_relation"
  - title: "Generating function (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Generating_function"
  - title: "GATE Overflow: combinatorics questions"
    url: "https://gateoverflow.in/tag/combinatory"
---

Counting questions appear in nearly every GATE CS paper, often as numerical answer questions where there are no options to check against. The safest habit is to identify the model first (ordered or unordered, with or without repetition, constrained or not), then apply the matching formula, then check with a tiny case.

## Basic principles

- **Sum rule:** if a task is done in one of several disjoint ways, add the counts.
- **Product rule:** if a task is a sequence of independent choices, multiply.
- **Complement:** count what you do not want and subtract from the total. "At least one" problems are almost always easier this way.
- **Division:** if every desired object is counted exactly $k$ times, divide by $k$.

## Permutations and combinations

| Situation | Count |
|---|---|
| Arrange $n$ distinct objects | $n!$ |
| Ordered selection of $r$ from $n$, no repetition | $P(n, r) = \dfrac{n!}{(n-r)!}$ |
| Unordered selection of $r$ from $n$, no repetition | $\binom{n}{r} = \dfrac{n!}{r!(n-r)!}$ |
| Ordered selection of $r$ from $n$, repetition allowed | $n^r$ |
| Unordered selection of $r$ from $n$ types, repetition allowed | $\binom{n + r - 1}{r}$ |
| Arrangements of a multiset with counts $n_1, \dots, n_k$ | $\dfrac{n!}{n_1!\,n_2! \cdots n_k!}$ |
| Circular arrangements of $n$ distinct objects | $(n-1)!$ |
| Necklaces where flipping is allowed, $n \ge 3$ | $(n-1)!/2$ |

Identities that save time: $\binom{n}{r} = \binom{n}{n-r}$, Pascal's rule $\binom{n}{r} = \binom{n-1}{r-1} + \binom{n-1}{r}$, $\sum_r \binom{n}{r} = 2^n$, and Vandermonde $\sum_k \binom{m}{k}\binom{n}{r-k} = \binom{m+n}{r}$.

### Stars and bars

The number of solutions of $x_1 + x_2 + \dots + x_k = n$ in

- non-negative integers is $\binom{n + k - 1}{k - 1}$;
- positive integers is $\binom{n - 1}{k - 1}$.

Lower bounds $x_i \ge a_i$: substitute $y_i = x_i - a_i$ and reduce $n$ by $\sum a_i$. Upper bounds $x_i \le b_i$: use inclusion-exclusion on the events $x_i \ge b_i + 1$.

The same formula counts multisets of size $n$ from $k$ types, ways to put $n$ identical balls in $k$ distinct boxes, and monomials of degree $n$ in $k$ variables.

### Balls into boxes

| Balls | Boxes | Any number per box | Every box nonempty |
|---|---|---|---|
| distinct | distinct | $k^n$ | $k!\,S(n, k)$ |
| identical | distinct | $\binom{n+k-1}{k-1}$ | $\binom{n-1}{k-1}$ |
| distinct | identical | $\sum_{j \le k} S(n, j)$ | $S(n, k)$ |
| identical | identical | partitions of $n$ into at most $k$ parts | partitions of $n$ into exactly $k$ parts |

## Inclusion-exclusion and derangements

$$|A_1 \cup \dots \cup A_k| = \sum |A_i| - \sum |A_i \cap A_j| + \sum |A_i \cap A_j \cap A_l| - \cdots$$

Typical uses: integers up to $N$ divisible by none of a set of primes, onto functions, bounded stars and bars, and derangements.

A **derangement** is a permutation with no fixed point:
$$D_n = n!\sum_{i=0}^{n} \frac{(-1)^i}{i!}, \qquad D_n = (n-1)(D_{n-1} + D_{n-2}).$$
Values: $D_1 = 0$, $D_2 = 1$, $D_3 = 2$, $D_4 = 9$, $D_5 = 44$, $D_6 = 265$. Also $D_n \approx n!/e$, and permutations with exactly $r$ fixed points number $\binom{n}{r} D_{n-r}$.

## Pigeonhole principle

If $N$ objects go into $k$ boxes, some box has at least $\lceil N / k \rceil$ objects. To force some box to hold at least $r$ objects you need $N = k(r - 1) + 1$.

Standard applications: among any $n + 1$ integers two have the same remainder mod $n$; among any 5 points in a unit square two are within $\sqrt 2 / 2$; in any group of people two have the same number of friends inside the group.

## Recurrence relations

### Setting up a recurrence

Classify objects of size $n$ by their first or last step. Examples:

- Binary strings with no two consecutive 1s: end in 0 or end in 01, so $a_n = a_{n-1} + a_{n-2}$ with $a_1 = 2$, $a_2 = 3$.
- Tower of Hanoi moves: $h_n = 2h_{n-1} + 1$, so $h_n = 2^n - 1$.
- Regions made by $n$ lines in general position: $r_n = r_{n-1} + n$, so $r_n = 1 + \frac{n(n+1)}{2}$.
- Binary strings of length $n$ with an even number of 0s: $2^{n-1}$.

### Linear homogeneous recurrences with constant coefficients

For $a_n = c_1 a_{n-1} + \dots + c_k a_{n-k}$, solve the characteristic equation $t^k - c_1 t^{k-1} - \dots - c_k = 0$.

- Distinct roots $r_1, \dots, r_k$: $a_n = \sum A_i r_i^n$.
- A root $r$ with multiplicity $m$ contributes $(A_0 + A_1 n + \dots + A_{m-1} n^{m-1}) r^n$.

Fit the constants with the initial values.

### Non-homogeneous recurrences

For $a_n = c_1 a_{n-1} + \dots + f(n)$, the solution is the homogeneous solution plus one particular solution. Guess the particular solution in the shape of $f(n)$:

| $f(n)$ | Trial particular solution |
|---|---|
| constant $c$ | $A$ |
| polynomial of degree $d$ | polynomial of degree $d$ |
| $s^n$, $s$ not a root | $A s^n$ |
| $s^n$, $s$ a root of multiplicity $m$ | $A n^m s^n$ |

If 1 is a root of the characteristic equation, multiply the polynomial guess by $n$.

## Generating functions

The ordinary generating function of $a_0, a_1, \dots$ is $A(x) = \sum_{n \ge 0} a_n x^n$.

| Sequence | Generating function |
|---|---|
| $1, 1, 1, \dots$ | $\dfrac{1}{1-x}$ |
| $1, c, c^2, \dots$ | $\dfrac{1}{1-cx}$ |
| $\binom{n + k - 1}{k - 1}$ | $\dfrac{1}{(1-x)^k}$ |
| $n + 1$ | $\dfrac{1}{(1-x)^2}$ |
| $n$ | $\dfrac{x}{(1-x)^2}$ |
| $\binom{m}{n}$ | $(1+x)^m$ |
| $1, 0, 1, 0, \dots$ | $\dfrac{1}{1-x^2}$ |
| $1$ for $n \le m$, else $0$ | $\dfrac{1 - x^{m+1}}{1 - x}$ |

Operations:
- Multiplying by $x$ shifts the sequence right by one.
- Multiplying $A(x)$ by $\frac{1}{1-x}$ gives partial sums $\sum_{i \le n} a_i$.
- Product $A(x)B(x)$ gives the convolution $\sum_i a_i b_{n-i}$. This is why "choose some items of type 1 and some of type 2" problems become products of polynomials.

To solve a recurrence with generating functions, multiply the recurrence by $x^n$, sum over $n$, solve for $A(x)$, then split into partial fractions and read off coefficients.

## Worked examples

### Worked example 1: Bounded stars and bars

How many solutions does $x_1 + x_2 + x_3 + x_4 = 12$ have with $0 \le x_i \le 4$?

1. Unrestricted: $\binom{15}{3} = 455$.
2. One variable at least 5: replace it by $y = x - 5$, sum 7: $\binom{10}{3} = 120$, times 4: $480$.
3. Two variables at least 5: sum 2: $\binom{5}{3} = 10$, times $\binom{4}{2} = 6$: $60$.
4. Three variables at least 5: sum would be negative: 0.

Answer: $455 - 480 + 60 = 35$.

### Worked example 2: Repeated root

Solve $a_n = 6a_{n-1} - 9a_{n-2}$, $a_0 = 2$, $a_1 = 9$.

1. $t^2 - 6t + 9 = (t - 3)^2$, double root 3. So $a_n = (A + Bn)3^n$.
2. $a_0 = A = 2$. $a_1 = 3(A + B) = 9$, so $B = 1$.
3. $a_n = (n + 2)3^n$. Check $a_2 = 6 \cdot 9 - 9 \cdot 2 = 36$ and $(4)(9) = 36$.

### Worked example 3: Non-homogeneous recurrence

Solve $a_n = 2a_{n-1} + 3$, $a_0 = 1$.

1. Homogeneous part: $C \cdot 2^n$.
2. Particular: try constant $A$: $A = 2A + 3$, $A = -3$.
3. $a_n = C 2^n - 3$, and $a_0 = 1$ gives $C = 4$. So $a_n = 2^{n+2} - 3$. Check: $a_1 = 5 = 2 \cdot 1 + 3$.

### Worked example 4: Coefficient extraction

In how many ways can you pick 10 fruits from apples, bananas and oranges if you take an even number of apples and at most 2 bananas?

Generating function:
$$\frac{1}{1-x^2} \cdot (1 + x + x^2) \cdot \frac{1}{1-x}.$$
Count directly instead: choose apples $a \in \{0, 2, 4, 6, 8, 10\}$ and bananas $b \in \{0, 1, 2\}$ with $a + b \le 10$; oranges take the rest. For $a \le 8$ all 3 values of $b$ work, giving $5 \times 3 = 15$. For $a = 10$ only $b = 0$ works, giving 1. Total 16.

### Worked example 5: Divisibility by inclusion-exclusion

How many integers in $1..1000$ are divisible by none of 2, 3, 5?

1. Divisible by 2, 3, 5: $500, 333, 200$. Sum $1033$.
2. By 6, 10, 15: $166, 100, 66$. Sum $332$.
3. By 30: $33$.
4. Divisible by at least one: $1033 - 332 + 33 = 734$.

Answer: $1000 - 734 = 266$.

## Common traps

- Using $\binom{n + k - 1}{k - 1}$ when the variables must be positive. Positive solutions use $\binom{n - 1}{k - 1}$.
- Dividing by symmetry when the objects are labelled (distinct people seated in labelled chairs are not circular).
- Missing higher order terms in inclusion-exclusion.
- Checking a recurrence's closed form only at the initial values. Several formulas agree on $a_0$ and $a_1$; also check $a_2$.
- Forgetting the $n$ factor for repeated roots.
- Off by one in pigeonhole: to force $r$ in a box with $k$ boxes, you need $k(r-1) + 1$, not $kr$.
- Confusing $\frac{x}{(1-x)^2}$ (sequence $n$) with $\frac{1}{(1-x)^2}$ (sequence $n+1$).

## Quick revision

- Non-negative solutions of $x_1 + \dots + x_k = n$: $\binom{n+k-1}{k-1}$. Positive: $\binom{n-1}{k-1}$.
- Multiset arrangements: $n! / (n_1! \cdots n_k!)$. Circular: $(n-1)!$.
- Onto functions $n \to k$: $\sum_j (-1)^j \binom{k}{j} (k-j)^n$.
- $D_n$: $0, 1, 2, 9, 44, 265$. Exactly $r$ fixed points: $\binom{n}{r}D_{n-r}$.
- Pigeonhole: $k(r-1) + 1$ objects force $r$ in one box.
- Distinct roots: $\sum A_i r_i^n$. Repeated root $r$ of multiplicity $m$: polynomial of degree $m-1$ times $r^n$.
- Strings with no two adjacent 1s: Fibonacci, length $n$ gives $F_{n+2}$ (with $F_1 = F_2 = 1$).
- $\frac{1}{(1-x)^k}$ has coefficients $\binom{n+k-1}{k-1}$.
- Product of generating functions is convolution of sequences.
