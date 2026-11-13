---
title: "Algorithms formula sheet"
summary: "Recurrences, complexities, standard counts and exam rules for every Algorithms topic on one page."
---

## Asymptotic complexity

| Notation | Meaning |
|---|---|
| $f = O(g)$ | $f(n) \le c\,g(n)$ for all $n \ge n_0$ |
| $f = \Omega(g)$ | $f(n) \ge c\,g(n)$ for all $n \ge n_0$ |
| $f = \Theta(g)$ | both of the above |
| $f = o(g)$ | $f/g \to 0$ |
| $f = \omega(g)$ | $f/g \to \infty$ |

**Growth order:** $1 < \log\log n < \log n < (\log n)^k < \sqrt{n} < n < n\log n < n^2 < n^{\log n} < 2^n < 3^n < n! < n^n$.

- Compare two functions by comparing their logs: $\log(n^{\log n}) = \log^2 n$, $\log(2^n) = n$.
- $a^{\log_b n} = n^{\log_b a}$. $\log(n!) = \Theta(n\log n)$. $n! = o(n^n)$, $2^n = o(n!)$.
- $\binom{2n}{n} = \Theta(4^n/\sqrt{n})$. $H_n = \sum 1/i = \ln n + O(1)$.
- $2^{f} = O(2^{g})$ does NOT follow from $f = O(g)$.

**Master theorem** for $T(n) = aT(n/b) + f(n)$, with $p = \log_b a$:

| Case | Condition | Result |
|---|---|---|
| 1 | $f = O(n^{p - \epsilon})$ | $\Theta(n^{p})$ |
| 2 | $f = \Theta(n^{p}\log^k n)$, $k \ge 0$ | $\Theta(n^{p}\log^{k+1} n)$ |
| 2, $k = -1$ | $f = \Theta(n^{p}/\log n)$ | $\Theta(n^{p}\log\log n)$ |
| 2, $k < -1$ | $f = \Theta(n^{p}\log^k n)$ | $\Theta(n^{p})$ |
| 3 | $f = \Omega(n^{p + \epsilon})$ and $af(n/b) \le cf(n)$, $c < 1$ | $\Theta(f(n))$ |

**Other recurrences:**

| Recurrence | Solution |
|---|---|
| $T(n) = T(n-1) + n$ | $\Theta(n^2)$ |
| $T(n) = 2T(n-1) + 1$ | $\Theta(2^n)$ |
| $T(n) = T(n/2) + n$ | $\Theta(n)$ |
| $T(n) = T(n/3) + T(2n/3) + n$ | $\Theta(n\log n)$ |
| $T(n) = T(n/5) + T(7n/10) + n$ | $\Theta(n)$ (fractions sum below 1) |
| $T(n) = 2T(\sqrt{n}) + \log n$ | $\Theta(\log n \log\log n)$ |
| $T(n) = T(\sqrt{n}) + 1$ | $\Theta(\log\log n)$ |
| $T(n) = \sqrt{n}\,T(\sqrt{n}) + n$ | $\Theta(n\log\log n)$ |

- $\sqrt{n}$ recurrences: substitute $n = 2^m$, then $S(m) = T(2^m)$.

**Loop counting:**

| Loop | Iterations |
|---|---|
| `i = 1; i <= n; i *= 2` | $\lfloor \log_2 n \rfloor + 1$ |
| `i = 2; i <= n; i = i*i` | $\Theta(\log\log n)$ |
| inner `j = 1; j <= i` with outer `i *= 2` | $2n - 1$ total, $\Theta(n)$ |
| inner `j += i` for `i = 1..n` | $\sum \lfloor n/i \rfloor = \Theta(n\log n)$ |
| inner `j *= 2` up to $i$, outer `i = 1..n` | $\Theta(n\log n)$ |

## Searching and sorting

