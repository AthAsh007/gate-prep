---
title: "Divide and conquer"
summary: "The divide-and-conquer pattern, its recurrences, and the standard algorithms: binary search, merge sort, quicksort, inversion counting, max-min, fast multiplication and fast exponentiation."
order: 6
sources:
  - title: "Divide-and-conquer algorithm (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Divide-and-conquer_algorithm"
  - title: "Strassen algorithm (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Strassen_algorithm"
  - title: "GATE Overflow: recurrence-relation tag"
    url: "https://gateoverflow.in/tag/recurrence-relation"
---

## The pattern

Divide and conquer (D&C) has three steps:

1. **Divide** the input into smaller instances of the same problem.
2. **Conquer** each instance recursively; tiny instances are solved directly.
3. **Combine** the sub-answers into the answer.

The running time is described by a recurrence of the form $T(n) = aT(n/b) + D(n) + C(n)$, where $a$ is the number of subproblems, $n/b$ their size, and $D, C$ the divide and combine costs. Unlike dynamic programming, the subproblems are independent, so nothing is gained by storing them. When a D&C recursion keeps solving the same subproblem (as in naive Fibonacci), it is a sign that DP is the right tool.

### Reading the recurrence

The Master theorem compares $f(n) = D(n) + C(n)$ with $n^{\log_b a}$, the number of leaves of the recursion tree.

- Leaves dominate ($f$ polynomially smaller): $\Theta(n^{\log_b a})$.
- Balanced ($f = \Theta(n^{\log_b a})$): $\Theta(n^{\log_b a}\log n)$.
- Root dominates ($f$ polynomially larger, regular): $\Theta(f(n))$.

Reducing the number of subproblems $a$ is often the key trick: Karatsuba goes from 4 to 3 half-size products, Strassen from 8 to 7.

## Standard algorithms

| Algorithm | Recurrence | Time |
|---|---|---|
| Binary search | $T(n) = T(n/2) + 1$ | $\Theta(\log n)$ |
| Merge sort | $T(n) = 2T(n/2) + n$ | $\Theta(n\log n)$ |
| Quicksort, balanced split | $T(n) = 2T(n/2) + n$ | $\Theta(n\log n)$ |
| Quicksort, worst split | $T(n) = T(n-1) + n$ | $\Theta(n^2)$ |
| Max and min | $T(n) = 2T(n/2) + 2$ | $3n/2 - 2$ comparisons |
| Maximum subarray | $T(n) = 2T(n/2) + n$ | $\Theta(n\log n)$ |
| Counting inversions | $T(n) = 2T(n/2) + n$ | $\Theta(n\log n)$ |
| Closest pair of points | $T(n) = 2T(n/2) + n$ | $\Theta(n\log n)$ |
| Karatsuba multiplication | $T(n) = 3T(n/2) + n$ | $\Theta(n^{\log_2 3}) \approx n^{1.585}$ |
| Naive block matrix multiply | $T(n) = 8T(n/2) + n^2$ | $\Theta(n^3)$ |
| Strassen | $T(n) = 7T(n/2) + n^2$ | $\Theta(n^{\log_2 7}) \approx n^{2.81}$ |
| Fast exponentiation | $T(n) = T(n/2) + 1$ | $\Theta(\log n)$ multiplications |
| Median of medians select | $T(n) = T(n/5) + T(7n/10) + n$ | $\Theta(n)$ |

### Merge sort

```
merge_sort(A, lo, hi):
    if lo >= hi: return
    mid = (lo + hi) / 2
    merge_sort(A, lo, mid)
    merge_sort(A, mid + 1, hi)
    merge(A, lo, mid, hi)     // at most (hi - lo) comparisons
```

The recursion depth is $\lceil\log_2 n\rceil$, each level does $\Theta(n)$ merging work, so the total is $\Theta(n\log n)$ regardless of input order. The worst-case comparison count satisfies $W(n) = W(\lceil n/2\rceil) + W(\lfloor n/2\rfloor) + n - 1$ with $W(1) = 0$, which equals $n\log_2 n - n + 1$ for powers of 2. The best case (each merge stops after one list runs out) is $\frac{n}{2}\log_2 n$ for powers of 2.

### Quicksort

D&C with all the work in the divide step (partition) and no combine step. Its recurrence depends on the split. Any split that keeps a constant fraction on each side, even 1:99, gives $\Theta(n\log n)$; a split of $0$ and $n-1$ at every level gives $\Theta(n^2)$.

For example, if every partition puts exactly one quarter of the elements on one side, then $T(n) = T(n/4) + T(3n/4) + cn$. Each full level of the recursion tree costs $cn$. The shallowest leaf is at depth $\log_4 n$ and the deepest at $\log_{4/3} n$, so the total lies between $cn\log_4 n$ and $cn\log_{4/3} n$. Both are $\Theta(n\log n)$; the split ratio changes only the constant. The quadratic worst case needs the subproblem to shrink by a constant amount, not a constant fraction.

### Max and min together

```
maxmin(A, lo, hi):
    if lo == hi: return (A[lo], A[lo])                     // 0 comparisons
    if hi == lo + 1: compare once, return (larger, smaller) // 1 comparison
    mid = (lo + hi) / 2
    (max1, min1) = maxmin(A, lo, mid)
    (max2, min2) = maxmin(A, mid + 1, hi)
    return (max(max1, max2), min(min1, min2))              // 2 comparisons
```

With $T(2) = 1$ and $T(n) = 2T(n/2) + 2$, unrolling for $n = 2^k$ gives $T(n) = \frac{3n}{2} - 2$. This matches the lower bound for the problem.

### Counting inversions

