---
title: "Number representation and arithmetic"
summary: "Base conversion, unsigned and signed integers (sign-magnitude, 1's and 2's complement), overflow, Booth multiplication, BCD, fixed point and IEEE 754 floating point, with GATE-style conversions worked step by step."
order: 4
sources:
  - title: "Two's complement (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Two%27s_complement"
  - title: "IEEE 754 (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/IEEE_754"
  - title: "Single-precision floating-point format (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Single-precision_floating-point_format"
  - title: "GATE Overflow: number representation questions"
    url: "https://gateoverflow.in/tag/number-representation"
---

## Why this topic scores

Questions here are mechanical, so they are free marks if you are careful: decode a 2's complement or IEEE 754 pattern, encode a decimal into IEEE 754 hex, decide whether an addition overflows, convert between bases, or reason about the range and precision of a made-up floating-point format. Most errors come from off-by-one mistakes in the exponent or from forgetting the hidden bit.

## Positional number systems

In base $r$, the digits $d_{n-1}\ldots d_1d_0.d_{-1}d_{-2}\ldots$ mean $\sum d_i r^i$. Digits must be less than $r$, which is often the key constraint in "find the base" questions.

### Conversions

- **Base $r$ to decimal**: expand the sum.
- **Decimal integer to base $r$**: divide by $r$ repeatedly, collect remainders from last to first.
- **Decimal fraction to base $r$**: multiply the fraction by $r$ repeatedly, collect the integer parts from first to last.
- **Binary, octal, hexadecimal**: group bits from the binary point outward, in threes for octal and fours for hex.

A decimal fraction has a finite binary expansion only if its denominator (in lowest terms) is a power of 2. So $0.75$ and $0.6875$ are exact, but $0.1$ is $0.000110011\ldots_2$ forever.

## Unsigned integers

$n$ bits represent $0$ to $2^n - 1$. Unsigned addition overflows when there is a carry out of the MSB. Unsigned subtraction $A - B$ done as $A + \overline{B} + 1$ produces carry out 1 when $A \ge B$ and 0 when a borrow occurs.

## Signed integers

| Representation | Range for $n$ bits | Zeros | Negate $x$ |
|---|---|---|---|
| Sign-magnitude | $-(2^{n-1}-1)$ to $2^{n-1}-1$ | two | flip the sign bit |
| 1's complement | $-(2^{n-1}-1)$ to $2^{n-1}-1$ | two | invert all bits |
| 2's complement | $-2^{n-1}$ to $2^{n-1}-1$ | one | invert all bits, add 1 |
| Excess-$K$ (biased) | $-K$ to $2^n - 1 - K$ | one | stored value is $x + K$ |

### 2's complement in detail

The MSB has weight $-2^{n-1}$ and every other bit has its usual positive weight:

$$x = -b_{n-1}2^{n-1} + \sum_{i=0}^{n-2} b_i 2^i$$

That formula is the fastest way to decode. Example: $11011011 = -128 + 64 + 16 + 8 + 2 + 1 = -37$.

- **Sign extension**: to widen a number, copy the sign bit into the new high positions. $-37$ in 16 bits is FFDB.
- **Negating the most negative number**: $-2^{n-1}$ has no positive counterpart, and negating it returns the same pattern.
- **Shortcut for negation**: copy bits from the right up to and including the first 1, then invert the rest.

### Overflow

Adding two $n$-bit 2's complement numbers overflows exactly when both operands have the same sign and the result has the other sign. Equivalent hardware test: overflow $= C_n \oplus C_{n-1}$ (carry out of the MSB XOR carry into the MSB). Adding numbers of opposite signs never overflows. A carry out of the MSB by itself means nothing for signed arithmetic.

In 1's complement addition, a carry out of the MSB is added back into the LSB (end-around carry).

### Booth's multiplication (radix 2)

Booth's algorithm scans the multiplier from the right with an extra bit $Q_{-1} = 0$. For each pair $(Q_i, Q_{i-1})$:

| Pair | Action |
|---|---|
| 0 0 or 1 1 | shift only |
| 1 0 | subtract multiplicand (start of a run of 1s) |
| 0 1 | add multiplicand (end of a run of 1s) |

