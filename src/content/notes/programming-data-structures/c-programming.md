---
title: "Programming in C"
summary: "C semantics that GATE tests through output-tracing questions: types, operators, pointers and arrays, strings, storage classes, scope and parameter passing."
order: 1
sources:
  - title: "C (programming language), Wikipedia"
    url: "https://en.wikipedia.org/wiki/C_(programming_language)"
  - title: "Operators in C and C++, Wikipedia"
    url: "https://en.wikipedia.org/wiki/Operators_in_C_and_C%2B%2B"
  - title: "GATE Overflow: c-programming tag"
    url: "https://gateoverflow.in/tag/c-programming"
---

## What GATE actually asks

Almost every C question in GATE is a short program followed by "what does it print?". The program is usually under 20 lines and tests one or two rules: pointer arithmetic, a static variable, an operator precedence surprise, a fall-through `switch`, or a function that receives a copy instead of the original. The way to score here is to trace slowly, write down every variable after every statement, and know the handful of rules below exactly.

Assume the usual sizes unless the question says otherwise: `char` is 1 byte, `int` is 4 bytes, and pointers are 4 or 8 bytes depending on the stated machine. GATE states the pointer size when it matters.

## Types and integer arithmetic

### Integer division and remainder

Since C99, integer division truncates toward zero, and the remainder takes the sign of the dividend:

- $7 / 2 = 3$, $-7 / 2 = -3$
- $7 \% 2 = 1$, $-7 \% 2 = -1$, $7 \% -2 = 1$

The identity $(a / b) \cdot b + a \% b = a$ always holds.

### Implicit conversions

In an expression mixing types, the narrower operand is converted to the wider one. `char` and `short` are promoted to `int` before arithmetic. When an `int` meets an `unsigned int`, the `int` is converted to unsigned, so `-1 < 1u` is false because $-1$ becomes $2^{32} - 1$. Assigning a `double` to an `int` truncates the fractional part.

Character arithmetic works on codes: `'A' + 2` is the code of `'C'`, and `c - '0'` turns a digit character into its value.

## Operators and precedence

A short ordering covers almost every question, from tightest to loosest:

1. Postfix: `()` `[]` `->` `.` `x++` `x--`
2. Unary (right to left): `++x` `--x` `*` `&` `!` `~` unary `-` `sizeof` casts
3. `*` `/` `%`
4. `+` `-`
5. `<<` `>>`
6. `<` `<=` `>` `>=`
7. `==` `!=`
8. `&`, then `^`, then `|`
9. `&&`, then `||`
10. `?:` (right to left)
11. Assignment operators (right to left)
12. Comma

Consequences worth memorising:

- `*p++` means `*(p++)`: read the current element, then advance the pointer.
- `(*p)++` increments the pointed-to value.
- `++*p` increments the value; `*++p` advances then reads.
- `a + b << 1` is `(a + b) << 1` because shifts are looser than addition.
- `x & 1 == 0` is `x & (1 == 0)`, which is always 0. Bitwise operators are looser than comparisons.
- `a = b == c` assigns the result of the comparison (0 or 1).

### Short-circuit evaluation

`&&` stops as soon as the left side is false, and `||` stops as soon as the left side is true. Side effects on the right are then skipped. Both operators yield 0 or 1, never the operand value.

### Unsequenced modifications

`i = i++ + 1;` or `printf("%d %d", i++, i++);` modify the same object twice without an intervening sequence point. That is undefined behaviour, and GATE avoids it in modern papers. The order in which the operands of `+` or the arguments of a function are evaluated is also unspecified, so `f() + g()` where both touch a shared static variable may give different answers on different compilers. If you see such code, check whether the answer depends on the order; if it does, the question is badly posed.

## Pointers and arrays

### The core identity

For an array `a` and integer `i`:

$$a[i] \equiv *(a + i) \equiv *(i + a) \equiv i[a]$$

In most expressions an array name decays to a pointer to its first element. It does not decay in three places: as the operand of `sizeof`, as the operand of `&`, and when a string literal initialises a `char` array.

