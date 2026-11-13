---
title: "Graph traversals, MST and shortest paths"
summary: "BFS and DFS with edge classification, topological sort and strongly connected components, minimum spanning trees, and single-source and all-pairs shortest paths with their limits."
order: 7
sources:
  - title: "Depth-first search (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Depth-first_search"
  - title: "Dijkstra's algorithm (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm"
  - title: "GATE Overflow: minimum-spanning-tree tag"
    url: "https://gateoverflow.in/tag/minimum-spanning-tree"
  - title: "MIT OCW 6.006 Introduction to Algorithms (Spring 2020)"
    url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/"
---

## Representations

| | Adjacency list | Adjacency matrix |
|---|---|---|
| Space | $\Theta(V + E)$ | $\Theta(V^2)$ |
| Test edge $(u, v)$ | $O(\deg u)$ | $O(1)$ |
| List neighbours of $u$ | $O(\deg u)$ | $O(V)$ |
| BFS or DFS | $O(V + E)$ | $O(V^2)$ |

Lists suit sparse graphs; matrices suit dense graphs and $O(1)$ edge tests. Unless stated otherwise, GATE assumes adjacency lists.

## Breadth-first search

```
BFS(G, s):
    for each v: dist[v] = infinity; parent[v] = nil
    dist[s] = 0; Q = queue containing s
    while Q not empty:
        u = dequeue(Q)
        for each v in adj[u]:
            if dist[v] == infinity:
                dist[v] = dist[u] + 1; parent[v] = u
                enqueue(Q, v)
```

- Visits vertices in non-decreasing distance from $s$. In an unweighted graph `dist[v]` is the shortest path length in edges.
- The parent pointers form a BFS tree of shortest paths.
- In an undirected graph, every non-tree edge joins vertices whose levels differ by at most 1. So BFS has only tree and cross edges, never back edges in the DFS sense.
- Applications: unweighted shortest paths, bipartiteness (an edge inside one level means an odd cycle), connected components, 0-1 BFS with a deque for weights in {0, 1}.

## Depth-first search

```
DFS(G):
    for each u: color[u] = WHITE
    time = 0
    for each u: if color[u] == WHITE: visit(u)

visit(u):
    color[u] = GRAY; time = time + 1; d[u] = time
    for each v in adj[u]:
        if color[v] == WHITE: parent[v] = u; visit(v)
    color[u] = BLACK; time = time + 1; f[u] = time
```

**Parenthesis theorem**: for any $u, v$ the intervals $[d[u], f[u]]$ and $[d[v], f[v]]$ are either disjoint or nested. $v$ is a descendant of $u$ exactly when $d[u] < d[v] < f[v] < f[u]$.

**White-path theorem**: $v$ becomes a descendant of $u$ if and only if, at time $d[u]$, there is a path from $u$ to $v$ made entirely of white vertices.

### Edge classification (directed graphs)

When edge $(u, v)$ is explored from $u$:

| Colour of $v$ | Edge type | Time relation |
|---|---|---|
| White | Tree | $v$ discovered now |
| Gray | Back (to an ancestor, includes self-loops) | $d[v] < d[u] < f[u] < f[v]$ |
| Black, $d[u] < d[v]$ | Forward (to a non-child descendant) | $d[u] < d[v] < f[v] < f[u]$ |
| Black, $d[v] < d[u]$ | Cross | $d[v] < f[v] < d[u] < f[u]$ |

In an **undirected** graph every edge is a tree edge or a back edge. A directed graph has a cycle if and only if DFS finds a back edge.

### Topological sort

A linear order of a DAG's vertices with every edge pointing forward. Two methods, both $O(V + E)$:

- **DFS**: output vertices in decreasing order of finishing time. For every edge $u \to v$ in a DAG, $f[v] < f[u]$.
- **Kahn**: repeatedly remove a vertex with in-degree 0. If vertices remain and none has in-degree 0, there is a cycle.

A DAG has a unique topological order exactly when it contains a Hamiltonian path.

### Strongly connected components

Kosaraju: run DFS on $G$ and record finishing times; run DFS on the transpose $G^T$ in decreasing order of those times; each tree of the second DFS is one SCC. Time $O(V + E)$. The component graph (SCCs contracted) is always a DAG.

## Minimum spanning trees

Kruskal (sort edges, add if no cycle, union-find, $O(E\log V)$) and Prim (grow one tree with a priority queue, $O(E\log V)$ with a binary heap, $O(V^2)$ with an array) are covered with proofs in the greedy notes. The facts asked most often:

- Cut property: the lightest edge across any cut is in some MST.
- Cycle property: the unique heaviest edge on a cycle is in no MST.
- Distinct weights mean a unique MST.
- To count MSTs, group edges by weight; inside each group count how many ways the edges can connect the components formed by lighter edges.

## Single-source shortest paths

All algorithms use **relaxation**: if $d[u] + w(u, v) < d[v]$, set $d[v] = d[u] + w(u, v)$ and record $u$ as the parent.

| Algorithm | Weights | Time |
|---|---|---|
| BFS | unweighted | $O(V + E)$ |
| DAG shortest path (relax in topological order) | any, no cycles | $O(V + E)$ |
| Dijkstra, binary heap | non-negative | $O((V + E)\log V)$ |
| Dijkstra, array | non-negative | $O(V^2)$ |
| Dijkstra, Fibonacci heap | non-negative | $O(E + V\log V)$ |
| Bellman-Ford | any, detects negative cycles | $O(VE)$ |
| Floyd-Warshall (all pairs) | any, no negative cycles | $\Theta(V^3)$ |

### Dijkstra

