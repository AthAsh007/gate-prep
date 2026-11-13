---
title: "Linked lists"
summary: "Singly, doubly and circular linked lists in C: node layout, insertion and deletion, reversal, two-pointer techniques, cycle detection and operation costs."
order: 4
sources:
  - title: "Linked list, Wikipedia"
    url: "https://en.wikipedia.org/wiki/Linked_list"
  - title: "Cycle detection, Wikipedia"
    url: "https://en.wikipedia.org/wiki/Cycle_detection"
  - title: "GATE Overflow: linked-list tag"
    url: "https://gateoverflow.in/tag/linked-list"
---

## Structure

A linked list is a chain of nodes, each holding data and a pointer to the next node. The list is reached through a `head` pointer; the last node's `next` is `NULL`.

```c
#include <stdlib.h>

struct node {
    int v;
    struct node *next;
};

struct node *newNode(int v, struct node *next) {
    struct node *n = malloc(sizeof *n);
    n->v = v;
    n->next = next;
    return n;
}
```

Unlike an array, nodes are not contiguous, so there is no $O(1)$ access by index. In exchange, inserting or removing a node needs no shifting once you hold a pointer to the right place.

### Variants

- **Singly linked**: one `next` pointer per node. Traversal only forward.
- **Doubly linked**: `prev` and `next`. Traversal both ways, and a node can be removed given only a pointer to it.
- **Circular**: the last node points back to the first. Often accessed through a pointer to the **last** node, which gives $O(1)$ access to both the last node and the first (`last->next`).
- **Header (sentinel) node**: a dummy node before the first real node, so insertion and deletion at the front need no special case.

## Operation costs

With a head pointer only, for a list of $n$ nodes:

| Operation | Singly linked | Doubly linked | Singly with tail pointer |
|---|---|---|---|
| Insert at front | $O(1)$ | $O(1)$ | $O(1)$ |
| Insert at end | $O(n)$ | $O(n)$ | $O(1)$ |
| Delete first | $O(1)$ | $O(1)$ | $O(1)$ |
| Delete last | $O(n)$ | $O(n)$, $O(1)$ with tail | $O(n)$ |
| Delete a node given a pointer to it | $O(n)$ in general | $O(1)$ | $O(n)$ |
| Search | $O(n)$ | $O(n)$ | $O(n)$ |
| Access $k$th node | $O(k)$ | $O(k)$ | $O(k)$ |

Deleting the last node of a singly linked list stays $O(n)$ even with a tail pointer, because you must find the node before it to set its `next` to `NULL`.

A trick sometimes tested: to delete a node `p` of a singly linked list in $O(1)$ when `p` is not the last node, copy `p->next->v` into `p` and unlink `p->next` instead. It fails for the last node.

Binary search on a linked list is not $O(\log n)$: finding the middle element costs linear time, so the total is $O(n)$.

## Core operations in C

### Insertion

```c
/* insert at front: returns the new head */
struct node *pushFront(struct node *head, int v) {
    return newNode(v, head);
}

/* insert after node p */
void insertAfter(struct node *p, int v) {
    p->next = newNode(v, p->next);
}
```

The order of pointer assignments matters. When inserting `n` after `p`, set `n->next = p->next` **before** changing `p->next`, or the rest of the list is lost.

### Deletion

```c
/* delete the first node with value v; returns the new head */
struct node *removeValue(struct node *head, int v) {
    struct node *prev = NULL, *cur = head;
    while (cur && cur->v != v) { prev = cur; cur = cur->next; }
    if (!cur) return head;               /* not found */
    if (prev) prev->next = cur->next;
    else head = cur->next;               /* deleting the head */
    free(cur);
    return head;
}
```

### Reversal

Iterative reversal walks the list once, pointing each node back at the reversed prefix:

```c
struct node *reverse(struct node *h) {
    struct node *prev = NULL, *nxt;
    while (h) {
        nxt = h->next;
        h->next = prev;
        prev = h;
        h = nxt;
    }
    return prev;
}
```

Time $\Theta(n)$, extra space $O(1)$. A recursive reversal also takes $\Theta(n)$ time but uses $\Theta(n)$ stack space.

## Two-pointer techniques

### Middle node

```c
struct node *slow = head, *fast = head;
while (fast && fast->next) {
    slow = slow->next;
    fast = fast->next->next;
}
```

After $k$ iterations `slow` is at node $k + 1$ and `fast` at node $2k + 1$ (1-based). For odd $n$ it stops at the exact middle, node $\frac{n+1}{2}$. For even $n$ it stops at node $\frac{n}{2} + 1$, the second of the two middle nodes. The loop condition decides this, so trace it rather than assume.

### $k$th node from the end

Move a lead pointer $k$ steps ahead, then move both pointers together until the lead falls off the end. The trailing pointer is then $k$th from the end.

### Cycle detection (Floyd)

Move `slow` by one and `fast` by two. If there is no cycle, `fast` reaches `NULL`. If there is a cycle, they must meet inside it, because once both are in the cycle the gap between them shrinks by one each step. The meeting happens within $\mu + \lambda$ steps, where $\mu$ is the distance from the head to the cycle start and $\lambda$ is the cycle length.

