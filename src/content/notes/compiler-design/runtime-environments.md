---
title: "Runtime environments"
summary: "Memory layout, activation records, static and dynamic scoping, access links and parameter passing methods, with traced examples."
order: 4
sources:
  - title: "Call stack (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Call_stack"
  - title: "Scope (computer science) (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Scope_(computer_science)"
  - title: "Evaluation strategy (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Evaluation_strategy"
---

## What the runtime environment covers

The compiler has to decide where every name lives while the program runs, how procedures are called and how they return, and how arguments reach the callee. These decisions form the runtime environment. GATE questions here are mostly about tracing programs: what is printed under a given scoping rule or parameter passing method.

## Memory layout of a running program

A typical layout from low to high addresses:

| Area | Contents | Size known at |
|---|---|---|
| Code | Machine instructions | Compile time |
| Static data | Globals, `static` locals, constants | Compile time |
| Heap | Objects from `malloc` or `new` | Runtime, grows toward higher addresses |
| Free space | Unused gap | |
| Stack | Activation records | Runtime, grows toward lower addresses |

The stack and heap grow toward each other so that either can use the free space.

### Three allocation strategies

- **Static allocation.** Every name gets a fixed address at compile time. Early Fortran worked this way. It cannot support recursion, because a second activation of the same procedure would overwrite the first one's locals. It also cannot support data whose size is only known at runtime.
- **Stack allocation.** Each call pushes an activation record and each return pops it. This supports recursion. Locals die when the call returns, so a procedure must not return a pointer to its own local variable.
- **Heap allocation.** Storage is allocated and freed in any order. Needed for data that outlives the call that created it, for closures, and in languages where activations themselves can outlive their callers. Freed by the programmer or by a garbage collector.

## Activation records

Every call creates an activation record (also called a stack frame). A typical record contains:

| Field | Purpose |
|---|---|
| Actual parameters | Values or addresses passed by the caller (often in registers instead) |
| Returned value | Space for the result (often a register instead) |
| Control link | Pointer to the caller's activation record (dynamic link) |
| Access link | Pointer to the record of the lexically enclosing procedure (static link) |
| Saved machine status | Return address and saved registers |
| Local data | The procedure's local variables |
| Temporaries | Values produced during expression evaluation |

Items whose sizes are known early (links, status) are placed near the middle so they can be found at fixed offsets from the frame pointer. Variable-length data goes at the end.

The caller and callee split the work of the calling sequence. Usually the caller evaluates arguments, stores the return address and old frame pointer, and jumps. The callee saves registers and initializes locals. On return the callee stores the result, restores registers and the frame pointer, and jumps back.

### Activation trees

Each node of the activation tree is one call. Children of a node are the calls it makes, in order from left to right. The calls currently live are exactly the nodes on the path from the root to the current node, and that path is what the control stack holds.

For `fib(n) = n < 2 ? n : fib(n-1) + fib(n-2)`, the call `fib(3)` makes 5 activations: `fib(3)`, `fib(2)`, `fib(1)`, `fib(0)`, and another `fib(1)`. The maximum stack depth is 3 (`fib(3)`, `fib(2)`, `fib(1)`).

## Scoping

A **scope rule** decides which declaration a use of a name refers to.

- **Static (lexical) scoping**: look in the current block, then the block that textually encloses it, and so on out to the globals. Decided by the program text alone. C, Java, Pascal and most modern languages use it.
- **Dynamic scoping**: look in the current activation, then in its caller, then in the caller's caller, following the call chain at runtime. Early Lisp, some shells and Perl's `local` behave like this.

Under static scoping with nested procedures, a procedure reaches non-local names through **access links**. If a procedure at nesting depth $n_p$ refers to a name declared at depth $n_q$, the generated code follows $n_p - n_q$ access links. A **display** is an alternative: an array where entry $d$ points to the most recent activation at depth $d$, so any non-local is reached in one step.

Under dynamic scoping the control links are enough, since the chain of callers is the search path.

## Parameter passing

| Method | What is passed | Effect of assigning to the formal |
|---|---|---|
| Call by value | Value of the actual | Changes only the local copy |
| Call by reference | Address of the actual | Changes the actual immediately |
| Call by value-result (copy-restore) | Value in, copied back on return | Actual changes only at return |
| Call by name | The unevaluated expression (a thunk) | Every use re-evaluates the actual in the caller's environment |

