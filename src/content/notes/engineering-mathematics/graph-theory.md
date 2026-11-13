---
title: "Graph theory"
summary: "Degrees and edge counts, connectivity and cut sets, trees and spanning trees, Euler and Hamilton paths, planarity, matchings and covers, and vertex and edge colouring."
order: 4
sources:
  - title: "Connectivity (graph theory) (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Connectivity_(graph_theory)"
  - title: "Matching (graph theory) (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Matching_(graph_theory)"
  - title: "Graph coloring (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Graph_coloring"
  - title: "GATE Overflow: graph theory questions"
    url: "https://gateoverflow.in/tag/graph-theory"
---

Graph theory is the most tested part of discrete mathematics in GATE CS. The syllabus names connectivity, matching and colouring, but questions also use degree counting, trees and Euler's formula as tools. Unless stated otherwise, graphs here are finite, simple and undirected, with $n$ vertices and $m$ edges.

## Degrees and edge counts

**Handshaking lemma.** $\sum_v \deg(v) = 2m$. So the number of odd degree vertices is even.

Edge count facts:
- $K_n$ has $\binom{n}{2}$ edges. $K_{a,b}$ has $ab$ edges.
- A $k$-regular graph on $n$ vertices has $nk/2$ edges, so $nk$ must be even.
- The complement $\bar G$ has $\binom{n}{2} - m$ edges. A self-complementary graph has $n(n-1)/4$ edges, so $n \equiv 0$ or $1 \pmod 4$.
- Number of labelled simple graphs on $n$ vertices: $2^{\binom{n}{2}}$.

**Graphic sequences (Havel-Hakimi).** A non-increasing sequence $d_1 \ge d_2 \ge \dots \ge d_n$ is the degree sequence of a simple graph iff removing $d_1$ and subtracting 1 from each of the next $d_1$ entries gives a graphic sequence. Repeat until all zeros (graphic) or a negative entry or impossible step appears (not graphic). Quick rejections: odd sum, or some $d_i \ge n$.

## Connectivity

A graph is **connected** if every pair of vertices is joined by a path. The maximal connected subgraphs are the **components**.

Edge bounds:
- A connected graph needs at least $n - 1$ edges.
- A graph with $k$ components has at least $n - k$ edges and at most $\binom{n - k + 1}{2}$ edges (one big clique plus $k - 1$ isolated vertices).
- If $m > \binom{n-1}{2}$, the graph must be connected.
- If $\delta(G) \ge (n - 1)/2$, the graph is connected.

**Cut vertex:** removing it increases the number of components. **Bridge (cut edge):** removing it increases the number of components. An edge is a bridge iff it lies on no cycle.

**Vertex connectivity** $\kappa(G)$: the fewest vertices whose removal disconnects $G$ or leaves one vertex. **Edge connectivity** $\lambda(G)$: the fewest edges whose removal disconnects $G$. Whitney's inequality:
$$\kappa(G) \le \lambda(G) \le \delta(G).$$
For $K_n$ all three equal $n - 1$. For a tree with at least 2 vertices, $\kappa = \lambda = 1$.

**Menger's theorem.** The maximum number of internally vertex-disjoint paths between two non-adjacent vertices equals the minimum number of vertices separating them (and the edge version holds with edge-disjoint paths and edge cuts).

## Trees

A tree is a connected acyclic graph. For a graph on $n$ vertices, any two of these imply the third: connected, acyclic, $m = n - 1$.

- Every tree with $n \ge 2$ has at least 2 leaves.
- Between any two vertices there is exactly one path.
- A forest with $k$ components has $n - k$ edges.
- Leaves of a tree: $L = 2 + \sum_{d \ge 3} (d - 2)\,n_d$, where $n_d$ is the number of vertices of degree $d$.

**Counting spanning trees.**
- Cayley's formula: $K_n$ has $n^{n-2}$ spanning trees (number of labelled trees on $n$ vertices).
- $K_{a,b}$ has $a^{b-1} b^{a-1}$ spanning trees.
- $C_n$ has $n$ spanning trees (drop any one edge).
- In general, the **matrix tree theorem**: the count equals any cofactor of the Laplacian $L = D - A$.

## Euler and Hamilton

