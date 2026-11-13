---
title: "Binary heaps"
summary: "The binary heap as a complete tree in an array: index arithmetic, insertion, deletion, linear-time build-heap, heapsort, d-ary heaps and the questions GATE builds on them."
order: 6
sources:
  - title: "Binary heap, Wikipedia"
    url: "https://en.wikipedia.org/wiki/Binary_heap"
  - title: "Heapsort, Wikipedia"
    url: "https://en.wikipedia.org/wiki/Heapsort"
  - title: "GATE Overflow: heap tag"
    url: "https://gateoverflow.in/tag/heap"
---

## Definition

A binary heap is a binary tree with two properties:

1. **Shape**: it is a complete binary tree. Every level is full except possibly the last, which is filled from left to right.
2. **Order**: in a **max-heap** every node's key is at least the keys of its children; in a **min-heap** it is at most. Equal keys are allowed.

The order property relates only a node and its descendants. Siblings and cousins are not ordered with respect to each other, which is why a heap is not a search structure.

Consequences:

- The maximum of a max-heap is at the root.
- A heap with $n$ nodes has height $\lfloor \log_2 n \rfloor$.
- It has $\lceil n/2 \rceil$ leaves and $\lfloor n/2 \rfloor$ internal nodes.
- Every path from the root to a leaf is sorted (non-increasing for a max-heap).

## Array representation

Because the tree is complete, it fits in an array with no gaps, level by level.

| | 0-based (root at 0) | 1-based (root at 1) |
|---|---|---|
| Left child of $i$ | $2i + 1$ | $2i$ |
| Right child of $i$ | $2i + 2$ | $2i + 1$ |
| Parent of $i$ | $\lfloor (i - 1)/2 \rfloor$ | $\lfloor i/2 \rfloor$ |
| Leaves | indices $\lfloor n/2 \rfloor .. n-1$ | indices $\lfloor n/2 \rfloor + 1 .. n$ |

Check which convention a question uses before computing anything. Most GATE heap questions use 0-based arrays when they show C code and 1-based when they show pseudo-code.

To test whether an array is a max-heap, check `a[parent(i)] >= a[i]` for every $i$ except the root. That is $n - 1$ comparisons.

## Operations

### Insert (sift-up)

Place the new key in the next free slot (index $n$) so the shape stays complete. Then, while it is larger than its parent, swap it with the parent.

```c
void insert(int h[], int *n, int x) {
    int i = (*n)++;
    h[i] = x;
    while (i > 0 && h[(i - 1) / 2] < h[i]) {
        int t = h[i]; h[i] = h[(i - 1) / 2]; h[(i - 1) / 2] = t;
        i = (i - 1) / 2;
    }
}
```

At most $\lfloor \log_2 n \rfloor$ swaps: $O(\log n)$.

### Delete-max (sift-down)

Save the root, move the last element to the root, shrink the heap, and push the root down: while it is smaller than its larger child, swap with that child.

```c
void siftDown(int h[], int n, int i) {
    for (;;) {
        int l = 2 * i + 1, r = l + 1, m = i;
        if (l < n && h[l] > h[m]) m = l;
        if (r < n && h[r] > h[m]) m = r;
        if (m == i) return;
        int t = h[i]; h[i] = h[m]; h[m] = t;
        i = m;
    }
}

int deleteMax(int h[], int *n) {
    int top = h[0];
    h[0] = h[--(*n)];
    siftDown(h, *n, 0);
    return top;
}
```

Each level costs two comparisons (find the larger child, then compare with it), so delete-max uses at most about $2 \log_2 n$ comparisons: $O(\log n)$.

### Other operations

- **Increase-key** in a max-heap: change the key and sift up. $O(\log n)$.
- **Decrease-key** in a max-heap: change the key and sift down. $O(\log n)$.
- **Delete an arbitrary position**: replace it with the last element, then sift up or down as needed. $O(\log n)$, given the position.
- **Search for a key**: no ordering guides you, so $\Theta(n)$.
- **Find the minimum of a max-heap**: it is among the $\lceil n/2 \rceil$ leaves, so $\Theta(n)$.

## Build-heap in linear time

Inserting $n$ keys one by one costs $O(n \log n)$. The bottom-up method is faster: treat the array as a complete tree and call sift-down on every internal node from the last one ($\lfloor n/2 \rfloor - 1$ in 0-based indexing) back to the root.

```c
void buildHeap(int h[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--)
        siftDown(h, n, i);
}
```

Why it is $O(n)$: a node at height $k$ sifts down at most $k$ levels, and there are at most $\lceil n / 2^{k+1} \rceil$ nodes at height $k$. So the total work is

$$\sum_{k=0}^{\lfloor \log_2 n \rfloor} \frac{n}{2^{k+1}} \cdot O(k) = O\Big(n \sum_{k \ge 0} \frac{k}{2^k}\Big) = O(2n) = O(n)$$

The two methods can produce different arrays from the same input. Questions say which method to use; read carefully.

## Heapsort

Build a max-heap, then repeatedly swap the root with the last element of the heap, shrink the heap by one and sift down the new root. The array ends sorted in increasing order.

- Time $\Theta(n \log n)$ in every case.
- In place, $O(1)$ extra space.
- Not stable.

## Where can the $k$th largest be?

In a max-heap with distinct keys:

