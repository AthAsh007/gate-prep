---
title: "Memory hierarchy and cache"
summary: "Memory interfacing with chips and decoders, average access time for multi-level hierarchies, cache mapping with tag, index and offset bits, replacement and write policies."
order: 3
sources:
  - title: "CPU cache (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/CPU_cache"
  - title: "Memory hierarchy (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Memory_hierarchy"
  - title: "GATE Overflow: cache-memory tag"
    url: "https://gateoverflow.in/tag/cache-memory"
---

## Why a hierarchy works

Fast memory is small and expensive per bit; large memory is slow. Programs show **locality**:

- **Temporal locality**: a location used now is likely to be used again soon (loop counters, the loop body itself).
- **Spatial locality**: locations near a used one are likely to be used soon (array elements, sequential instructions).

So a small fast level close to the CPU (registers, then L1, L2, L3 caches) holds recently used blocks, and slower levels (main memory, disk) hold everything. Data moves between cache and memory in fixed-size **blocks** (also called lines).

## Memory interfacing

A memory of $W$ words of $b$ bits built from chips of $w \times c$ bits:

- chips side by side per row (to widen the word): $b / c$,
- rows (to add words): $W / w$,
- total chips $= (W/w) \times (b/c)$,
- address lines on each chip: $\log_2 w$; the remaining $\log_2 (W/w)$ high address bits drive a decoder that enables one row.

Memory interleaving spreads consecutive addresses across modules (low-order interleaving uses the low address bits to choose the module), so that a block can be fetched from several modules in parallel.

## Performance of a hierarchy

Let $h$ be the hit ratio, $t_c$ the cache access time and $t_m$ the memory access time.

### Hierarchical (look-through) access

The memory is accessed only after the cache misses, so a miss pays both:

$$T_{avg} = h\,t_c + (1-h)(t_c + t_m) = t_c + (1-h)\,t_m.$$

### Simultaneous (look-aside) access

Cache and memory are started together and a miss costs only the memory time:

$$T_{avg} = h\,t_c + (1-h)\,t_m.$$

### Two levels of cache

With L1 ($h_1$, $t_1$), L2 ($h_2$ local hit ratio, $t_2$) and memory $t_m$:

$$\text{Hierarchical: } T = t_1 + (1-h_1)\big[t_2 + (1-h_2)\,t_m\big]$$
$$\text{Simultaneous: } T = h_1 t_1 + (1-h_1) h_2 t_2 + (1-h_1)(1-h_2)\, t_m$$

The **local** hit ratio of L2 counts hits among requests that reach L2. The **global** miss ratio is $(1-h_1)(1-h_2)$. If a question gives a global L2 hit figure, convert before using these formulas.

### Miss penalty and block transfers

The formula $T = t_{hit} + m \times \text{miss penalty}$ is the standard form when the miss penalty already includes everything a miss costs. A block of $B$ bytes over a bus of width $w$ bytes with first-word latency $L$ and per-transfer time $t$ gives

$$\text{miss penalty} = L + \frac{B}{w}\, t$$

(unless the question says words are delivered in parallel from interleaved modules, in which case only one transfer time may apply). For write-back caches, a dirty victim adds a write-back: average penalty $= t_{fetch} + d \cdot t_{writeback}$ where $d$ is the fraction of victims that are dirty.

## Cache mapping

A byte address is split into fields. With block size $B$ bytes, $L$ lines, associativity $k$ (lines per set), and $S = L / k$ sets:

$$\text{offset} = \log_2 B, \qquad \text{index} = \log_2 S, \qquad \text{tag} = \text{address bits} - \text{index} - \text{offset}.$$

| Mapping | $k$ | Sets | Index bits | Comparators |
|---|---|---|---|---|
| Direct-mapped | 1 | $L$ | $\log_2 L$ | 1 |
| $k$-way set-associative | $k$ | $L/k$ | $\log_2(L/k)$ | $k$ |
| Fully associative | $L$ | 1 | 0 | $L$ |

A block with block number $b$ (the address without the offset) goes to set $b \bmod S$. In direct mapping it can live in only one line; in $k$-way it can use any of $k$ lines of its set; in fully associative it can use any line.

Each comparator is as wide as the tag. Doubling associativity at fixed capacity halves the sets, removes one index bit and adds one tag bit.

### Tag directory (metadata) size

Each line stores its tag and status bits:

$$\text{directory size} = L \times (\text{tag} + \text{valid} + \text{dirty} + \text{replacement bits}).$$

A dirty bit exists only for write-back caches. Replacement state (for example LRU bits) appears only if the question says so.

### Types of misses

- **Compulsory (cold)**: first reference to a block. Happens in any cache.
- **Capacity**: the working set is bigger than the cache. Would happen even in a fully associative cache of the same size.
- **Conflict**: the block was evicted because too many blocks mapped to its set, although other sets had room. Zero in a fully associative cache.

### Replacement policies

Direct mapping has no choice. For set-associative and fully associative caches: LRU (evict least recently used), FIFO (evict oldest loaded), random. LRU for $k$ ways needs $\lceil \log_2 k! \rceil$ bits of state per set in full form; for 2 ways one bit is enough.

### Write policies

| | Write hit | Write miss |
|---|---|---|
| Write-through | update cache and memory | with **no-write-allocate**: update memory only |
| Write-back | update cache only, set dirty bit | with **write-allocate**: fetch block, then write in cache |

