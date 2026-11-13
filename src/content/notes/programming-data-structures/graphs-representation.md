---
title: "Graphs as a data structure"
summary: "Graph vocabulary and counting facts, and how adjacency matrices, adjacency lists, edge lists and incidence matrices store a graph, with the space and time cost of each."
order: 7
sources:
  - title: "Graph (abstract data type), Wikipedia"
    url: "https://en.wikipedia.org/wiki/Graph_(abstract_data_type)"
  - title: "Adjacency matrix, Wikipedia"
    url: "https://en.wikipedia.org/wiki/Adjacency_matrix"
  - title: "Adjacency list, Wikipedia"
    url: "https://en.wikipedia.org/wiki/Adjacency_list"
---

## Vocabulary

A graph $G = (V, E)$ has a set of vertices $V$ and a set of edges $E$. Write $n = |V|$ and $m = |E|$.

- **Undirected**: an edge $\{u, v\}$ has no direction. **Directed**: an edge $(u, v)$ goes from $u$ to $v$.
- **Simple graph**: no self-loops and no parallel edges. GATE assumes simple graphs unless it says otherwise.
- **Weighted**: each edge carries a number.
- **Degree** $\deg(v)$: number of edges at $v$. In a directed graph, in-degree and out-degree are counted separately.
- **Walk**: a sequence of vertices joined by edges, repeats allowed. **Path**: no repeated vertices. **Cycle**: a closed path.
- **Connected** (undirected): a path exists between every pair. **Strongly connected** (directed): a directed path exists both ways between every pair.
- **Component**: a maximal connected subgraph.
- **Tree**: connected and acyclic; equivalently connected with $n - 1$ edges; equivalently acyclic with $n - 1$ edges.
- **Bipartite**: vertices split into two sides with every edge crossing between them. A graph is bipartite exactly when it has no odd cycle.

## Counting facts

- **Handshake lemma**: $\sum_v \deg(v) = 2m$ in an undirected graph. So the number of odd-degree vertices is even.
- In a directed graph, $\sum_v \text{in}(v) = \sum_v \text{out}(v) = m$.
- A simple undirected graph has at most $\binom{n}{2} = \frac{n(n-1)}{2}$ edges; a simple directed graph at most $n(n-1)$.
- The number of distinct simple undirected graphs on $n$ labelled vertices is $2^{\binom{n}{2}}$.
- A forest with $n$ vertices and $k$ components has $n - k$ edges.
- A graph with $n$ vertices and $k$ components has at least $n - k$ edges, and at most $\binom{n - k + 1}{2}$ edges (one big complete component plus $k - 1$ isolated vertices).
- The largest disconnected simple graph on $n$ vertices has $\binom{n-1}{2}$ edges. Any simple graph with more edges is connected.
- A complete bipartite graph $K_{a,b}$ has $ab$ edges.

## Representations

### Adjacency matrix

An $n \times n$ matrix $A$ with $A[i][j] = 1$ if there is an edge from $i$ to $j$ (or the weight, for weighted graphs).

```c
#define N 5
int A[N][N];                       /* A[i][j] = 1 if edge i -> j */

void addEdge(int u, int v) {       /* undirected */
    A[u][v] = 1;
    A[v][u] = 1;
}
```

- Space $\Theta(n^2)$ regardless of $m$.
- Edge test $O(1)$.
- Listing the neighbours of $v$: $\Theta(n)$, a full row.
- For an undirected graph the matrix is symmetric, and the diagonal is zero for a simple graph.
- Row sum of row $i$ is the out-degree of $i$; column sum of column $j$ is the in-degree of $j$.

### Adjacency list

An array of $n$ lists; the list of $u$ holds every $v$ with an edge $(u, v)$.

```c
struct edge { int to; struct edge *next; };
struct edge *adj[N];               /* adj[u] is the head of u's list */

void addArc(int u, int v) {        /* directed u -> v, inserted at the front */
    struct edge *e = malloc(sizeof *e);
    e->to = v;
    e->next = adj[u];
    adj[u] = e;
}
```

- Space $\Theta(n + m)$. An undirected edge appears in two lists, so there are $2m$ list nodes; a directed graph has $m$.
- Edge test $(u, v)$: $O(\deg(u))$.
- Listing the neighbours of $v$: $\Theta(\deg(v))$.
- Out-degree of $u$ is the length of its list. In-degree needs a pass over all lists: $\Theta(n + m)$ for all vertices at once.

### Edge list and incidence matrix

- **Edge list**: an array of $m$ pairs (or triples with weights). Space $\Theta(m)$. Natural input for Kruskal's algorithm, which sorts edges.
- **Incidence matrix**: $n \times m$, with entry $(v, e) = 1$ when vertex $v$ is an end of edge $e$. In an undirected graph every column has exactly two 1s; for a directed graph one end is marked $+1$ and the other $-1$. Space $\Theta(nm)$.

### Choosing a representation

| Task | Adjacency matrix | Adjacency list |
|---|---|---|
| Space | $\Theta(n^2)$ | $\Theta(n + m)$ |
| Is $(u, v)$ an edge? | $O(1)$ | $O(\deg(u))$ |
| Visit all neighbours of $u$ | $\Theta(n)$ | $\Theta(\deg(u))$ |
| BFS or DFS of the whole graph | $\Theta(n^2)$ | $\Theta(n + m)$ |
| Add an edge | $O(1)$ | $O(1)$ at the list head |
| Remove an edge | $O(1)$ | $O(\deg(u))$ |
| Transpose (reverse all edges) | $\Theta(n^2)$ | $\Theta(n + m)$ |

