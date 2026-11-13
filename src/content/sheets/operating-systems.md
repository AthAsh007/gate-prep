---
title: "Operating Systems formula sheet"
summary: "Formulas, standard counts and quick rules for processes, synchronization, deadlock, scheduling, memory and file systems."
---

## System calls, processes and threads

| Fact | Value or rule |
|---|---|
| $n$ successive `fork()` calls (no conditions) | $2^n$ processes, $2^n - 1$ new children |
| `fork()` return value | 0 in child, child PID in parent, $-1$ on failure |
| Loop `for i<n { fork(); print }` | prints $2 + 4 + \dots + 2^n = 2^{n+1} - 2$ |
| `exec` succeeds | never returns; code after it does not run |
| Zombie | terminated, parent has not called `wait()` |
| Orphan | still running, parent has exited; adopted by `init` |
| Shared after `fork` | open-file entries (common file offset); not memory |
| Shared by threads | code, data, heap, open files, signal handlers |
| Private to a thread | registers, PC, stack, thread ID |

- Many-to-one (user-level threads): fast switches, no parallelism, one blocking call blocks all threads.
- One-to-one (kernel threads): true parallelism, kernel call per thread operation.
- Privileged: I/O instructions, timer setting, interrupt disable, MMU and page table base changes. Not privileged: reading the clock, trap/syscall instruction.

## Concurrency and synchronization

| Rule | Value |
|---|---|
| Counting semaphore final value | $S_0 - \#P + \#V$ (any order) |
| Negative value $-k$ (blocking implementation) | $k$ processes blocked |
| Processes in CS with semaphore initialised to $k$ | at most $k$ |
| Ordering "A before B" | semaphore at 0; `signal` after A, `wait` before B |

Critical section requirements: mutual exclusion, progress, bounded waiting. Strict alternation (`turn`) fails progress; the two-flag algorithm can deadlock; Peterson (flag + turn) satisfies all three for 2 processes on sequentially consistent memory.

- Test-and-set / CAS spinlock: mutual exclusion yes, bounded waiting no. Ticket lock (fetch-and-add): FIFO, bounded waiting yes.
- Disabling interrupts works only on a uniprocessor.
- Spin when the hold time is shorter than two context switches and there are several CPUs; otherwise block.
- Bounded buffer: `empty = N`, `full = 0`, `mutex = 1`. Always `wait(empty or full)` before `wait(mutex)`; swapping them can deadlock.
- First readers-writers: writers can starve. Second: readers can starve.
- Dining philosophers fixes: at most $n-1$ seated, asymmetric pick-up order, pick both or none.
- Monitors: one active process inside. Condition `signal` with no waiter does nothing (a semaphore `V` is remembered).
- Hoare: signalled thread runs at once. Mesa: signaller continues, so wrap `wait` in `while`.
- `cond_wait(c, m)`: hold `m`; releases it and sleeps atomically; re-acquires before returning.
- Barrier with turnstile: last arrival signals; each thread does `wait; signal`; final value 1. Reuse needs two turnstiles.
- Priority inversion fix: priority inheritance.
- Lost update with `x++` (load, add, store) by 2 threads each doing $n$ increments: final value can be as low as 2 (for $n \ge 2$).

## Deadlock

Four necessary conditions: mutual exclusion, hold and wait, no preemption, circular wait.

| Prevention method | Condition removed |
|---|---|
| Request everything at start, or release all before new request | Hold and wait |
| Take resources away from a waiting process | No preemption |
| Global numbering, request in increasing order | Circular wait |

| Quantity | Formula |
|---|---|
| $n$ processes, each needs at most $k$ of $m$ identical units; deadlock impossible iff | $n(k-1) + 1 \le m$ |
| Minimum units for maxima $k_1, \dots, k_n$ | $\sum (k_i - 1) + 1$ |
| Need matrix | Need $=$ Max $-$ Allocation |
| Banker's safety / detection cost | $O(m n^2)$ |

- Safe implies no deadlock; unsafe does not imply deadlock.
- Banker's request: grant only if Request $\le$ Need, Request $\le$ Available, and the resulting state is safe.
- Detection: Work $=$ Available; repeatedly finish any process with Request $\le$ Work and add its Allocation. Unfinished processes are deadlocked (or wait forever on them).
- RAG, single instance per type: cycle iff deadlock. Several instances: cycle is necessary, not sufficient.
- Wait-for graph: only for single-instance resources.

## CPU and I/O scheduling

| Quantity | Formula |
|---|---|
| Turnaround | completion $-$ arrival |
| Waiting | turnaround $-$ burst (minus I/O time if any) |
| Response | first run $-$ arrival |
| Response ratio (HRRN) | $(w + b)/b$ |
| RR max wait between quanta ($n$ procs, quantum $q$, switch $s$) | $(n-1)q + ns$ |
| CPU efficiency with switch cost | $q/(q+s)$ |
| Utilisation with I/O wait fraction $p$, $n$ processes | $1 - p^n$ |
| Exponential burst prediction | $\tau_{n+1} = \alpha t_n + (1-\alpha)\tau_n$ |