An inversion is a pair $i < j$ with $A[i] > A[j]$. Modify merge sort: when merging, each time an element is taken from the right half while $r$ elements remain in the left half, add $r$ to the count (all of those are larger and earlier). Total $\Theta(n\log n)$ instead of $\Theta(n^2)$ for checking every pair.

### Maximum subarray

Split at the midpoint. The best subarray lies in the left half, in the right half, or crosses the middle. The crossing case takes the best suffix of the left half plus the best prefix of the right half, in linear time. Hence $\Theta(n\log n)$. Kadane's scan solves the same problem in $\Theta(n)$ and is not D&C.

### Fast multiplication

Write $x = x_1 2^{n/2} + x_0$ and $y = y_1 2^{n/2} + y_0$. Then $xy = x_1y_1 2^n + (x_1y_0 + x_0y_1)2^{n/2} + x_0y_0$, which needs four half-size products. Karatsuba notes that $x_1y_0 + x_0y_1 = (x_1 + x_0)(y_1 + y_0) - x_1y_1 - x_0y_0$, so three products suffice. Strassen applies the same idea to $2 \times 2$ block matrices: seven block products and 18 block additions.

### Fast exponentiation

```
power(x, n):
    if n == 0: return 1
    h = power(x, n / 2)          // one recursive call
    if n is even: return h * h
    else: return x * h * h
```

At most 2 multiplications per level and $\lfloor\log_2 n\rfloor + 1$ levels: $\Theta(\log n)$. Calling `power(x, n/2)` twice instead of storing it in `h` changes the recurrence to $T(n) = 2T(n/2) + 1 = \Theta(n)$.

## Worked examples

### Worked example 1: Worst-case merge sort comparisons

How many comparisons does merge sort make in the worst case on 8 elements?

$W(1) = 0$, $W(2) = 1$, $W(4) = 2W(2) + 3 = 5$, $W(8) = 2W(4) + 7 = 17$. Formula check: $8 \cdot 3 - 8 + 1 = 17$. For 16 elements: $2 \cdot 17 + 15 = 49 = 16 \cdot 4 - 16 + 1$.

### Worked example 2: D&C max-min count

How many comparisons does the recursive max-min algorithm make on $n = 8$?

$T(2) = 1$, $T(4) = 2(1) + 2 = 4$, $T(8) = 2(4) + 2 = 10$. Formula $\frac{3 \cdot 8}{2} - 2 = 10$. Scanning twice would use $2(8 - 1) = 14$.

### Worked example 3: Inversions by merging

Count inversions in $[4, 1, 3, 9, 7, 2]$.

Split into $[4, 1, 3]$ and $[9, 7, 2]$.

- Left half: (4,1) and (4,3), so 2 inversions; sorted $[1, 3, 4]$.
- Right half: (9,7), (9,2), (7,2), so 3 inversions; sorted $[2, 7, 9]$.
- Merge $[1, 3, 4]$ with $[2, 7, 9]$: take 1; take 2 from the right while 3 and 4 remain on the left, add 2; then 3, 4, 7, 9 add nothing.

Total $2 + 3 + 2 = 7$.

### Worked example 4: Picking the faster recurrence

Algorithm P solves a problem by $T_P(n) = 5T_P(n/2) + n^2$; algorithm Q by $T_Q(n) = 24T_Q(n/4) + n^2$. Which is faster?

P: $n^{\log_2 5} \approx n^{2.32}$ dominates $n^2$, so $\Theta(n^{2.32})$. Q: $n^{\log_4 24} \approx n^{2.29}$ dominates $n^2$, so $\Theta(n^{2.29})$. Q is asymptotically faster, though only slightly. For Q to beat P with $a$ subproblems of size $n/4$, we need $\log_4 a < \log_2 5$, that is $a < 25$.

### Worked example 5: Karatsuba by hand

Multiply $x = 12$ and $y = 34$ with one level of Karatsuba in base 10, splitting each number into a high and a low digit.

$x_1 = 1$, $x_0 = 2$, $y_1 = 3$, $y_0 = 4$. Three products:

- $P_1 = x_1y_1 = 3$
- $P_2 = x_0y_0 = 8$
- $P_3 = (x_1 + x_0)(y_1 + y_0) = 3 \times 7 = 21$

Middle term $P_3 - P_1 - P_2 = 21 - 3 - 8 = 10$, which equals $x_1y_0 + x_0y_1 = 4 + 6$. Result $3 \cdot 100 + 10 \cdot 10 + 8 = 408 = 12 \times 34$. One multiplication was traded for a few additions; applied recursively, that trade is what lowers the exponent from 2 to $\log_2 3$. The base case matters in practice: for small numbers the extra additions cost more than they save, so real implementations switch to schoolbook multiplication below a threshold size.

## Common traps

- D&C does not always beat brute force: $T(n) = 4T(n/2) + n$ is still $\Theta(n^2)$.
- Two recursive calls on the same half (as in a careless power function) double the work.
- Quicksort's worst case is a property of the split, not of D&C in general.
- Merge sort makes the same number of recursive calls for every input; only comparisons change.
- When the combine step is $\Theta(n\log n)$, as in a naive closest-pair, $T(n) = 2T(n/2) + n\log n = \Theta(n\log^2 n)$.

## Quick revision

- Write the recurrence first, then apply the Master theorem.
- Merge sort worst comparisons: $n\log_2 n - n + 1$.
- Max-min: $3n/2 - 2$ comparisons.
- Karatsuba $n^{1.585}$, Strassen $n^{2.81}$.
- Fast power: $\Theta(\log n)$ multiplications with one recursive call.
- Inversions counted during merge in $\Theta(n\log n)$.
