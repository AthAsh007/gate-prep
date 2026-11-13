---
title: "Programming and Data Structures formula sheet"
summary: "C rules, recursion counts, stack and queue formulas, list tricks, tree and heap counts, and graph representation costs on one page."
---

## Programming in C

| Rule | Fact |
|---|---|
| Integer division | Truncates toward zero: `-7 / 2 == -3`, `-7 % 2 == -1` (remainder has the dividend's sign) |
| Signed vs unsigned | Signed converts to unsigned: `-1 < 1u` is false |
| Short-circuit | `&&` stops at first false, `\|\|` at first true; skipped side effects never happen |
| Precedence | `() [] -> .` > unary `! ~ ++ -- * & sizeof` > `* / %` > `+ -` > `<< >>` > relational > `== !=` > `&` > `^` > `\|` > `&&` > `\|\|` > `?:` > `=` > `,` |
| Bit tricks | `x & (x - 1)` clears the lowest set bit; `a >> 3 & 7` is `(a >> 3) & 7` |

| Storage | Lifetime | Linkage | Default |
|---|---|---|---|
| `auto` local | Block | None | Garbage |
| `static` local | Program, initialised once | None | 0 |
| Global | Program | External | 0 |
| `static` global | Program | Internal (file only) | 0 |

- `extern int x;` inside a block names the global `x` and hides an outer local `x`.
- `register` variables have no address.

Pointers and arrays:

- `a[i] == *(a + i) == i[a]`; `p + k` moves `k * sizeof(*p)` bytes.
- `int a[R][C]`: `*(*(a + i) + j)` is `a[i][j]`; `a + i` has type `int (*)[C]`.
- `int (*p)[C]` points to a row, `p++` skips a row. `int *p[C]` is an array of pointers.
- `*p[1]` means `*(p[1])`.
- `&a + 1` skips the whole array; `a + 1` skips one element.
- Array parameters decay to pointers: `sizeof(param)` is the pointer size.
- `sizeof` of a `char[20]` is 20; `strlen` counts to `'\0'`. Writing to a string literal is undefined.
- `strcat` appends, `strcpy` copies with `'\0'`, `strcmp` compares the first differing character.
- C is call by value: swapping pointer parameters does nothing to the caller; swapping `*a`, `*b` does.
- Macros substitute text: `#define SQ(x) x * x` gives `SQ(2 + 3) = 11`; `MAX(i++, j)` can increment twice.

## Recursion

| Recurrence | Result |
|---|---|
| $T(n) = T(n-1) + n$ | $\Theta(n^2)$ |
| $T(n) = 2T(n-1) + c$ | $\Theta(2^n)$ |
| $T(n) = T(n/2) + c$ | $\Theta(\log n)$ |
| $T(n) = 2T(n/2) + c$ | $\Theta(n)$ |
| $T(n) = 2T(n/2) + n$ | $\Theta(n \log n)$ |
| $T(n) = T(n-1) + T(n-2) + c$ | $\Theta(\phi^n)$, $\phi \approx 1.618$ |

| Function | Total calls |
|---|---|
| Naive `fib`, base $n \le 1$ | $2F(n+1) - 1$: 1, 1, 3, 5, 9, 15, 25 for $n = 0..6$ |
| `c(n, k)`, base $k = 0$ or $k = n$ | $2\binom{n}{k} - 1$ |
| Tower of Hanoi | $2^n - 1$ moves |

- Leaves return 1 and every other call makes two calls: calls $= 2 \cdot \text{value} - 1$.
- Print before the call: top-down order. Print after: reverse order.
- A `static` local is shared by all calls.
- Stack depth = longest path in the recursion tree, not the number of calls.

## Arrays, stacks and queues

| Layout | Address of $A[i][j]$, $A[l_1..u_1][l_2..u_2]$, size $w$, base $B$ |
|---|---|
| Row-major | $B + w[(i - l_1)(u_2 - l_2 + 1) + (j - l_2)]$ |
| Column-major | $B + w[(j - l_2)(u_1 - l_1 + 1) + (i - l_1)]$ |
| Lower triangular, row-wise, 1-based | $B + w[\frac{i(i-1)}{2} + (j - 1)]$ |
| Upper triangular, row-wise, 1-based, $n \times n$ | $B + w[(i-1)n - \frac{(i-1)(i-2)}{2} + (j - i)]$ |

Stacks:

- Stack permutations of $1..n$: $C_n = \frac{1}{n+1}\binom{2n}{n}$ (5, 14, 42 for $n = 3, 4, 5$). Forbidden pattern: $i < j < k$ output as $k, i, j$.
- Postfix: operator pops `b` then `a`, pushes `a op b`. Prefix: scan right to left, pop `a` then `b`.
- Infix to postfix: pop while top precedence is higher, or equal and the incoming operator is left-associative. `^` does not pop `^`.

Circular queue (size $n$, `front` = first element, `rear` = next free slot, one slot empty):

| Test | Condition |
|---|---|
| Empty | `front == rear` |
| Full | `(rear + 1) % n == front` |
| Count | `(rear - front + n) % n` |

- Queue from two stacks: $O(1)$ amortised (each element moved once).
- Deque: $O(1)$ at both ends. Input-restricted: insert one end. Output-restricted: delete one end.

## Linked lists

| Singly list with head and tail | Time |
|---|---|
| Insert or delete at head, insert at tail | $O(1)$ |
| Delete tail, search, $k$-th node | $\Theta(n)$ |
| Delete given node (not last) without head | $O(1)$: copy next, unlink next |
| Delete given node, doubly linked | $O(1)$ |

- Reverse: `next = cur->next; cur->next = prev; prev = cur; cur = next;` then `head = prev`.
- Doubly linked insert in the middle: 4 pointer writes; delete: 2.
- Merge sorted lists of sizes $m$, $n$: at most $m + n - 1$ comparisons.
- Middle: slow moves 1, fast moves 2.
- Floyd: tail $\mu$, cycle $\lambda$. After the meeting, reset one pointer to the head; both step by 1 and meet at the cycle entry after $\mu$ steps.

## Trees and binary search trees

Height $h$ = edges on the longest root-to-leaf path.

| Fact | Value |
|---|---|
| Nodes, height $h$ | $h + 1$ to $2^{h+1} - 1$ |
| Null pointers, $n$ nodes | $n + 1$ |
| Leaves | $L = n_2 + 1$ |
| Full tree with $L$ leaves | $2L - 1$ nodes |
| Complete tree, $n$ nodes | height $\lfloor \log_2 n \rfloor$, leaves $\lceil n/2 \rceil$ |
| Shapes or BSTs with $n$ keys | $C_n$: 1, 1, 2, 5, 14, 42, 132 |
| BSTs on $1..n$ with root $k$ | $C_{k-1} C_{n-k}$ |
| Shapes with height $n - 1$ | $2^{n-1}$ |

- Unique tree: inorder plus preorder, postorder or level order. Preorder plus postorder only for full trees.
- BST from preorder: insert the keys in that order. Root is first in preorder, last in postorder.
- BST search, insert, delete: $O(h)$. Two-child delete uses the inorder successor or predecessor.

| AVL fact | Value |
|---|---|
| Balance factor | $h(L) - h(R) \in \{-1, 0, 1\}$ |
| Minimum nodes | $N(h) = N(h-1) + N(h-2) + 1$: 1, 2, 4, 7, 12, 20, 33, 54 |
| Rotations | insert: one single or one double; delete: up to $O(\log n)$ |
| LL / RR | single right / single left rotation |
| LR / RL | rotate child left then node right / child right then node left |

## Binary heaps

| Item | 0-based | 1-based |
|---|---|---|
| Children of $i$ | $2i+1$, $2i+2$ | $2i$, $2i+1$ |
| Parent | $\lfloor (i-1)/2 \rfloor$ | $\lfloor i/2 \rfloor$ |
| Leaves | $\lfloor n/2 \rfloor .. n-1$ | $\lfloor n/2 \rfloor + 1 .. n$ |

| Operation | Time |
|---|---|
| Find max | $O(1)$ |
| Insert, delete max, change key | $O(\log n)$ |
| Bottom-up build | $\Theta(n)$; at most $n - s(n)$ swaps, $s(n)$ = 1 bits of $n$ |
| $n$ insertions | $O(n \log n)$ |
| Search, min of a max-heap | $\Theta(n)$ |
| Heapsort | $\Theta(n \log n)$, in place, not stable |

- Height $\lfloor \log_2 n \rfloor$. Min of a max-heap is a leaf.
- $k$-th largest in a max-heap ($k \ge 2$): depth 1 to $k - 1$.
- Max-heaps on $n$ distinct keys: $\binom{n-1}{L} H(L) H(R)$; 1, 1, 2, 3, 8, 20, 80 for $n = 1..7$.
- Sorted ascending array is a min-heap.
- $d$-ary heap: children $di + 1 .. di + d$, parent $\lfloor (i-1)/d \rfloor$.

## Graphs as a data structure

| Cost | Matrix | Lists |
|---|---|---|
| Space | $\Theta(V^2)$ | $\Theta(V + E)$ |
| Edge test | $O(1)$ | $O(\deg u)$ |
| Neighbours, out-degree | $\Theta(V)$ | $\Theta(\deg u)$ |
| In-degree of one vertex | $\Theta(V)$ | $\Theta(V + E)$ |
| Count edges, transpose, BFS, DFS | $\Theta(V^2)$ | $\Theta(V + E)$ |
| Universal sink | $O(V)$ | $\Theta(V + E)$ |

- List nodes and matrix 1s: $2E$ undirected, $E$ directed.
- Max edges: $\binom{V}{2}$ undirected, $V(V-1)$ directed; disconnected undirected: $\binom{V-1}{2}$.
- Upper triangle without diagonal: $\binom{V}{2}$ bits.
- $(A^k)_{ij}$ counts walks of length $k$; triangles $= \text{trace}(A^3)/6$.
- CSR: `rowptr` has $V + 1$ entries, `col` has $E$; out-degree is `rowptr[u+1] - rowptr[u]`.
- Matrix for dense graphs or $O(1)$ edge tests; lists for sparse graphs and traversals.