| Algorithm | Best | Average | Worst | Space | Stable | In place |
|---|---|---|---|---|---|---|
| Bubble (early exit) | $n$ | $n^2$ | $n^2$ | $1$ | yes | yes |
| Insertion | $n$ | $n^2$ | $n^2$ | $1$ | yes | yes |
| Selection | $n^2$ | $n^2$ | $n^2$ | $1$ | no | yes |
| Merge | $n\log n$ | $n\log n$ | $n\log n$ | $n$ | yes | no |
| Quick | $n\log n$ | $n\log n$ | $n^2$ | $\log n$ to $n$ | no | yes |
| Heap | $n\log n$ | $n\log n$ | $n\log n$ | $1$ | no | yes |
| Counting | $n + k$ | $n + k$ | $n + k$ | $n + k$ | yes | no |
| Radix ($d$ digits, base $b$) | $d(n + b)$ | $d(n + b)$ | $d(n + b)$ | $n + b$ | yes | no |

- Comparison sort lower bound: $\lceil \log_2 n! \rceil$ comparisons, $\Omega(n\log n)$.
- Insertion sort: shifts = inversions $I$; time $\Theta(n + I)$. Max inversions $n(n-1)/2$.
- Selection sort: at most $n - 1$ swaps.
- Merge of lists of sizes $m$, $n$: min $\min(m, n)$ comparisons, max $m + n - 1$.
- Merge sort worst case comparisons on $n = 2^k$: $n\log_2 n - n + 1$.
- Quicksort worst case: sorted or reverse sorted input with first or last pivot, and all-equal keys with Lomuto. Comparisons then $n(n-1)/2$.
- Quicksort recursing on the smaller part first: stack $O(\log n)$.
- Radix sort of $n$ keys in range $0$ to $n^c - 1$ with base $n$: $\Theta(cn)$.
- Counting sort: prefix sums $C[i] = $ number of keys $\le i$; scan input right to left for stability.

**Selection and order statistics:**

| Task | Cost |
|---|---|
| Min or max | $n - 1$ comparisons |
| Min and max together (pairs) | $\lceil 3n/2 \rceil - 2$ |
| Second smallest (tournament) | $n + \lceil \log_2 n \rceil - 2$ |
| $k$-th smallest, quickselect | $\Theta(n)$ average, $\Theta(n^2)$ worst |
| $k$-th smallest, median of medians (groups of 5) | $\Theta(n)$ worst |
| Median of medians with groups of 3 | $\Theta(n\log n)$ |

**Binary search:**

- Worst case probes on $n$ sorted keys: $\lfloor \log_2 n \rfloor + 1$.
- $n = 2^k - 1$: average successful probes $= \frac{1}{n}\sum_{d=1}^{k} d\,2^{d-1}$.
- Loop `while lo < hi`, `A[mid] < x` then `lo = mid + 1` else `hi = mid`: returns first index with $A[i] \ge x$ (lower bound). With `<=` it returns first index with $A[i] > x$ (count of elements $\le x$).

## Hashing

| Quantity | Value (load factor $\alpha = n/m$) |
|---|---|
| Chaining, unsuccessful search | $\Theta(1 + \alpha)$ |
| Chaining, successful search | $1 + \alpha/2$ approx. |
| Chaining, worst case search | $\Theta(n)$ |
| Open addressing, unsuccessful (uniform hashing) | $\le 1/(1 - \alpha)$ probes |
| Open addressing, successful | $\le \frac{1}{\alpha}\ln\frac{1}{1-\alpha}$ |
| Expected keys in a slot | $\alpha$ |
| Expected colliding pairs (universal) | $\le \binom{n}{2}/m$ |

| Probing | Probe $i$ | Distinct sequences | Problem |
|---|---|---|---|
| Linear | $(h(k) + i) \bmod m$ | $m$ | primary clustering |
| Quadratic | $(h(k) + c_1 i + c_2 i^2) \bmod m$ | $m$ | secondary clustering |
| Double | $(h_1(k) + i\,h_2(k)) \bmod m$ | $\Theta(m^2)$ | none of the above |

- Double hashing visits all slots iff $\gcd(h_2(k), m) = 1$: use $m$ prime, or $m = 2^r$ with $h_2$ odd. $h_2(k) \ne 0$ always.
- Quadratic probing with $i^2$ can miss slots: $i^2 \bmod 8 \in \{0, 1, 4\}$. With prime $m$ and $\alpha \le 1/2$ an empty slot is always found.
- Linear probing: an empty slot right after a run of $r$ full slots is filled next with probability $(r + 1)/m$.
- Deletion in open addressing: mark as deleted (tombstone), never empty, or later searches stop early.
- Universal family: $\Pr_h[h(x) = h(y)] \le 1/m$ for every $x \ne y$. Example: $h_{a,b}(k) = ((ak + b) \bmod p) \bmod m$, $p$ prime, $1 \le a < p$, $0 \le b < p$.