Differences only show up with aliasing (the same variable passed twice, or a global that the callee also touches directly) or with actuals like `a[i]` whose meaning depends on other variables.

For value-result, the order of copying back matters when the same variable is passed twice. GATE questions state the order; if not, assume left to right.

## Worked examples

### Worked example 1: Static versus dynamic scoping

```
int x = 1;
void p() { x = x + 10; }
void q() { int x = 5; p(); print(x); }
void main() { q(); print(x); }
```

**Static scoping.** The `x` inside `p` is the global, because `p` is defined at the top level. `q` calls `p`, which sets the global to 11. `q` prints its own local `x`, which is 5. Then `main` prints the global, 11. Output: `5 11`.

**Dynamic scoping.** When `p` runs, the most recent active declaration of `x` is the one in `q` (the caller). So `p` changes `q`'s local to 15. `q` prints 15. Back in `main`, the only `x` is the global, still 1. Output: `15 1`.

### Worked example 2: Four parameter passing methods

```
void f(int x, int y) { x = x + 1; y = y + x; }
void main() { int a = 2; f(a, a); print(a); }
```

- **Value:** `x` and `y` are copies. `a` stays 2. Prints 2.
- **Reference:** `x`, `y` and `a` are the same cell. `x = x + 1` makes it 3. `y = y + x` makes it $3 + 3 = 6$. Prints 6.
- **Value-result, copy back left to right:** `x = 3`, then `y = 2 + 3 = 5`. On return `a = x = 3`, then `a = y = 5`. Prints 5. With right to left copy back it would print 3.
- **Name:** every use of `x` or `y` means `a`, so it behaves like reference here. Prints 6.

### Worked example 3: Call by name breaks swap

```
void swap(int x, int y) { int t = x; x = y; y = t; }
i = 1; a[1] = 3; a[3] = 7;
swap(i, a[i]);
```

Under call by name, `y` is the expression `a[i]`, evaluated afresh at each use.

1. `t = x` means `t = i`, so `t = 1`.
2. `x = y` means `i = a[i]` = `a[1]` = 3. Now `i = 3`.
3. `y = t` means `a[i] = 1`, but `i` is now 3, so `a[3] = 1`.

Final state: `i = 3`, `a[1] = 3`, `a[3] = 1`. The intended swap of `i` and `a[1]` did not happen. Under call by reference the addresses are fixed at the call, so `i` and `a[1]` would swap correctly.

### Worked example 4: Access links with nesting

```
procedure A          (depth 1)
  int v;
  procedure B        (depth 2)
    procedure C      (depth 3)
      ... uses v ...
```

Inside `C`, the name `v` is declared in `A`. The code follows $3 - 1 = 2$ access links: from `C`'s record to `B`'s, then to `A`'s, then reads `v` at its fixed offset. With a display, the code reads `display[1]` and goes straight to `A`'s record.

## Common traps

- Mixing up control link and access link. The control link points to the caller; the access link points to the lexically enclosing procedure.
- Under dynamic scoping, a parameter or local of a caller is a binding that a callee can see. Students often forget that function parameters count as declarations.
- Assuming static allocation can handle recursion. It cannot.
- Forgetting that value-result copies back only at return, so the actual is unchanged during the call.
- Assuming call by name equals call by reference. They differ when the actual is something like `a[i]` and `i` changes inside the call.
- Returning the address of a local variable from a stack-allocated function gives a dangling pointer.

## Quick revision

- Layout: code, static, heap (grows up), free, stack (grows down).
- Static allocation: no recursion, no dynamic sizes. Stack: recursion. Heap: data that outlives the call.
- Activation record: parameters, return value, control link, access link, saved status, locals, temporaries.
- Static scope follows program text and access links; dynamic scope follows the call chain via control links.
- Non-local access at depth difference $d$ needs $d$ access link hops, or one display lookup.
- Value copies in, reference aliases, value-result copies in and out, name re-evaluates the expression at each use.
- Aliasing (same actual twice) is what makes the methods produce different outputs.
