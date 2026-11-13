---
title: "CPU and I/O scheduling"
summary: "CPU scheduling criteria and algorithms (FCFS, SJF, SRTF, Round Robin, priority, HRRN, multilevel queues) with Gantt charts, and disk scheduling (FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK)."
order: 4
sources:
  - title: "Operating Systems: Three Easy Pieces (free online book)"
    url: "https://pages.cs.wisc.edu/~remzi/OSTEP/"
  - title: "Wikipedia: Scheduling (computing)"
    url: "https://en.wikipedia.org/wiki/Scheduling_(computing)"
  - title: "Wikipedia: I/O scheduling"
    url: "https://en.wikipedia.org/wiki/I/O_scheduling"
---

## Why this topic matters

Scheduling is the most reliably numeric OS topic in GATE. Expect at least one NAT question asking for an average waiting or turnaround time, and often one on disk head movement. These are pure simulation: the only hard parts are reading the tie-breaking rule correctly and not slipping on arithmetic. Draw the Gantt chart every time.

## Definitions

For each process:

- **Arrival time** (AT): when it enters the ready queue.
- **Burst time** (BT): CPU time it needs.
- **Completion time** (CT): when it finishes.
- **Turnaround time**: $\text{TAT} = \text{CT} - \text{AT}$.
- **Waiting time**: $\text{WT} = \text{TAT} - \text{BT}$ (time spent in the ready queue, if there is no I/O).
- **Response time**: first time on the CPU minus arrival.

System-wide criteria: CPU utilisation, throughput (jobs per unit time), average TAT, average WT, average response time. If a process does I/O in the middle, subtract both CPU and I/O time from TAT to get waiting time.

**Preemptive** schedulers can take the CPU away from a running process (on a timer or a new arrival). **Non-preemptive** ones switch only when the running process blocks or ends.

## CPU scheduling algorithms

### First Come First Served (FCFS)

Run in arrival order, non-preemptive. Simple, no starvation, but suffers from the **convoy effect**: short jobs wait behind a long one, and I/O devices sit idle while the CPU-bound job runs.

### Shortest Job First (SJF)

Non-preemptive: when the CPU becomes free, pick the ready job with the smallest burst. When all jobs arrive together, SJF gives the **minimum average waiting time** of any non-preemptive schedule. Long jobs can **starve**. Real systems do not know burst lengths and predict them by exponential averaging:

$$\tau_{n+1} = \alpha\, t_n + (1 - \alpha)\, \tau_n$$

where $t_n$ is the actual length of the last burst and $\tau_n$ the previous prediction.

### Shortest Remaining Time First (SRTF)

Preemptive SJF: whenever a job arrives, compare its burst with the **remaining** time of the running job. It minimises average waiting time over all schedules for a given arrival pattern, and it can starve long jobs.

### Round Robin (RR)

Preemptive FCFS with a time quantum $q$. A process runs for at most $q$, then goes to the tail of the ready queue.

- Very large $q$: RR becomes FCFS.
- Very small $q$: lots of context switches; the overhead dominates.
- With $n$ ready processes, each waits at most $(n - 1)q$ for its next turn, so response time is bounded.

The usual convention when a new process arrives at the same instant the running one is preempted: **the new arrival goes into the queue first**. Always read what the question states; it changes the answer.

### Priority scheduling

Pick the highest priority (often the smallest number). Can be preemptive or not. Low-priority jobs can starve; **aging** gradually raises the priority of waiting jobs. SJF is priority scheduling with priority = predicted burst.

### Highest Response Ratio Next (HRRN)

Non-preemptive. At each decision pick the job with the largest

$$\text{RR} = \frac{W + S}{S}$$

where $W$ is time waited so far and $S$ the burst. Short jobs are favoured, but a long job's ratio grows as it waits, so there is no starvation.

### Longest Remaining Time First (LRTF)

Preemptive; always run the job with the most remaining time. Of little practical use but appears in GATE because ties are frequent, so the tie-breaking rule (usually lowest process ID) decides the answer.

### Multilevel queue and multilevel feedback queue

A **multilevel queue** keeps separate queues (system, interactive, batch) with their own algorithms and fixed priorities between them. A **multilevel feedback queue** lets processes move: a job that uses its whole quantum drops to a lower queue with a larger quantum; a job that waits too long moves up. It approximates SRTF without knowing burst lengths.

### Context switch overhead

If each switch costs $s$ and every job runs a full quantum $q$ before the switch, the fraction of CPU time doing useful work is

$$\text{efficiency} = \frac{q}{q + s}$$

## Worked examples

### Worked example 1: FCFS, SJF and SRTF on the same input

| Process | AT | BT |
|---|---|---|
| P1 | 0 | 6 |
| P2 | 1 | 3 |
| P3 | 2 | 7 |
| P4 | 3 | 2 |

**FCFS**

| 0-6 | 6-9 | 9-16 | 16-18 |
|---|---|---|---|
| P1 | P2 | P3 | P4 |

WT: P1 0, P2 $9-1-3=5$, P3 $16-2-7=7$, P4 $18-3-2=13$. Average $25/4 = 6.25$.

**SJF (non-preemptive)**. At 0 only P1 is ready, so it runs to 6. At 6 the shortest is P4 (2), then P2 (3), then P3.

| 0-6 | 6-8 | 8-11 | 11-18 |
|---|---|---|---|
| P1 | P4 | P2 | P3 |

