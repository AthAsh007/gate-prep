---
title: "Pumping lemma and closure properties"
summary: "The pumping lemmas for regular and context-free languages, how to use them correctly, and the closure properties of every language class from regular to recursively enumerable."
order: 3
sources:
  - title: "Wikipedia: Pumping lemma for regular languages"
    url: "https://en.wikipedia.org/wiki/Pumping_lemma_for_regular_languages"
  - title: "Wikipedia: Pumping lemma for context-free languages"
    url: "https://en.wikipedia.org/wiki/Pumping_lemma_for_context-free_languages"
  - title: "NPTEL courses"
    url: "https://nptel.ac.in/courses"
---

## What the pumping lemmas are for

Both pumping lemmas describe a property that **every** language in a class has. They are used in one direction only: to show that a given language is **not** in the class. A language that passes the pumping test may still be outside the class, so the lemma can never prove that a language is regular or context-free.

In GATE the lemma itself is rarely asked as a proof. What is asked is the reasoning behind it ("which split is possible", "why does this choice of string work") and, much more often, closure properties, which are the fast route to the same conclusions.

## Pumping lemma for regular languages

**Statement.** If $L$ is regular, there is a number $p \ge 1$ (the pumping length) such that every $s \in L$ with $|s| \ge p$ can be written as $s = xyz$ where

1. $|xy| \le p$
2. $|y| \ge 1$
3. $xy^iz \in L$ for every $i \ge 0$.

**Where it comes from.** Take a DFA for $L$ with $p$ states. Reading the first $p$ symbols of $s$ visits $p + 1$ states, so some state repeats. The part of the input read between the two visits is a loop, $y$. Going round the loop any number of times, including zero, leads to the same state, so acceptance does not change.

### Using it as a game

To prove $L$ is not regular, play against an opponent:

1. The opponent picks $p$. You must handle every $p$, so keep it symbolic.
2. **You** pick a string $s \in L$ with $|s| \ge p$. Choose it so that the first $p$ symbols are boring, for example all the same letter.
3. The opponent picks any split $xyz$ obeying conditions 1 and 2. You must handle **every** such split.
4. **You** pick $i$ so that $xy^iz \notin L$.

The most common mistake is to choose the split yourself. You do not get to; you only know $|xy| \le p$ and $|y| \ge 1$.

Pumping **down** ($i = 0$) is often the useful choice, for example when the language says "more $a$'s than $b$'s".

## Pumping lemma for context-free languages

**Statement.** If $L$ is context-free, there is $p \ge 1$ such that every $s \in L$ with $|s| \ge p$ can be written $s = uvxyz$ where

1. $|vxy| \le p$
2. $|vy| \ge 1$
3. $uv^ixy^iz \in L$ for every $i \ge 0$.

**Where it comes from.** A long enough string has a tall parse tree, and on a long root-to-leaf path some variable repeats. The subtree under the upper copy can be substituted for the lower one (pump up) or the lower one for the upper (pump down). $v$ and $y$ are what the upper copy adds on the left and right.

**The key consequence.** The window $vxy$ has length at most $p$, so if your string has blocks of length $p$, the window touches at most two **adjacent** blocks. Pumping can change at most two adjacent counts. This is why $a^nb^nc^n$ (three counts must move together) and $a^nb^mc^nd^m$ (the $a$ and $c$ blocks are not adjacent) are not CFL.

### Ogden's lemma

A stronger version lets you mark at least $p$ positions and guarantees that $v$ and $y$ together contain a marked position. It is needed for a few languages where plain pumping fails, such as some inherently ambiguous examples. GATE does not ask it directly; just know it exists.

## Closure properties

This table is the single most useful thing to memorize for this section. Y means closed, N means not closed in general.

| Operation | Regular | DCFL | CFL | Recursive | RE |
|---|---|---|---|---|---|
| Union | Y | N | Y | Y | Y |
| Intersection | Y | N | N | Y | Y |
| Complement | Y | Y | N | Y | N |
| Concatenation | Y | N | Y | Y | Y |
| Kleene star | Y | N | Y | Y | Y |
| Reversal | Y | N | Y | Y | Y |
| Homomorphism | Y | N | Y | N | Y |
| Inverse homomorphism | Y | Y | Y | Y | Y |
| Intersection with a regular language | Y | Y | Y | Y | Y |
| Difference $L_1 - L_2$ | Y | N | N | Y | N |

Notes on the less obvious entries:

- **CFL, intersection:** $\{a^nb^nc^m\} \cap \{a^mb^nc^n\} = \{a^nb^nc^n\}$.
- **CFL, complement:** follows from intersection, because closure under union and complement would give intersection by De Morgan.
- **DCFL, complement:** a DPDA can be made to always read its whole input, then accepting and rejecting states can be swapped.
- **DCFL, union and intersection:** fail for the same reason as CFL intersection. $\{a^nb^nc^m\}$ and $\{a^mb^nc^n\}$ are both DCFL.
- **Recursive, homomorphism:** an erasing homomorphism can hide the "witness" part of a string, turning a decidable language into an RE-complete one.
- **RE, complement:** if both $L$ and $\overline{L}$ are RE, then $L$ is recursive. The halting language is RE and not recursive, so its complement is not RE.
- **Infinite union** is not a closure property of any of these classes: every language is a union of singletons.
- **Subsets:** none of the classes is closed under taking subsets. $\Sigma^*$ is regular and contains every language.

### Mixed-class rules

These come up in "which is necessarily..." questions. Let $R$ be regular, $L$ a CFL, $D$ a DCFL:

