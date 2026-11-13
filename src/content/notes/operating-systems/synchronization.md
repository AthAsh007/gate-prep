---
title: "Concurrency and synchronization"
summary: "Race conditions, the critical section problem, Peterson's solution, hardware locks, semaphores, monitors, and the classic producer-consumer, readers-writers and dining philosophers problems."
order: 2
sources:
  - title: "Operating Systems: Three Easy Pieces (free online book)"
    url: "https://pages.cs.wisc.edu/~remzi/OSTEP/"
  - title: "Wikipedia: Peterson's algorithm"
    url: "https://en.wikipedia.org/wiki/Peterson%27s_algorithm"
  - title: "Wikipedia: Semaphore (programming)"
    url: "https://en.wikipedia.org/wiki/Semaphore_(programming)"
---

## Why this topic matters

Synchronization questions appear in almost every GATE paper. They come in three flavours: (1) a short piece of entry/exit code and a question about which property it satisfies, (2) semaphore code and a question about possible outputs, final values or deadlock, and (3) race conditions on a shared variable with a question about possible final values. All three are solved the same way: list the atomic steps and look for the one interleaving that breaks the claim.

## Race conditions

A **race condition** exists when the result depends on the order in which concurrent steps interleave. The classic case is `count++`, which compiles to three steps:

```c
r = count;      /* load  */
r = r + 1;      /* compute */
count = r;      /* store */
```

If two threads both load the same value before either stores, one increment is lost. The part of the code that touches shared data is the **critical section** (CS).

## The critical section problem

Each process has the structure:

```c
while (true) {
    entry section
    critical section
    exit section
    remainder section
}
```

A correct solution must satisfy:

1. **Mutual exclusion**: at most one process is in its CS at any time.
2. **Progress**: if the CS is free and some processes want to enter, the choice of who enters is made only among those processes, and it is made in finite time. A process in its remainder section must not block others.
3. **Bounded waiting**: after a process requests entry, there is a bound on how many times others can enter before it does.

No assumption may be made about relative speeds or the number of CPUs. A solution that busy-waits is still correct; busy waiting is a performance concern, not a correctness one.

### Two broken attempts

**Strict alternation** with a shared `turn`:

```c
while (turn != i) ;
/* CS */
turn = j;
```

Mutual exclusion holds. Progress fails: if $P_j$ never wants to enter, $P_i$ cannot enter twice in a row.

**Flags only**, set then test:

```c
flag[i] = true;
while (flag[j]) ;
/* CS */
flag[i] = false;
```

Mutual exclusion holds, but if both set their flags before either tests, both spin forever. Progress fails (a deadlock in the entry section). If the order is reversed (test then set), mutual exclusion itself fails.

### Peterson's solution

Peterson combines both ideas for two processes:

```c
/* shared */
bool flag[2] = {false, false};
int turn;

/* process i, with j = 1 - i */
flag[i] = true;          /* I want to enter */
turn = j;                /* but you go first if you also want to */
while (flag[j] && turn == j) ;
/* critical section */
flag[i] = false;
```

Why it works:

- **Mutual exclusion**: if both are inside, both found the loop condition false. Both flags are true, so each must have seen `turn` equal to its own index. But `turn` has a single value; whoever wrote `turn` last let the other one in and is itself stuck.
- **Progress**: if $P_j$ is not interested, `flag[j]` is false and $P_i$ enters at once.
- **Bounded waiting**: after $P_j$ leaves and tries again, it sets `turn = i`, so $P_i$ gets in next. The bound is 1.

Peterson assumes loads and stores are atomic and not reordered. On modern CPUs it needs memory barriers.

## Hardware support

### Test-and-set

`TestAndSet` atomically returns the old value and sets the variable to true:

```c
bool TestAndSet(bool *target) {   /* executed atomically */
    bool old = *target;
    *target = true;
    return old;
}

/* lock */
while (TestAndSet(&lock)) ;
/* CS */
lock = false;
```

This gives mutual exclusion and progress on any number of CPUs, but **not bounded waiting**: whichever spinner runs `TestAndSet` first after the release wins, so one process can lose forever. Bounded waiting can be added with a `waiting[]` array where the leaving process hands the lock to the next waiting process in cyclic order.

### Compare-and-swap and swap

`CompareAndSwap(&v, expected, new)` sets `v` to `new` only if `v == expected`, returning the old value. `Swap(&a, &b)` exchanges two values atomically. Both can build spin locks the same way as test-and-set.

### Disabling interrupts

On a single CPU, disabling interrupts around the CS works because nothing can preempt the process. It fails on multiprocessors and is too dangerous to give to user programs.

## Semaphores

A semaphore $S$ is an integer accessed only through two atomic operations:

```c
wait(S)   { S--; if (S < 0) { add caller to S's queue; block(); } }
signal(S) { S++; if (S <= 0) { remove a process P from S's queue; wakeup(P); } }
```

In this blocking form, a negative value $-k$ means $k$ processes are waiting. The older busy-wait definition (`while (S <= 0); S--;`) never lets $S$ go negative. Either way, the final value after any sequence of completed operations is

$$S_{\text{final}} = S_{\text{initial}} - (\text{number of waits}) + (\text{number of signals})$$

- A **binary semaphore** takes values 0 and 1. Initialised to 1 it acts as a lock.
- A **counting semaphore** initialised to $n$ allows up to $n$ holders, for example $n$ buffer slots.
- A semaphore initialised to 0 is used for **ordering**: `signal` after event A in one process, `wait` before event B in another forces A before B.

A **mutex** is a lock with an owner: only the thread that locked it may unlock it. A binary semaphore has no owner; any process may signal it.

