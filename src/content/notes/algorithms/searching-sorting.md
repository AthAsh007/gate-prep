---
title: "Searching and sorting"
summary: "Linear and binary search, the comparison sorts and linear-time sorts, their costs, stability and in-place behaviour, and the comparison lower bound."
order: 2
sources:
  - title: "Sorting algorithm (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Sorting_algorithm"
  - title: "Binary search (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Binary_search"
  - title: "GATE Overflow: sorting tag"
    url: "https://gateoverflow.in/tag/sorting"
---

## Searching

### Linear search

Scan elements one by one. Worst case $n$ comparisons, $\Theta(n)$ time, works on unsorted data and linked lists. If the key is equally likely to be at any of the $n$ positions, a successful search makes $(n+1)/2$ comparisons on average.

### Binary search

Works on a sorted array with random access. Each step compares the key with the middle element and discards half the range.

```
binary_search(A, n, key):          // A[0..n-1] sorted
    lo = 0; hi = n - 1
    while lo <= hi:
        mid = (lo + hi) / 2        // integer division
        if A[mid] == key: return mid
        if key < A[mid]: hi = mid - 1
        else: lo = mid + 1
    return -1
```

With $k$ probes the algorithm can handle an array of at most $2^k - 1$ elements, so the worst case is $\lceil\log_2(n+1)\rceil = \lfloor\log_2 n\rfloor + 1$ probes. Time $\Theta(\log n)$, iterative space $\Theta(1)$. On a linked list binary search loses its advantage because reaching the middle costs $\Theta(n)$.

Common variants: first occurrence (on a match, record it and continue left), lower bound (first index with $A[i] \ge$ key), and search in a rotated sorted array (one half is always sorted). Interpolation search averages $\Theta(\log\log n)$ on uniformly distributed keys but is $\Theta(n)$ in the worst case.

## Comparison sorts

### Selection sort

Repeatedly select the minimum of the unsorted suffix and swap it to the front. Always $n(n-1)/2$ comparisons and at most $n - 1$ swaps, so it is the right choice when writes are expensive. Not stable in the usual array form.

### Bubble sort

Repeatedly swap adjacent out-of-order pairs. After pass $p$ the largest $p$ elements are in place. With an early-exit flag, a sorted input finishes in one pass of $n-1$ comparisons. The number of swaps equals the number of inversions.

### Insertion sort

Insert $A[i]$ into the sorted prefix $A[0..i-1]$ by shifting larger elements right.

```
for i = 1 to n - 1:
    key = A[i]; j = i - 1
    while j >= 0 and A[j] > key:
        A[j + 1] = A[j]; j = j - 1
    A[j + 1] = key
```

Shifts equal the number of inversions $I$. Comparisons lie between $I$ and $I + n - 1$. Best case (sorted) $\Theta(n)$, worst case (reverse sorted) $\Theta(n^2)$. It is stable, in place, online, and fast on nearly sorted data. Using binary search to find the position cuts comparisons to $O(n\log n)$ but shifts remain $\Theta(n^2)$ in the worst case.

### Merge sort

Split in half, sort each half, merge. $T(n) = 2T(n/2) + \Theta(n) = \Theta(n\log n)$ in every case. Merging lists of sizes $m$ and $k$ takes between $\min(m, k)$ and $m + k - 1$ comparisons. The worst-case total for $n = 2^h$ is $n\log_2 n - n + 1$. Needs $\Theta(n)$ extra space for arrays, but sorts linked lists with $O(1)$ extra space. Stable.

### Quicksort

Partition around a pivot, then recurse on both sides.

```
partition(A, lo, hi):              // Lomuto, pivot = A[hi]
    p = A[hi]; i = lo - 1
    for j = lo to hi - 1:
        if A[j] <= p:
            i = i + 1; swap A[i], A[j]
    swap A[i + 1], A[hi]
    return i + 1
```

Partition costs $\Theta(n)$. Balanced splits give $\Theta(n\log n)$; any constant-ratio split such as 1:9 still gives $\Theta(n\log n)$. The worst case $\Theta(n^2)$ occurs when the pivot is always the minimum or maximum, which happens for first- or last-element pivots on sorted or reverse-sorted input, and on arrays of all-equal keys with Lomuto. Randomised pivot gives expected $\Theta(n\log n)$, about $1.39\,n\log_2 n$ comparisons. Not stable. In place apart from the recursion stack.

### Heapsort

Build a max-heap in $\Theta(n)$, then extract the maximum $n - 1$ times at $O(\log n)$ each. $\Theta(n\log n)$ in all cases, in place, not stable.

### Comparison table

| Algorithm | Best | Average | Worst | Stable | In place |
|---|---|---|---|---|---|
| Selection | $n^2$ | $n^2$ | $n^2$ | No | Yes |
| Bubble (with flag) | $n$ | $n^2$ | $n^2$ | Yes | Yes |
| Insertion | $n$ | $n^2$ | $n^2$ | Yes | Yes |
| Merge | $n\log n$ | $n\log n$ | $n\log n$ | Yes | No ($\Theta(n)$) |
| Quick | $n\log n$ | $n\log n$ | $n^2$ | No | Yes (stack only) |
| Heap | $n\log n$ | $n\log n$ | $n\log n$ | No | Yes |
| Counting | $n + k$ | $n + k$ | $n + k$ | Yes | No |
| Radix ($d$ digits) | $d(n + b)$ | $d(n + b)$ | $d(n + b)$ | Yes | No |

### Lower bound

