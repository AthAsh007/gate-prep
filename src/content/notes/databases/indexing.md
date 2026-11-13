---
title: "File organization and indexing"
summary: "Records and blocks, blocking factor, primary, clustering and secondary indexes, dense versus sparse and multilevel indexes, and order, height and key-count calculations for B and B+ trees."
order: 5
sources:
  - title: "B+ tree (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/B%2B_tree"
  - title: "B-tree (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/B-tree"
  - title: "Database index (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Database_index"
  - title: "GATE Overflow: b-tree questions"
    url: "https://gateoverflow.in/tag/b-tree"
---

## Why block accesses are the cost measure

Data lives on disk in fixed-size **blocks** (pages). Reading one block costs far more than any computation on it, so query and index costs are counted in block accesses. Every calculation in this topic is about how many records or index entries fit in a block, and how many blocks you must read.

## Records and blocking

- **Block size** $B$ bytes, **record size** $R$ bytes, $r$ records.
- **Blocking factor** for unspanned storage (a record never crosses a block boundary):

$$bfr = \left\lfloor \frac{B}{R} \right\rfloor$$

- Number of blocks $b = \lceil r / bfr \rceil$.
- With **spanned** storage a record may continue in the next block, so no space is wasted and $b = \lceil rR / B \rceil$. Assume unspanned unless told otherwise.

### File organizations

| Organization | Search on ordering key | Insert |
|---|---|---|
| Heap (unordered) | Linear scan, $b/2$ average, $b$ worst | Cheap: append |
| Sorted (sequential) | Binary search, $\lceil \log_2 b \rceil$ | Expensive: shift records or use overflow |
| Hashed | About 1 access (plus overflow chains) | Cheap; poor for range queries |

## Single-level indexes

An index file holds entries (key, pointer), sorted by key. Entries are small, so many fit in one block, and searching the index is cheaper than searching the data.

| Index type | Built on | Entries | Dense or sparse |
|---|---|---|---|
| Primary | Ordering key field (unique) | One per data block (block anchor) | Sparse |
| Clustering | Ordering non-key field | One per distinct value | Sparse |
| Secondary | Non-ordering field (key or non-key) | One per record (or per value with a block of pointers) | Dense |

- **Dense** index: an entry for every search-key value (every record when the field is a key).
- **Sparse** index: entries for only some values; it works only when the file is sorted on the indexed field.
- A file can have at most one primary or clustering index (it can be sorted on only one field) but many secondary indexes.

Search cost with a single-level index of $b_i$ blocks using binary search:

$$\lceil \log_2 b_i \rceil + 1$$

The $+1$ reads the data block.

## Multilevel indexes

Treat the first-level index as a sorted file and build a sparse index on it, then another on that, until the top level fits in one block. The **fan-out** $fo$ is the index blocking factor.

- Level 1 has $b_1$ blocks, level 2 has $\lceil b_1 / fo \rceil$, and so on.
- Number of levels $t = \lceil \log_{fo} (\text{entries at level 1}) \rceil$.
- Search cost $= t + 1$ block accesses.

A static multilevel index is hard to maintain under inserts and deletes. B-trees and B+ trees are dynamic multilevel indexes that stay balanced.

## B-trees

A B-tree of **order p** (maximum p children per node):

- Each internal node has at most p children and p - 1 keys.
- Each node other than the root has at least $\lceil p/2 \rceil$ children (internal) and $\lceil p/2 \rceil - 1$ keys.
- The root has at least 2 children if it is not a leaf (at least 1 key).
- All leaves are at the same depth.
- Every key is stored exactly once, **with its data pointer**, in an internal node or a leaf.

Node size constraint (block pointer $P$, data pointer $P_r$, key $K$):

$$p \cdot P + (p - 1)(K + P_r) \le B$$

## B+ trees

- Internal nodes store only keys and child pointers; they route the search.
- All keys appear in the **leaves** with their record pointers. Some keys are repeated in internal nodes as separators.
- Leaves are linked left to right, so range queries scan the leaf chain.
- Every search goes all the way to a leaf.

Two different orders:

$$\text{internal: } p \cdot P + (p - 1) K \le B$$

$$\text{leaf: } p_{leaf}(K + P_r) + P \le B$$

The extra $P$ in a leaf is the next-leaf pointer. Since internal nodes carry no record pointers, B+ trees have higher fan-out than B-trees for the same block size, and so fewer levels.

### Min and max keys for a given height

For a B-tree of order p with h levels (root at level 1):

- Maximum keys: every node full, $(p - 1)(1 + p + p^2 + \dots + p^{h-1}) = p^h - 1$.
- Minimum keys: root has 1 key and 2 children; every other node has $\lceil p/2 \rceil - 1$ keys and $\lceil p/2 \rceil$ children. With $d = \lceil p/2 \rceil$: $1 + 2(d - 1)(1 + d + \dots + d^{h-2}) = 2d^{h-1} - 1$.

