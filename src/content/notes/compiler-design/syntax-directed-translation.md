---
title: "Syntax-directed translation"
summary: "Synthesized and inherited attributes, S-attributed and L-attributed definitions, dependency graphs, and how to evaluate translation schemes the way GATE asks."
order: 3
sources:
  - title: "Syntax-directed translation (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Syntax-directed_translation"
  - title: "Attribute grammar (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Attribute_grammar"
  - title: "GATE Overflow: syntax-directed translation questions"
    url: "https://gateoverflow.in/tag/syntax-directed-translation"
---

## The idea

Syntax-directed translation attaches meaning to a grammar. Each grammar symbol gets attributes (a value, a type, a piece of code, a pointer to a tree node), and each production gets rules that compute those attributes. The parser drives the computation: whenever it uses a production, the attached rules run.

Two forms are used:

- A **syntax-directed definition (SDD)** gives semantic rules with no stated order of evaluation. Example: $E \to E_1 + T \quad \{E.val = E_1.val + T.val\}$.
- A **syntax-directed translation scheme (SDT)** embeds program fragments, called semantic actions, at specific positions inside the right side. Example: $E \to E_1 + T \ \{\text{print}('+')\}$. The position of the action fixes when it runs.

## Synthesized and inherited attributes

At a parse tree node $N$ labelled with nonterminal $A$:

- A **synthesized** attribute of $A$ is computed from attributes of $N$'s children and of $N$ itself. Information flows upward. Terminals have only synthesized attributes, supplied by the scanner (for example `num.lexval`).
- An **inherited** attribute of $A$ is computed from attributes of $N$'s parent, of $N$'s siblings, and of $N$ itself. Information flows downward or sideways.

Typical uses:

| Purpose | Attribute kind |
|---|---|
| Value of an expression | synthesized |
| Building a syntax tree | synthesized |
| Type passed down a declaration list | inherited |
| Left operand passed into a tail after left-recursion removal | inherited |

## Dependency graphs and evaluation order

Draw one node per attribute instance in the parse tree. Put an edge from attribute $b$ to attribute $c$ when the rule for $c$ uses $b$. Any topological order of this graph is a valid evaluation order. If the graph has a cycle, no order exists and the SDD cannot be evaluated for that tree. Testing whether an arbitrary SDD can ever produce a cycle is computationally expensive (exponential in general), which is why compilers restrict themselves to the two classes below.

## S-attributed definitions

An SDD is **S-attributed** if it uses only synthesized attributes.

- Evaluate it with any bottom-up order, such as a postorder traversal of the tree.
- It fits LR parsing perfectly: when the parser reduces by $A \to X_1 \cdots X_n$, all $X_i$ attributes are on the stack, so $A$'s attributes can be computed during the reduction.
- In an SDT form, every action sits at the right end of its production. Such an SDT is called postfix.

## L-attributed definitions

An SDD is **L-attributed** if every attribute is either synthesized, or inherited with this restriction: in a production $A \to X_1 X_2 \cdots X_n$, an inherited attribute of $X_i$ may depend only on

1. inherited attributes of the head $A$, and
2. attributes (inherited or synthesized) of $X_1, \ldots, X_{i-1}$, the symbols to the left of $X_i$, and
3. attributes of $X_i$ itself, as long as no cycle is formed.

It may not use synthesized attributes of $A$ or attributes of $X_{i+1}, \ldots, X_n$.

Facts:

- Every S-attributed SDD is L-attributed. The converse is false.
- An L-attributed SDD can be evaluated in one depth-first, left-to-right traversal of the parse tree.
- L-attributed SDDs on an LL(1) grammar can be evaluated during top-down parsing. For a bottom-up parser, inherited attributes are handled with marker nonterminals that derive $\varepsilon$.

## Where actions run in a translation scheme

For an SDT, imagine each action as an extra leaf in the parse tree at the position where it appears. Then do a preorder walk from left to right: every action runs when the walk reaches its leaf.

During a bottom-up parse, an action at the end of a production runs at the moment of the reduction. This gives a simple procedure for "what is printed" questions:

1. Build the parse tree for the input (respecting precedence and associativity from the grammar).
2. List the reductions in the order an LR parser makes them, which is a postorder of the tree.
3. Read off the action of each reduction.

An action placed in the middle of a production, like $A \to B \{\text{print } 1\} C$, runs after everything under $B$ is done and before anything under $C$ starts.

## Grammar shapes that decide precedence

When the SDT rules give operators unusual meanings, the grammar alone decides grouping:

- An operator introduced at a lower level of the grammar (closer to the terminals) has higher precedence.
- A left-recursive rule like $E \to E \# T$ makes $\#$ left associative. A right-recursive rule like $E \to T \# E$ makes it right associative.

