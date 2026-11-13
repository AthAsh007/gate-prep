---
title: "Deadlock"
summary: "The four conditions for deadlock, resource allocation graphs, prevention, avoidance with the Banker's algorithm, detection, recovery, and the minimum-resources formula."
order: 3
sources:
  - title: "Operating Systems: Three Easy Pieces (free online book)"
    url: "https://pages.cs.wisc.edu/~remzi/OSTEP/"
  - title: "Wikipedia: Banker's algorithm"
    url: "https://en.wikipedia.org/wiki/Banker%27s_algorithm"
---

## Why this topic matters

GATE tests deadlock with three recurring question types: the minimum number of resources that rules out deadlock (a formula question, usually NAT), the Banker's algorithm (is the state safe, which sequence is safe, can a request be granted), and conceptual statements about the four conditions and resource allocation graphs. The Banker's questions are mechanical but long, so a clean tabular method saves time.

## What deadlock is

A set of processes is **deadlocked** when every process in the set is waiting for an event that only another process in the set can cause. Usually the event is the release of a resource. No process in the set can run, release, or be woken.

Deadlock is different from **starvation**: a starving process could proceed, but keeps losing to others. A deadlocked process can never proceed without outside intervention.

### The four necessary conditions (Coffman)

All four must hold at the same time:

1. **Mutual exclusion**: at least one resource can be held by only one process at a time.
2. **Hold and wait**: a process holds at least one resource while waiting for another.
3. **No preemption**: a resource is released only voluntarily by its holder.
4. **Circular wait**: there is a cycle $P_0 \to P_1 \to \cdots \to P_k \to P_0$ where each waits for a resource held by the next.

The conditions are necessary, not sufficient, when resources have multiple instances. Breaking any one of them makes deadlock impossible.

## Resource allocation graph

A RAG has process nodes (circles) and resource nodes (boxes with one dot per instance).

- **Request edge** $P \to R$: $P$ is waiting for an instance of $R$.
- **Assignment edge** $R \to P$: an instance of $R$ is held by $P$.

Rules:

- No cycle: no deadlock.
- Cycle, and every resource in it has a single instance: deadlock.
- Cycle, but some resource has several instances: deadlock is possible but not certain. A process outside the cycle may hold an instance and release it, breaking the wait.

For single-instance resources, collapse the RAG into a **wait-for graph**: an edge $P_i \to P_j$ when $P_i$ waits for a resource held by $P_j$. A cycle in the wait-for graph is exactly a deadlock.

## Handling deadlock

There are four strategies.

### 1. Prevention: break a condition

| Condition | How to break it | Cost |
|---|---|---|
| Mutual exclusion | make resources shareable (read-only files, spooling a printer) | impossible for most resources |
| Hold and wait | request everything at once, or release everything before requesting more | poor utilisation, starvation |
| No preemption | if a request fails, release what you hold (or let the OS take it) | only for resources whose state can be saved, like CPU registers or memory |
| Circular wait | number the resource types; request only in increasing order | must know the order; may request early |

Resource ordering is the most practical. A cycle would need some process to hold a higher-numbered resource while waiting for a lower one, which the rule forbids.

### 2. Avoidance: stay in safe states

Each process declares its **maximum** need in advance. Before granting a request, the OS checks that the resulting state is **safe**: there exists an order (a **safe sequence**) in which every process can get its remaining need, finish and release.

- Safe state: deadlock cannot happen, whatever the processes request (within their declared maximum).
- Unsafe state: deadlock may happen. Unsafe does not mean deadlocked.

### 3. Detection and recovery

Let deadlocks happen, run a detection algorithm periodically (or when CPU utilisation drops), then recover by:

- aborting all deadlocked processes, or aborting one at a time until the cycle breaks
- preempting resources from a victim and rolling it back to a checkpoint

Victim choice considers priority, how much work would be lost, and how many resources it holds. Always picking the same victim causes starvation, so the number of rollbacks is often included in the cost.

### 4. Ignore it

Most general-purpose systems (Unix, Windows) do not run Banker's; they rely on careful programming and restarts. This is called the ostrich approach.

## Banker's algorithm

Data for $n$ processes and $m$ resource types:

- `Available[m]`: free instances of each type
- `Max[n][m]`: declared maximum demand
- `Allocation[n][m]`: currently held
- `Need[n][m] = Max - Allocation`

### Safety algorithm

```text
Work = Available
Finish[i] = false for all i
repeat:
    find i with Finish[i] == false and Need[i] <= Work (component-wise)
    if found:
        Work = Work + Allocation[i]
        Finish[i] = true
until no such i
safe if Finish[i] == true for all i
```

The cost is $O(m n^2)$. If several processes qualify at a step, any choice works; you never need to backtrack, because finishing a process only increases `Work`.

### Resource-request algorithm

When $P_i$ requests vector `Request`:

1. If `Request > Need[i]`: error (exceeds declared maximum).
2. If `Request > Available`: $P_i$ must wait.
3. Otherwise pretend to grant: `Available -= Request`, `Allocation[i] += Request`, `Need[i] -= Request`. Run the safety algorithm. If safe, grant; if not, roll back and make $P_i$ wait.

### Detection algorithm