| Algorithm | Preemptive | Starvation | Note |
|---|---|---|---|
| FCFS | no | no | convoy effect |
| SJF | no | yes | optimal avg wait, all at time 0 |
| SRTF | yes | yes | optimal avg wait overall |
| Priority | either | yes | fix with aging |
| RR | yes | no | large $q$ becomes FCFS; tiny $q$ becomes processor sharing |
| HRRN | no | no | favours short jobs, ages long ones |
| LRTF | yes | yes | very poor average |
| MLFQ | yes | yes without boost | full quantum used means demotion |

- With I/O bursts, draw the CPU and each device as separate timelines; CPU utilisation $=$ busy / makespan.

Disk scheduling (head at $h$, cylinders $0..C-1$):

| Algorithm | Movement |
|---|---|
| FCFS | sum of successive gaps |
| SSTF | nearest next; can starve far requests |
| SCAN (moving up) | $(C-1-h) + (C-1-\text{lowest})$ if requests lie below |
| LOOK (moving up) | $(\text{highest}-h) + (\text{highest}-\text{lowest})$ |
| C-SCAN | goes to the end, jumps to 0, continues up; count the return if the question says so |
| C-LOOK | serves up to highest, jumps to lowest pending request |

## Memory management and virtual memory

| Quantity | Formula |
|---|---|
| Pages in VA space | $2^{\text{VA bits}} / \text{page size}$ |
| Single-level page table size | pages $\times$ PTE size |
| Frames | physical memory / page size |
| Inverted page table size | frames $\times$ entry size |
| Levels for multi-level paging | $\lceil (\text{VA bits} - \text{offset bits}) / \log_2(\text{entries per table}) \rceil$ |
| EAT with TLB ($t$ TLB, $m$ memory, hit $h$, $k$ levels) | $h(t + m) + (1-h)(t + (k+1)m)$ |
| EAT with page faults (fault rate $p$, service $s$) | $(1-p)\,m + p\,s$ |
| TLB reach | entries $\times$ page size |
| Internal fragmentation | $\lceil \text{size}/P \rceil P - \text{size}$; average $P/2$ |
| Optimal page size (overhead per process) | $P = \sqrt{2 s e}$ ($s$ process size, $e$ PTE size) |

- PTE bits: frame number, valid, dirty, reference, protection. Dirty bit 0 means no write-back on eviction.
- Segmentation: check offset $<$ limit, then base $+$ offset. Segmentation with paging: segment number, page number, offset; page table per segment.
- Paging: internal fragmentation only. Segmentation and variable partitions: external fragmentation. Compaction needs run-time relocation.
- Placement: first fit (first hole that fits), best fit (smallest that fits), worst fit (largest), next fit (resume from last position).
- Buddy system: round up to a power of 2, split halves, merge only with the buddy at address XOR size.

Page replacement:

| Algorithm | Evicts | Belady's anomaly |
|---|---|---|
| FIFO | oldest loaded | possible |
| OPT | next used farthest in future | no |
| LRU | least recently used | no (stack algorithm) |
| Clock (second chance) | first page with ref bit 0; clears bits while passing | possible |
| LFU | lowest use count; state tie-break | possible |

- Working set $W(t, \Delta)$: distinct pages in the last $\Delta$ references. Thrashing when $\sum |W_i| >$ total frames.

## File systems

| Quantity | Formula |
|---|---|
| Pointers per block | block size / pointer size $= n$ |
| Max file size (inode) | $(d + n + n^2 + n^3) \times B$ |
| Index blocks for $D$ data blocks with linked index blocks ($n-1$ pointers each) | $\lceil D/(n-1) \rceil$ |
| FAT size | blocks $\times$ entry size |
| Bitmap size | blocks / 8 bytes |
| Linked allocation, payload per block | $B -$ pointer size |
| Average rotational latency | $\tfrac12 \times 60/\text{RPM}$ s |
| Transfer time | bytes / transfer rate, or (sectors read / sectors per track) $\times$ rotation |
| Disk access time | seek $+$ rotational latency $+$ transfer ($+$ controller) |

| Allocation | Random access | External fragmentation | Reads for block $k$ (index in memory) |
|---|---|---|---|
| Contiguous | yes | yes | 1 |
| Linked | no | no | $k$ (1-based) |
| FAT (cached) | yes | no | 1 |
| Indexed | yes | no | 1 plus index blocks not cached |

- Journaling: log metadata first, replay on recovery; avoids full fsck.
- RAID 0: striping, no redundancy. RAID 1: mirroring, capacity $N/2$. RAID 5: capacity $(N-1)$ disks, survives 1 failure. RAID 6: $(N-2)$, survives 2.