WT: P1 0, P2 $11-1-3=7$, P3 $18-2-7=9$, P4 $8-3-2=3$. Average $19/4 = 4.75$.

**SRTF**. At 1, P2 (3) beats P1's remaining 5. At 3, P4 (2) arrives; P2 has 1 left and keeps running. At 4, P4 (2) beats P1 (5).

| 0-1 | 1-4 | 4-6 | 6-11 | 11-18 |
|---|---|---|---|---|
| P1 | P2 | P4 | P1 | P3 |

WT: P1 $11-0-6=5$, P2 0, P3 9, P4 $6-3-2=1$. Average $15/4 = 3.75$.

As expected, SRTF < SJF < FCFS on average waiting time.

### Worked example 2: Round Robin, quantum 2

Same processes, $q = 2$, zero switch cost, new arrivals join the queue before a preempted process.

- 0-2: P1 runs (4 left). P2 arrived at 1, P3 at 2. Queue: P2, P3, P1.
- 2-4: P2 (1 left). P4 arrived at 3. Queue: P3, P1, P4, P2.
- 4-6: P3 (5 left). Queue: P1, P4, P2, P3.
- 6-8: P1 (2 left). 8-10: P4 done. 10-11: P2 done. 11-13: P3 (3 left). 13-15: P1 done. 15-18: P3 runs its last 3 units alone.

| 0-2 | 2-4 | 4-6 | 6-8 | 8-10 | 10-11 | 11-13 | 13-15 | 15-18 |
|---|---|---|---|---|---|---|---|---|
| P1 | P2 | P3 | P1 | P4 | P2 | P3 | P1 | P3 |

CT: P1 15, P2 11, P3 18, P4 10. TAT: 15, 10, 16, 7, average 12. WT: 9, 7, 9, 5, average 7.5. RR is worse on average waiting here but every job got the CPU within 4 time units of arriving.

### Worked example 3: disk scheduling

Cylinders 0 to 199, head at 60 and moving toward higher numbers. Queue: 25, 150, 77, 8, 120, 99, 40, 180.

- **FCFS**: serve in queue order. $35 + 125 + 73 + 69 + 112 + 21 + 59 + 140 = 634$.
- **SSTF**: from 60, 77 (17 away) beats 40 (20 away). Then 99, 120, 150, 180, and finally 40, 25, 8. Movement $= (180 - 60) + (180 - 8) = 292$.
- **SCAN** (elevator, goes to the end): up to 199 then down to 8. $139 + 191 = 330$.
- **C-SCAN**: up to 199, jump to 0, then up to 40. Counting the jump: $139 + 199 + 40 = 378$.
- **LOOK**: up only to 180, then down to 8. $120 + 172 = 292$.
- **C-LOOK**: up to 180, jump to 8, up to 40. $120 + 172 + 32 = 324$.

LOOK and SSTF tie here, which happens whenever SSTF's greedy choice happens to follow the elevator order.

### Worked example 4: context switch overhead

Three CPU-bound jobs, each needing 12 ms, all arrive at 0. RR with $q = 4$ ms and switch cost 1 ms, charged before every dispatch except the first. How long until all finish?

There are $3 \times 3 = 9$ slices of 4 ms and 8 switches between them: $9 \times 4 + 8 \times 1 = 44$ ms. Useful work is 36 ms, so utilisation is $36/44 \approx 81.8\%$.

## Disk scheduling summary

Seek time dominates disk access, so schedulers minimise head movement.

| Algorithm | Idea | Note |
|---|---|---|
| FCFS | queue order | fair, slow |
| SSTF | nearest request next | can starve far requests |
| SCAN | sweep to the end, reverse | uniform-ish wait |
| C-SCAN | sweep to the end, jump to the start | more uniform wait; check whether the jump counts |
| LOOK | sweep only to the last request, reverse | SCAN without the wasted travel |
| C-LOOK | sweep to the last request, jump to the lowest request | C-SCAN without the wasted travel |

Rotational latency: average half a rotation, $\frac{1}{2} \cdot \frac{60}{\text{RPM}}$ seconds. For 7200 RPM that is about 4.17 ms.

## Common traps

- Computing waiting time as start time minus arrival in a preemptive schedule. Use $\text{TAT} - \text{BT}$.
- Ignoring the tie-breaking rule. With RR, the order between a new arrival and the preempted process changes every later slot.
- Forgetting idle time when no process has arrived yet.
- In SRTF, comparing a new job's burst with the running job's **original** burst instead of its remaining time.
- In SCAN, stopping at the last request (that is LOOK). In C-SCAN, forgetting to decide whether the return jump is counted.
- Mixing up which direction the head is moving at the start.
- Assuming a smaller RR quantum always helps. It improves response time but can worsen turnaround and adds switch overhead.

## Quick revision

- TAT = CT - AT; WT = TAT - BT; response = first run - AT.
- FCFS: convoy effect. SJF: optimal average WT among non-preemptive (all arrive together); starvation. SRTF: optimal overall; starvation.
- RR: large $q$ becomes FCFS; small $q$ means many switches; efficiency $q/(q + s)$.
- Priority: starvation, fixed by aging. HRRN: $(W + S)/S$, no starvation.
- MLFQ: demote jobs that use their whole quantum.
- Disk: SSTF greedy; SCAN to the end; C-SCAN to the end and jump; LOOK and C-LOOK stop at the last request.
- Always draw the Gantt chart and state the convention you used.