Any comparison sort corresponds to a binary decision tree with at least $n!$ leaves, so its height is at least $\log_2(n!) = \Theta(n\log n)$. Merge sort and heapsort are therefore asymptotically optimal. The minimum number of comparisons in the worst case for 5 elements is $\lceil\log_2 120\rceil = 7$ as a lower bound (and 7 is achievable).

## Linear-time sorts

These avoid the lower bound by not using comparisons.

- **Counting sort**: keys in $0..k$. Count occurrences, take prefix sums, then place elements scanning the input right to left so the sort is stable. $\Theta(n + k)$ time and space.
- **Radix sort**: sort by the least significant digit first, using a stable sort for each digit. With $d$ digits in base $b$ it costs $\Theta(d(n + b))$. Keys up to $n^c$ written in base $n$ have $c$ digits, so radix sort is $\Theta(n)$ for constant $c$. Using an unstable per-digit sort breaks correctness.
- **Bucket sort**: for keys uniform in $[0, 1)$, expected $\Theta(n)$; worst case is the cost of the bucket sort used inside one bucket.

## Selection

The $k$-th smallest element can be found by quickselect in expected $\Theta(n)$, worst case $\Theta(n^2)$. The median-of-medians pivot (groups of 5) guarantees $T(n) \le T(n/5) + T(7n/10) + O(n) = \Theta(n)$ worst case. Finding both minimum and maximum needs only $\lceil 3n/2\rceil - 2$ comparisons by processing elements in pairs, against $2n - 2$ for two separate scans. The second largest needs $n + \lceil\log_2 n\rceil - 2$ comparisons using a tournament.

## Worked examples

### Worked example 1: Binary search probes

What is the maximum number of probes for a successful or unsuccessful binary search in a sorted array of 100 elements?

We need the smallest $k$ with $2^k - 1 \ge 100$. $2^6 - 1 = 63$ is too small and $2^7 - 1 = 127$ suffices, so the answer is 7. Check with the other form: $\lfloor\log_2 100\rfloor + 1 = 6 + 1 = 7$.

### Worked example 2: Lomuto partition trace

Partition $[3, 8, 2, 5, 1, 4, 7, 6]$ with pivot 6 (last element), indices from 0.

- $j = 0$: 3 $\le$ 6, $i = 0$, swap with itself.
- $j = 1$: 8 skipped.
- $j = 2$: 2, $i = 1$, swap A[1], A[2]: $[3, 2, 8, 5, 1, 4, 7, 6]$.
- $j = 3$: 5, $i = 2$: $[3, 2, 5, 8, 1, 4, 7, 6]$.
- $j = 4$: 1, $i = 3$: $[3, 2, 5, 1, 8, 4, 7, 6]$.
- $j = 5$: 4, $i = 4$: $[3, 2, 5, 1, 4, 8, 7, 6]$.
- $j = 6$: 7 skipped.

Final swap of A[5] and A[7] gives $[3, 2, 5, 1, 4, 6, 7, 8]$. The pivot lands at index 5, exactly the number of elements not larger than it.

### Worked example 3: Insertion sort cost

Sort $[2, 5, 1, 4, 3]$ with insertion sort. Count shifts and comparisons.

Inversions: (2,1), (5,1), (5,4), (5,3), (4,3), so 5 shifts. Comparisons per step:

- Inserting 5 into $[2]$: 1 comparison (stops at 2).
- Inserting 1 into $[2, 5]$: 2 comparisons (passes 5 and 2, then $j$ falls below 0, so no stopping comparison).
- Inserting 4 into $[1, 2, 5]$: 2 comparisons (passes 5, stops at 2).
- Inserting 3 into $[1, 2, 4, 5]$: 3 comparisons (passes 5 and 4, stops at 2). Total $1 + 2 + 2 + 3 = 8$ comparisons and 5 shifts.

### Worked example 4: Radix sort cost

Sort $n$ integers in the range $[0, n^2 - 1]$. Comparison sorts need $\Omega(n\log n)$. In base $n$ each key has 2 digits, so two counting-sort passes of $\Theta(n + n)$ each give $\Theta(n)$ overall. If the range were $[0, 2^n]$, each key would have about $n/\log_2 n$ base-$n$ digits and radix sort would cost $\Theta(n^2/\log n)$, worse than merge sort.

## Common traps

- Stability matters only when equal keys exist; the classic unstable sorts are selection, quick and heap.
- Quicksort worst case also appears on all-equal keys with Lomuto partition, not only on sorted input.
- "In place" usually allows $O(\log n)$ stack; merge sort on arrays is still not in place.
- Insertion sort is $\Theta(n + I)$ where $I$ is the inversion count; a nearly sorted array is linear.
- Binary search needs random access. Questions about binary search on a linked list expect $\Theta(n)$.
- Heap building is $\Theta(n)$, not $\Theta(n\log n)$; the sort phase is what costs $n\log n$.
- Selection sort does $\Theta(n^2)$ comparisons even on sorted input.

## Quick revision

- Binary search worst case: $\lfloor\log_2 n\rfloor + 1$ probes.
- Comparison sort lower bound: $\log_2 n! = \Theta(n\log n)$.
- Stable: insertion, bubble, merge, counting, radix. Unstable: selection, quick, heap.
- Fewest swaps: selection sort ($\le n - 1$).
- Merge two sorted lists of sizes $m, k$: at most $m + k - 1$ comparisons.
- Min and max together: $\lceil 3n/2\rceil - 2$ comparisons.
- Median of medians: linear worst case; quickselect: linear expected.
- Radix sort needs a stable digit sort.
