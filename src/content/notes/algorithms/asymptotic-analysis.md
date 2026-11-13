---
title: "Asymptotic complexity"
summary: "Asymptotic notations, growth-rate ordering, loop counting and the main methods for solving recurrences, including the Master theorem."
order: 1
sources:
  - title: "Big O notation (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Big_O_notation"
  - title: "Master theorem (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Master_theorem_(analysis_of_algorithms)"
  - title: "GATE Overflow: asymptotic-notation tag"
    url: "https://gateoverflow.in/tag/asymptotic-notation"
  - title: "MIT OCW 6.006 Introduction to Algorithms (Spring 2020)"
    url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/"
---

## Why asymptotics

GATE never asks how many milliseconds a program takes. It asks how the running time or memory grows as the input size $n$ grows. Asymptotic analysis throws away constant factors and lower-order terms so that two algorithms can be compared independently of machine and compiler. The worst case is the default unless a question says "average" or "expected".

## The five notations

Let $f, g$ be non-negative functions of $n$.

| Notation | Meaning | Formal condition |
|---|---|---|
| $f = O(g)$ | $f$ grows no faster than $g$ | $\exists c > 0, n_0$: $f(n) \le c\,g(n)$ for all $n \ge n_0$ |
| $f = \Omega(g)$ | $f$ grows at least as fast as $g$ | $\exists c > 0, n_0$: $f(n) \ge c\,g(n)$ for all $n \ge n_0$ |
| $f = \Theta(g)$ | same growth | $f = O(g)$ and $f = \Omega(g)$ |
| $f = o(g)$ | strictly slower | for every $c > 0$, $f(n) < c\,g(n)$ eventually |
| $f = \omega(g)$ | strictly faster | for every $c > 0$, $f(n) > c\,g(n)$ eventually |

A useful test: if $L = \lim_{n\to\infty} f(n)/g(n)$ exists, then $L = 0$ means $f = o(g)$, $0 < L < \infty$ means $f = \Theta(g)$, and $L = \infty$ means $f = \omega(g)$. The limit may fail to exist (for example $f(n) = n^{1 + \sin n}$), in which case use the definitions directly.

### Properties worth remembering

- Transitivity holds for all five notations.
- Reflexivity holds for $O$, $\Omega$, $\Theta$ but not for $o$, $\omega$.
- Symmetry: $f = \Theta(g) \iff g = \Theta(f)$.
- Transpose symmetry: $f = O(g) \iff g = \Omega(f)$, and $f = o(g) \iff g = \omega(f)$.
- $O(f) + O(g) = O(\max(f, g))$ and $O(f)\cdot O(g) = O(fg)$.
- Not every pair is comparable: $n$ and $n^{1+\sin n}$ are neither $O$ nor $\Omega$ of each other.

### Standard growth order

For constants $0 < \epsilon < 1 < c$ and $k \ge 1$:

$$1 < \log\log n < \log n < (\log n)^k < n^{\epsilon} < n < n\log n < n^c < n^{\log n} < c^n < n! < n^n$$

Key facts used to place unusual functions:

- Logs of any base differ by a constant factor, so $\log_2 n = \Theta(\log_{10} n)$. Bases inside exponents do matter: $2^n = o(3^n)$.
- $a^{\log_b n} = n^{\log_b a}$. So $4^{\log_2 n} = n^2$ and $2^{\log_2 n} = n$.
- Stirling: $\log(n!) = \Theta(n\log n)$ and $n! = o(n^n)$, $n! = \omega(2^n)$.
- To compare two fast-growing functions, compare their logarithms. If $\log f = o(\log g)$ then $f = o(g)$. The converse fails: $\log n^2 = \Theta(\log n)$ yet $n^2 \neq \Theta(n)$.

## Counting loop iterations

Most "find the complexity of this code" questions reduce to a sum.

