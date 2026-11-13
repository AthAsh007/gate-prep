---
title: "Trees and binary search trees"
summary: "Binary tree terminology and node-count formulas, the four traversals and tree reconstruction, and binary search tree search, insertion, deletion and costs, with a short note on AVL height bounds."
order: 5
sources:
  - title: "Binary tree, Wikipedia"
    url: "https://en.wikipedia.org/wiki/Binary_tree"
  - title: "Binary search tree, Wikipedia"
    url: "https://en.wikipedia.org/wiki/Binary_search_tree"
  - title: "Tree traversal, Wikipedia"
    url: "https://en.wikipedia.org/wiki/Tree_traversal"
  - title: "GATE Overflow: binary-search-tree tag"
    url: "https://gateoverflow.in/tag/binary-search-tree"
---

## Terminology

A **tree** is a connected acyclic graph; a rooted tree has one node marked as the root. A tree with $n$ nodes has exactly $n - 1$ edges.

- **Depth** of a node: number of edges from the root to it. The root has depth 0.
- **Height** of a node: number of edges on the longest path from it down to a leaf. The **height of the tree** is the height of the root. GATE papers usually say "a single node has height 0"; some older questions count levels instead. Always read the definition given.
- **Leaf**: a node with no children. **Internal node**: at least one child.
- **Degree** of a node in a rooted tree: number of children.

### Kinds of binary trees

- **Binary tree**: every node has at most two children, called left and right.
- **Full** (also called strictly binary or proper): every node has 0 or 2 children.
- **Perfect**: full, and all leaves at the same depth. A perfect tree of height $h$ has $2^{h+1} - 1$ nodes.
- **Complete**: every level full except possibly the last, which is filled from the left. This is the shape of a binary heap.
- **Skewed**: every node has at most one child, so the tree is a path.

## Node-count formulas

Let $n_0$, $n_1$, $n_2$ be the numbers of nodes with 0, 1 and 2 children.

- Counting edges two ways: $n - 1 = n_1 + 2n_2$ and $n = n_0 + n_1 + n_2$. Subtracting gives
$$n_0 = n_2 + 1$$
for every non-empty binary tree. The number of one-child nodes never matters.
- A full binary tree with $L$ leaves has $L - 1$ internal nodes and $2L - 1$ nodes in total.
- A binary tree of height $h$ has between $h + 1$ and $2^{h+1} - 1$ nodes.
- A binary tree with $n$ nodes has height at least $\lceil \log_2(n + 1) \rceil - 1 = \lfloor \log_2 n \rfloor$ and at most $n - 1$.
- A complete binary tree with $n$ nodes has height exactly $\lfloor \log_2 n \rfloor$.
- In a $k$-ary tree where every internal node has exactly $k$ children, with $I$ internal nodes: $n = kI + 1$ and $L = (k - 1)I + 1$.
- The number of null child pointers in a binary tree with $n$ nodes is $n + 1$.

### Counting trees

The number of structurally different binary trees with $n$ nodes is the Catalan number $C_n = \frac{1}{n+1}\binom{2n}{n}$: $1, 1, 2, 5, 14, 42$ for $n = 0 .. 5$. The same number counts BSTs on $n$ distinct keys, since the keys are forced once the shape is fixed. With $n$ distinct labels placed freely, there are $n! \cdot C_n$ labelled binary trees.

## Traversals

```c
struct t { int key; struct t *l, *r; };

void preorder(struct t *p)  { if (p) { visit(p); preorder(p->l); preorder(p->r); } }
void inorder(struct t *p)   { if (p) { inorder(p->l); visit(p); inorder(p->r); } }
void postorder(struct t *p) { if (p) { postorder(p->l); postorder(p->r); visit(p); } }
```

- Preorder: root, left, right. The first element is the root.
- Inorder: left, root, right. For a BST this lists keys in sorted order.
- Postorder: left, right, root. The last element is the root.
- Level order: level by level, left to right, using a queue.

All four take $\Theta(n)$ time. The recursive versions use stack space proportional to the height.

### Reconstructing a tree

With distinct keys, **inorder plus any one of preorder, postorder or level order** determines the tree uniquely:

1. Take the root from the other traversal (first of preorder, last of postorder, first of level order).
2. Find the root in the inorder sequence. Keys to its left form the left subtree; keys to its right form the right subtree.
3. Recurse on each side, taking the corresponding subsequence of the other traversal.

**Preorder plus postorder** does not determine a general binary tree: whenever a node has only one child, you cannot tell whether that child is left or right. It does determine a full binary tree.

For a **BST**, one traversal is enough except inorder alone. Preorder or postorder gives the root; the inorder sequence is just the sorted keys, so you already have the pair.

## Binary search trees

A BST stores keys so that for every node, all keys in its left subtree are smaller and all keys in its right subtree are larger. This is a property of whole subtrees, not just of the immediate children.

### Search and insert

```c
struct t *search(struct t *p, int k) {
    while (p && p->key != k)
        p = (k < p->key) ? p->l : p->r;
    return p;
}

struct t *insert(struct t *p, int k) {
    if (!p) {
        p = malloc(sizeof *p);
        p->key = k; p->l = p->r = NULL;
        return p;
    }
    if (k < p->key) p->l = insert(p->l, k);
    else p->r = insert(p->r, k);
    return p;
}
```

Both follow one root-to-leaf path: $O(h)$ time. A new key always becomes a leaf.

### Delete

Three cases for the node `z` being deleted:

