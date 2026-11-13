---
title: "Memory management and virtual memory"
summary: "Contiguous allocation, paging, page table size and multi-level page tables, TLB effective access time, segmentation, demand paging, page replacement (FIFO, LRU, Optimal), Belady's anomaly and thrashing."
order: 5
sources:
  - title: "Operating Systems: Three Easy Pieces (free online book)"
    url: "https://pages.cs.wisc.edu/~remzi/OSTEP/"
  - title: "Wikipedia: Page replacement algorithm"
    url: "https://en.wikipedia.org/wiki/Page_replacement_algorithm"
  - title: "Wikipedia: Translation lookaside buffer"
    url: "https://en.wikipedia.org/wiki/Translation_lookaside_buffer"
---

## Why this topic matters

Memory management is one of the heaviest OS areas in GATE. The standard question types are: page table size and number of levels (pure bit arithmetic), effective access time with a TLB or with page faults, page fault counting for FIFO, LRU and Optimal, and statements about fragmentation, Belady's anomaly and thrashing. Almost all of it reduces to splitting an address into fields and counting carefully.

## Contiguous allocation

Each process occupies one contiguous block of physical memory, checked by a **base** (relocation) register and a **limit** register: the CPU adds the base to every logical address and traps if the logical address is not less than the limit.

- **Fixed partitions** cause **internal fragmentation**: unused space inside an allocated partition.
- **Variable partitions** cause **external fragmentation**: enough total free memory exists, but in holes too small to use. **Compaction** fixes it at the cost of moving processes.

Hole selection: **first fit** (first hole large enough), **best fit** (smallest hole large enough, leaves tiny leftovers), **worst fit** (largest hole). First fit and best fit usually beat worst fit in utilisation; first fit is fastest.

## Paging

Logical memory is split into fixed-size **pages**, physical memory into **frames** of the same size. A page table maps page number to frame number, so a process need not be contiguous.

A logical address of $v$ bits with page size $2^d$ bytes splits into

$$\underbrace{p}_{v - d \text{ bits}} \;\Big|\; \underbrace{\text{offset}}_{d \text{ bits}}$$

and the physical address is frame number followed by the same offset. Paging has **no external fragmentation** but has **internal fragmentation** in the last page of each process (on average half a page).

### Page table size

$$\text{entries} = 2^{v - d}, \qquad \text{table size} = 2^{v - d} \times \text{PTE size}$$

A page table entry holds the frame number ($\log_2$ of the number of frames) plus control bits: valid, dirty (modified), referenced, protection. If the question says the entry is rounded to bytes or words, round up.

### Multi-level page tables

A flat table for a 32-bit space with 4 KB pages and 4-byte entries is 4 MB per process, even if the process uses a few megabytes. A multi-level table pages the page table itself: only the inner tables that map used regions are allocated.

If every table at every level must fit in one page of size $2^d$ with entries of $e$ bytes, each level resolves $\log_2(2^d / e)$ bits, and

$$\text{levels} = \left\lceil \frac{v - d}{\log_2(2^d / e)} \right\rceil$$

The cost is one memory access per level on a TLB miss.

### Inverted page table

One entry per **physical frame**, holding (process ID, page number). Its size depends on physical memory, not on the virtual address space or the number of processes. Lookups need a hash table, and sharing pages is awkward.

## TLB and effective access time

The **translation lookaside buffer** is a small, fast associative cache of recent page-to-frame translations. With hit ratio $h$, TLB time $t$, memory access time $m$ and a $k$-level page table:

$$\text{EAT} = h\,(t + m) + (1 - h)\,(t + k\,m + m)$$

If the question says the TLB and memory lookups start in parallel, drop $t$ from the miss path. Without ASIDs, the TLB is flushed on every process switch, which is why a fresh process starts with a low hit ratio.

## Segmentation

Memory is divided into variable-size logical units (code, data, stack, heap). A logical address is (segment number, offset). The segment table gives base and limit; the offset is valid if $0 \le \text{offset} < \text{limit}$, and the physical address is base + offset. Segmentation matches the programmer's view and makes protection and sharing natural, but suffers from **external fragmentation**. **Segmented paging** pages each segment to remove it.

## Virtual memory and demand paging

Only the pages a process touches are loaded. A reference to a page with its valid bit clear raises a **page fault**: the OS finds a free frame (evicting a victim if needed, writing it back if dirty), reads the page from disk, updates the table and restarts the instruction.

With page fault rate $p$, memory access time $m$ and fault service time $s$:

$$\text{EAT} = (1 - p)\, m + p\, s$$

Because $s$ is millions of times $m$, $p$ must be tiny. Example: $m = 100$ ns, $s = 10$ ms, $p = 10^{-5}$ gives $\text{EAT} \approx 100 + 100 = 200$ ns, already a 2x slowdown.

## Page replacement

