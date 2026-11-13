---
title: "Hashing"
summary: "Hash functions, collision resolution by chaining and open addressing, probe sequences, expected search costs and the clustering effects GATE asks about."
order: 3
sources:
  - title: "Hash table (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Hash_table"
  - title: "Linear probing (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Linear_probing"
  - title: "GATE Overflow: hashing tag"
    url: "https://gateoverflow.in/tag/hashing"
---

## The idea

A hash table stores $n$ keys in an array of $m$ slots. A hash function $h$ maps each key to a slot index in $0..m-1$. When the function spreads keys evenly, insert, search and delete take expected $O(1)$ time. Two keys with the same slot form a collision, and the table needs a rule to resolve it.

The **load factor** is $\alpha = n/m$. With chaining $\alpha$ can exceed 1; with open addressing $\alpha \le 1$ always.

## Hash functions

- **Division method**: $h(k) = k \bmod m$. Choose $m$ prime and not close to a power of 2. If $m = 2^p$, only the low $p$ bits of the key are used, which wastes information.
- **Multiplication method**: $h(k) = \lfloor m \cdot (kA \bmod 1)\rfloor$ for a constant $0 < A < 1$. The choice of $m$ is not critical, so $m = 2^p$ is fine.
- **Universal hashing**: pick $h$ at random from a family where any two distinct keys collide with probability at most $1/m$. This gives expected $O(1 + \alpha)$ per operation for any input, not just random input.

**Simple uniform hashing** assumes each key is equally likely to go to any slot, independently of other keys. Expected-cost results below rely on it.

## Separate chaining

Each slot holds a linked list of the keys that hash there.

```
insert(k):  put k at head of list T[h(k)]          // O(1)
search(k):  scan list T[h(k)]                      // O(1 + length)
delete(k):  remove node from T[h(k)]               // O(1) with doubly linked list and node pointer
```

Under simple uniform hashing:

- Expected chain length is $\alpha$.
- Unsuccessful search examines $\alpha$ keys on average, $\Theta(1 + \alpha)$ time including the hash.
- Successful search examines $1 + \frac{\alpha}{2} - \frac{\alpha}{2n}$ keys on average, also $\Theta(1 + \alpha)$.
- Worst case: all $n$ keys in one chain, $\Theta(n)$ search.

The probability that a given slot is empty after inserting $n$ keys is $(1 - 1/m)^n$, so the expected number of empty slots is $m(1 - 1/m)^n$. The expected number of colliding pairs is $\binom{n}{2}/m$.

## Open addressing

All keys live in the table itself. Insertion probes the slots $h(k, 0), h(k, 1), h(k, 2), \dots$ until it finds an empty one. Search follows the same sequence and stops at the key or at an empty slot.

### Probe sequences

