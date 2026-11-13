---
title: "Recursion"
summary: "How recursive functions execute on the call stack, how to trace their output and return values, how to count calls, and how to turn them into recurrences."
order: 2
sources:
  - title: "Recursion (computer science), Wikipedia"
    url: "https://en.wikipedia.org/wiki/Recursion_(computer_science)"
  - title: "Tower of Hanoi, Wikipedia"
    url: "https://en.wikipedia.org/wiki/Tower_of_Hanoi"
  - title: "GATE Overflow: recursion tag"
    url: "https://gateoverflow.in/tag/recursion"
---

## What a recursive function is

A function is recursive when it calls itself, directly or through other functions. Every correct recursive function has two parts:

- A **base case** that returns without recursing.
- A **recursive case** that calls the function on a smaller input, so that the base case is eventually reached.

If the input does not shrink toward the base case on every path, the recursion never ends and the program eventually overflows the stack.

## How a call executes

Each call creates an **activation record** (stack frame) holding its parameters, local variables and the return address. Frames are pushed when a call starts and popped when it returns, so the most recent call always finishes first. Two consequences matter for tracing:

1. Each active call has its **own copies** of parameters and automatic locals. Changing `n` in one call does not affect `n` in the caller.
2. **Static and global variables are shared**. There is one copy, and every activation reads and writes the same storage.

The maximum number of frames alive at once is the **recursion depth**. Extra space used by a recursive function is proportional to its depth, not to its total number of calls.

## Tracing output

The position of a `printf` relative to the recursive call decides the order of output.

```c
void pre(int n)  { if (n == 0) return; printf("%d ", n); pre(n - 1); }   /* 3 2 1 */
void post(int n) { if (n == 0) return; post(n - 1); printf("%d ", n); }  /* 1 2 3 */
```

- Print before the call: output appears on the way down, in calling order.
- Print after the call: output appears on the way back up, in reverse calling order.
- Print both before and after: output is a palindrome-like pattern, down then up.

When a function makes two or more recursive calls, draw the **recursion tree**. Each node is one call; its children are the calls it makes, left to right in program order. The output order is then a traversal of that tree: a print before the calls is a preorder visit, a print between two calls is an inorder visit, and a print after the calls is a postorder visit.

## Tracing return values

For return values, work bottom-up. Compute the base cases, then build a small table $f(0), f(1), f(2), \ldots$ until you reach the asked value. This is faster and safer than expanding the full recursion tree, and it works whenever the function has no side effects.

When there are side effects (static counters, global arrays, printing), you must follow the actual execution order, frame by frame.

### Static variables inside recursion

A static local is created once. Values written on the way down are still there on the way back up. A common pattern:

```c
int g(int n) {
    static int c = 0;
    int t;
    if (n == 0) return c;
    c += n;
    t = g(n - 1);
    return t + c;
}
```

All the additions to `c` happen during the descent. By the time any frame returns, `c` already holds its final value, and every frame adds that final value. For `g(3)`, `c` ends at 6 and the result is $6 + 6 + 6 + 6 = 24$.

If the function were written `return g(n - 1) + c;` the compiler could read `c` before or after making the call, since the evaluation order of the operands of `+` is unspecified. Well-posed questions store the recursive result in a local first, as above.

## Counting calls

Let $C(n)$ be the number of calls made by $f(n)$, counting the call itself. Write a recurrence that mirrors the code. For the naive Fibonacci function:

```c
int fib(int n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}
```

$$C(0) = C(1) = 1, \quad C(n) = 1 + C(n-1) + C(n-2)$$

This gives $1, 1, 3, 5, 9, 15, 25, \ldots$ and in closed form $C(n) = 2F(n+1) - 1$, where $F$ is the Fibonacci sequence with $F(1) = F(2) = 1$. Calls grow exponentially, roughly as $\phi^n$ with $\phi \approx 1.618$.

The number of additions performed is $C(n) - (\text{number of leaves})$, and the number of leaves (calls that hit the base case) of `fib(n)` is $F(n+1)$.

## From code to recurrence

To get the running time, write $T(n)$ for the work done by a call on input $n$:

| Code shape | Recurrence | Solution |
|---|---|---|
| one call on $n - 1$, constant work | $T(n) = T(n-1) + c$ | $\Theta(n)$ |
| one call on $n - 1$, linear work | $T(n) = T(n-1) + cn$ | $\Theta(n^2)$ |
| two calls on $n - 1$ | $T(n) = 2T(n-1) + c$ | $\Theta(2^n)$ |
| one call on $n/2$ | $T(n) = T(n/2) + c$ | $\Theta(\log n)$ |
| two calls on $n/2$ | $T(n) = 2T(n/2) + c$ | $\Theta(n)$ |
| two calls on $n/2$, linear work | $T(n) = 2T(n/2) + cn$ | $\Theta(n \log n)$ |

A classic trap: `return f(n / 2) + f(n / 2);` makes two calls and costs $\Theta(n)$, while `return 2 * f(n / 2);` makes one call and costs $\Theta(\log n)$. The return value is the same.

## Classic recursive functions

- **Factorial**: $n! = n \cdot (n-1)!$, depth $n$, time $\Theta(n)$.
- **GCD (Euclid)**: $\gcd(a, b) = \gcd(b, a \bmod b)$, $\gcd(a, 0) = a$. Number of steps is $O(\log \min(a, b))$.
- **Fast power**: $x^n = (x^{n/2})^2$, times $x$ if $n$ is odd. One recursive call per halving, so $\Theta(\log n)$ multiplications.
- **Tower of Hanoi**: moving $n$ disks takes $M(n) = 2M(n-1) + 1$ moves, so $M(n) = 2^n - 1$. The largest disk moves exactly once; disk $k$ from the top moves $2^{n-k}$ times.
- **Binary representation**: `p(n / 2)` then print `n % 2` prints $n$ in binary.
- **Digit sum**: `n % 10 + f(n / 10)` with depth equal to the number of digits plus one.

