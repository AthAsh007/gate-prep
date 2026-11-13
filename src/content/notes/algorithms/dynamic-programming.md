---
title: "Dynamic programming"
summary: "When and how to use dynamic programming, with the standard GATE formulations: LCS, 0/1 knapsack, matrix chain multiplication, Floyd-Warshall and Bellman-Ford."
order: 5
sources:
  - title: "Dynamic programming (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Dynamic_programming"
  - title: "Floyd-Warshall algorithm (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm"
  - title: "GATE Overflow: dynamic-programming tag"
    url: "https://gateoverflow.in/tag/dynamic-programming"
---

## The idea

Dynamic programming (DP) solves a problem by expressing its answer in terms of answers to smaller subproblems, then computing each subproblem once and storing it. It applies when the problem has:

1. **Optimal substructure**: an optimal solution is built from optimal solutions of subproblems.
2. **Overlapping subproblems**: the same subproblems appear many times in a plain recursion.

Without overlap, plain divide and conquer is enough. Without optimal substructure, no recurrence exists. Naive recursive Fibonacci makes $\Theta(\phi^n)$ calls; storing $F(0..n)$ cuts this to $\Theta(n)$.

### Two styles

- **Memoisation (top-down)**: write the recursion, cache each result the first time it is computed. Only reachable subproblems are solved.
- **Tabulation (bottom-up)**: fill a table in an order where every dependency is ready. No recursion overhead, and rows that are no longer needed can be discarded to save space.

### Recipe

1. Define the subproblem precisely (what does $C[i][j]$ mean?).
2. Write the recurrence, including base cases.
3. Fix an evaluation order.
4. Running time = number of subproblems $\times$ work per subproblem.
5. Recover the solution itself by storing the choice made at each cell.

## Longest common subsequence

A subsequence keeps order but may skip characters. For $X = x_1..x_m$ and $Y = y_1..y_n$, let $C[i][j]$ be the LCS length of the prefixes $X_i$ and $Y_j$.

$$C[i][j] = \begin{cases} 0 & i = 0 \text{ or } j = 0 \\ C[i-1][j-1] + 1 & x_i = y_j \\ \max(C[i-1][j],\ C[i][j-1]) & x_i \ne y_j \end{cases}$$

Time and space $\Theta(mn)$. The length alone needs only two rows, $\Theta(\min(m, n))$ space. Related: shortest common supersequence length $= m + n - \text{LCS}$; minimum deletions plus insertions to turn $X$ into $Y$ $= m + n - 2\,\text{LCS}$.

## 0/1 knapsack

Items $1..n$ with weights $w_i$ and values $v_i$, capacity $W$. $K[i][c]$ is the best value using items $1..i$ with capacity $c$.

$$K[i][c] = \begin{cases} K[i-1][c] & w_i > c \\ \max(K[i-1][c],\ K[i-1][c - w_i] + v_i) & \text{otherwise} \end{cases}$$

Time $\Theta(nW)$. This is **pseudo-polynomial**: polynomial in the value of $W$, but exponential in the number of bits of $W$. 0/1 knapsack is NP-hard, so this does not contradict anything. With a one-dimensional array, loop $c$ from $W$ down to $w_i$ so each item is used once; looping upward gives the unbounded knapsack instead.

Subset sum is the same table with boolean entries: $S[i][s] = S[i-1][s] \lor S[i-1][s - a_i]$.

## Matrix chain multiplication

Matrix $A_i$ has dimensions $p_{i-1} \times p_i$. Multiplying a $p \times q$ by a $q \times r$ matrix costs $pqr$ scalar multiplications. $m[i][j]$ is the minimum cost of computing $A_i \cdots A_j$.

$$m[i][j] = \begin{cases} 0 & i = j \\ \min_{i \le k < j}\big(m[i][k] + m[k+1][j] + p_{i-1}p_kp_j\big) & i < j \end{cases}$$

Fill by increasing chain length. $\Theta(n^2)$ subproblems, $O(n)$ choices each: $\Theta(n^3)$ time, $\Theta(n^2)$ space. The number of parenthesisations of $n$ matrices is the Catalan number $C_{n-1} = \frac{1}{n}\binom{2n-2}{n-1}$, which grows exponentially, so brute force is hopeless.