```
Dijkstra(G, s):
    d[v] = infinity for all v; d[s] = 0
    Q = min-priority queue of all vertices keyed by d
    while Q not empty:
        u = extract_min(Q)           // d[u] is now final
        for each edge (u, v, w):
            if d[u] + w < d[v]:
                d[v] = d[u] + w; decrease_key(Q, v, d[v])
```

Correctness rests on one claim: when $u$ is extracted, no shorter path to $u$ can exist, because any other path must leave the finalised set through a vertex with a label at least $d[u]$ and then only add non-negative weights.

### Dijkstra's limitations

- **Negative edges** break the claim above. A vertex finalised early can later be reached more cheaply through a negative edge, and its descendants keep the wrong value. Adding a constant to every edge does not fix this, because paths with more edges get penalised more.
- **Negative cycles** make shortest paths undefined; Dijkstra cannot detect them. Use Bellman-Ford.
- Dijkstra does work on graphs with cycles, and on undirected graphs with non-negative weights.
- With all edge weights equal, Dijkstra behaves like BFS but costs a log factor more.
- A shortest-path tree depends on the source, and it differs from an MST in general.

## Worked examples

### Worked example 1: BFS levels

Undirected graph with adjacency lists in alphabetical order: A: B, C. B: A, D, E. C: A, F. D: B, G. E: B, G. F: C, G. G: D, E, F. Run BFS from A.

Dequeue A: enqueue B, C (distance 1). Dequeue B: enqueue D, E (distance 2). Dequeue C: enqueue F (distance 2). Dequeue D: enqueue G (distance 3). E, F, G add nothing new. Visit order A, B, C, D, E, F, G. Distances: B, C = 1; D, E, F = 2; G = 3. The edges E-G and F-G are non-tree edges between levels 2 and 3, and none of them skips a level.

### Worked example 2: DFS times and edge types

Directed graph: $1 \to 2$, $1 \to 4$, $2 \to 3$, $3 \to 1$, $3 \to 4$, $5 \to 4$, $5 \to 6$, $6 \to 5$. The main loop and every adjacency list are in increasing vertex order.

visit(1): $d = 1$. Edge $1\to2$ tree, visit(2): $d = 2$. Edge $2\to3$ tree, visit(3): $d = 3$. Edge $3\to1$: 1 is gray, **back edge**. Edge $3\to4$ tree, visit(4): $d = 4$, no edges, $f = 5$. Finish 3 ($f = 6$), 2 ($f = 7$). Back at 1, edge $1\to4$: 4 is black and $d[1] < d[4]$, **forward edge**. Finish 1 ($f = 8$).

visit(5): $d = 9$. Edge $5\to4$: 4 is black and $d[4] < d[5]$, **cross edge**. Edge $5\to6$ tree, visit(6): $d = 10$; edge $6\to5$: 5 is gray, **back edge**. $f[6] = 11$, $f[5] = 12$.

Summary: tree edges $1\to2$, $2\to3$, $3\to4$, $5\to6$; back $3\to1$, $6\to5$; forward $1\to4$; cross $5\to4$. The back edges reveal the cycles 1-2-3 and 5-6. The SCCs are {1, 2, 3}, {4}, {5, 6}.

### Worked example 3: Dijkstra trace

Directed edges: $A\to B$ (10), $A\to C$ (3), $C\to B$ (4), $B\to D$ (2), $C\to D$ (8), $C\to E$ (2), $E\to D$ (7), $D\to E$ (9). Source A.

| Extracted | $d[B]$ | $d[C]$ | $d[D]$ | $d[E]$ |
|---|---|---|---|---|
| A (0) | 10 | 3 | $\infty$ | $\infty$ |
| C (3) | 7 | 3 | 11 | 5 |
| E (5) | 7 | | 11 | 5 |
| B (7) | 7 | | 9 | |
| D (9) | | | 9 | |

Final distances: B 7, C 3, D 9, E 5. Extraction order A, C, E, B, D. Note that E is finalised before B even though B was discovered first.

### Worked example 4: Where Dijkstra goes wrong

Edges $s\to a$ (2), $s\to b$ (5), $b\to a$ ($-4$), $a\to c$ (4). Dijkstra extracts s, then a with $d[a] = 2$ and sets $d[c] = 6$, then b with $d[b] = 5$. The edge $b\to a$ offers $1$, but $a$ is already final, and even if its label is lowered, $c$ is not relaxed again. Dijkstra reports $d[c] = 6$; the true distance is $5 - 4 + 4 = 5$. Bellman-Ford gets 5 after at most 3 passes.

## Common traps

- BFS gives shortest paths only for unweighted (or equal-weight) graphs.
- In undirected DFS there are no forward or cross edges; in undirected BFS there are no back edges.
- DFS-based topological order is by decreasing finishing time, not discovery time.
- Dijkstra with a negative edge can still give correct answers on some graphs; the claim is that it is not guaranteed.
- Edge order inside adjacency lists changes BFS and DFS trees and times. Questions must fix it; read the convention.
- For a dense graph, array-based Prim or Dijkstra $O(V^2)$ beats the heap version $O(E\log V) = O(V^2\log V)$.
- Counting connected components: one per call from the outer DFS or BFS loop.

## Quick revision

- BFS and DFS: $O(V + E)$ with lists, $O(V^2)$ with a matrix.
- DFS edge types by colour: white tree, gray back, black forward or cross.
- Cycle in directed graph iff back edge. Topological sort exists iff DAG.
- SCC: Kosaraju with two DFS passes, $O(V + E)$.
- Dijkstra: non-negative weights only; $O(E\log V)$ with a binary heap.
- Bellman-Ford $O(VE)$ handles negative edges; Floyd-Warshall $\Theta(V^3)$ for all pairs.
- DAG shortest paths in $O(V + E)$ by relaxing in topological order.