## Greedy algorithms

| Problem | Greedy rule | Time |
|---|---|---|
| Activity selection | earliest finish time | $O(n\log n)$ |
| Interval partitioning (rooms) | sort by start; answer = max overlap | $O(n\log n)$ |
| Fractional knapsack | highest value/weight first | $O(n\log n)$ |
| Huffman coding | merge two smallest | $O(n\log n)$ |
| Optimal merge pattern | merge two smallest files | $O(n\log n)$ |
| Job sequencing with deadlines | highest profit, latest free slot | $O(n^2)$ or $O(n\log n)$ |
| Min sum of completion times | shortest job first | $O(n\log n)$ |
| Min weighted completion | decreasing $w_j/p_j$ | $O(n\log n)$ |
| Min max lateness | earliest deadline first | $O(n\log n)$ |
| MST | Kruskal, Prim | see graphs |

- Greedy fails: 0/1 knapsack, coin change for non-canonical systems ($\{1, 7, 10\}$, amount 15: greedy 6, optimum 3), activity selection by shortest or earliest start.
- Huffman on $n$ symbols: $n - 1$ merges, $n - 1$ internal nodes, max code length $n - 1$ (Fibonacci frequencies).
- Huffman total bits $= \sum f_i \ell_i =$ sum of all internal node weights.
- Optimal merge cost = sum of all intermediate merged sizes.

## Dynamic programming

Use DP when there are **optimal substructure** and **overlapping subproblems**.

| Problem | Recurrence | Time | Space |
|---|---|---|---|
| LCS | match: $c[i-1][j-1] + 1$; else $\max(c[i-1][j], c[i][j-1])$ | $O(mn)$ | $O(mn)$, $O(\min(m,n))$ for length only |
| Edit distance | $\min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + [a_i \ne b_j])$ | $O(mn)$ | $O(mn)$ |
| LIS | $L[i] = 1 + \max_{j < i, a_j < a_i} L[j]$ | $O(n^2)$, $O(n\log n)$ with tails | $O(n)$ |
| 0/1 knapsack | $\max(K[i-1][w], v_i + K[i-1][w - w_i])$ | $O(nW)$ pseudo-polynomial | $O(nW)$ |
| Subset sum | $S[i][s] = S[i-1][s] \lor S[i-1][s - a_i]$ | $O(nW)$ | $O(W)$ |
| Coin change (ways) | $N[s] \mathrel{+}= N[s - c]$, coins in outer loop | $O(kS)$ | $O(S)$ |
| Rod cutting | $r_n = \max_k (p_k + r_{n-k})$ | $O(n^2)$ | $O(n)$ |
| Matrix chain | $\min_k (m[i][k] + m[k+1][j] + p_{i-1}p_kp_j)$ | $O(n^3)$ | $O(n^2)$ |
| Optimal BST | $\min_r (e[i][r-1] + e[r+1][j]) + w(i, j)$ | $O(n^3)$, $O(n^2)$ Knuth | $O(n^2)$ |

**Standard counts:**

| Count | Value |
|---|---|
| Parenthesisations of $n$ matrices | Catalan $C_{n-1} = \frac{1}{n}\binom{2n-2}{n-1}$: 1, 1, 2, 5, 14, 42 |
| BSTs on $n$ keys | $C_n$: 1, 2, 5, 14, 42 for $n = 1..5$ |
| Monotone lattice paths to $(a, b)$ | $\binom{a + b}{a}$ |
| Naive recursive Fibonacci calls for $F_n$ | $2F_{n+1} - 1$ |

- Any $k^2 + 1$ distinct numbers contain a monotone subsequence of length $k + 1$ (Erdos-Szekeres).
- Coin change ways: coin loop outside counts combinations; amount loop outside counts ordered sequences.

## Divide and conquer