## Floyd-Warshall (all-pairs shortest paths)

$d^{(k)}[i][j]$ is the shortest $i \to j$ path whose intermediate vertices are all in $\{1..k\}$.

$$d^{(k)}[i][j] = \min\big(d^{(k-1)}[i][j],\ d^{(k-1)}[i][k] + d^{(k-1)}[k][j]\big)$$

```
for k = 1 to V:
    for i = 1 to V:
        for j = 1 to V:
            if d[i][k] + d[k][j] < d[i][j]:
                d[i][j] = d[i][k] + d[k][j]
```

Time $\Theta(V^3)$, space $\Theta(V^2)$ (one matrix can be updated in place). Handles negative edges. A negative cycle shows up as $d[i][i] < 0$. The loop over $k$ must be outermost. Replacing $(\min, +)$ by $(\lor, \land)$ gives Warshall's transitive closure.

## Bellman-Ford (single source, negative edges allowed)

$d_k(v)$ is the shortest path to $v$ using at most $k$ edges: $d_k(v) = \min(d_{k-1}(v),\ \min_{(u,v)} d_{k-1}(u) + w(u,v))$. A shortest simple path has at most $V - 1$ edges, so $V - 1$ rounds suffice.

```
d[s] = 0; d[v] = infinity for v != s
repeat V - 1 times:
    for each edge (u, v, w):
        if d[u] + w < d[v]: d[v] = d[u] + w
for each edge (u, v, w):
    if d[u] + w < d[v]: report negative cycle
```

Time $O(VE)$. In practice the in-place version may converge earlier, depending on edge order; it can stop as soon as a full pass changes nothing.

## Other standard DPs

| Problem | Subproblem | Time |
|---|---|---|
| Edit distance | prefixes $X_i$, $Y_j$ | $\Theta(mn)$ |
| Longest increasing subsequence | LIS ending at $i$ | $\Theta(n^2)$, or $\Theta(n\log n)$ with patience sorting |
| Coin change (number of ways) | amount $s$ using first $i$ coins | $\Theta(nS)$ |
| Rod cutting | best value for length $j$ | $\Theta(n^2)$ |
| Optimal BST | keys $i..j$ | $\Theta(n^3)$ |
| Travelling salesman (Held-Karp) | subset $S$, end vertex $j$ | $\Theta(n^2 2^n)$ |

## Worked examples

### Worked example 1: LCS table

Find the LCS length of $X = $ ACBDAB and $Y = $ BDCABA.

The filled table (rows are prefixes of $X$, columns of $Y$, row 0 and column 0 omitted):

| | B | D | C | A | B | A |
|---|---|---|---|---|---|---|
| A | 0 | 0 | 0 | 1 | 1 | 1 |
| C | 0 | 0 | 1 | 1 | 1 | 1 |
| B | 1 | 1 | 1 | 1 | 2 | 2 |
| D | 1 | 2 | 2 | 2 | 2 | 2 |
| A | 1 | 2 | 2 | 3 | 3 | 3 |
| B | 1 | 2 | 2 | 3 | 4 | 4 |

The answer is the bottom-right cell, 4. Tracing back through diagonal moves gives BDAB, one LCS of length 4.

### Worked example 2: 0/1 knapsack

Capacity 7, items (weight, value): (1, 1), (3, 4), (4, 5), (5, 7).

Rows after each item, capacities 0 to 7:

| Items used | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| {1} | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| {1, 2} | 0 | 1 | 1 | 4 | 5 | 5 | 5 | 5 |
| {1, 2, 3} | 0 | 1 | 1 | 4 | 5 | 6 | 6 | 9 |
| {1, 2, 3, 4} | 0 | 1 | 1 | 4 | 5 | 7 | 8 | 9 |

Answer 9, from items 2 and 3 (weights 3 + 4). The ratio-greedy choice (5, 7) then (1, 1) gives only 8.

### Worked example 3: Matrix chain

Dimensions $p = (5, 10, 3, 12, 5)$, so four matrices.

