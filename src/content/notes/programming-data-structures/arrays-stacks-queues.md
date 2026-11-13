---
title: "Arrays, stacks and queues"
summary: "Array address calculation, stack and queue operations and implementations, expression conversion and evaluation, stack permutations and circular queues."
order: 3
sources:
  - title: "Stack (abstract data type), Wikipedia"
    url: "https://en.wikipedia.org/wiki/Stack_(abstract_data_type)"
  - title: "Queue (abstract data type), Wikipedia"
    url: "https://en.wikipedia.org/wiki/Queue_(abstract_data_type)"
  - title: "Shunting yard algorithm, Wikipedia"
    url: "https://en.wikipedia.org/wiki/Shunting_yard_algorithm"
  - title: "GATE Overflow: stack tag"
    url: "https://gateoverflow.in/tag/stack"
---

## Arrays

An array stores elements of one type in consecutive memory. Access by index costs $O(1)$ because the address is computed directly from the base address $B$ and the element size $w$.

### One-dimensional

For an array declared with index range $[L .. U]$:

$$\text{addr}(A[i]) = B + (i - L) \cdot w$$

The number of elements is $U - L + 1$.

### Two-dimensional

For $A[L_1 .. U_1][L_2 .. U_2]$ with $R = U_1 - L_1 + 1$ rows and $C = U_2 - L_2 + 1$ columns:

$$\text{row-major: } B + \big((i - L_1) \cdot C + (j - L_2)\big) \cdot w$$

$$\text{column-major: } B + \big((j - L_2) \cdot R + (i - L_1)\big) \cdot w$$

C uses row-major order. Fortran and MATLAB use column-major. The pattern generalises: in row-major order the last index varies fastest.

### Triangular and banded matrices

A lower-triangular $n \times n$ matrix has $\frac{n(n+1)}{2}$ non-zero entries. Stored row by row with 1-based indices, element $(i, j)$ with $j \le i$ sits at position

$$\frac{i(i-1)}{2} + j$$

counting from 1, because rows $1 .. i-1$ hold $1 + 2 + \cdots + (i - 1)$ entries. Stored column by column, the offset is instead the sum of the lengths of the earlier columns.

### Costs

| Operation | Unsorted array | Sorted array |
|---|---|---|
| Access by index | $O(1)$ | $O(1)$ |
| Search | $O(n)$ | $O(\log n)$ |
| Insert at a position | $O(n)$ shifting | $O(n)$ |
| Delete at a position | $O(n)$ shifting | $O(n)$ |

## Stacks

A stack is a last-in, first-out (LIFO) collection. Its operations are `push`, `pop`, `top` (peek) and `isEmpty`, each $O(1)$.

### Array implementation

```c
#define MAX 100
int st[MAX];
int top = -1;                 /* empty stack */

void push(int x) {
    if (top == MAX - 1) { /* overflow */ return; }
    st[++top] = x;
}
int pop(void) {
    if (top == -1) { /* underflow */ return -1; }
    return st[top--];
}
```

`top` is the index of the current top element. Pushing on a full stack is overflow; popping an empty one is underflow. A linked-list stack pushes and pops at the head, also in $O(1)$, with no fixed capacity.

Two stacks can share one array of size $n$ by growing from opposite ends; overflow happens only when the two tops meet, so all $n$ cells are usable.

### Applications

- Function calls and recursion (activation records).
- Balanced parentheses: push each opening bracket, pop on each closing bracket and check that the types match; the string is balanced if no mismatch occurs and the stack ends empty.
- Evaluating postfix and prefix expressions.
- Converting infix to postfix.
- Undo, backtracking, and depth-first search.

## Expression notation

- **Infix**: operator between operands, `a + b`. Needs precedence, associativity and parentheses.
- **Postfix** (reverse Polish): operator after operands, `a b +`. No parentheses needed.
- **Prefix** (Polish): operator before operands, `+ a b`.

