---
title: "Lexical analysis"
summary: "How a scanner turns characters into tokens, how to count tokens in GATE questions, and how regular expressions and DFAs drive the scanner."
order: 1
sources:
  - title: "Lexical analysis (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Lexical_analysis"
  - title: "Maximal munch (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Maximal_munch"
  - title: "GATE Overflow: lexical analysis questions"
    url: "https://gateoverflow.in/tag/lexical-analysis"
---

## Where the scanner sits

A compiler front end runs in this order: lexical analysis, syntax analysis, semantic analysis, then intermediate code generation. The lexical analyzer (also called the scanner or lexer) is the only phase that reads the raw source text. Everything after it sees a stream of tokens.

The scanner usually works on demand. The parser calls a function such as `getNextToken()`, and the scanner reads just enough characters to produce one token. This is why lexical analysis and parsing are often described as one pass even though they are separate phases.

The jobs of the scanner:

- Group characters into lexemes and return a token for each lexeme.
- Throw away whitespace (spaces, tabs, newlines) and comments.
- Enter identifiers and literals into the symbol table, or return a pointer to an existing entry, as the token's attribute.
- Keep track of line numbers so later phases can report errors with a location.
- Report lexical errors such as an illegal character or an unterminated string or comment.

What the scanner does **not** do: it does not check that brackets balance, that a variable was declared, or that types match. Those are syntax and semantic checks.

## Token, lexeme, pattern

These three words are tested directly in GATE.

| Term | Meaning | Example |
|---|---|---|
| Token | The category name passed to the parser | `id`, `num`, `relop`, `if` |
| Lexeme | The actual characters matched in the source | `count`, `42`, `<=`, `if` |
| Pattern | The rule (usually a regular expression) describing the lexemes of a token | `letter (letter or digit)*` |

A token is usually a pair: the token name plus an attribute value. For `count` the pair is (`id`, pointer to the symbol table entry for `count`). For `<=` the pair might be (`relop`, `LE`). The parser only looks at the token name; later phases use the attribute.

Keywords are lexemes that match the identifier pattern but are reserved. The common way to handle them is to pre-load the keywords into the symbol table, scan the word with the identifier DFA, and then look it up. If the entry is marked as a keyword, the scanner returns the keyword token instead of `id`.

## Regular expressions, NFA and DFA

Every token class in a real language is a regular language, so it can be described by a regular expression and recognized by a finite automaton. The usual construction:

1. Write a regular expression for each token.
2. Convert each expression to an NFA (Thompson construction).
3. Join the NFAs with a new start state and $\varepsilon$-moves.
4. Convert to a DFA with the subset construction, then minimize.

Tools like Lex and Flex do exactly this. The generated scanner simulates one DFA. A DFA state that contains accepting states of several NFAs is labelled with the token that was listed first in the specification.

Two facts worth remembering:

- Simulating a DFA costs $O(n)$ time for $n$ input characters, regardless of the size of the expression.
- The subset construction can produce up to $2^k$ states from a $k$-state NFA, but scanners for real languages stay small.

## Two rules that resolve ambiguity

When several patterns can match at the current position, the scanner applies two rules:

1. **Longest match (maximal munch).** Choose the longest prefix that matches any pattern. The scanner keeps reading as long as the DFA can continue, remembers the last accepting position, and backs up to it when it gets stuck.
2. **Priority.** If two patterns match the same longest prefix, choose the one listed first. This is why keyword rules are written before the identifier rule in a Lex file.

Maximal munch is greedy and never looks back to see whether a shorter choice would let the rest of the input parse. In C, `x = y---z;` scans as `x`, `=`, `y`, `--`, `-`, `z`, `;`. The scanner takes `--` first because it is the longest operator starting at that position. It never tries `-` followed by `--`.

The amount of lookahead needed can exceed one character. In Fortran-like languages with insignificant blanks, the scanner might have to read far ahead to tell `DO 5 I = 1.25` (an assignment) from `DO 5 I = 1,25` (a loop). In C, the scanner needs one extra character to separate `<` from `<=` and `<<`.

## Counting tokens in C code

Token counting is the most common GATE question on this topic. Use these conventions unless the question says otherwise:

- Each keyword, identifier, constant, string literal, operator and punctuation symbol is one token.
- A whole string literal, including its quotes and any characters inside, is one token. Operators written inside a string are not separate tokens.
- A character constant such as `'a'` is one token.
- Multi-character operators are one token each: `<=`, `>=`, `==`, `!=`, `++`, `--`, `+=`, `->`, `&&`, `<<`.
- Comments and whitespace produce no tokens.
- A unary minus in front of a number is a separate token from the number. `-2` is two tokens.
- Preprocessor lines such as `#include <stdio.h>` are handled before scanning. GATE questions usually avoid them or say how to treat them.
- Format specifiers like `%d` inside a string are part of the string literal.

A reliable way to count is to rewrite the code with one token per box, left to right, and only then count the boxes.

## Lexical errors

Errors the scanner can detect:

- A character that cannot begin any token, for example `@` or a stray backquote in C source outside a string.
- An unterminated string literal or an unterminated block comment.
- A numeric literal that does not fit the pattern, such as a malformed exponent, in languages whose scanner checks this.
- An identifier that is too long, if the language sets a limit.

Errors the scanner cannot detect, because each piece is a valid token on its own:

- `int 9x;` scans as `int`, `9`, `x`, `;`. The problem is a syntax error.
- `fi (a == b)` scans `fi` as an identifier. The parser or semantic analyzer will complain.
- Missing semicolons, unbalanced brackets, undeclared variables and type mismatches.

Common recovery strategy: panic mode, where the scanner deletes characters until it can form a valid token again.

## Input buffering

Reading one character at a time from disk is slow, so scanners use a buffer. The classic scheme uses two halves of size $N$ each. Two pointers mark the current lexeme: `lexemeBegin` and `forward`. When `forward` runs off the end of one half, the other half is reloaded. Sentinels (a special end-of-buffer character at the end of each half) let the inner loop check only one condition per character instead of two. The scheme fails only if a single lexeme plus the lookahead is longer than $N$.

## Worked examples

### Worked example 1: Counting tokens in a loop header

Count the tokens in:

```c
while(i<=n){sum+=a[i++];}
```

Split it up:

| Position | Lexeme | Kind |
|---|---|---|
| 1 | `while` | keyword |
| 2 | `(` | punctuation |
| 3 | `i` | identifier |
| 4 | `<=` | operator |
| 5 | `n` | identifier |
| 6 | `)` | punctuation |
| 7 | `{` | punctuation |
| 8 | `sum` | identifier |
| 9 | `+=` | operator |
| 10 | `a` | identifier |
| 11 | `[` | punctuation |
| 12 | `i` | identifier |
| 13 | `++` | operator |
| 14 | `]` | punctuation |
| 15 | `;` | punctuation |
| 16 | `}` | punctuation |

Total: 16 tokens. The traps here are `<=`, `+=` and `++`. Counting them as two characters each would give 19.

### Worked example 2: Strings and comments

Count the tokens in:

```c
printf("x=%d\n", x /*val*/ ) ;
```

The tokens are `printf`, `(`, the string literal `"x=%d\n"`, `,`, `x`, `)`, `;`. The comment disappears and the `=` and `%` inside the string are not tokens. The escape `\n` is still inside the literal.

Total: 7 tokens.

### Worked example 3: Maximal munch with custom tokens

Suppose a language has three tokens, listed in this priority order:

```
T1 : (ab)+
T2 : a b*
T3 : b+
```

The scanner uses longest match, and on a tie picks the token listed first. Scan the input `abbabab`.

- At position 0, `T1` can match `ab` (it cannot take `abb` because after `ab` it needs another `a`). `T2` can match `abb`. `T3` cannot start with `a`. Longest is `abb`, so the first token is `T2`.
- At position 3 the rest is `abab`. `T1` matches all four characters. `T2` matches only `ab`. So the second token is `T1`.

Output: `T2 T1`.

Now scan `ababbab`. At position 0, `T1` matches `abab` (length 4) and `T2` matches `ab` (length 2), so `T1(abab)`. Next comes `b`, only `T3` matches, giving `T3(b)`. The rest is `ab`: both `T1` and `T2` match two characters, so the tie goes to `T1`. Output: `T1 T3 T1`.

### Worked example 4: Which phase catches it

For each fragment of C, decide the first phase that reports an error.

| Fragment | Phase | Reason |
|---|---|---|
| `char *s = "abc;` | Lexical | String never closes |
| `int a = 5 @ 3;` | Lexical | `@` cannot start any C token |
| `x = (y + 2;` | Syntax | Every token is fine, brackets do not match |
| `int x; x = "hi" * 3;` | Semantic | Type mismatch |
| `y = z + 1;` with `z` undeclared | Semantic | Symbol table check |

## Common traps

- Counting a string literal as several tokens because it contains operators or spaces. It is always one token.
- Counting comments. They produce no tokens, even when they contain code.
- Splitting `>=`, `==`, `++`, `->` into two tokens. Under maximal munch they are one token.
- Forgetting that `-5` in an expression is two tokens: the operator and the constant.
- Thinking the scanner detects undeclared variables. It only sees one token at a time.
- Assuming maximal munch tries alternatives. `a+++b` is always `a ++ + b`, even if another split would make more sense.
- Mixing up lexeme and token. The lexeme is the text; the token is the category.

## Quick revision

- Scanner output: a sequence of (token name, attribute) pairs. Whitespace and comments are dropped.
- Tokens are defined by regular expressions and recognized by a DFA built through NFA and subset construction.
- Ambiguity rules: longest match first, then earliest listed pattern.
- Keywords are usually recognized as identifiers and then looked up in a reserved word table.
- Lexical errors: illegal characters, unterminated strings or comments, malformed literals.
- Not lexical errors: missing semicolons, unbalanced brackets, undeclared names, type errors.
- Token counting: one token per keyword, identifier, literal, operator or punctuation symbol; whole string literal is one token; multi-character operators are one token.
- Two-buffer input with sentinels reduces the work per character to one test.