For a B+ tree, count keys in the leaves: maximum is $p^{h-1} \cdot p_{leaf}$, and the minimum uses 2 children at the root and minimum fill elsewhere. Always confirm the definition of "order" the question uses (maximum children, maximum keys, or minimum keys); GATE has used all three.

### Insertion and splits

Insert into the correct leaf. If the leaf overflows, split it into two halves; in a B+ tree the first key of the right half is **copied** up into the parent. When an internal node overflows, it splits and its middle key is **moved** up (not copied). If the root splits, a new root is created and the height grows by one. Height only ever increases at the root, which is why the tree stays balanced.

## Worked examples

### Worked example 1: blocking factor and index costs

A file has 20,000 records of 150 bytes, sorted on a key, in 2048-byte blocks. An index entry is a 10-byte key plus a 6-byte pointer.

- $bfr = \lfloor 2048 / 150 \rfloor = 13$. Data blocks $= \lceil 20000 / 13 \rceil = 1539$.
- Binary search on the data file: $\lceil \log_2 1539 \rceil = 11$ accesses.
- Index blocking factor $= \lfloor 2048 / 16 \rfloor = 128$.
- Primary (sparse) index: 1539 entries, $\lceil 1539 / 128 \rceil = 13$ blocks. Cost $= \lceil \log_2 13 \rceil + 1 = 4 + 1 = 5$.
- Secondary (dense) index on a non-ordering key: 20,000 entries, $\lceil 20000 / 128 \rceil = 157$ blocks. Cost $= \lceil \log_2 157 \rceil + 1 = 8 + 1 = 9$.
- Making the secondary index multilevel: 157, then $\lceil 157/128 \rceil = 2$, then 1. Three levels, cost $3 + 1 = 4$.

### Worked example 2: B+ tree orders

Block 4096 bytes, key 16 bytes, block pointer 8 bytes, record pointer 10 bytes.

Internal node: $8p + 16(p - 1) \le 4096 \Rightarrow 24p \le 4112 \Rightarrow p = 171$.

Leaf node: $26 \, p_{leaf} + 8 \le 4096 \Rightarrow p_{leaf} \le 157.2 \Rightarrow p_{leaf} = 157$.

### Worked example 3: levels needed for a million keys

Using the orders above with every node full, 1,000,000 keys need $\lceil 10^6 / 157 \rceil = 6370$ leaves. The level above needs $\lceil 6370 / 171 \rceil = 38$ nodes, and the next level needs 1 node (the root). So the tree has 3 levels, and fetching a record takes 3 index block reads plus 1 data block read, 4 in total. A binary search on a sorted file of the same records would need far more.

### Worked example 4: minimum keys in a B-tree

Order 5 (at most 5 children), 3 levels. $d = \lceil 5/2 \rceil = 3$, so non-root nodes need at least 2 keys and internal ones at least 3 children.

- Root: 1 key, 2 children.
- Level 2: 2 nodes with 2 keys each = 4 keys, 6 children in total.
- Level 3: 6 leaves with 2 keys each = 12 keys.

Total $1 + 4 + 12 = 17$, matching $2d^{h-1} - 1 = 2 \cdot 9 - 1 = 17$. The maximum for the same tree is $5^3 - 1 = 124$.

## Common traps

- Forgetting the floor in the blocking factor (unspanned records waste the leftover bytes) or the ceiling in the block count.
- Using the internal-node formula for leaves, or forgetting the next-leaf pointer in a B+ tree leaf.
- Counting $p$ keys instead of $p - 1$ in a node with p children.
- Forgetting the $+1$ data block access after the index search.
- Building a sparse index on a field the file is not sorted on. Secondary indexes are dense.
- Applying non-root minimum fill rules to the root, which needs only 2 children (1 key).
- Mixing up order definitions. Read whether "order" means max children, max keys, or min keys.
- Saying B+ tree searches can stop at an internal node. That is true only for B-trees.

## Quick revision

- $bfr = \lfloor B/R \rfloor$; blocks $= \lceil r / bfr \rceil$.
- Single-level index with binary search: $\lceil \log_2 b_i \rceil + 1$.
- Multilevel: levels $= \lceil \log_{fo} \text{entries} \rceil$; cost = levels + 1.
- Primary and clustering indexes are sparse; secondary indexes are dense; at most one ordering index per file.
- B-tree node: $pP + (p-1)(K + P_r) \le B$.
- B+ internal: $pP + (p-1)K \le B$; B+ leaf: $p_{leaf}(K + P_r) + P \le B$.
- B-tree order p, h levels: max keys $p^h - 1$; min keys $2\lceil p/2 \rceil^{h-1} - 1$.
- Leaf split copies the separator up; internal split moves the middle key up; height grows only at the root.
