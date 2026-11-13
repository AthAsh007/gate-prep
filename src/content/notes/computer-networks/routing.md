---
title: "Routing"
summary: "Covers distance vector routing with Bellman-Ford, count to infinity and its fixes, and link state routing with flooding and Dijkstra's algorithm."
order: 3
sources:
  - title: "Distance-vector routing protocol (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Distance-vector_routing_protocol"
  - title: "Link-state routing protocol (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Link-state_routing_protocol"
  - title: "RFC 2453: RIP Version 2"
    url: "https://www.rfc-editor.org/rfc/rfc2453"
---

## Routing versus forwarding

Forwarding is the per-packet action inside one router: look up the destination in the forwarding table and send the packet out of the right interface. Routing is the network-wide process that fills those tables. Routing algorithms model the network as a graph: routers are nodes, links are edges, and each edge has a cost (hop count, delay, inverse of bandwidth, or an administrator's choice). The goal is the least-cost path from every router to every destination.

Two families matter for GATE:

| Property | Distance vector | Link state |
|---|---|---|
| What a router knows | Its own link costs and neighbours' distance vectors | The full topology |
| What it sends | Its whole distance vector | Its own link costs (LSA or LSP) |
| Sent to | Neighbours only | Every router (flooding) |
| Algorithm | Bellman-Ford, distributed | Dijkstra, run locally |
| Convergence | Slow, can count to infinity | Fast, no count to infinity |
| Message size | Large (one entry per destination) | Small (one entry per link) |
| Robustness | A wrong vector spreads to everyone | A router can only lie about its own links |
| Example protocol | RIP | OSPF, IS-IS |

## Distance vector routing

### Bellman-Ford equation

Let $D_x(y)$ be router $x$'s estimate of the least cost to $y$, and $c(x, v)$ the cost of the link to neighbour $v$. Then

$$D_x(y) = \min_{v \in \text{neighbours}(x)} \{ c(x, v) + D_v(y) \}$$

Each router keeps its own cost to each neighbour and the latest vector received from each neighbour. Whenever a link cost changes or a new vector arrives, it recomputes its vector. If its vector changes, it sends the new one to all neighbours. The next hop for $y$ is the neighbour $v$ that achieved the minimum.

A practical way to work exam questions: build a small table with one column per neighbour. In each column write (link cost to that neighbour) + (that neighbour's advertised distance). The new entry is the row minimum, and the column that gave it is the next hop.

### Good news travels fast

If a link cost drops, the router next to it sees a better path at once, and the improvement spreads one hop per exchange. After at most (network diameter) exchanges every router has the new value.

### Bad news travels slowly: count to infinity

Take a line A - B - C, both links of cost 1. B reaches A at cost 1 and C at cost 2 (via B). Now the A-B link fails. B looks for another route to A. C still advertises "A at cost 2", and B does not know that C's route goes through B itself. So B sets its distance to $2 + 1 = 3$ via C. C then sees B's new 3 and updates to 4. B updates to 5, and so on. The two routers bounce the route back and forth, raising it by 2 every round, until the value reaches whatever the protocol treats as infinity. Meanwhile packets for A loop between B and C.

### Fixes and their limits

- **Split horizon**: do not advertise a route back to the neighbour you learned it from. C would not tell B about A at all, so B would see A as unreachable.
- **Split horizon with poisoned reverse**: advertise the route back to that neighbour with distance infinity. This is more explicit and kills two-node loops quickly.
- **Small infinity**: RIP uses 16 as infinity, so a route that counts up stops after a bounded number of rounds. It also limits RIP networks to 15 hops.
- **Hold-down timers and triggered updates**: reduce the window in which stale routes are believed.

None of these stops count to infinity in every topology. When three or more routers form a loop, a router can still learn a stale route from a neighbour that learned it from someone else.

## Link state routing

### Flooding

Each router learns its neighbours (hello packets) and the cost of each link. It puts this in a link state packet with its identity, a sequence number and an age. The packet is flooded: every router that receives a new packet (higher sequence number than any stored) stores it and forwards it on every other interface. Duplicates and old packets are dropped. When flooding finishes, every router holds the same complete map.

### Dijkstra's algorithm

Each router then computes a shortest path tree with itself as the root.

1. Set $D(\text{source}) = 0$ and $D(v) = \infty$ for every other node. The finalised set $N'$ is empty.
2. Pick the node $u$ not in $N'$ with the smallest $D(u)$ and add it to $N'$.
3. For each neighbour $v$ of $u$ not in $N'$: if $D(u) + c(u, v) < D(v)$, set $D(v) = D(u) + c(u, v)$ and record $u$ as $v$'s predecessor.
4. Repeat until all nodes are finalised.

With $n$ nodes and a simple array this is $O(n^2)$; with a binary heap it is $O((n + e) \log n)$. Edge costs must be non-negative. The first hop on the path to each destination becomes the forwarding entry.

### Oscillation

If link costs depend on the traffic they carry, link state routes can oscillate: everyone moves traffic to the currently cheap path, which then becomes expensive. Real protocols avoid load-based costs or randomise when routers recompute.

## Hierarchy and protocols in use

- **RIP**: distance vector, hop count metric, infinity 16, updates every 30 seconds over UDP port 520.
- **OSPF**: link state, configurable costs, areas for hierarchy, runs directly over IP.
- **BGP**: path vector between autonomous systems. Each route carries the list of AS numbers it passed through, so a router that sees its own AS in the path rejects it. This avoids loops without count to infinity. BGP runs over TCP port 179.

Intra-domain protocols (RIP, OSPF) optimise cost. Inter-domain routing (BGP) is driven by policy.

## Worked examples

### Worked example 1: One distance vector update

Router X has neighbours P (cost 2), Q (cost 7) and R (cost 4). Vectors to destinations (U, V, W):

- P: (5, 9, 3)
- Q: (1, 2, 6)
- R: (4, 3, 8)

| Destination | Via P | Via Q | Via R | New value |
|---|---|---|---|---|
| U | 7 | 8 | 8 | 7 via P |
| V | 11 | 9 | 7 | 7 via R |
| W | 5 | 13 | 12 | 5 via P |

X's new vector to (U, V, W) is (7, 7, 5). X's own old values do not matter; only the current neighbour vectors and link costs are used.

### Worked example 2: Dijkstra step by step

Undirected links: A-B 2, A-C 5, B-C 1, B-D 4, C-D 1, C-E 6, D-E 2. Source A.

| Step | Finalised | B | C | D | E |
|---|---|---|---|---|---|
| 0 | A | 2 | 5 | $\infty$ | $\infty$ |
| 1 | A, B | 2 | 3 | 6 | $\infty$ |
| 2 | A, B, C | | 3 | 4 | 9 |
| 3 | A, B, C, D | | | 4 | 6 |
| 4 | all | | | | 6 |

Shortest path to E: A-B-C-D-E with cost $2 + 1 + 1 + 2 = 6$. The forwarding entry at A for every destination here is "next hop B".

### Worked example 3: Counting to infinity with a number

Line A - B - C with costs 1, infinity defined as 16, no split horizon. A-B fails. B updates first using C's old value 2, giving 3. Then C and B update alternately, each adding 1 to the other's latest value.

B's values: 3, 5, 7, 9, 11, 13, 15, then 17 which is capped at 16. B reaches infinity on its 8th update. With split horizon, C never advertised A to B, so B would set A to 16 on its first update.

### Worked example 4: Why link state messages are small

A network has 50 routers and each has 4 links. In distance vector, each advertisement has 50 entries and goes to 4 neighbours. In link state, each router's LSP has 4 entries but is flooded to every router, so each router stores $50 \times 4 = 200$ link entries. Link state trades more memory and flooding for faster, loop-free convergence.

## Common traps

- Using a router's old distance to a destination in the Bellman-Ford update. Only current link costs and the neighbours' latest vectors count.
- Forgetting to add the link cost to the neighbour's advertised distance.
- Believing split horizon solves count to infinity in all networks. It fixes only two-node loops.
- Claiming link state routing counts to infinity. It does not, because every router computes from the full map.
- Mixing up which algorithm uses which: Bellman-Ford for distance vector, Dijkstra for link state.
- In Dijkstra, finalising a node because it was reached first rather than because it has the smallest tentative distance.
- Forgetting that Dijkstra needs non-negative costs.
- Treating BGP as distance vector. It is path vector.

## Quick revision

- Distance vector: send your whole table to neighbours; $D_x(y) = \min_v \{c(x,v) + D_v(y)\}$.
- Link state: flood your own links to everyone; each router runs Dijkstra.
- Good news fast, bad news slow; count to infinity raises distances step by step.
- Split horizon and poisoned reverse fix two-node loops only.
- RIP: DV, hop count, infinity 16, UDP 520. OSPF: LS, over IP. BGP: path vector, TCP 179.
- Dijkstra: pick the smallest tentative node, relax its edges, repeat; $O(n^2)$ with an array.
- Link state packets carry sequence numbers and ages so old information is discarded.