So with `int a[10];`, `sizeof(a)` is 40, `a` and `&a` have the same address but different types (`int *` and `int (*)[10]`), and `&a + 1` jumps past the whole array.

### Pointer arithmetic

Adding $k$ to a pointer to type `T` moves it by $k \cdot \text{sizeof}(T)$ bytes. Subtracting two pointers into the same array gives the number of elements between them, not bytes. A pointer may point one past the last element, but forming a pointer before the first element is undefined.

### Function parameters

A parameter written as `int b[]` or `int b[10]` is really `int *b`. Inside the function `sizeof(b)` is the pointer size, and the function cannot learn the array length. This is why C functions on arrays always take the length as a second argument.

### Two-dimensional arrays

`int m[3][4]` is an array of 3 rows, each an array of 4 ints, stored row by row. `m[i]` is a row (decays to `int *`), and `m + i` has type `int (*)[4]`, so adding 1 skips a whole row.

```c
int m[3][4];
int (*rp)[4] = m;      /* pointer to a row of 4 ints */
int *ap[3];            /* array of 3 pointers to int */
/* m[i][j] == *(*(m + i) + j) == *(m[i] + j) */
```

Reading declarations: start at the name, read `[]` and `()` to the right first, then `*` to the left, and let parentheses override. `int (*f)(int)` is a pointer to a function; `int *f(int)` is a function returning a pointer.

## Strings

A string is a `char` array ending in `'\0'`. `strlen` counts characters before the terminator; `sizeof` on an array counts every byte including the terminator.

```c
char s[] = "GATE";     /* array of 5 chars, writable */
char *t = "GATE";      /* pointer to a string literal, do not modify */
/* sizeof(s) == 5, strlen(s) == 4, sizeof(t) == pointer size */
```

Writing a `'\0'` into the middle of a string shortens it for every function that reads it. Modifying a string literal through `t` is undefined.

## Storage classes, scope and lifetime

| Class | Where declared | Lifetime | Default value | Linkage |
|---|---|---|---|---|
| `auto` | inside a block | until block exits | indeterminate | none |
| `register` | inside a block | until block exits | indeterminate | none, and `&` is not allowed |
| `static` local | inside a block | whole program | 0 | none |
| `static` global | file scope | whole program | 0 | internal (this file only) |
| global (no keyword) | file scope | whole program | 0 | external |
| `extern` | anywhere | refers to a definition elsewhere | | external |

Two facts drive most questions:

1. A `static` local is initialised once, before `main` starts, and keeps its value across calls and across recursive activations. There is exactly one copy shared by every activation.
2. Scope is lexical. An inner declaration hides an outer one with the same name until the inner block ends. A function body always sees the global, never a local of its caller.

## Parameter passing

C has only call by value. A function receives copies of its arguments. To let a function change a caller's variable you pass its address and write through the pointer.

```c
void swap1(int x, int y) { int t = x; x = y; y = t; }      /* no effect on caller */
void swap2(int *x, int *y) { int t = *x; *x = *y; *y = t; } /* swaps caller's values */
```

Passing a pointer is still call by value: the function gets a copy of the address. Changing the pointer itself (`p = NULL;`) does not affect the caller's pointer; changing `*p` does.

GATE sometimes uses pseudo-code with call by reference, call by value-result or call by name. Under call by reference, the parameter is an alias, so every write is seen immediately by the caller. Under value-result, the parameter is a copy that is written back when the function returns. Under call by name, the argument expression is re-evaluated each time the parameter is used.

## Control flow details

- `switch` jumps to the matching `case` and then falls through every following label until a `break`. `default` can sit anywhere and is also fallen into.
- `for (init; cond; step)` checks `cond` before each iteration; `do { } while (cond);` runs the body at least once.
- `if (x = 0)` assigns 0 and tests false. `if (x == 0)` is the comparison.
- `break` leaves only the innermost loop or `switch`; `continue` skips to the next iteration of the innermost loop (in a `for` loop, the step still runs).