- Nested loops both running to $n$: $\Theta(n^2)$.
- Loop variable multiplied or divided by a constant: $\Theta(\log n)$ iterations.
- Inner loop bound depends on the outer variable: write the sum explicitly. $\sum_{i=1}^{n} i = \Theta(n^2)$, $\sum_{i=1}^{n} \log i = \Theta(n\log n)$, $\sum_{i=1}^{n} n/i = \Theta(n\log n)$ (harmonic series).
- Geometric sums are dominated by their largest term: $1 + 2 + 4 + \dots + n = 2n - 1 = \Theta(n)$.
- Loop with $i = i^2$ or $i = 2^i$ style growth: $\Theta(\log\log n)$ iterations.

```
for i = 1 to n             // n iterations
    j = 1
    while j <= i           // runs floor(log2 i) + 1 times
        j = 2 * j
```

The total here is $\sum_{i=1}^{n} (\lfloor\log_2 i\rfloor + 1) = \Theta(n\log n)$.

## Space complexity

Count the extra memory beyond the input. Recursion uses stack space proportional to the maximum depth, not to the total number of calls. Merge sort needs $\Theta(n)$ auxiliary space for merging; recursive binary search needs $\Theta(\log n)$ stack but iterative binary search needs $\Theta(1)$; quicksort needs $\Theta(\log n)$ stack on average and $\Theta(n)$ in the worst case unless it always recurses on the smaller part first.

## Solving recurrences

### Substitution and unrolling

Guess a form and prove it by induction, or expand the recurrence until a pattern appears.

- $T(n) = T(n-1) + c \Rightarrow \Theta(n)$
- $T(n) = T(n-1) + n \Rightarrow \Theta(n^2)$
- $T(n) = T(n/2) + c \Rightarrow \Theta(\log n)$
- $T(n) = T(n/2) + n \Rightarrow \Theta(n)$
- $T(n) = 2T(n-1) + c \Rightarrow \Theta(2^n)$
- $T(n) = T(n-1) + T(n-2) + c \Rightarrow \Theta(\phi^n)$ with $\phi \approx 1.618$

### Recursion tree

Draw the cost at each level and sum. If level costs shrink geometrically, the root dominates. If they grow geometrically, the leaves dominate. If they are equal, multiply one level's cost by the number of levels. For uneven splits such as $T(n) = T(n/3) + T(2n/3) + n$, every full level costs $n$ and the deepest path has $\log_{3/2} n$ levels, giving $\Theta(n\log n)$.

### Master theorem

For $T(n) = aT(n/b) + f(n)$ with $a \ge 1$, $b > 1$, compare $f(n)$ with $n^{\log_b a}$:

1. If $f(n) = O(n^{\log_b a - \epsilon})$ for some $\epsilon > 0$: $T(n) = \Theta(n^{\log_b a})$.
2. If $f(n) = \Theta(n^{\log_b a}\log^k n)$ with $k \ge 0$: $T(n) = \Theta(n^{\log_b a}\log^{k+1} n)$.
3. If $f(n) = \Omega(n^{\log_b a + \epsilon})$ and $a f(n/b) \le c f(n)$ for some $c < 1$: $T(n) = \Theta(f(n))$.

The extended case 2 covers $k \ge 0$. For $k = -1$ the answer is $\Theta(n^{\log_b a}\log\log n)$, and for $k < -1$ it is $\Theta(n^{\log_b a})$. The theorem does not apply to $T(n-1)$ style recurrences, to non-constant $a$ (such as $T(n) = nT(n/2)$), or to $a < 1$.

### Change of variables

For recurrences with $\sqrt{n}$, substitute $n = 2^m$. Then $T(\sqrt n)$ becomes $S(m/2)$ and $\log n$ becomes $m$. For example $T(n) = T(\sqrt n) + 1$ becomes $S(m) = S(m/2) + 1$, so $S(m) = \Theta(\log m)$ and $T(n) = \Theta(\log\log n)$.

## Worked examples

### Worked example 1: Ordering four functions

Arrange $f_1 = n!$, $f_2 = 2^n$, $f_3 = n^{\log_2 n}$, $f_4 = 4^{\log_2 n}$ in increasing order of growth.

