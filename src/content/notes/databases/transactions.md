---
title: "Transactions and concurrency control"
summary: "ACID properties, schedules, conflict and view serializability with precedence graphs, recoverable, cascadeless and strict schedules, two-phase locking variants, and timestamp ordering."
order: 6
sources:
  - title: "ACID (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/ACID"
  - title: "Serializability (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Serializability"
  - title: "Two-phase locking (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Two-phase_locking"
  - title: "GATE Overflow: transaction-and-concurrency questions"
    url: "https://gateoverflow.in/tag/transaction-and-concurrency"
---

## Transactions and ACID

A transaction is a sequence of reads and writes that the DBMS treats as one logical unit, ending in commit or abort.

| Property | Meaning | Ensured by |
|---|---|---|
| Atomicity | All of it happens or none of it does | Recovery manager (undo using the log) |
| Consistency | A correct transaction takes a consistent state to a consistent state | Programmer and integrity constraints |
| Isolation | Concurrent execution looks like some serial execution | Concurrency control |
| Durability | Committed changes survive crashes | Recovery manager (redo, write-ahead log) |

### Transaction states

Active, then partially committed (last statement executed), then committed; or failed, then aborted (rolled back). After an abort the transaction can be restarted or killed.

## Schedules

Notation: $r_i(X)$ and $w_i(X)$ are a read and write of item X by transaction $T_i$; $c_i$ and $a_i$ are commit and abort.

A **schedule** interleaves the operations of several transactions while keeping each transaction's own order. A **serial** schedule runs transactions one after another; with n transactions there are $n!$ serial schedules. Two transactions with $m$ and $n$ operations have $\binom{m+n}{m}$ schedules.

### Anomalies that concurrency control prevents

- **Lost update**: $r_1(X), r_2(X), w_1(X), w_2(X)$; $T_1$'s write is overwritten.
- **Dirty read**: $T_2$ reads a value written by $T_1$, which later aborts.
- **Unrepeatable read**: $T_1$ reads X twice and $T_2$ changes it in between.
- **Phantom**: a repeated range query sees new rows inserted by another transaction.

## Conflict serializability

Two operations **conflict** if they belong to different transactions, access the same item, and at least one is a write. So the conflicting pairs are read-write, write-read and write-write. Two reads never conflict.

Two schedules are **conflict equivalent** if one can be turned into the other by swapping adjacent non-conflicting operations; equivalently, every conflicting pair appears in the same order. A schedule is **conflict serializable** if it is conflict equivalent to some serial schedule.

### Precedence graph test

1. One node per transaction.
2. For each conflicting pair where $T_i$'s operation comes first, draw $T_i \to T_j$.
3. The schedule is conflict serializable if and only if the graph has no cycle.
4. Each topological order of the graph is an equivalent serial schedule.

## View serializability

Two schedules are **view equivalent** if, for every data item:

1. The same transaction reads the initial value.
2. Every read $r_i(X)$ reads the value written by the same transaction (reads-from).
3. The same transaction performs the final write.

A schedule is **view serializable** if it is view equivalent to some serial schedule.

- Every conflict serializable schedule is view serializable.
- A view serializable schedule that is not conflict serializable must contain a **blind write** (a write of X without a preceding read of X by that transaction).
- Testing view serializability is NP-complete in general, so in practice you check candidate serial orders.

## Recoverability

These properties concern commits and aborts, independently of serializability.

| Property | Rule |
|---|---|
| Recoverable | If $T_j$ reads from $T_i$, then $T_i$ commits before $T_j$ commits |
| Cascadeless (ACA) | Transactions read only committed values: if $T_j$ reads X written by $T_i$, $c_i$ comes before that read |
| Strict | No transaction reads **or writes** X until the last transaction that wrote X has committed or aborted |

Strict $\subset$ cascadeless $\subset$ recoverable. A schedule that is not recoverable can leave the database unable to undo an abort, because the reader has already committed. A recoverable but not cascadeless schedule may need cascading rollback.

## Lock-based protocols

Shared lock (S) for reading, exclusive lock (X) for writing. S is compatible with S; X is compatible with nothing.

### Two-phase locking (2PL)

Each transaction has a **growing phase** (acquire locks, release none) followed by a **shrinking phase** (release locks, acquire none). The point where it holds all its locks is the lock point.

| Variant | Rule | Guarantees | Deadlock-free? |
|---|---|---|---|
| Basic 2PL | Two phases | Conflict serializable (order of lock points) | No |
| Strict 2PL | Hold X locks until commit/abort | Conflict serializable and strict | No |
| Rigorous 2PL | Hold all locks until commit/abort | Serializable in commit order, strict | No |
| Conservative 2PL | Acquire every lock before starting | Conflict serializable | Yes |

Basic 2PL can produce cascading aborts. Not every conflict serializable schedule can be produced by 2PL.

### Deadlock handling with timestamps

- **Wait-die** (non-preemptive): an older transaction may wait for a younger one; a younger one requesting from an older one dies (aborts) and restarts with the same timestamp.
- **Wound-wait** (preemptive): an older transaction wounds (aborts) the younger holder; a younger one waits for an older one.

Both prevent deadlock and starvation because the restarted transaction keeps its original timestamp and eventually becomes the oldest.

## Timestamp ordering

Each transaction gets a timestamp $TS(T)$ at start. Each item X keeps $RTS(X)$ and $WTS(X)$, the largest timestamps that read and wrote it.

- $T$ issues $r(X)$: if $TS(T) < WTS(X)$, reject and roll back T. Otherwise allow and set $RTS(X) = \max(RTS(X), TS(T))$.
- $T$ issues $w(X)$: if $TS(T) < RTS(X)$ or $TS(T) < WTS(X)$, reject and roll back T. Otherwise allow and set $WTS(X) = TS(T)$.