- The largest is at the root (index 0).
- The second largest is a child of the root: index 1 or 2.
- The third largest is at depth 1 or 2: any of indices 1 to 6.
- In general, the $k$th largest has depth at most $k - 1$, so it lies in the first $2^k - 1$ positions.
- The smallest is a leaf.

Finding the $k$th largest without destroying the heap can be done in $O(k \log k)$ with an auxiliary heap of candidates.

## Heaps with $d$ children

In a $d$-ary heap stored 0-based, the children of $i$ are $di + 1, \ldots, di + d$ and the parent of $i$ is $\lfloor (i - 1)/d \rfloor$. Height is about $\log_d n$. Insert gets cheaper ($O(\log_d n)$), while delete-max gets more expensive ($O(d \log_d n)$) because each level must look at $d$ children.

## Cost summary

| Operation | Binary heap |
|---|---|
| Find max (max-heap) | $O(1)$ |
| Insert | $O(\log n)$ |
| Delete max | $O(\log n)$ |
| Increase or decrease key (position known) | $O(\log n)$ |
| Build from $n$ keys, bottom-up | $O(n)$ |
| Build by $n$ insertions | $O(n \log n)$ |
| Search or find min (max-heap) | $\Theta(n)$ |
| Merge two heaps of size $n$ | $O(n)$ by rebuilding |

## Worked examples

### Worked example 1: inserting into a min-heap

Insert 40, 25, 30, 10, 5, 35, 15 one at a time into an empty min-heap (0-based array).

- 40: `[40]`.
- 25 is smaller than parent 40, swap: `[25, 40]`.
- 30 at index 2, parent 25: stays. `[25, 40, 30]`.
- 10 at index 3, parent 40: swap; at index 1, parent 25: swap. `[10, 25, 30, 40]`.
- 5 at index 4, parent 25: swap; at index 1, parent 10: swap. `[5, 10, 30, 40, 25]`.
- 35 at index 5, parent 30: stays.
- 15 at index 6, parent 30: swap; at index 2, parent 5: stays.

Final: `[5, 10, 15, 40, 25, 35, 30]`.

### Worked example 2: bottom-up build-heap with swap count

Build a max-heap from `[3, 1, 6, 5, 2, 4, 9, 7]` ($n = 8$, sift-down on indices 3, 2, 1, 0).

- Index 3 (5): child 7. Swap. `[3, 1, 6, 7, 2, 4, 9, 5]` (1 swap)
- Index 2 (6): children 4, 9. Swap with 9. `[3, 1, 9, 7, 2, 4, 6, 5]` (2)
- Index 1 (1): children 7, 2. Swap with 7; now at index 3 with child 5, swap again. `[3, 7, 9, 5, 2, 4, 6, 1]` (4)
- Index 0 (3): children 7, 9. Swap with 9; now at index 2 with children 4, 6, swap with 6. `[9, 7, 6, 5, 2, 4, 3, 1]` (6)

Result `[9, 7, 6, 5, 2, 4, 3, 1]` after 6 swaps.

### Worked example 3: one delete-max

Delete the maximum from `[9, 7, 6, 5, 2, 4, 3, 1]`. Move the last element 1 to the root: `[1, 7, 6, 5, 2, 4, 3]`. Its larger child is 7, swap: `[7, 1, 6, 5, 2, 4, 3]`. At index 1 the children are 5 and 2; swap with 5: `[7, 5, 6, 1, 2, 4, 3]`. Index 3 has no children in a heap of 7. Done.

### Worked example 4: how many max-heaps on 1 to 5?

The shape for $n = 5$ is fixed: the root, a left subtree of 3 nodes and a right subtree of 1 node. The root must be 5. Choose which 3 of the remaining 4 keys go left: $\binom{4}{3} = 4$ ways. A 3-node heap with given keys can be arranged in 2 ways (largest on top, the other two in either order), and a 1-node heap in 1 way. Total $4 \times 2 \times 1 = 8$.

The general recurrence is $H(n) = \binom{n-1}{L} H(L) H(R)$, where $L$ and $R$ are the sizes of the left and right subtrees of the complete tree.

## Common traps

- Mixing 0-based and 1-based parent and child formulas.
- Swapping with the first child instead of the larger child during sift-down.
- Using one-by-one insertion when the question asks for bottom-up build-heap (or the reverse); the arrays differ.
- Assuming the smallest element of a max-heap is at the last index. It can be at any leaf.
- Saying build-heap is $O(n \log n)$. The bottom-up method is $O(n)$.
- Thinking a heap supports search in $O(\log n)$.

## Quick revision

- Complete tree plus heap order; height $\lfloor \log_2 n \rfloor$; $\lceil n/2 \rceil$ leaves.
- 0-based: children $2i + 1$, $2i + 2$, parent $\lfloor (i-1)/2 \rfloor$. 1-based: children $2i$, $2i + 1$, parent $\lfloor i/2 \rfloor$.
- Insert sifts up, delete-max sifts down with the larger child, both $O(\log n)$.
- Bottom-up build-heap is $O(n)$; repeated insertion is $O(n \log n)$.
- Heapsort: $\Theta(n \log n)$, in place, not stable.
- Second largest at index 1 or 2; minimum at some leaf; search $\Theta(n)$.
- $d$-ary heap, 0-based: parent of $i$ is $\lfloor (i-1)/d \rfloor$.
