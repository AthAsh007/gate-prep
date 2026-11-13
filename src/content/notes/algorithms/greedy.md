---
title: "Greedy algorithms"
summary: "The greedy design technique, how to prove a greedy choice correct, and the standard problems: activity selection, fractional knapsack, job sequencing, Huffman coding and minimum spanning trees."
order: 4
sources:
  - title: "Greedy algorithm (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Greedy_algorithm"
  - title: "Huffman coding (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Huffman_coding"
  - title: "Minimum spanning tree (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Minimum_spanning_tree"
  - title: "MIT OCW 6.006 Introduction to Algorithms (Spring 2020)"
    url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/"
---

## What makes an algorithm greedy

A greedy algorithm builds a solution step by step and at each step makes the choice that looks best right now, never revisiting it. It is correct only when the problem has two properties:

1. **Greedy choice property**: some optimal solution contains the locally best first choice.
2. **Optimal substructure**: after making that choice, the remaining problem is a smaller instance of the same kind, and an optimal solution to it combines with the choice to give an optimal whole.

Dynamic programming also needs optimal substructure, but it tries all choices and keeps the best. Greedy commits to one. When greedy works it is usually simpler and faster; when it fails it can be far from optimal.

### The exchange argument

The standard proof pattern: take any optimal solution $O$. If it does not contain the greedy choice $g$, swap some element of $O$ for $g$ and show the result is still feasible and no worse. Then an optimal solution containing $g$ exists, and induction on the remaining subproblem finishes the proof.

## Activity selection

Given $n$ activities with start time $s_i$ and finish time $f_i$, choose the largest set with no two overlapping.

**Greedy rule**: sort by finish time and repeatedly take the next activity that starts no earlier than the last chosen one finishes.

```
sort activities by finish time
last = -infinity; count = 0
for each activity (s, f) in order:
    if s >= last:
        select it; last = f; count = count + 1
```

**Proof**: let $a$ be the activity that finishes first. In any optimal solution, replace its first activity by $a$. Since $a$ finishes no later, it overlaps nothing the first activity did not, so the set stays feasible with the same size. Time: $\Theta(n\log n)$ for sorting, $\Theta(n)$ after that.

Rules that fail: earliest start time, shortest duration, fewest conflicts. Each has a small counterexample.

## Fractional knapsack

Items have weight $w_i$ and value $v_i$; any fraction of an item may be taken; capacity $W$. Sort by ratio $v_i/w_i$ in decreasing order and take items fully until the next one does not fit, then take the fraction that fills the knapsack.

**Proof**: if an optimal solution uses some weight of a lower-ratio item while a higher-ratio item is not fully used, moving that weight to the higher-ratio item increases value. So the optimum fills by ratio. Time $\Theta(n\log n)$, or $\Theta(n)$ with linear-time selection of the median ratio.

The same rule fails for **0/1 knapsack**: with capacity 50 and items (10, 60), (20, 100), (30, 120), ratio greedy takes the first two for 160, while the optimum takes the last two for 220. 0/1 knapsack needs dynamic programming.

## Job sequencing with deadlines

$n$ unit-time jobs, each with a deadline $d_i$ and profit $p_i$. Profit counts only if the job finishes by its deadline. Sort jobs by decreasing profit; place each in the latest free slot at or before its deadline; skip it if none exists. With a simple array the cost is $O(n^2)$; with disjoint sets for "latest free slot" it is close to $O(n\log n)$.

## Huffman coding

Given character frequencies, build a prefix-free binary code minimising $\sum_c f(c)\cdot \text{depth}(c)$.

```
Q = min-priority queue of leaves keyed by frequency
repeat n - 1 times:
    x = extract_min(Q); y = extract_min(Q)
    z = new node with children x, y and freq(z) = freq(x) + freq(y)
    insert(Q, z)
return the remaining node as root
```

**Proof sketch**: the two least frequent characters can be made siblings at maximum depth in some optimal tree (swap them with the deepest siblings; cost does not increase). Merging them into one character of combined frequency reduces the problem by one, and the cost of the full tree equals the cost of the reduced tree plus $f(x) + f(y)$.

Useful facts:

- Total encoded length = sum of the weights of all internal nodes.
- Time $O(n\log n)$ with a heap.
- The optimal tree is full: every internal node has two children.
- Ties can give different trees with different individual code lengths, but the total cost is always the same.
- With equal frequencies for $2^k$ symbols, every code has length $k$.

## Minimum spanning trees

For a connected weighted undirected graph, an MST is a spanning tree of minimum total weight. Two rules justify every MST algorithm:

- **Cut property**: for any partition of the vertices into two sets, a lightest edge crossing the cut belongs to some MST. With distinct weights it belongs to every MST.
- **Cycle property**: a strictly heaviest edge on any cycle belongs to no MST.

### Kruskal