First simplify: $f_4 = n^{\log_2 4} = n^2$. Take $\log_2$ of the rest: $\log f_3 = (\log n)^2$, $\log f_2 = n$, $\log f_1 = \Theta(n\log n)$. Since $2\log n < (\log n)^2 < n < n\log n$, the order is $f_4 < f_3 < f_2 < f_1$. Comparing logs is safe here because each gap in the logs is unbounded, not a constant.

### Worked example 2: Three recurrences

(a) $T(n) = 9T(n/3) + n$. Here $n^{\log_3 9} = n^2$ and $f(n) = n = O(n^{2-1})$. Case 1: $\Theta(n^2)$.

(b) $T(n) = T(2n/3) + 1$. $a = 1$, $b = 3/2$, $n^{\log_b 1} = n^0 = 1$, and $f(n) = 1$. Case 2 with $k = 0$: $\Theta(\log n)$.

(c) $T(n) = 2T(n/2) + n/\log n$. $n^{\log_2 2} = n$ and $f(n) = n\log^{-1} n$. Basic case 2 needs $k \ge 0$ and case 1 needs a polynomial gap, so the basic theorem fails. A recursion tree gives level $i$ cost $n/(\log n - i)$, and summing over $\log n$ levels gives $n \cdot H_{\log n} = \Theta(n\log\log n)$.

### Worked example 3: Exact loop count

How many times does the inner body execute for $n = 8$ in the fragment from the loop section above?

For each $i$ the inner loop runs $\lfloor\log_2 i\rfloor + 1$ times: $i = 1$ gives 1, $i = 2, 3$ give 2 each, $i = 4..7$ give 3 each, $i = 8$ gives 4. Total $1 + 4 + 12 + 4 = 21$. Asymptotically this is $\Theta(n\log n)$.

### Worked example 4: Uneven split

Solve $T(n) = T(n/2) + T(n/4) + n$.

Level 0 costs $n$. Level 1 costs $n/2 + n/4 = 3n/4$. Level 2 costs $(3/4)^2 n$. The level costs form a decreasing geometric series with ratio $3/4$, so the total is at most $n \cdot \frac{1}{1 - 3/4} = 4n$. Since the root alone costs $n$, $T(n) = \Theta(n)$. The rule: when the subproblem fractions sum to less than 1 and $f(n) = n$, the answer is linear.

## Common traps

- $O$ is an upper bound only. "$n = O(n^2)$" is true; saying an algorithm "is $O(n^2)$" does not mean it takes quadratic time.
- $2^{2n} \ne O(2^n)$ and $3^n \ne O(2^n)$. Constant factors in exponents matter.
- $\log(n^k) = k\log n = \Theta(\log n)$, but $(\log n)^k$ is not $\Theta(\log n)$ for $k > 1$.
- Master theorem case 3 needs the regularity condition. It almost always holds for polynomial $f(n)$, but check it.
- $n\log n$ vs $n^{1.01}$: the polynomial wins for large $n$ even though it looks close.
- A loop that doubles $j$ starting from 0 never terminates. Read the initialisation.
- Counting recursion depth for space, not total calls. Naive Fibonacci makes exponentially many calls but uses only $\Theta(n)$ stack.

## Quick revision

- Limit test: ratio $\to 0$, constant, or $\infty$ gives $o$, $\Theta$, $\omega$.
- $\log n! = \Theta(n\log n)$; $a^{\log_b n} = n^{\log_b a}$.
- Harmonic sum $\sum n/i = \Theta(n\log n)$; geometric sums take the largest term.
- Master theorem: compare $f(n)$ with $n^{\log_b a}$; equal (times $\log^k$) adds one log factor.
- $\sqrt n$ recurrences: substitute $n = 2^m$.
- $T(n) = T(\alpha n) + T(\beta n) + n$: $\Theta(n)$ if $\alpha + \beta < 1$, $\Theta(n\log n)$ if $\alpha + \beta = 1$.
- Stack space equals maximum recursion depth times frame size.