## Macros

The preprocessor substitutes text before compilation. `#define SQ(x) x * x` turns `SQ(a + 1)` into `a + 1 * a + 1`. Arguments with side effects get evaluated as many times as they appear in the body. The safe form brackets each argument and the whole body: `#define SQ(x) ((x) * (x))`.

## Worked examples

### Worked example 1: pointers walking backward

```c
int a[] = {5, 10, 15, 20, 25};
int *p = a + 4;
int s = 0;
while (p > a) {
    s += *p - *(p - 1);
    p -= 2;
}
printf("%d\n", s);
```

- `p` at index 4: `s = 25 - 20 = 5`, then `p` moves to index 2.
- `p` at index 2: `s = 5 + (15 - 10) = 10`, then `p` moves to index 0.
- `p > a` is now false.

Output: 10. Note that `p` stops exactly at `a`; the loop never forms a pointer before the array.

### Worked example 2: value versus address

```c
int a = 1, b = 2;
swap1(a, b);
printf("%d %d ", a, b);
swap2(&a, &b);
printf("%d %d\n", a, b);
```

`swap1` exchanges its private copies and discards them, so the first print shows `1 2`. `swap2` writes through the addresses, so the second print shows `2 1`. Output: `1 2 2 1`.

### Worked example 3: a static local hiding a global

```c
int k = 2;
int g(int n) {
    static int k = 1;
    k = k * n;
    return k;
}
int main(void) {
    int r = g(2);
    r += g(3);
    r += k;
    printf("%d\n", r);
    return 0;
}
```

Inside `g`, the name `k` refers to the static local, which starts at 1. `g(2)` makes it 2 and returns 2. `g(3)` makes it 6 and returns 6. In `main`, `k` is the global, still 2. So $r = 2 + 6 + 2 = 10$.

The calls are in separate statements on purpose. If the code were `g(2) + g(3)` in one expression, the order of the two calls would be unspecified and the result would depend on the compiler.

### Worked example 4: scanning a string

```c
char s[] = "GATE2027";
char *p = s;
int n = 0;
while (*p) {
    if (*p >= '0' && *p <= '9')
        n = n * 10 + (*p - '0');
    p++;
}
printf("%d %d\n", n, (int)(p - s));
```

Letters are skipped. The digits build $n = 2$, then $20$, then $202$, then $2027$. The loop ends when `p` reaches the terminator at index 8, and `p - s` is the element count 8. Output: `2027 8`.

## Common traps

- Reading `*p++` as "increment the value". It advances the pointer.
- Forgetting that shifts and bitwise operators bind more loosely than arithmetic and comparisons.
- Assuming `sizeof` on an array parameter gives the array size. It gives the pointer size.
- Treating a static local as if it restarts on every call, or as if each recursive call has its own copy.
- Forgetting fall-through in `switch`, especially into `default`.
- Expanding a macro as if it were a function call with evaluated arguments.
- Comparing signed and unsigned values without converting the signed one.
- Assuming `char *t = "abc"; t[0] = 'x';` is legal. It is undefined.
- Using `=` where `==` was meant inside a condition.

## Quick revision

- $a[i] = *(a + i)$; an array name decays to a pointer except under `sizeof`, `&` and string initialisation.
- Pointer plus $k$ moves $k$ elements; pointer minus pointer counts elements.
- `int (*p)[n]` is a pointer to an array; `int *p[n]` is an array of pointers.
- Integer division truncates toward zero; the remainder has the sign of the dividend.
- Precedence: postfix, unary, `* / %`, `+ -`, shifts, relational, equality, `& ^ |`, `&& ||`, `?:`, assignment, comma.
- `&&` and `||` short-circuit and return 0 or 1.
- Static locals: one copy, initialised once, default 0. Automatic locals: fresh each call, indeterminate if uninitialised.
- C passes everything by value; pass an address to modify the caller's variable.
- `strlen` excludes the terminator; `sizeof` on a `char` array includes it.
- Macros are text substitution; bracket every argument and the whole body.