To find the cycle start: after they meet, reset one pointer to the head and move both one step at a time. They meet again at the first node of the cycle. To find $\lambda$, keep one pointer fixed and walk the other around until it returns.

## Doubly linked lists

```c
struct dnode { int v; struct dnode *prev, *next; };
```

To remove node `X` from the middle (both neighbours exist):

```c
X->prev->next = X->next;
X->next->prev = X->prev;
```

The two statements can be in either order because neither changes `X`'s own fields. To insert a new node `N` after `P` (with `P->next` not `NULL`):

```c
N->prev = P;
N->next = P->next;
P->next->prev = N;   /* must run before P->next changes */
P->next = N;
```

GATE likes asking which ordering of these four statements is correct. The safe rule: fill in the new node's pointers first, then update the old neighbours, and never read `P->next` after overwriting it.

## Circular lists and the Josephus problem

In a circular list, a traversal stops when it returns to the start node, not at `NULL`. Deleting every $k$th node around a circle until one remains is the Josephus problem. With 0-based positions,

$$J(1) = 0, \qquad J(n) = \big(J(n-1) + k\big) \bmod n$$

and the survivor in 1-based numbering is $J(n) + 1$. For $k = 2$ there is a closed form: write $n = 2^m + \ell$ with $0 \le \ell < 2^m$; the survivor is $2\ell + 1$.

## Arrays versus linked lists

| | Array | Linked list |
|---|---|---|
| Access by index | $O(1)$ | $O(n)$ |
| Insert or delete at a known position | $O(n)$ shifting | $O(1)$ pointer changes |
| Memory | contiguous, no pointer overhead | extra pointer per node |
| Cache behaviour | good | poor |
| Size | fixed, or reallocation | grows freely |

## Worked examples

### Worked example 1: deleting alternate nodes

The list holds 1, 2, 3, 4, 5, 6. What does it hold after this loop?

```c
struct node *p = head;
while (p != NULL && p->next != NULL) {
    struct node *q = p->next;
    p->next = q->next;
    free(q);
    p = p->next;
}
```

- `p` at 1: unlink 2, move to 3.
- `p` at 3: unlink 4, move to 5.
- `p` at 5: unlink 6, `p` becomes `NULL`.

The list is 1, 3, 5. With an odd length such as 1 to 5, the loop stops at 5 because `p->next` is `NULL`.

### Worked example 2: recursion that skips nodes

```c
void pr(struct node *p) {
    if (p == NULL) return;
    if (p->next) pr(p->next->next);
    printf("%d ", p->v);
}
```

For the list 1 to 6: `pr(1)` calls `pr(3)`, which calls `pr(5)`. Node 5's next is 6 and 6's next is `NULL`, so `pr(5)` calls `pr(NULL)`, which returns. Printing happens on the way back: 5, then 3, then 1. Output: `5 3 1`.

### Worked example 3: inserting into a doubly linked list

`P` is a node with successor `S`. Which order of statements inserts `N` between them?

1. `N->next = P->next; N->prev = P; P->next = N; N->next->prev = N;`
2. `P->next = N; N->next = P->next; N->prev = P; S->prev = N;`

Order 1 works: `N->next` is set to `S` while `P->next` still points to `S`; after `P->next = N`, the expression `N->next->prev` is `S->prev`, which correctly becomes `N`.

Order 2 fails: after `P->next = N`, the statement `N->next = P->next` makes `N` point to itself.

### Worked example 4: Floyd on a concrete list

Nodes 1 to 8 are linked in order, and node 8 points back to node 4. Both pointers start at node 1.

| Step | slow | fast |
|---|---|---|
| 1 | 2 | 3 |
| 2 | 3 | 5 |
| 3 | 4 | 7 |
| 4 | 5 | 4 |
| 5 | 6 | 6 |

They meet at node 6 after 5 steps. Here $\mu = 3$ (nodes 1, 2, 3 before the cycle) and $\lambda = 5$ (nodes 4 to 8). Restarting one pointer at node 1 and moving both by one: 1 and 6, then 2 and 7, then 3 and 8, then 4 and 4. They meet at node 4, the start of the cycle.

## Common traps

- Overwriting `p->next` before saving it, which loses the rest of the list.
- Forgetting the special case for deleting or inserting at the head (or use a header node).
- Assuming a tail pointer makes deleting the last node $O(1)$ in a singly linked list.
- Off-by-one on the middle node for even lengths.
- Dereferencing `fast->next->next` without checking `fast->next`.
- In circular lists, looping until `NULL`, which never comes.
- Reading a node after `free` on it.

## Quick revision

- Singly linked list with head only: front operations $O(1)$, end operations $O(n)$, search $O(n)$.
- Doubly linked: delete a given node in $O(1)$; two statements, order free.
- Insert after `p`: set the new node's `next` first.
- Reversal: three pointers, $\Theta(n)$ time, $O(1)$ space.
- Slow and fast pointers: middle node, $k$th from end, cycle detection.
- Floyd: meet inside the cycle; reset one pointer to head to find the cycle start.
- Josephus: $J(n) = (J(n-1) + k) \bmod n$, survivor $J(n) + 1$; for $k = 2$, $2\ell + 1$.