The operand order is the same in all three forms. Only the operator positions change.

### Evaluating postfix

Scan left to right. Push each operand. On an operator, pop the top value as the **right** operand, pop again for the **left** operand, compute, and push the result. At the end exactly one value remains.

To evaluate **prefix**, scan right to left. On an operator, the first pop is the **left** operand.

### Infix to postfix with an operator stack

Scan left to right:

1. Operand: append to output.
2. `(`: push.
3. `)`: pop and output until `(`; discard the `(`.
4. Operator `op`: while the stack top is an operator that has higher precedence than `op`, or equal precedence and `op` is left associative, pop it to output. Then push `op`.
5. At the end, pop everything to output.

Exponentiation `^` is right associative, so an incoming `^` does not pop a `^` already on the stack. That one rule is behind many wrong answers.

The maximum stack size reached during conversion is a favourite NAT question. Track the stack after every symbol; count `(` if the question says parentheses are pushed.

## Stack permutations

Push $1, 2, \ldots, n$ in order, popping whenever you like. The number of different output orders is the Catalan number

$$C_n = \frac{1}{n+1}\binom{2n}{n}$$

which is $1, 2, 5, 14, 42$ for $n = 1 .. 5$. To check one sequence, simulate: before outputting $x$, push every number up to $x$ that has not been pushed; then $x$ must be on top. A sequence is impossible exactly when it contains a pattern $a < b < c$ appearing in the order $c, a, b$.

## Queues

A queue is first-in, first-out (FIFO): `enqueue` at the rear, `dequeue` from the front, both $O(1)$.

### Linear array queue

With `front` and `rear` only moving forward, slots freed by dequeues are never reused, so the queue can report full while the array is mostly empty. The circular queue fixes this.

### Circular queue

Indices wrap with `% n`. One common convention: `front` is the index of the first element, `rear` is the index where the next element goes.

```c
#define N 8
int q[N];
int front = 0, rear = 0;      /* empty when front == rear */

int isFull(void)  { return (rear + 1) % N == front; }
void enqueue(int x) { if (!isFull()) { q[rear] = x; rear = (rear + 1) % N; } }
int dequeue(void) { int x = q[front]; front = (front + 1) % N; return x; }
```

- Empty: `front == rear`.
- Full: `(rear + 1) % N == front`. One slot stays unused, so capacity is $N - 1$.
- Number of elements: `(rear - front + N) % N`.

If a question uses a different convention (for example `rear` pointing at the last element, or a separate count), recompute these conditions from the definition given.

### Variants

- **Deque**: insert and delete at both ends. An input-restricted deque allows insertion at one end only; an output-restricted deque allows deletion at one end only.
- **Priority queue**: dequeue returns the highest-priority element. A binary heap gives $O(\log n)$ insert and delete.

### Simulating one structure with another

- **Queue with two stacks** `in` and `out`: enqueue pushes onto `in`. Dequeue pops from `out`; if `out` is empty, first move every element of `in` to `out`. Each element is pushed twice and popped twice in its lifetime, so a sequence of $m$ operations costs $O(m)$: amortised $O(1)$ per operation, worst case $O(n)$ for a single dequeue.
- **Stack with two queues**: one of push or pop must cost $O(n)$, because you have to rotate all elements through the second queue to bring the newest one to the front.

## Worked examples

### Worked example 1: column-major address

An array `A[1..6][1..8]` of 2-byte elements is stored in column-major order from address 2000. Find the address of `A[4][5]`.

There are $R = 6$ rows. Columns 1 to 4 come before column 5, giving $4 \times 6 = 24$ elements. Within column 5, rows 1 to 3 come before row 4: 3 more. Offset $= 27$ elements $= 54$ bytes. Address: $2000 + 54 = 2054$.

In row-major order the same element would be at $2000 + \big((4-1) \cdot 8 + (5-1)\big) \cdot 2 = 2000 + 56 = 2056$.