1. `z` is a leaf: remove it.
2. `z` has one child: link its parent directly to that child.
3. `z` has two children: find its **inorder successor** (the leftmost node of the right subtree), copy the successor's key into `z`, then delete the successor, which has no left child and so falls under case 1 or 2. Using the **inorder predecessor** (rightmost node of the left subtree) is equally valid; the question will say which.

### Costs

| Operation | Average (random insertions) | Worst case (unbalanced) | Balanced (AVL, red-black) |
|---|---|---|---|
| Search, insert, delete | $O(\log n)$ | $\Theta(n)$ | $\Theta(\log n)$ |
| Find min or max | $O(\log n)$ | $\Theta(n)$ | $\Theta(\log n)$ |
| Inorder traversal | $\Theta(n)$ | $\Theta(n)$ | $\Theta(n)$ |
| Build from $n$ keys by insertion | $O(n \log n)$ | $\Theta(n^2)$ | $\Theta(n \log n)$ |

The worst case happens when keys arrive in sorted order and the tree becomes a chain. Sorting $n$ keys by inserting them into a BST and reading the inorder sequence therefore costs $\Theta(n^2)$ in the worst case.

### Useful BST facts

- The minimum is the leftmost node; the maximum is the rightmost node.
- The inorder successor of a node with a right child is the leftmost node of that right subtree. Otherwise it is the nearest ancestor whose left subtree contains the node.
- Checking whether a binary tree is a BST: an inorder traversal must be strictly increasing. Checking only parent-child pairs is not enough.
- To test whether a sequence can be the preorder of a BST, rebuild the tree by inserting the keys in that order and compare its preorder with the sequence. They match exactly when the sequence is valid.

## AVL trees in brief

An AVL tree is a BST in which, at every node, the heights of the two subtrees differ by at most 1. The minimum number of nodes in an AVL tree of height $h$ (height of a single node = 0) satisfies

$$N(0) = 1, \quad N(1) = 2, \quad N(h) = N(h-1) + N(h-2) + 1$$

giving $1, 2, 4, 7, 12, 20, 33$. Since $N(h)$ grows like the Fibonacci numbers, the height is at most about $1.44 \log_2 n$, so all operations are $O(\log n)$. Insertions are fixed by at most one single or double rotation.

## Worked examples

### Worked example 1: building a BST

Insert 50, 28, 71, 15, 36, 60, 88, 33, 40, 65 into an empty BST.

- 50 is the root. 28 goes left, 71 right.
- 15 is the left child of 28 and 36 the right child of 28.
- 60 is the left child of 71 and 88 the right child of 71.
- 33 and 40 become children of 36. 65 becomes the right child of 60.

Preorder: `50 28 15 36 33 40 71 60 65 88`. Postorder: `15 33 40 36 28 65 60 88 71 50`. Height: 3 (path 50, 28, 36, 33). Leaves: 15, 33, 40, 65, 88, which is 5. Check $n_0 = n_2 + 1$: the two-child nodes are 50, 28, 71, 36, which is 4, and $4 + 1 = 5$.

### Worked example 2: inorder and postorder to preorder

Inorder `4 2 7 5 1 3 6`, postorder `4 7 5 2 6 3 1`.

- Root is 1 (last of postorder). Left inorder `4 2 7 5`, right inorder `3 6`.
- Left postorder `4 7 5 2`: root 2, left `4`, right inorder `7 5` with postorder `7 5`, so 5 has left child 7.
- Right postorder `6 3`: root 3, right child 6.

Preorder: `1 2 4 5 7 3 6`.

### Worked example 3: deleting nodes with two children

Using the tree from example 1:

- Delete 28 with the inorder successor. The leftmost node of 28's right subtree is 33. Copy 33 into the node and remove the old 33 (a leaf). Preorder becomes `50 33 15 36 40 71 60 65 88`.
- Instead, delete 50 from the original tree. Its successor is 60 (leftmost in the right subtree). 60 has a right child 65, which moves up to be the left child of 71. Preorder becomes `60 28 15 36 33 40 71 65 88`.

### Worked example 4: minimum nodes in an AVL tree

What is the smallest AVL tree of height 4? Using the recurrence: $N(2) = 2 + 1 + 1 = 4$, $N(3) = 4 + 2 + 1 = 7$, $N(4) = 7 + 4 + 1 = 12$. So 12 nodes. Equivalently, an AVL tree with 11 nodes has height at most 3.

## Common traps

- Mixing up height conventions (edges versus levels). A wrong convention shifts every answer by one.
- Assuming preorder and postorder together fix a binary tree.
- Checking the BST property only between parent and child.
- Forgetting that a BST's worst case is $\Theta(n)$, not $\Theta(\log n)$.
- Using the predecessor when the question asks for the successor, or the reverse.
- Applying $2^{h+1} - 1$ with $h$ counted as levels.
- Counting labelled trees with $C_n$ instead of $n! \cdot C_n$.

## Quick revision

- $n_0 = n_2 + 1$ in every binary tree; a full binary tree with $L$ leaves has $2L - 1$ nodes.
- Height $h$: between $h + 1$ and $2^{h+1} - 1$ nodes. Complete tree with $n$ nodes: height $\lfloor \log_2 n \rfloor$.
- Null pointers in a binary tree with $n$ nodes: $n + 1$.
- Binary tree shapes and BSTs on $n$ keys: $C_n$; $C_5 = 42$.
- Inorder of a BST is sorted; inorder plus one other traversal rebuilds a tree.
- BST operations cost $O(h)$: $\Theta(n)$ worst, $\Theta(\log n)$ when balanced.
- Delete with two children: replace by inorder successor (or predecessor), then delete that node.
- AVL minimum nodes: $N(h) = N(h-1) + N(h-2) + 1$; $1, 2, 4, 7, 12, 20$.