The number of additions and subtractions equals the number of bit changes in the multiplier with the appended 0. Booth is efficient for multipliers with long runs of 1s and worst for alternating patterns such as 0101...01 with $Q_{-1} = 0$, where every pair needs an operation.

## BCD and other codes

**BCD (8421)** stores each decimal digit in 4 bits; codes 1010 to 1111 are unused. BCD addition: add the digits in binary; if the 4-bit result exceeds 9 or produces a carry, add 0110 and pass a carry to the next digit.

**Excess-3** is BCD plus 3. It is self-complementing: inverting all bits gives the 9's complement of the digit.

**Gray code**: consecutive values differ in one bit. Binary to Gray is $G = B \oplus (B \gg 1)$.

## Fixed-point numbers

A fixed-point format puts the binary point at a fixed position. With $m$ integer bits and $f$ fraction bits in 2's complement, the stored integer is divided by $2^f$. Range is $-2^{m-1}$ to $2^{m-1} - 2^{-f}$, and every step is exactly $2^{-f}$. Example: in 4.4 format, $1101.0110$ is the integer $-42$, so the value is $-42/16 = -2.625$.

## IEEE 754 floating point

A floating-point number is $(-1)^s \times 1.f \times 2^{e - \text{bias}}$ for normalized values.

| Format | Sign | Exponent | Fraction | Bias |
|---|---|---|---|---|
| Single (32-bit) | 1 | 8 | 23 | 127 |
| Double (64-bit) | 1 | 11 | 52 | 1023 |

### Special exponent fields

| Exponent field | Fraction | Meaning |
|---|---|---|
| all 0s | 0 | $\pm 0$ |
| all 0s | nonzero | subnormal: $(-1)^s \times 0.f \times 2^{1 - \text{bias}}$ |
| 1 to max $-1$ | any | normalized: $(-1)^s \times 1.f \times 2^{e - \text{bias}}$ |
| all 1s | 0 | $\pm\infty$ |
| all 1s | nonzero | NaN |

Note the subnormal exponent is $1 - \text{bias}$ (that is $-126$ for single), not $0 - \text{bias}$. This makes the subnormals continue smoothly below the smallest normal number.

### Key single-precision values

- Largest finite: $(2 - 2^{-23}) \times 2^{127} \approx 3.4 \times 10^{38}$.
- Smallest positive normalized: $2^{-126} \approx 1.18 \times 10^{-38}$.
- Smallest positive subnormal: $2^{-23} \times 2^{-126} = 2^{-149} \approx 1.4 \times 10^{-45}$.
- Gap between 1 and the next representable number: $2^{-23}$.
- Integers are exact up to $2^{24}$; $2^{24} + 1$ is the first that cannot be stored.

+0 and -0 have different bit patterns but compare equal. NaN compares unequal to everything, including itself.

### Encoding a decimal number

1. Write the magnitude in binary.
2. Normalize to $1.xxx \times 2^E$.
3. Biased exponent $= E + \text{bias}$, in binary.
4. Fraction = the bits after the leading 1, padded with zeros (or rounded to nearest even if longer).
5. Concatenate sign, exponent and fraction; group into hex.

### Custom formats

GATE often defines a small format, for example 1 sign bit, $k$ exponent bits with bias $2^{k-1} - 1$, and $p$ fraction bits. Use the same rules: the largest exponent field is reserved, the largest finite value is $(2 - 2^{-p}) \times 2^{(2^k - 2) - \text{bias}}$, and the smallest normal is $2^{1 - \text{bias}}$. Read the question carefully: some custom formats do not reserve the all-ones exponent, and some have no hidden bit.

## Worked examples

### Worked example 1: Base conversion

Convert $243.25$ to hexadecimal and $11010.101_2$ to decimal.

**Solution.** $243 = 15 \times 16 + 3$, so the integer part is F3. $0.25 \times 16 = 4.0$, so the fraction is .4. Answer: $\text{F3.4}_{16}$.

$11010.101_2 = 16 + 8 + 2 + 0.5 + 0.125 = 26.625$.

### Worked example 2: Overflow check

In 8-bit 2's complement, compute 5A + 4B (hex) and decide whether it overflows.