### Worked example 2: infix to postfix

Convert `(a + b) * c - d / (e - f) ^ g` with `^` highest and right associative.

| Symbol | Action | Stack (bottom to top) | Output |
|---|---|---|---|
| `(` | push | `(` | |
| `a` | output | `(` | `a` |
| `+` | push | `( +` | `a` |
| `b` | output | `( +` | `a b` |
| `)` | pop to `(` | empty | `a b +` |
| `*` | push | `*` | `a b +` |
| `c` | output | `*` | `a b + c` |
| `-` | pop `*`, push | `-` | `a b + c *` |
| `d` | output | `-` | `a b + c * d` |
| `/` | push | `- /` | `a b + c * d` |
| `(` | push | `- / (` | `a b + c * d` |
| `e` | output | `- / (` | `a b + c * d e` |
| `-` | push | `- / ( -` | `a b + c * d e` |
| `f` | output | `- / ( -` | `a b + c * d e f` |
| `)` | pop to `(` | `- /` | `a b + c * d e f -` |
| `^` | push | `- / ^` | `a b + c * d e f -` |
| `g` | output | `- / ^` | `a b + c * d e f - g` |
| end | pop `^`, `/`, `-` | empty | `a b + c * d e f - g ^ / -` |

Result: `a b + c * d e f - g ^ / -`. The stack peaked at 4 symbols (`- / ( -`).

### Worked example 3: evaluating postfix and prefix

Postfix `9 2 4 * + 6 3 / -`: `2 4 *` gives 8, `9 8 +` gives 17, `6 3 /` gives 2, `17 2 -` gives 15.

Prefix `- * 3 + 4 2 / 8 2`, scanned right to left: push 2, 8; `/` pops 8 (left) and 2, pushes 4. Push 2, 4; `+` pops 4 and 2, pushes 6. Push 3; `*` pops 3 and 6, pushes 18. `-` pops 18 (left) and 4, pushes 14. Value: 14.

### Worked example 4: circular queue trace

Array size $N = 5$ with the convention above, starting from `front = rear = 0`. Operations: enqueue 10, 20, 30; dequeue; enqueue 40, 50. Is the queue full, and how many elements does it hold?

- Enqueue 10, 20, 30 into indices 0, 1, 2: `front = 0`, `rear = 3`.
- Dequeue removes 10: `front = 1`.
- Enqueue 40 into index 3: `rear = 4`. Enqueue 50 into index 4: `rear` wraps to 0.

Check: `(rear + 1) % 5 = 1 = front`, so the queue is full. Count: $(0 - 1 + 5) \bmod 5 = 4$, which is the capacity $N - 1$.

## Common traps

- Popping postfix operands in the wrong order. For `a b -`, the first pop is `b`.
- Treating `^` as left associative during conversion.
- Using row-major formulas on a column-major question, or forgetting to subtract lower bounds.
- Forgetting that a circular queue with this convention holds only $N - 1$ elements.
- Counting $n!$ stack permutations instead of the Catalan number.
- Assuming a two-stack queue has $O(1)$ worst-case dequeue. It is amortised $O(1)$.

## Quick revision

- Row-major: $B + ((i - L_1) C + (j - L_2)) w$. Column-major: $B + ((j - L_2) R + (i - L_1)) w$.
- Lower-triangular, row-wise, 1-based: position $\frac{i(i-1)}{2} + j$.
- Stack: LIFO, push and pop $O(1)$; `top = -1` means empty.
- Postfix evaluation pops right operand first; prefix evaluation scans right to left.
- Infix to postfix: pop while the stack top has higher precedence, or equal precedence with a left-associative incoming operator.
- Stack permutations of $n$ items: $C_n$; $C_4 = 14$, $C_5 = 42$.
- Circular queue: empty `front == rear`, full `(rear + 1) % N == front`, size `(rear - front + N) % N`.
- Queue from two stacks: amortised $O(1)$ per operation.