## Tail recursion

A call is a **tail call** if nothing remains to be done in the caller after it returns. `return f(n - 1, acc * n);` is a tail call; `return n * f(n - 1);` is not, because the multiplication happens after the call. A compiler can turn tail recursion into a loop and reuse a single frame, which reduces space from $O(\text{depth})$ to $O(1)$. GATE asks you to recognise tail calls and to know that they can be converted to iteration.

## Mutual recursion

Two functions can call each other, as in `A` calling `B` and `B` calling `A`. Declare one prototype first so the compiler knows the second name. Trace mutual recursion exactly like ordinary recursion: expand one level at a time and evaluate bottom-up.

## Worked examples

### Worked example 1: a print between two calls

```c
void t(int n) {
    if (n == 0) return;
    t(n - 1);
    printf("%d ", n);
    t(n - 1);
}
```

`t(1)` prints `1`. `t(2)` prints the output of `t(1)`, then 2, then `t(1)` again: `1 2 1`. `t(3)` prints `1 2 1`, then 3, then `1 2 1`.

Output of `t(3)`: `1 2 1 3 1 2 1`. The number of values printed is $P(n) = 2P(n-1) + 1 = 2^n - 1$, which is 7 for $n = 3$. This is the same structure as the Tower of Hanoi, and it is an inorder walk of the recursion tree.

### Worked example 2: value and call count together

```c
int f(int n) {
    if (n <= 2) return n;
    return f(n - 1) + f(n - 3);
}
```

Find `f(6)` and the total number of calls.

Values: $f(0) = 0, f(1) = 1, f(2) = 2$, then $f(3) = f(2) + f(0) = 2$, $f(4) = f(3) + f(1) = 3$, $f(5) = f(4) + f(2) = 5$, $f(6) = f(5) + f(3) = 7$.

Calls: $C(n) = 1$ for $n \le 2$ and $C(n) = 1 + C(n-1) + C(n-3)$. So $C(3) = 3$, $C(4) = 5$, $C(5) = 7$, $C(6) = 1 + 7 + 3 = 11$.

Answer: `f(6)` returns 7 using 11 calls.

### Worked example 3: a static variable across two top-level calls

```c
int r(int n) {
    static int s = 0;
    if (n <= 0) return s;
    s = s + n;
    return r(n - 2) + n;
}
```

`main` calls `r(5)` twice and prints both results.

First call: descending, `s` becomes 5, 8, 9; `r(-1)` returns 9. Returning: `r(1) = 9 + 1 = 10`, `r(3) = 10 + 3 = 13`, `r(5) = 13 + 5 = 18`.

Second call: `s` starts at 9, not 0. Descending it becomes 14, 17, 18; `r(-1)` returns 18. Returning: $18 + 1 + 3 + 5 = 27$.

Output: 18 and 27. The second answer is the trap: a static does not reset between top-level calls.

### Worked example 4: depth of fast exponentiation

```c
int pw(int x, int n) {
    if (n == 0) return 1;
    int h = pw(x, n / 2);
    if (n % 2) return h * h * x;
    return h * h;
}
```

`pw(3, 5)` calls `pw(3, 2)`, which calls `pw(3, 1)`, which calls `pw(3, 0)`. That is 4 calls in total, all on one chain, so the depth is 4. Returning: `pw(3, 0) = 1`, `pw(3, 1) = 1 * 1 * 3 = 3`, `pw(3, 2) = 3 * 3 = 9`, `pw(3, 5) = 9 * 9 * 3 = 243`.

In general the call count is $\lfloor \log_2 n \rfloor + 2$ for $n \ge 1$, so the time is $\Theta(\log n)$. Storing the half result in `h` is what makes this logarithmic; computing `pw(x, n / 2) * pw(x, n / 2)` would bring back $\Theta(n)$.

## Common traps

- Giving each recursive call its own copy of a static variable. There is only one.
- Forgetting that a static keeps its value between separate calls from `main`.
- Reading output in calling order when the print comes after the recursive call.
- Counting only the recursive calls and forgetting the first call, or the reverse. Read what the question counts.
- Confusing depth (space) with the total number of calls (time).
- Assuming `f(n/2) + f(n/2)` is as cheap as `2 * f(n/2)`.
- Missing a base case path: `if (n == 0)` with a step of `n - 2` never terminates for odd `n`.
- Expanding by hand when a bottom-up table would be quicker and less error-prone.

## Quick revision

- Every call gets a fresh frame with its own parameters and automatic locals; statics and globals are shared.
- Print before the call gives descending order, after the call gives the reverse.
- Two calls with a print between them produce $2^n - 1$ outputs.
- Calls of naive Fibonacci: $C(n) = 1 + C(n-1) + C(n-2)$ with $C(0) = C(1) = 1$; $C(5) = 15$.
- Tower of Hanoi needs $2^n - 1$ moves.
- $T(n) = 2T(n/2) + c$ is $\Theta(n)$; $T(n) = T(n/2) + c$ is $\Theta(\log n)$; $T(n) = 2T(n-1) + c$ is $\Theta(2^n)$.
- Tail recursion can be turned into a loop with $O(1)$ extra space.
- Space used by recursion equals the maximum depth times the frame size.