- A connected graph has an **Euler circuit** iff every vertex has even degree, and an **Euler path** (not circuit) iff exactly two vertices have odd degree.
- A **Hamiltonian cycle** visits every vertex once. No simple characterization is known. Dirac's sufficient condition: $n \ge 3$ and $\delta(G) \ge n/2$. Ore's condition: $\deg u + \deg v \ge n$ for every non-adjacent pair.
- $K_n$ has $(n-1)!/2$ distinct Hamiltonian cycles. $K_{a,b}$ is Hamiltonian iff $a = b \ge 2$.

## Planarity

For a connected planar graph with $f$ faces (including the outer face), **Euler's formula** is
$$n - m + f = 2.$$
With $k$ components it becomes $n - m + f = k + 1$.

Consequences for simple planar graphs with $n \ge 3$:
- $m \le 3n - 6$.
- If there is no triangle, $m \le 2n - 4$.
- Some vertex has degree at most 5.

$K_5$ ($m = 10 > 9$) and $K_{3,3}$ ($m = 9 > 8$, triangle free) are not planar. **Kuratowski:** a graph is planar iff it has no subdivision of $K_5$ or $K_{3,3}$.

## Matchings and covers

A **matching** is a set of edges with no shared endpoint. A **perfect matching** covers every vertex, so it needs $n$ even and has $n/2$ edges.

| Quantity | Symbol | Meaning |
|---|---|---|
| Matching number | $\nu(G)$ | largest matching |
| Vertex cover number | $\beta(G)$ | fewest vertices touching every edge |
| Independence number | $\alpha(G)$ | largest set of pairwise non-adjacent vertices |
| Edge cover number | $\rho(G)$ | fewest edges touching every vertex (no isolated vertices) |

Key relations:
- **Gallai:** $\alpha + \beta = n$. If there are no isolated vertices, $\nu + \rho = n$.
- Always $\nu \le \beta$ (each matched edge needs its own cover vertex) and $\beta \le 2\nu$.
- **Konig:** in a bipartite graph, $\nu = \beta$.
- **Hall:** a bipartite graph with parts $X, Y$ has a matching saturating $X$ iff $|N(S)| \ge |S|$ for every $S \subseteq X$.
- Every $k$-regular bipartite graph ($k \ge 1$) has a perfect matching.

Standard counts:
- Perfect matchings in $K_{2k}$: $(2k-1)(2k-3)\cdots 3 \cdot 1 = \dfrac{(2k)!}{2^k k!}$.
- Perfect matchings in $K_{k,k}$: $k!$.
- $\nu(P_n) = \lfloor n/2 \rfloor$, $\nu(C_n) = \lfloor n/2 \rfloor$, $\alpha(C_n) = \lfloor n/2 \rfloor$, $\beta(C_n) = \lceil n/2 \rceil$.

## Colouring

A **proper vertex colouring** gives adjacent vertices different colours. The fewest colours needed is the **chromatic number** $\chi(G)$.

Bounds and facts:
- $\chi(G) \ge \omega(G)$ (size of the largest clique) and $\chi(G) \ge n / \alpha(G)$.
- $\chi(G) \le \Delta(G) + 1$ (greedy colouring). **Brooks:** $\chi \le \Delta$ unless $G$ is a complete graph or an odd cycle.
- $\chi(G) \le 2$ iff $G$ is bipartite iff $G$ has no odd cycle.
- Four colour theorem: every planar graph has $\chi \le 4$.

| Graph | $\chi$ |
|---|---|
| $K_n$ | $n$ |
| $C_n$, $n$ even / odd | 2 / 3 |
| Tree, $n \ge 2$ | 2 |
| $K_{a,b}$ | 2 |
| Wheel $W_n$ (cycle $C_n$ plus hub), $n$ even / odd | 3 / 4 |
| Petersen graph | 3 |

**Chromatic polynomial** $P(G, k)$ counts proper colourings with at most $k$ colours:
- $K_n$: $k(k-1)\cdots(k-n+1)$.
- Any tree on $n$ vertices: $k(k-1)^{n-1}$.
- $C_n$: $(k-1)^n + (-1)^n (k-1)$.
- Deletion-contraction: $P(G, k) = P(G - e, k) - P(G / e, k)$.