Since $m \le n^2$, lists are never worse than the matrix for traversals. Use a matrix for dense graphs ($m$ close to $n^2$), for frequent edge tests, or for algorithms that work on the matrix directly, such as Floyd-Warshall. Use lists for sparse graphs, which most real graphs are.

## Matrix powers count walks

For an adjacency matrix $A$ (entries 0 or 1),

$$(A^k)_{ij} = \text{number of walks of length } k \text{ from } i \text{ to } j$$

because $(A^2)_{ij} = \sum_t A_{it} A_{tj}$ counts the middle vertices $t$ with edges $i$ to $t$ and $t$ to $j$, and the argument extends by induction.

Useful specialisations for a simple undirected graph:

- $(A^2)_{ii} = \deg(i)$, since a closed walk of length 2 goes to a neighbour and back.
- $\text{trace}(A^2) = 2m$.
- $\text{trace}(A^3) = 6 \times$ (number of triangles), since each triangle gives 3 starting vertices times 2 directions.

## Storing a graph compactly

When the graph is fixed after input, adjacency lists are often stored in two arrays instead of linked nodes. An array `start` of length $n + 1$ and an array `nbr` of length $m$ (or $2m$ undirected): the neighbours of $u$ are `nbr[start[u]]` to `nbr[start[u+1] - 1]`. This compressed form uses $\Theta(n + m)$ space and is cache-friendly. Building it needs one pass to count degrees and a prefix sum over the counts.

## Worked examples

### Worked example 1: list sizes

A directed graph has 8 vertices and 20 arcs; an undirected graph has 8 vertices and 20 edges. How many list nodes do their adjacency lists hold, and how many cells do their adjacency matrices have?

- Directed: 20 list nodes, one per arc.
- Undirected: 40 list nodes, two per edge, matching $\sum \deg = 2m = 40$.
- Both matrices have $8 \times 8 = 64$ cells, whatever the edge count.

### Worked example 2: walks and triangles from $A$

Take vertices 0 to 3 with edges 0-1, 0-2, 1-2, 2-3. Squaring the adjacency matrix gives

$$A^2 = \begin{pmatrix} 2 & 1 & 1 & 1 \\ 1 & 2 & 1 & 1 \\ 1 & 1 & 3 & 0 \\ 1 & 1 & 0 & 1 \end{pmatrix}$$

- The diagonal is the degree sequence 2, 2, 3, 1, and its sum is $8 = 2m$.
- $(A^2)_{0,3} = 1$: the only walk of length 2 from 0 to 3 goes through 2.
- $(A^2)_{2,3} = 0$: there is no common neighbour of 2 and 3.
- $\text{trace}(A^3) = 6$, so there is $6 / 6 = 1$ triangle, namely $\{0, 1, 2\}$.

### Worked example 3: edge bounds with components

What is the largest number of edges in a simple undirected graph with 12 vertices and exactly 3 components?

Put 10 vertices in one complete component and leave 2 isolated vertices: $\binom{10}{2} = 45$ edges. Splitting the vertices more evenly only loses edges, since $\binom{a}{2} + \binom{b}{2} < \binom{a + b - 1}{2} + \binom{1}{2}$ whenever both $a, b \ge 2$. The minimum number of edges with 3 components is $12 - 3 = 9$ (a forest of three trees).

### Worked example 4: in-degrees from adjacency lists

```c
int indeg[N] = {0};
for (int u = 0; u < N; u++)
    for (struct edge *e = adj[u]; e != NULL; e = e->next)
        indeg[e->to]++;
```

The outer loop runs $n$ times and the inner loop runs once per arc overall, so the total time is $\Theta(n + m)$. With an adjacency matrix the same task needs a column sum for every vertex, $\Theta(n^2)$.

## Common traps

- Counting $m$ list nodes for an undirected graph instead of $2m$.
- Saying a matrix uses $\Theta(m)$ space. It is always $\Theta(n^2)$.
- Saying BFS on a matrix is $\Theta(n + m)$. It is $\Theta(n^2)$, because each vertex scans a full row.
- Confusing walks (repeats allowed) with paths when reading $A^k$.
- Forgetting the factor 6 when getting triangles from $\text{trace}(A^3)$.
- Using $\binom{n}{2}$ for a disconnected graph; the maximum is $\binom{n-1}{2}$.

## Quick revision

- $\sum \deg(v) = 2m$; simple graph: $m \le \binom{n}{2}$; tree: $m = n - 1$.
- Disconnected simple graph: at most $\binom{n-1}{2}$ edges; with $k$ components, at most $\binom{n-k+1}{2}$.
- Matrix: $\Theta(n^2)$ space, $O(1)$ edge test, $\Theta(n)$ to list neighbours, traversals $\Theta(n^2)$.
- Lists: $\Theta(n + m)$ space, $2m$ nodes undirected, traversals $\Theta(n + m)$.
- All in-degrees from lists: $\Theta(n + m)$.
- $(A^k)_{ij}$ counts walks of length $k$; $\text{trace}(A^2) = 2m$; triangles $= \text{trace}(A^3)/6$.