- **FIFO**: evict the page loaded earliest. Simple, but can evict heavily used pages, and suffers from **Belady's anomaly**.
- **Optimal (OPT)**: evict the page whose next use is farthest in the future (or never). Fewest faults possible; needs the future, so it is a benchmark.
- **LRU**: evict the page not used for the longest time. Good approximation of OPT; needs hardware support (counters or a stack).
- **Clock (second chance)**: FIFO with a reference bit; a page with bit 1 gets the bit cleared and is skipped once. Approximates LRU.

LRU and OPT are **stack algorithms**: the pages held with $n$ frames are always a subset of those held with $n + 1$ frames. Stack algorithms never show Belady's anomaly.

### Thrashing and the working set

**Thrashing** happens when processes do not have enough frames for their active pages: they fault constantly, the paging disk saturates, CPU utilisation drops, and a naive scheduler admits more processes, which makes it worse.

The **working set** $W(t, \Delta)$ is the set of distinct pages referenced in the last $\Delta$ references. If $\sum_i |W_i| >$ total frames, thrashing is likely and a process should be suspended. **Page fault frequency** control is the practical version: give a process more frames if its fault rate is too high, take frames away if it is too low.

## Worked examples

### Worked example 1: two-level page table

32-bit virtual addresses, 4 KB pages, 4-byte PTEs, two levels with each table one page.

Offset 12 bits; one page holds $4096/4 = 1024$ entries, so 10 bits per level: $10 + 10 + 12 = 32$.

A process uses the lowest 8 MB (code and data) and the highest 4 MB (stack). Each inner table maps $1024 \times 4\,\text{KB} = 4$ MB. So it needs 2 inner tables for the bottom, 1 for the top, plus 1 outer table: 4 pages = 16 KB, instead of 4 MB for a flat table.

### Worked example 2: TLB effective access time

TLB lookup 10 ns, memory access 80 ns, hit ratio 90%, single-level page table.

$$\text{EAT} = 0.9 \times (10 + 80) + 0.1 \times (10 + 80 + 80) = 81 + 17 = 98 \text{ ns}$$

Without a TLB every access would take $2 \times 80 = 160$ ns.

### Worked example 3: FIFO, LRU and OPT on one string

Three frames, initially empty; initial loads count as faults. Reference string:

1, 3, 0, 3, 5, 6, 3, 1, 5, 0, 6, 3

| Ref | 1 | 3 | 0 | 3 | 5 | 6 | 3 | 1 | 5 | 0 | 6 | 3 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| FIFO | F | F | F | - | F | F | F | F | F | F | F | F |
| LRU | F | F | F | - | F | F | - | F | F | F | F | F |
| OPT | F | F | F | - | F | F | - | - | F | F | - | - |

- **FIFO** (11 faults): at 5, evict 1 (oldest), frames {3, 0, 5}. At 6, evict 3. Now 3 itself faults, evicting 0, and the chain continues. The hit on the second 3 is the only one.
- **LRU** (10 faults): at 5, the least recent is 1, frames {3, 0, 5}; at 6, the least recent is 0 (3 was used at position 4), so 3 survives and the next 3 hits.
- **OPT** (7 faults): at 5 (position 5), the next uses are 1 at position 8, 3 at 7, 0 at 10, so evict 0, frames {1, 3, 5}. At 6, the next uses are 1 at 8, 3 at 7, 5 at 9, so evict 5, giving {1, 3, 6}. Then 3 and 1 hit. At 5 (position 9), 1 is never used again: evict it. At 0, 5 is never used again: evict it. 6 and 3 hit.

### Worked example 4: Belady's anomaly

FIFO on 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5:

- 3 frames: 9 faults (the only hits are the 1 and 2 right after 5, and the final 5).
- 4 frames: 10 faults (hits only on the first repeats of 1 and 2).

Adding a frame increased faults. LRU on the same string gives 10 faults with 3 frames and 8 with 4, never more with more frames.

## Common traps

- Mixing bits and bytes: page table size is entries times **bytes** per entry.
- Using the physical address size to count page table entries. Entries come from the **virtual** page number; physical size only sets the frame number width.
- Forgetting the $t$ in both hit and miss paths of EAT, or forgetting the final data access on a miss.
- Counting levels by dividing total address bits by bits per level instead of using $v - d$.
- In page replacement, forgetting whether initial loads count as faults. They usually do; read the question.
- OPT ties: when two pages are never used again, either may be evicted; the count is the same.
- Saying an inverted page table grows with virtual memory. It grows with physical memory.
- Calling a TLB miss a page fault. A TLB miss just means a page table walk.

## Quick revision

- Address split: page number $v - d$ bits, offset $d$ bits. Table size $2^{v-d} \times$ PTE.
- Levels $= \lceil (v - d) / \log_2(\text{entries per page}) \rceil$.
- TLB EAT: $h(t + m) + (1 - h)(t + (k + 1)m)$.
- Fault EAT: $(1 - p)m + p s$.
- Paging: internal fragmentation only. Segmentation: external fragmentation.
- OPT fewest faults; LRU and OPT are stack algorithms; FIFO shows Belady's anomaly.
- Thrashing when total working sets exceed frames; cure by reducing multiprogramming.
- Best fit and first fit beat worst fit; first fit is fastest.