Same loop as the safety algorithm, but with the **current requests** instead of `Need`. Processes left with `Finish == false` at the end are deadlocked. A process with no outstanding request is treated as able to finish.

## Minimum resources to avoid deadlock

$n$ processes share $R$ identical instances; process $i$ needs at most $m_i$ at once. The worst case is when every process holds $m_i - 1$ and asks for one more. If even then one instance is free, some process can finish and release, and the rest follow. So deadlock is impossible exactly when

$$R \ge \sum_{i=1}^{n} (m_i - 1) + 1$$

When every process needs at most $k$: $R \ge n(k - 1) + 1$. Rearranged for the largest number of processes with $R$ instances: $n \le \dfrac{R - 1}{k - 1}$.

## Worked examples

### Worked example 1: minimum instances

Three processes need at most 3, 4 and 6 tape drives. Minimum drives so deadlock is impossible:

$$(3 - 1) + (4 - 1) + (6 - 1) + 1 = 2 + 3 + 5 + 1 = 11$$

With 10 drives they could hold 2, 3 and 5, none free, all waiting.

### Worked example 2: is the state safe?

Resource types A, B, C with totals (9, 6, 5).

| Process | Allocation | Max | Need |
|---|---|---|---|
| P0 | 2 1 0 | 5 2 2 | 3 1 2 |
| P1 | 1 2 1 | 2 4 3 | 1 2 2 |
| P2 | 2 0 1 | 4 1 2 | 2 1 1 |
| P3 | 0 1 2 | 1 3 3 | 1 2 1 |
| P4 | 1 1 0 | 3 2 1 | 2 1 1 |

Allocated sum is (6, 5, 4), so Available = (3, 1, 1).

| Step | Pick | Need | Work after release |
|---|---|---|---|
| start | | | 3 1 1 |
| 1 | P2 | 2 1 1 | 5 1 2 |
| 2 | P0 | 3 1 2 | 7 2 2 |
| 3 | P1 | 1 2 2 | 8 4 3 |
| 4 | P3 | 1 2 1 | 8 5 5 |
| 5 | P4 | 2 1 1 | 9 6 5 |

All finish, so the state is safe with sequence P2, P0, P1, P3, P4. At the start, P4 also fits (need (2,1,1)); choosing it first gives another safe sequence. The final `Work` always equals the totals, a quick check of your arithmetic.

### Worked example 3: should a request be granted?

Same state. (a) P1 requests (0, 1, 0). (b) P4 requests (1, 1, 0).

(a) The request is within Need and Available. Pretend: Available becomes (3, 0, 1). Every process's Need now has B at least 1 (P0 needs 1, P1 now needs 1, P2 1, P3 2, P4 1) and B available is 0. Nobody can finish: unsafe. **Deny**; P1 waits.

(b) Pretend: Available (2, 0, 1), P4's Need becomes (1, 0, 1), Allocation (2, 2, 0). P4 fits: Work = (2,0,1) + (2,2,0) = (4, 2, 1). Then P2 (2,1,1): (6, 2, 2). P0 (3,1,2): (8, 3, 2). P1 (1,2,2): (9, 5, 3). P3: (9, 6, 5). Safe. **Grant**.

Note that the smaller-looking request was the dangerous one: it took the last B.

### Worked example 4: detection with single instances

Single-instance resources R1, R2, R3. P1 holds R1 and waits for R2. P2 holds R2 and waits for R3. P3 holds R3 and waits for nothing. P4 waits for R1.

Wait-for graph: P1 to P2, P2 to P3, P4 to P1. No cycle, so no deadlock. P3 finishes and frees R3, then P2, then P1, then P4.

If P3 instead waited for R1, the graph would have P1 to P2 to P3 to P1, and P1, P2, P3 would be deadlocked. P4 would also wait forever, even though it is not on the cycle.

## Common traps

- Treating "unsafe" as "deadlocked". Unsafe only means deadlock is possible.
- Concluding deadlock from any cycle when resources have multiple instances.
- Using Max instead of Need in the safety check.
- Forgetting to add the finished process's **Allocation** (not Need or Max) to Work.
- In the minimum-resources formula, forgetting the $+1$, or using $n \cdot k$ instead of $n(k - 1)$.
- In the "largest number of processes" version, rounding up instead of down.
- Calling Banker's prevention. It is avoidance; prevention breaks one of the four conditions structurally.
- Missing processes that are deadlocked without being on the cycle (they wait on a deadlocked process).

## Quick revision

- Four conditions: mutual exclusion, hold and wait, no preemption, circular wait. All needed.
- RAG: no cycle means no deadlock; cycle with single instances means deadlock; cycle with multiple instances means maybe.
- Prevention breaks a condition; resource ordering breaks circular wait.
- Avoidance: Banker's, needs Max in advance, keeps the system in safe states.
- Need = Max - Allocation. Safety: repeatedly finish any process with Need at most Work, then Work += its Allocation.
- Request: check against Need, then Available, then pretend and test safety.
- Detection: same loop using current Request; leftovers are deadlocked.
- No deadlock guaranteed iff $R \ge \sum (m_i - 1) + 1$; equal needs $k$: $R \ge n(k - 1) + 1$.