**Solution.** $5A = 90$ and $4B = 75$, both positive. Binary sum: $01011010 + 01001011 = 10100101$ = A5. The result's MSB is 1, so it reads as $-91$. Two positives gave a negative: overflow. Carry into the MSB is 1 and carry out is 0, and $1 \oplus 0 = 1$ agrees. The true sum 165 exceeds 127.

### Worked example 3: Booth recoding

How many additions and subtractions does radix-2 Booth perform for the multiplier $00111100$?

**Solution.** Append 0: $00111100\,0$. Scanning pairs from the right, the only changes are at bit 2 (pair $(1,0)$: subtract) and bit 6 (pair $(0,1)$: add). So 2 operations. The recoding is $+2^6 - 2^2 = 64 - 4 = 60$, which matches $00111100 = 60$. A plain shift-and-add multiplier would do 4 additions (one per 1 bit).

### Worked example 4: Encode 12.375 in single precision

**Solution.** $12 = 1100_2$ and $0.375 = 0.011_2$, so $12.375 = 1100.011_2 = 1.100011_2 \times 2^3$.

- Sign: 0.
- Exponent: $3 + 127 = 130 = 10000010_2$.
- Fraction: $10001100000000000000000$.

Bits: $0\,10000010\,10001100000000000000000$. Grouped in fours: $0100\,0001\,0100\,0110\,0000\,0000\,0000\,0000$ = 41460000 (hex).

### Worked example 5: Decode BE200000

**Solution.** Binary: $1011\,1110\,0010\,0000\ldots$

- Sign: 1.
- Exponent: $01111100 = 124$, actual $124 - 127 = -3$.
- Fraction: $0100\ldots$, significand $1.01_2 = 1.25$.

Value: $-1.25 \times 2^{-3} = -0.15625$.

### Worked example 6: A small format

A format has 1 sign bit, 5 exponent bits (bias 15) and 4 fraction bits, with IEEE rules. Find the largest finite value and the smallest positive subnormal.

**Solution.** Largest usable exponent field is $11110 = 30$, so the exponent is $30 - 15 = 15$. Largest significand $1.1111_2 = 2 - 2^{-4} = 1.9375$. Largest value $= 1.9375 \times 2^{15} = 63488$.

Smallest subnormal: fraction $0001$, value $2^{-4} \times 2^{1-15} = 2^{-18}$.

## Common traps

- Using the bias wrongly: actual exponent $=$ field $-$ bias, not field $+$ bias.
- Forgetting the hidden 1 for normalized numbers, or adding it for subnormals.
- Using $-127$ instead of $-126$ as the subnormal exponent in single precision.
- Grouping hex digits from the left when the bit count is not a multiple of 4. Pad on the left of the integer part (and the right of the fraction part).
- Treating carry out as signed overflow. Use the sign rule or $C_n \oplus C_{n-1}$.
- Writing the 2's complement range as symmetric. It is $-2^{n-1}$ to $2^{n-1} - 1$.
- In BCD addition, forgetting to correct a digit that produced a carry even though its 4-bit result looks valid (for example $9 + 9 = 1\,0010$ needs the $+6$ correction).
- Assuming 0.1 is stored exactly in binary floating point.

## Quick revision

- 2's complement value: $-b_{n-1}2^{n-1} + \sum b_i2^i$; range $[-2^{n-1}, 2^{n-1}-1]$.
- 1's complement and sign-magnitude: range $\pm(2^{n-1}-1)$, two zeros.
- Signed overflow: same-sign operands, different-sign result; $= C_n \oplus C_{n-1}$.
- Sign extension: copy the sign bit.
- Booth: one operation per bit change in multiplier with appended 0.
- BCD add: if digit sum > 9 or carries, add 0110.
- IEEE single: 1/8/23, bias 127. Double: 1/11/52, bias 1023.
- Normal: $1.f \times 2^{e-127}$. Subnormal: $0.f \times 2^{-126}$.
- Exponent all 1s: infinity (fraction 0) or NaN.
- Single: max $\approx 3.4 \times 10^{38}$, min normal $2^{-126}$, min subnormal $2^{-149}$.