**Thomas write rule**: if $TS(T) < WTS(X)$ but $TS(T) \ge RTS(X)$, ignore the obsolete write instead of rolling back. This allows some view serializable schedules that are not conflict serializable.

Basic timestamp ordering guarantees conflict serializability and is deadlock-free (no transaction waits), but it can cause starvation and is not recoverable unless commits are also controlled.

## Worked examples

### Worked example 1: a cycle in the precedence graph

$S: r_1(A),\; r_2(B),\; w_2(A),\; r_3(B),\; w_1(B),\; w_3(A)$

Conflicting pairs:

- $r_1(A)$ before $w_2(A)$: $T_1 \to T_2$.
- $r_1(A)$ before $w_3(A)$, and $w_2(A)$ before $w_3(A)$: $T_1 \to T_3$, $T_2 \to T_3$.
- $r_2(B)$ before $w_1(B)$: $T_2 \to T_1$.
- $r_3(B)$ before $w_1(B)$: $T_3 \to T_1$.

$T_1 \to T_2 \to T_1$ is a cycle, so S is not conflict serializable. It is not view serializable either. $r_1(A)$ reads the initial A, so in any view-equivalent serial order $T_1$ must come before $T_2$ (which writes A). $r_2(B)$ reads the initial B, so $T_2$ must come before $T_1$ (which writes B). Both cannot hold.

Changing the schedule to $r_1(A), r_2(B), w_2(A), r_3(B), w_3(A), r_1(C)$ leaves edges $T_1 \to T_2$, $T_1 \to T_3$, $T_2 \to T_3$ and no cycle. The only equivalent serial order is $T_1, T_2, T_3$.

### Worked example 2: counting serializable schedules

$T_1: r_1(A), w_1(A)$ and $T_2: r_2(A), w_2(A)$. There are $\binom{4}{2} = 6$ schedules. Every pair across the two transactions except $r_1(A), r_2(A)$ conflicts. If $T_1$'s read and $T_2$'s read both happen before either write, the writes create edges in both directions. Checking all six, only the two serial schedules have an acyclic graph. Answer: 2.

When counting, list the conflicting pairs and count the interleavings in which they all point the same way; it is often easier to count the bad cases and subtract.

### Worked example 3: view serializable but not conflict serializable

$S: r_3(Y),\; w_1(Y),\; w_3(Y),\; w_2(Y)$

- $r_3(Y)$ before $w_1(Y)$: $T_3 \to T_1$. $w_1(Y)$ before $w_3(Y)$: $T_1 \to T_3$. Cycle, so not conflict serializable.
- View check against $T_3, T_1, T_2$: in S, $T_3$ reads the initial Y and $T_2$ writes last. In the serial order, $T_3$ runs first and reads the initial Y, and $T_2$ runs last. Same reads-from, same final writer. View serializable.

The blind writes $w_1(Y)$ and $w_2(Y)$ make this possible.

### Worked example 4: recoverability

$S: r_1(A),\; w_1(A),\; r_2(A),\; w_2(A),\; c_2,\; c_1$

$T_2$ reads A written by $T_1$, but $T_2$ commits first. If $T_1$ now aborts, $T_2$ has committed a value derived from data that never existed. S is **not recoverable**. Swapping the commits ($c_1$ before $c_2$) makes it recoverable, but still not cascadeless, because $r_2(A)$ reads an uncommitted value.

### Worked example 5: timestamp ordering trace

$TS(T_1) = 1$, $TS(T_2) = 2$, all item timestamps start at 0. Operations: $r_2(X), w_1(X), \dots$

- $r_2(X)$: $2 \ge WTS(X) = 0$. Allowed, $RTS(X) = 2$.
- $w_1(X)$: $1 < RTS(X) = 2$. A younger transaction has already read X, so $T_1$'s write would arrive too late in timestamp order. $T_1$ is rolled back.

Under the Thomas write rule the outcome is the same here, because the rule only ignores writes that are older than $WTS(X)$, not writes that are older than $RTS(X)$.

## Common traps

- Drawing an edge for two reads. Only pairs with at least one write conflict.
- Drawing edges between operations of the same transaction.
- Treating "not conflict serializable" as "not serializable". Check view serializability when there are blind writes.
- Confusing recoverable with cascadeless. Recoverable is about commit order; cascadeless is about reading only committed data.
- Saying 2PL prevents deadlock. Only conservative 2PL does.
- Applying the read rule to a write in timestamp ordering. A write checks both RTS and WTS; a read checks only WTS.
- Thinking Thomas write rule saves a write that is older than RTS. It only skips writes older than WTS.
- In wait-die, the older transaction waits and the younger dies. In wound-wait, the older wounds and the younger waits.

## Quick revision

- Atomicity and durability: recovery. Isolation: concurrency control. Consistency: application plus constraints.
- Conflict = different transactions, same item, at least one write.
- Precedence graph acyclic iff conflict serializable; topological orders give serial equivalents.
- Conflict serializable implies view serializable; the converse needs no blind writes.
- Strict $\subset$ cascadeless $\subset$ recoverable.
- 2PL gives conflict serializability; strict 2PL adds strictness; conservative 2PL avoids deadlock.
- TO read: reject if $TS < WTS$. TO write: reject if $TS < RTS$ or $TS < WTS$. Thomas: ignore a write with $TS < WTS$ (when $TS \ge RTS$).
- Wait-die: old waits, young dies. Wound-wait: old wounds, young waits.
- n transactions: $n!$ serial schedules; m and n operations: $\binom{m+n}{m}$ interleavings.