## Monitors

A **monitor** is a language construct grouping shared data with the procedures that access it. Only one process can be active inside the monitor at a time; the compiler inserts the locking.

Waiting for a condition uses **condition variables**:

- `x.wait()` releases the monitor and blocks the caller on `x`.
- `x.signal()` wakes one process blocked on `x`. If none is waiting, **nothing happens**: the signal is lost. This is the key difference from a semaphore, which remembers signals in its count.

With Hoare semantics the signalled process runs at once; with Mesa semantics (used in practice) it is only moved to the ready queue, so it must recheck its condition in a `while` loop.

## Classic problems

### Producer-consumer (bounded buffer)

Buffer of $N$ slots; semaphores `mutex = 1`, `empty = N`, `full = 0`.

```c
/* producer */                 /* consumer */
wait(empty);                   wait(full);
wait(mutex);                   wait(mutex);
  put item;                      take item;
signal(mutex);                 signal(mutex);
signal(full);                  signal(empty);
```

The **order of the two waits matters**. If the producer does `wait(mutex)` before `wait(empty)` and the buffer is full, it sleeps holding `mutex`, and no consumer can get in to free a slot: deadlock. The order of the two signals does not affect correctness.

### Readers-writers

Many readers may read together; a writer needs exclusive access. First (reader-preference) solution, with `mutex = 1`, `wrt = 1`, `readcount = 0`:

```c
/* writer */            /* reader */
wait(wrt);              wait(mutex);
  write;                readcount++;
signal(wrt);            if (readcount == 1) wait(wrt);
                        signal(mutex);
                          read;
                        wait(mutex);
                        readcount--;
                        if (readcount == 0) signal(wrt);
                        signal(mutex);
```

The first reader locks out writers; the last reader lets them in. **Writers can starve** if readers keep arriving. The writer-preference variant blocks new readers once a writer is waiting, which can starve readers instead.

### Dining philosophers

Five philosophers, five chopsticks (semaphores initialised to 1). If each does `wait(left); wait(right);`, all five can pick up their left chopstick at once and wait forever: circular wait.

Ways to prevent deadlock:

- allow at most 4 philosophers at the table (a counting semaphore of 4)
- asymmetric order: odd philosophers pick left first, even pick right first
- pick up both chopsticks only if both are free, inside a critical section

## Worked examples

### Worked example 1: lost updates

`x = 0`. Two threads each execute `x = x + 1` twice, where each statement is load, add, store. What final values are possible?

Maximum: no overlap, $x = 4$.

Reaching 2: T1 loads 0 and pauses. T2 runs both its increments, so $x = 2$. T1 adds 1 to its stale 0 and stores 1, wiping out T2's work. T1 then runs its second increment fully: $x = 2$.

Why not 1: every store writes (loaded value + 1), so no store ever writes 0. The final value comes from the last store, which belongs to some thread's second increment. That thread loaded after its own first store, so it read at least 1 and wrote at least 2.

Reaching 3 is easy (lose exactly one update), so the possible values are $\{2, 3, 4\}$. In general, with two threads doing $n \ge 2$ increments each, the minimum is 2, not $n$.

### Worked example 2: ordering with a semaphore

`s = 0`. P1 runs `print("A"); signal(s);`. P2 runs `wait(s); print("B");`. P3 runs `print("C");`. How many distinct outputs?

The only constraint is A before B. C can be anywhere. Orders of A, B, C with A before B: ABC, ACB, CAB. So 3 outputs.

### Worked example 3: what does this lock violate?

```c
/* process i */
while (lock == 1) ;
lock = 1;
/* CS */
lock = 0;
```

$P_0$ sees `lock == 0`, leaves the loop and is preempted before setting it. $P_1$ also sees 0 and enters. $P_0$ resumes, sets `lock = 1` and enters too. Mutual exclusion fails. The fix is to make test and set one atomic step, which is exactly what `TestAndSet` does.

### Worked example 4: semaphore arithmetic

A counting semaphore starts at 5. Twelve `wait` and seven `signal` operations finish in some order (blocking implementation). Final value: $5 - 12 + 7 = 0$. No process is waiting at the end, and the value is 0, so the next `wait` will block.

## Common traps

- Deciding a solution is wrong because it busy-waits. Busy waiting is legal.
- Confusing progress with bounded waiting. Strict alternation fails progress; plain test-and-set fails bounded waiting.
- Treating a monitor `signal()` like a semaphore `signal()`. A condition signal with no waiter is lost.
- Swapping `wait(empty)` and `wait(mutex)` in the producer: deadlock when the buffer is full.
- Assuming `x++` is atomic in race questions. It is three steps unless stated otherwise.
- Forgetting that a binary semaphore can be signalled by a process that never waited on it, while a mutex cannot.
- For output-counting questions, missing that statements of one process stay in program order.

## Quick revision

- CS requirements: mutual exclusion, progress, bounded waiting.
- Strict alternation: ME yes, progress no. Flag-set-then-test: ME yes, can deadlock. Flag-test-then-set: ME no.
- Peterson: `flag[i] = true; turn = j; while (flag[j] && turn == j);`. Satisfies all three, bound 1.
- TestAndSet spin lock: ME and progress, no bounded waiting, busy waits, works on multiprocessors.
- Semaphore final value = initial - waits + signals. Negative value $-k$ means $k$ blocked.
- Producer: `wait(empty)` before `wait(mutex)`. Consumer: `wait(full)` before `wait(mutex)`.
- First readers-writers: writers may starve.
- Dining philosophers deadlock fixes: at most 4 seated, asymmetric pickup, atomic pickup of both.
- Monitor: one active process; condition signal without a waiter has no effect.