Never apply ordinary arithmetic precedence. Draw the tree from the grammar.

## Worked examples

### Worked example 1: Value with unusual operators

```
E -> E # T     { E.v = E1.v * T.v }
E -> T         { E.v = T.v }
T -> T & F     { T.v = T1.v - F.v }
T -> F         { T.v = F.v }
F -> num       { F.v = num.lexval }
```

Evaluate `6 & 2 # 3 # 5 & 4`.

Since $\&$ is generated lower in the grammar, it binds tighter than $\#$. Both are left associative.

- $T$-groups: `6 & 2` gives $6 - 2 = 4$; `3` gives $3$; `5 & 4` gives $5 - 4 = 1$.
- $E$ is left associative over $\#$: $(4 \times 3) \times 1 = 12$.

Answer: 12. A left-to-right evaluation ignoring the grammar would give $((6 - 2) \times 3 \times 5) - 4 = 56$, a wrong distractor.

### Worked example 2: What gets printed

```
S -> X Y      { print("s") }
X -> p X      { print("1") }
X -> q        { print("2") }
Y -> Y r      { print("3") }
Y -> t        { print("4") }
```

Input: `p q t r r`.

Bottom-up reductions in order:

1. `q` reduced to $X$: prints 2.
2. `p X` reduced to $X$: prints 1. The whole $X$ subtree is now done.
3. `t` reduced to $Y$: prints 4.
4. `Y r` reduced to $Y$: prints 3.
5. `Y r` reduced to $Y$: prints 3.
6. `X Y` reduced to $S$: prints s.

Output: `21433s`. Note that $X$ is right recursive, so the innermost $X$ (built from `q`) is reduced first, while $Y$ is left recursive, so the leftmost part (`t`) is reduced first.

### Worked example 3: Checking L-attributed

For the production $A \to B C D$, which rules keep the SDD L-attributed?

| Rule | L-attributed? | Why |
|---|---|---|
| $C.i = A.i + B.s$ | Yes | Uses head inherited and left sibling |
| $D.i = B.s \times C.s$ | Yes | Both are left siblings |
| $A.s = D.s$ | Yes | Synthesized rules are always allowed |
| $B.i = C.s$ | No | $C$ is to the right of $B$ |
| $C.i = A.s$ | No | Synthesized attribute of the head |

### Worked example 4: Inherited type in a declaration

```
D -> T L        { L.in = T.type }
T -> int        { T.type = integer }
T -> float      { T.type = float }
L -> L1 , id    { L1.in = L.in; addtype(id.entry, L.in) }
L -> id         { addtype(id.entry, L.in) }
```

For `float a, b, c` the type is computed once at $T$, passed into $L$ as an inherited attribute, and then passed down the left spine of the $L$ chain. `addtype` runs three times, once for each identifier. The definition is L-attributed: $L.in$ depends on its left sibling $T$, and $L_1.in$ depends on its parent's inherited attribute. It is not S-attributed because $in$ is inherited.

### Worked example 5: Counting with attributes

```
N -> N D   { N.v = 3 * N1.v + D.v }
N -> D     { N.v = D.v }
D -> 0 | 1 | 2   { D.v = digit value }
```

This reads a base 3 numeral. For `1202`: $1 \to 3\cdot1+2 = 5 \to 3\cdot5+0 = 15 \to 3\cdot15+2 = 47$. Answer 47. If the rule were written with right recursion $N \to D N$ and the same formula, the meaning would change, because the first digit would then be combined last.

## Common traps

- Using normal arithmetic precedence instead of the grammar's structure.
- Thinking an action at the right end of a right-recursive rule runs from left to right in the input. For $X \to p X$ the innermost (rightmost) $X$ reduces first.
- Calling an SDD L-attributed when an inherited attribute uses a sibling to the right.
- Believing every L-attributed SDD is S-attributed. It is the other way round.
- Forgetting that terminals cannot have inherited attributes; their values come from the scanner.
- Assuming the dependency graph is always acyclic. If a cycle exists, there is no valid order.

## Quick revision

- Synthesized: from children. Inherited: from parent and siblings.
- S-attributed: only synthesized; bottom-up evaluation; natural for LR parsers; actions at the right end.
- L-attributed: inherited attributes depend only on the head's inherited attributes and left siblings; one left-to-right depth-first pass.
- S-attributed $\subset$ L-attributed.
- Any topological order of the dependency graph is a valid evaluation order; a cycle means no order.
- Print questions: build the tree from the grammar, list reductions in postorder, read off actions.
- Lower in the grammar means higher precedence; left recursion means left associativity.