Write-through is usually paired with no-write-allocate and a write buffer; write-back with write-allocate. In write-through every write costs memory time unless a buffer hides it. In write-back, memory sees writes only when dirty blocks are evicted.

### Block size trade-off

At fixed capacity, larger blocks reduce compulsory misses (spatial locality) but increase the miss penalty and, past a point, increase the miss rate because fewer blocks fit.

## Worked examples

### Worked example 1: address split for three mappings

A 64 KB cache with 64-byte blocks on a machine with 32-bit byte addresses. Find tag, index and offset bits for direct-mapped, 4-way set-associative and fully associative organisations.

Lines $= 65536 / 64 = 1024$. Offset $= 6$ bits in every case.

| Mapping | Sets | Index | Tag |
|---|---|---|---|
| Direct-mapped | 1024 | 10 | $32 - 10 - 6 = 16$ |
| 4-way | 256 | 8 | $32 - 8 - 6 = 18$ |
| Fully associative | 1 | 0 | $32 - 6 = 26$ |

### Worked example 2: tag directory size

For the 4-way cache above, each line has a valid bit, a dirty bit and 2 LRU bits besides its tag. Directory size $= 1024 \times (18 + 1 + 1 + 2) = 1024 \times 22 = 22528$ bits $= 22$ Kbits.

### Worked example 3: hierarchical versus simultaneous

L1: 1 ns, hit ratio 0.95. L2: 8 ns, local hit ratio 0.9. Memory: 60 ns.

Hierarchical: $T = 1 + 0.05\,[8 + 0.1 \times 60] = 1 + 0.05 \times 14 = 1.7$ ns.

Simultaneous: $T = 0.95(1) + 0.05(0.9)(8) + 0.05(0.1)(60) = 0.95 + 0.36 + 0.30 = 1.61$ ns.

Unless the question names the model, look for words like "first checks", "on a miss then accesses" (hierarchical) or "accessed in parallel" (simultaneous).

### Worked example 4: tracing one sequence through three mappings

A cache has 4 lines and starts empty. The block reference string is 0, 8, 0, 6, 8, 2, 0, 6. Compare direct-mapped (line $= b \bmod 4$), 2-way set-associative with 2 sets and LRU (set $= b \bmod 2$), and fully associative with LRU.

| Ref | Direct-mapped | 2-way LRU (set 0 holds all even blocks) | Fully associative LRU |
|---|---|---|---|
| 0 | miss | miss | miss |
| 8 | miss, evicts 0 | miss | miss |
| 0 | miss, evicts 8 | hit | hit |
| 6 | miss (line 2) | miss, evicts 8 | miss |
| 8 | miss, evicts 0 | miss, evicts 0 | hit |
| 2 | miss, evicts 6 | miss, evicts 6 | miss |
| 0 | miss, evicts 8 | miss, evicts 8 | hit |
| 6 | miss, evicts 2 | miss, evicts 2 | hit |
| Hits | 0 | 1 | 4 |

Every block here is even, so the set-associative cache uses only one of its two sets. All the misses beyond the 4 compulsory ones (blocks 0, 8, 6, 2) in the direct-mapped and 2-way caches are conflict misses, which fully associative mapping avoids.

### Worked example 5: building memory from chips

Build a $1\text{M} \times 32$ memory from $128\text{K} \times 8$ chips.

- Chips per row: $32/8 = 4$.
- Rows: $1\text{M}/128\text{K} = 8$.
- Total: 32 chips.
- Address: $\log_2 2^{20} = 20$ bits; each chip uses 17; the top 3 bits go to a 3-to-8 decoder that enables one row.

## Common traps

- **Byte versus word addressing.** If memory is word-addressable with 4-byte words, a 64-byte block has 16 words and the offset is 4 bits, not 6.
- **Hierarchical or simultaneous.** The two formulas give different answers and both appear among options.
- **Local versus global hit ratio** for L2.
- **Tag width in fully associative caches** is address minus offset only; the number of lines does not reduce it.
- **Tag width does not change with block size** at fixed capacity and associativity, because the offset gains what the index loses.
- **Dirty bit only in write-back.** Do not add it for write-through caches.
- **More associativity is not always fewer misses.** With LRU, a sequence cycling through $k+1$ blocks of one set misses every time.
- **Array loops.** Find the stride in bytes, the number of elements per block, and which elements share a line. Column-order traversal of a row-major array often maps many rows to the same few lines.

## Quick revision

- Offset $= \log_2 B$; sets $= \text{lines}/k$; index $= \log_2(\text{sets})$; tag $=$ rest.
- Set for block $b$: $b \bmod S$.
- Comparators: $k$ for $k$-way, each tag-bits wide.
- Directory $= \text{lines} \times (\text{tag} + \text{status bits})$.
- Hierarchical: $T = t_c + (1-h)t_m$. Simultaneous: $T = h t_c + (1-h) t_m$.
- Two levels hierarchical: $t_1 + (1-h_1)[t_2 + (1-h_2)t_m]$.
- Miss penalty with a bus: latency $+ (B/w) \times$ transfer time; dirty victims add write-back time.
- Misses: compulsory, capacity, conflict (conflict is zero in fully associative).
- Chips $= (W/w)(b/c)$; extra address bits feed the row decoder.