```
sort edges by weight
make_set(v) for every vertex v
for each edge (u, v) in order:
    if find(u) != find(v):
        add (u, v) to tree; union(u, v)
```

Each accepted edge is the lightest edge crossing the cut between its endpoint's component and the rest, so the cut property applies. Time $O(E\log E) = O(E\log V)$, dominated by sorting. It may build a forest that joins up only at the end.

### Prim

Grow one tree from a start vertex, each time adding the lightest edge from the tree to a vertex outside it. The cut is (tree, rest). Time $O(V^2)$ with an array (best for dense graphs), $O(E\log V)$ with a binary heap, $O(E + V\log V)$ with a Fibonacci heap.

### MST facts for GATE

- An MST has exactly $V - 1$ edges.
- Distinct edge weights imply a unique MST. Repeated weights may still give a unique MST.
- The lightest edge is always in some MST; with distinct weights, in every MST. The second lightest edge is also always included (two edges cannot form a cycle).
- Adding a constant to all weights does not change which trees are minimum. Squaring positive weights does not either, since order is preserved.
- An MST minimises the maximum edge weight on the path between every pair (minimax path), but it is not a shortest-path tree.

## Worked examples

### Worked example 1: Huffman cost

Frequencies: p 8, q 3, r 12, s 2, t 20, u 5 (total 50). Find the total bits.

Merges: $s + q = 5$. Queue: 5, u 5, p 8, r 12, t 20. Merge $5 + 5 = 10$. Queue: p 8, 10, r 12, t 20. Merge $8 + 10 = 18$. Queue: r 12, 18, t 20. Merge $12 + 18 = 30$. Queue: t 20, 30. Merge $20 + 30 = 50$.

Sum of internal nodes: $5 + 10 + 18 + 30 + 50 = 113$ bits. Code lengths: t 1, r 2, p 3, u 4, s 5, q 5, and indeed $20 + 24 + 24 + 20 + 10 + 15 = 113$. Average $113/50 = 2.26$ bits per symbol, versus 3 bits for a fixed-length code over 6 symbols.

### Worked example 2: Kruskal and Prim on one graph

Edges: A-B 3, A-C 1, B-C 7, B-D 5, C-D 2, C-E 8, D-E 4, D-F 6, E-F 9, B-F 10.

**Kruskal**: A-C 1 accept, C-D 2 accept, A-B 3 accept, D-E 4 accept, B-D 5 reject (B and D already joined through A, C), D-F 6 accept. Five edges for six vertices, weight $1 + 2 + 3 + 4 + 6 = 16$.

**Prim from A**: tree {A}, lightest crossing edge A-C 1. Tree {A, C}: candidates A-B 3, B-C 7, C-D 2, C-E 8; take C-D 2. Tree {A, C, D}: A-B 3, B-D 5, D-E 4, D-F 6, C-E 8; take A-B 3. Then D-E 4, then D-F 6. Same tree, weight 16. The two algorithms add edges in the same order here only by coincidence.

### Worked example 3: Activity selection

Activities as [start, finish): a1 [1,4), a2 [2,6), a3 [5,7), a4 [3,8), a5 [7,9), a6 [8,11), a7 [9,12), a8 [11,14). Already sorted by finish time.

Take a1 (ends 4). a2 starts at 2, skip. a3 starts at 5, take (ends 7). a4 skip. a5 starts at 7, take (ends 9). a6 starts at 8, skip. a7 starts at 9, take (ends 12). a8 starts at 11, skip. Answer: 4 activities {a1, a3, a5, a7}.

### Worked example 4: Fractional knapsack

Capacity 35. Items (weight, value): (10, 50), (20, 60), (15, 90), (5, 20). Ratios: 5, 3, 6, 4.

Take (15, 90): used 15, value 90. Take (10, 50): used 25, value 140. Take (5, 20): used 30, value 160. Remaining 5 units of the ratio-3 item: $5 \times 3 = 15$. Total 175.

## Common traps

- Greedy for 0/1 knapsack and for coin change with arbitrary denominations is wrong. Coins {1, 3, 4} and amount 6: greedy uses 3 coins, the optimum uses 2.
- Activity selection must sort by finish time, not start time or length.
- Huffman total cost is the sum of internal node weights, not leaf weights.
- In Prim, the edge added at each step depends on the start vertex; Kruskal's order does not.
- "Number of MSTs" questions: group edges by equal weight and count the independent choices inside each group.
- The shortest-path tree from a vertex and the MST are different in general.

## Quick revision

- Greedy works with greedy choice property plus optimal substructure; prove with an exchange argument.
- Activity selection: earliest finish, $\Theta(n\log n)$.
- Fractional knapsack: by ratio; 0/1 knapsack: DP.
- Huffman: merge two smallest, $O(n\log n)$; cost = sum of internal nodes.
- Kruskal $O(E\log V)$ with union-find; Prim $O(V^2)$ array or $O(E\log V)$ heap.
- Cut property and cycle property decide MST membership.