| Algorithm | Recurrence | Time |
|---|---|---|
| Merge sort | $2T(n/2) + n$ | $\Theta(n\log n)$ |
| Max subarray (D&C) | $2T(n/2) + n$ | $\Theta(n\log n)$; Kadane $\Theta(n)$ |
| Counting inversions | $2T(n/2) + n$ | $\Theta(n\log n)$ |
| Closest pair | $2T(n/2) + n$ (presorted) | $\Theta(n\log n)$ |
| Closest pair, re-sort strip each call | $2T(n/2) + n\log n$ | $\Theta(n\log^2 n)$ |
| Karatsuba | $3T(n/2) + n$ | $\Theta(n^{\log_2 3}) = \Theta(n^{1.585})$ |
| Strassen | $7T(n/2) + n^2$ | $\Theta(n^{\log_2 7}) = \Theta(n^{2.807})$ |
| Fast power $x^n$ | $T(n/2) + 1$ | $\Theta(\log n)$ |
| Power with two recursive calls | $2T(n/2) + 1$ | $\Theta(n)$ |
| Min and max (halves) | $2T(n/2) + 2$ | $3n/2 - 2$ comparisons |

- Strassen: 7 products, 18 additions of $n/2$ blocks. Scalar multiplications $7^{\log_2 n}$; additions $A(n) = 7A(n/2) + 18(n/2)^2$.
- A $b \times b$ block scheme with $k$ products runs in $\Theta(n^{\log_b k})$ (when $\log_b k > 2$); compare exponents.
- Closest pair strip: compare each point with at most the next 7 in $y$ order.

## Graph traversals, MST and shortest paths

| Algorithm | Time (adjacency list) | Notes |
|---|---|---|
| BFS, DFS | $O(V + E)$ | matrix: $O(V^2)$ |
| Topological sort | $O(V + E)$ | DFS by decreasing finish time, or Kahn |
| SCC (Kosaraju, Tarjan) | $O(V + E)$ | Kosaraju: DFS on $G$, then on $G^T$ by decreasing finish |
| Articulation points, bridges | $O(V + E)$ | DFS low values |
| Prim, binary heap | $O(E\log V)$ | Fibonacci heap $O(E + V\log V)$; matrix $O(V^2)$ |
| Kruskal | $O(E\log E)$ | sorting dominates; union-find $O(\alpha(V))$ per op |
| Dijkstra, binary heap | $O((V + E)\log V)$ | no negative edges |
| Bellman-Ford | $O(VE)$ | detects negative cycles |
| DAG shortest paths | $O(V + E)$ | relax in topological order, any weights |
| Floyd-Warshall | $O(V^3)$ | all pairs, negative edges allowed |

**DFS edge classes** (directed, by colour of $v$ when edge $(u, v)$ is seen):

| $v$ is | Edge | Note |
|---|---|---|
| white | tree | |
| gray (on stack) | back | cycle exists |
| black, $d[u] < d[v]$ | forward | |
| black, $d[u] > d[v]$ | cross | |

- Undirected DFS: only tree and back edges. Undirected BFS: tree and cross edges; levels differ by at most 1.
- Component graph of SCCs is always a DAG.
- Articulation point: DFS root with $\ge 2$ children; non-root $u$ with a child $v$ having $low[v] \ge d[u]$. Bridge $(u, v)$: $low[v] > d[u]$.
- Topological order count: adding an isolated vertex to a DAG on $n$ vertices multiplies the count by $n + 1$.

**MST facts:**

- Cut property: the lightest edge crossing any cut is in some MST.
- Cycle property: the unique heaviest edge on a cycle is in no MST.
- Distinct weights imply a unique MST. MST has $V - 1$ edges.
- MST minimises the maximum edge on paths (bottleneck), but the MST path is not a shortest path.

**Shortest path facts:**

- Bellman-Ford: after round $i$, all shortest paths with at most $i$ edges are correct. One extra round that still relaxes an edge means a negative cycle reachable from $s$.
- Dijkstra can be wrong with a negative edge even without a negative cycle.
- Adding a constant to every edge can change shortest paths; multiplying by a positive constant cannot.
- Floyd-Warshall: $D^{(k)}$ allows intermediates $\{1, \dots, k\}$ only; a negative $D[i][i]$ means a negative cycle.