**Edge colouring.** The chromatic index $\chi'(G)$ is $\Delta$ or $\Delta + 1$ (Vizing). Bipartite graphs have $\chi' = \Delta$ (Konig). $\chi'(K_n) = n - 1$ for even $n$ and $n$ for odd $n$.

## Worked examples

### Worked example 1: Faces of a planar graph

A connected planar simple graph has 10 vertices, each of degree 3. How many faces does a planar drawing have?

1. $m = 10 \cdot 3 / 2 = 15$.
2. $f = 2 - n + m = 2 - 10 + 15 = 7$.

Sanity check: $15 \le 3 \cdot 10 - 6 = 24$.

### Worked example 2: Matching versus cover in a non-bipartite graph

Find $\nu$, $\beta$, $\alpha$ for the cycle $C_7$.

1. $\alpha(C_7) = 3$: pick alternate vertices; a fourth would sit next to one of them.
2. Gallai: $\beta = 7 - 3 = 4$.
3. $\nu(C_7) = 3$: 7 vertices allow at most 3 disjoint edges.

Here $\nu = 3 < \beta = 4$. Konig's equality fails because $C_7$ has an odd cycle.

### Worked example 3: Chromatic polynomial of a small graph

Count proper colourings with $k$ colours of the "triangle with a pendant": vertices $a, b, c$ form a triangle and $d$ is joined only to $c$.

1. Triangle: $k(k-1)(k-2)$ ways.
2. $d$ must avoid the colour of $c$: $k - 1$ ways.
3. $P = k(k-1)^2(k-2)$. With $k = 3$: $3 \cdot 4 \cdot 1 = 12$.

The polynomial is zero at $k = 2$, matching $\chi = 3$.

### Worked example 4: Edges forcing connectivity

What is the smallest $m$ such that every simple graph with 9 vertices and $m$ edges is connected?

The densest disconnected graph is $K_8$ plus an isolated vertex, with $\binom{8}{2} = 28$ edges. So any graph with $29$ edges is connected. Answer: 29.

### Worked example 5: Hall's condition

Students $s_1, s_2, s_3, s_4$ list acceptable projects: $s_1: \{A, B\}$, $s_2: \{A\}$, $s_3: \{A, B\}$, $s_4: \{C, D\}$. Can every student get a distinct project?

Take $S = \{s_1, s_2, s_3\}$. $N(S) = \{A, B\}$, which has 2 elements, fewer than 3. Hall's condition fails, so no such assignment exists. The maximum matching has size 3 (for example $s_2A$, $s_1B$, $s_4C$).

## Common traps

- Using $m \le 3n - 6$ to prove a graph is planar. It is only a necessary condition.
- Forgetting the outer face in Euler's formula.
- Applying Konig's theorem ($\nu = \beta$) to non-bipartite graphs.
- Assuming high minimum degree makes $\kappa$ large. Two $K_4$s sharing a vertex have $\delta = 3$ but $\kappa = 1$.
- Counting perfect matchings of $K_{2k}$ as $(2k)!/2^k$, forgetting that the order of the $k$ pairs does not matter.
- Wheel chromatic numbers: $W_n$ with an odd rim needs 4 colours, not 3.
- Treating $\chi = 2$ as "is a tree". Any bipartite graph with an edge has $\chi = 2$.

## Quick revision

- $\sum \deg = 2m$; odd degree vertices come in even numbers.
- $k$ components: $n - k \le m \le \binom{n-k+1}{2}$.
- $\kappa \le \lambda \le \delta$.
- Trees: $m = n - 1$, at least 2 leaves, $n^{n-2}$ labelled trees.
- Euler circuit: connected and all degrees even. Euler path: exactly 0 or 2 odd vertices.
- Planar: $n - m + f = 2$, $m \le 3n - 6$, triangle free $m \le 2n - 4$.
- $\alpha + \beta = n$; $\nu + \rho = n$ (no isolated vertices); bipartite $\nu = \beta$.
- Perfect matchings: $K_{2k}$ has $(2k-1)!!$; $K_{k,k}$ has $k!$.
- $\chi \le \Delta + 1$; bipartite iff no odd cycle iff $\chi \le 2$.
- $P(C_n, k) = (k-1)^n + (-1)^n(k-1)$; tree: $k(k-1)^{n-1}$.