- Length 2: $m_{12} = 5 \cdot 10 \cdot 3 = 150$, $m_{23} = 10 \cdot 3 \cdot 12 = 360$, $m_{34} = 3 \cdot 12 \cdot 5 = 180$.
- $m_{13} = \min(m_{23} + 5\cdot10\cdot12,\ m_{12} + 5\cdot3\cdot12) = \min(960, 330) = 330$.
- $m_{24} = \min(m_{34} + 10\cdot3\cdot5,\ m_{23} + 10\cdot12\cdot5) = \min(330, 960) = 330$.
- $m_{14} = \min(m_{24} + 5\cdot10\cdot5,\ m_{12} + m_{34} + 5\cdot3\cdot5,\ m_{13} + 5\cdot12\cdot5) = \min(580, 405, 630) = 405$.

Optimal order $(A_1A_2)(A_3A_4)$ with 405 multiplications.

### Worked example 4: Floyd-Warshall

Directed graph on vertices 1 to 4: $1\to2$ (4), $1\to3$ (9), $2\to3$ (3), $2\to4$ (7), $3\to4$ (1), $3\to1$ (6), $4\to1$ (2).

After $k = 1$ (paths through vertex 1): $d[3][2] = 6 + 4 = 10$, $d[4][2] = 2 + 4 = 6$, $d[4][3] = 2 + 9 = 11$. After $k = 2$: $d[1][3] = 4 + 3 = 7$, $d[1][4] = 4 + 7 = 11$, $d[4][3] = 6 + 3 = 9$. After $k = 3$: $d[1][4] = 7 + 1 = 8$, $d[2][4] = 3 + 1 = 4$, $d[2][1] = 3 + 6 = 9$. After $k = 4$: $d[2][1] = 4 + 2 = 6$, $d[3][1] = 1 + 2 = 3$, $d[3][2] = 1 + 6 = 7$. Final matrix:

$$D = \begin{pmatrix} 0 & 4 & 7 & 8 \\ 6 & 0 & 3 & 4 \\ 3 & 7 & 0 & 1 \\ 2 & 6 & 9 & 0 \end{pmatrix}$$

### Worked example 5: Bellman-Ford needs every pass

Vertices s, a, b, c, t. Edges relaxed in this order each pass: $a\to t$ (4), $c\to a$ ($-2$), $a\to c$ (5), $b\to c$ ($-3$), $s\to a$ (6), $s\to b$ (7), $b\to t$ (9).

- Pass 1: $a = 6$, $b = 7$, $t = 16$ (only edges out of s and b are usable).
- Pass 2: $t = 6 + 4 = 10$, $c = \min(11, 7 - 3) = 4$.
- Pass 3: $a = 4 - 2 = 2$.
- Pass 4: $t = 2 + 4 = 6$.

Final: $a = 2$, $b = 7$, $c = 4$, $t = 6$. The worst edge order made the shortest path $s \to b \to c \to a \to t$ (4 edges) need all $V - 1 = 4$ passes.

## Common traps

- 0/1 knapsack in $\Theta(nW)$ is not a polynomial algorithm.
- LCS is not the longest common substring; substrings must be contiguous and use a different recurrence ($C[i][j] = 0$ on mismatch).
- Matrix chain needs $p_{i-1}p_kp_j$, not $p_ip_kp_j$. Write the dimension vector carefully.
- Floyd-Warshall with $k$ in an inner loop is wrong.
- Bellman-Ford pass values depend on edge order; final values do not.
- Coin change "number of ways" with coins in the outer loop counts combinations; with amounts in the outer loop it counts ordered sequences.

## Quick revision

- DP = optimal substructure + overlapping subproblems.
- LCS, edit distance: $\Theta(mn)$. Matrix chain: $\Theta(n^3)$. 0/1 knapsack: $\Theta(nW)$, pseudo-polynomial.
- Floyd-Warshall: $\Theta(V^3)$, negative edges fine, $d[i][i] < 0$ means a negative cycle.
- Bellman-Ford: $O(VE)$, $V - 1$ passes, one more pass detects negative cycles.
- Parenthesisations of $n$ matrices: Catalan $C_{n-1}$ (1, 1, 2, 5, 14, 42 for $n = 1..6$).