| Method | $h(k, i)$ | Distinct sequences | Problem |
|---|---|---|---|
| Linear | $(h'(k) + i) \bmod m$ | $m$ | primary clustering |
| Quadratic | $(h'(k) + c_1 i + c_2 i^2) \bmod m$ | $m$ | secondary clustering, may not visit all slots |
| Double hashing | $(h_1(k) + i\,h_2(k)) \bmod m$ | $\Theta(m^2)$ | needs $h_2(k)$ coprime with $m$ |

**Primary clustering**: in linear probing, occupied slots form long runs. A key hashing anywhere into a run lands at its end, so a run of length $L$ grows with probability $(L + 1)/m$ per insertion. Big runs grow faster.

**Secondary clustering**: in quadratic probing, two keys with the same home slot follow identical probe sequences. Keys with different home slots do not interfere as much, so the effect is milder.

**Double hashing** makes the step size depend on the key, so keys with the same home slot usually take different paths. $h_2(k)$ must never be 0; a common choice is $h_2(k) = 1 + (k \bmod m')$ with $m' < m$, and $m$ prime makes every step coprime to $m$.

With $c_1 = 0$, $c_2 = 1$ and $m$ prime, the first $\lceil m/2\rceil$ quadratic probes are distinct, so insertion always succeeds while $\alpha \le 1/2$. Beyond that, quadratic probing can fail to find an empty slot even when one exists.

### Expected probes under uniform hashing

| Search | Uniform hashing | Linear probing (approx.) |
|---|---|---|
| Unsuccessful / insert | $\dfrac{1}{1 - \alpha}$ | $\dfrac12\left(1 + \dfrac{1}{(1 - \alpha)^2}\right)$ |
| Successful | $\dfrac{1}{\alpha}\ln\dfrac{1}{1 - \alpha}$ | $\dfrac12\left(1 + \dfrac{1}{1 - \alpha}\right)$ |

The uniform-hashing column is an upper bound that double hashing approaches. As $\alpha \to 1$ all costs blow up, which is why tables are resized (usually doubled, then all keys rehashed) once $\alpha$ passes a threshold such as 0.5 or 0.75. Doubling keeps the amortised insert cost $O(1)$.

### Deletion

Clearing a slot to empty breaks search: a later key that probed past this slot during its insertion will now be reported missing. The fix is a **tombstone** (deleted marker): search skips over it, insertion may reuse it. Tombstones lengthen searches, so tables with many deletions are rebuilt periodically, or chaining is preferred.

## Worked examples

### Worked example 1: Linear vs quadratic probing

Insert $20, 31, 42, 9, 53, 14$ into an empty table of size 11 with $h'(k) = k \bmod 11$.

Home slots: $20 \to 9$, $31 \to 9$, $42 \to 9$, $9 \to 9$, $53 \to 9$, $14 \to 3$.

**Linear probing** ($+i$):

- 20 goes to 9 (1 probe).
- 31: 9 taken, goes to 10 (2 probes).
- 42: 9, 10 taken, wraps to 0 (3 probes).
- 9: 9, 10, 0 taken, goes to 1 (4 probes).
- 53: 9, 10, 0, 1 taken, goes to 2 (5 probes).
- 14: home slot 3 is free (1 probe).

Final table: slot 0 = 42, 1 = 9, 2 = 53, 3 = 14, 9 = 20, 10 = 31. Total 16 probes. Notice that 14 now sits at the end of a run of six, so any future key hashing to 9, 10, 0, 1, 2 or 3 will land in slot 4.

**Quadratic probing** ($+i^2$):

- 20 goes to 9.
- 31: probes 9, then $9 + 1 = 10$.
- 42: probes 9, 10, then $9 + 4 = 13 \bmod 11 = 2$.
- 9: probes 9, 10, 2, then $9 + 9 = 18 \bmod 11 = 7$.
- 53: probes 9, 10, 2, 7, then $9 + 16 = 25 \bmod 11 = 3$.
- 14: home slot 3 is now taken, $3 + 1 = 4$.

Final: slot 2 = 42, 3 = 53, 4 = 14, 7 = 9, 9 = 20, 10 = 31. The keys sharing home slot 9 still followed one identical sequence (secondary clustering), but the occupied slots are no longer one long run.

### Worked example 2: Expected probes at $\alpha = 0.8$

Uniform hashing, unsuccessful search: $\frac{1}{1 - 0.8} = 5$ probes. Successful search: $\frac{1}{0.8}\ln 5 = 1.25 \times 1.609 \approx 2.01$ probes. For linear probing the approximations give $\frac12(1 + 25) = 13$ probes unsuccessful and $\frac12(1 + 5) = 3$ successful. The gap between 5 and 13 is the cost of primary clustering.

### Worked example 3: Where will the next key land?

A table of size 10 uses linear probing. Slots 1, 2, 3 and 6 are occupied. A new key's hash is uniform over 0..9. Find the probability that it lands in slot 4.

It lands in 4 if it hashes to 1, 2, 3 (then slides to the end of the run) or to 4 itself. That is 4 values out of 10, so probability 0.4. Slot 7 receives hashes 6 and 7 (probability 0.2), and slot 0 receives only hash 0 (0.1). Slots just after a run are the most likely next targets.

### Worked example 4: Chaining statistics

1000 keys go into 250 slots with simple uniform hashing. Then $\alpha = 4$. An unsuccessful search examines 4 keys on average. A successful search examines about $1 + \alpha/2 = 3$ keys. The expected number of empty slots is $250(1 - 1/250)^{1000} \approx 250e^{-4} \approx 4.5$.

## Common traps

- Read the probe function carefully: some questions use $(h(k) + i)$, others start at $i = 1$ or use $c_1 i + c_2 i^2$ with specific constants.
- Count probes, not collisions. A key placed in its home slot used 1 probe and 0 collisions.
- Wrap-around: after slot $m - 1$ comes slot 0.
- Load factor in chaining can exceed 1; open addressing cannot hold more than $m$ keys.
- The worst-case search for any hashing scheme is $\Theta(n)$. Expected $O(1)$ is not a worst-case claim.
- Do not delete in open addressing by emptying a slot.
- Quadratic probing with a non-prime $m$ can cycle through only a few slots.

## Quick revision

- $\alpha = n/m$; chaining search $\Theta(1 + \alpha)$ expected.
- Open addressing, uniform hashing: unsuccessful $\le 1/(1 - \alpha)$, successful $\le \frac{1}{\alpha}\ln\frac{1}{1 - \alpha}$.
- Linear probing: primary clustering. Quadratic: secondary clustering. Double hashing: neither.
- Next-slot probability under linear probing = (run length before the slot + 1) / $m$.
- Use tombstones for deletion in open addressing.
- Division method: prefer prime $m$ away from powers of 2.