- $L \cap R$, $L - R$, $L \cup R$ are CFL. $R - L$ need not be.
- $D \cap R$ and $\overline{D}$ are DCFL.
- RE minus recursive is RE; recursive minus RE need not be RE.

## Proving non-membership with closure

The pattern: assume $L$ is in the class, apply operations the class is closed under, and land on a language known to be outside the class. Contradiction.

Typical moves:

- Intersect with a regular language such as $a^*b^*$ to strip away unwanted strings.
- Complement (only for classes closed under it).
- Apply a homomorphism to rename or delete symbols.
- Use the fact that a unary CFL is regular.

## Worked examples

### Worked example 1: Pumping down

Show $L = \{a^i b^j : i > j\}$ is not regular.

Let $p$ be the pumping length. Choose $s = a^{p+1}b^p \in L$. Any split with $|xy| \le p$ puts $y$ inside the leading $a$'s, so $y = a^k$ with $k \ge 1$. Pump down ($i = 0$): $xz = a^{p+1-k}b^p$. Since $k \ge 1$, the number of $a$'s is at most $p$, so it is no longer greater than the number of $b$'s. $xz \notin L$. So $L$ is not regular.

Pumping up would not work here: more $a$'s keeps the string in $L$.

### Worked example 2: Growing gaps

Show $L = \{a^{n^2} : n \ge 0\}$ is not regular.

Choose $s = a^{p^2}$. Any split has $1 \le |y| \le p$. Pumping once more gives length $p^2 + |y| \le p^2 + p < p^2 + 2p + 1 = (p+1)^2$. Also $p^2 + |y| > p^2$. So the length lies strictly between two consecutive squares and $xy^2z \notin L$.

The same idea works for any language whose lengths have unbounded gaps (powers of 2, primes, factorials). Since unary CFLs are regular, these languages are not even context-free.

### Worked example 3: Closure instead of pumping

Show $L = \{w \in \{a,b\}^* : n_a(w) = n_b(w)\}$ is not regular.

If $L$ were regular, then $L \cap a^*b^*$ would be regular (closure under intersection). But $L \cap a^*b^* = \{a^nb^n\}$, which is not regular. So $L$ is not regular.

Same trick for $\{ww^R\}$: intersect with $a^*bba^*$ to get $\{a^nbba^n\}$.

### Worked example 4: CFL pumping on a copy language

Show $L = \{ww : w \in \{a,b\}^*\}$ is not context-free.

First simplify with closure: $L \cap a^*b^*a^*b^* = \{a^nb^ma^nb^m\}$. If $L$ were CFL, so would this be. Now pump $s = a^pb^pa^pb^p$.

The window $vxy$ has length at most $p$, so it lies inside one block or spans two adjacent blocks.

- Inside one block: pumping changes one count only, so the two $a$-blocks (or the two $b$-blocks) become unequal.
- Across two adjacent blocks (for example the first $a$-block and the first $b$-block): it changes those counts but not the matching blocks in the second half.

In every case $uv^2xy^2z$ is not of the form $a^nb^ma^nb^m$. So $L$ is not CFL.

### Worked example 5: Passing the test is not enough

Let $L = \{a^ib^jc^k : i \ge 1, j = k\} \cup \{b^jc^k : j, k \ge 0\}$.

It satisfies the regular pumping lemma with $p = 1$:

- If $s$ starts with $a$, take $y$ = the first $a$. Pumping up keeps $i \ge 1$ with $j = k$. Pumping down either keeps $i \ge 1$ or removes the only $a$, leaving $b^jc^j$, which is in the second part.
- If $s$ has no $a$, it is $b^jc^k$; pump its first symbol and it stays in $b^*c^*$.

But $L$ is not regular: $L \cap ab^*c^* = \{ab^jc^j\}$, which is not regular. This is the standard reason the lemma is only a one-way test.

## Common traps

- **Choosing the split.** You choose $s$ and $i$; the opponent chooses $p$ and the split.
- **Strings shorter than $p$.** The lemma says nothing about them; your $s$ must have length at least $p$.
- **CFL window misuse.** $vxy$ can straddle two adjacent blocks; handle that case, not only "inside one block".
- **Subset reasoning.** "$L \subseteq R$ and $R$ regular, so $L$ is regular" is false.
- **CFL intersection.** Closed with a regular language, not with another CFL.
- **DCFL complement.** DCFLs are closed under complement even though CFLs are not.
- **Homomorphism and recursive languages.** Recursive is the one column in the table that fails homomorphism while RE passes it.
- **$L^*$ regular does not mean $L$ regular:** $\{a^p : p \text{ prime}\}^* = \{\epsilon\} \cup \{a^n : n \ge 2\}$.

## Quick revision

- Regular pumping: $|xy| \le p$, $|y| \ge 1$, $xy^iz \in L$ for all $i \ge 0$.
- CFL pumping: $|vxy| \le p$, $|vy| \ge 1$, $uv^ixy^iz \in L$ for all $i \ge 0$.
- Both are necessary conditions only; they prove non-membership.
- Pick strings whose first $p$ symbols are uniform; try $i = 0$ and $i = 2$.
- CFL window touches at most two adjacent blocks.
- Regular: closed under everything in the table.
- CFL: not closed under intersection, complement, difference.
- DCFL: closed under complement, inverse homomorphism and intersection with regular; little else.
- Recursive: closed under all Boolean operations, not homomorphism.
- RE: closed under union, intersection, concatenation, star, homomorphism; not complement.
- Fastest non-regularity proof is often intersecting with $a^*b^*$ to reach $a^nb^n$.
