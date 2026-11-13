---
title: "Calculus"
summary: "Limits and standard limits, continuity and differentiability, mean value theorems, finding maxima and minima, and definite integration techniques for GATE."
order: 7
sources:
  - title: "Mean value theorem (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Mean_value_theorem"
  - title: "Maximum and minimum (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Maximum_and_minimum"
  - title: "L'Hopital's rule (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/L%27H%C3%B4pital%27s_rule"
  - title: "GATE Overflow: calculus questions"
    url: "https://gateoverflow.in/tag/calculus"
---

Calculus in GATE CS is mostly one-variable and mostly one-mark: evaluate a limit, decide continuity or differentiability at a point, locate a maximum, find the value promised by the mean value theorem, or compute a definite integral. The questions reward knowing a handful of standard results and a few integration tricks.

## Limits

$\lim_{x \to a} f(x) = L$ means $f(x)$ gets arbitrarily close to $L$ as $x$ approaches $a$ from either side. The limit exists iff the left limit and right limit both exist and are equal.

### Standard limits

| Limit | Value |
|---|---|
| $\lim_{x \to 0} \frac{\sin x}{x}$ | 1 |
| $\lim_{x \to 0} \frac{\tan x}{x}$ | 1 |
| $\lim_{x \to 0} \frac{1 - \cos x}{x^2}$ | $\frac{1}{2}$ |
| $\lim_{x \to 0} \frac{e^x - 1}{x}$ | 1 |
| $\lim_{x \to 0} \frac{a^x - 1}{x}$ | $\ln a$ |
| $\lim_{x \to 0} \frac{\ln(1 + x)}{x}$ | 1 |
| $\lim_{x \to 0} (1 + x)^{1/x}$ | $e$ |
| $\lim_{x \to \infty} \left(1 + \frac{a}{x}\right)^{x}$ | $e^a$ |
| $\lim_{x \to a} \frac{x^n - a^n}{x - a}$ | $n a^{n-1}$ |
| $\lim_{x \to \infty} \frac{x^k}{e^x}$, $\lim_{x \to \infty} \frac{\ln x}{x^k}$ ($k > 0$) | 0 |

### Techniques

1. **Direct substitution.** Try it first.
2. **Factor and cancel** for $\frac{0}{0}$ in rational functions.
3. **Rationalize** when square roots appear.
4. **L'Hospital's rule.** For $\frac{0}{0}$ or $\frac{\infty}{\infty}$, $\lim \frac{f}{g} = \lim \frac{f'}{g'}$ if the right side exists. Other indeterminate forms ($0 \cdot \infty$, $\infty - \infty$) must first be rewritten as a quotient.
5. **Exponent forms** $1^\infty$, $0^0$, $\infty^0$: write $y = f^g$, take $\ln y = g \ln f$, find that limit, then exponentiate. For $1^\infty$ there is a shortcut: if $f \to 1$ and $g \to \infty$, then $\lim f^g = e^{\lim g(f - 1)}$.
6. **Rational functions at infinity.** Compare degrees: numerator degree smaller gives 0, equal gives the ratio of leading coefficients, larger gives $\pm\infty$.
7. **Series.** $\sin x = x - \frac{x^3}{6} + \cdots$, $\cos x = 1 - \frac{x^2}{2} + \frac{x^4}{24} - \cdots$, $e^x = 1 + x + \frac{x^2}{2} + \cdots$, $\ln(1 + x) = x - \frac{x^2}{2} + \cdots$. Useful when L'Hospital would need many rounds.

## Continuity and differentiability

$f$ is **continuous** at $a$ if $\lim_{x \to a} f(x) = f(a)$: the limit exists and equals the value.

$f$ is **differentiable** at $a$ if
$$f'(a) = \lim_{h \to 0} \frac{f(a + h) - f(a)}{h}$$
exists, meaning the left and right derivatives exist and agree.

Differentiable implies continuous. The converse is false: $|x|$ is continuous at 0 with left derivative $-1$ and right derivative $+1$.

Checks for piecewise functions at a joining point $a$:
1. Continuity: left limit, right limit and $f(a)$ all equal.
2. Differentiability: also left and right derivatives equal. For pieces that are differentiable on each side, compare the one-sided derivative formulas at $a$.

Known examples at $x = 0$ (with $f(0) = 0$):

| $f(x)$ | Continuous | Differentiable |
|---|---|---|
| $|x|$ | yes | no |
| $x|x|$ | yes | yes, $f'(0) = 0$ |
| $x \sin(1/x)$ | yes | no |
| $x^2 \sin(1/x)$ | yes | yes, $f'(0) = 0$, but $f'$ not continuous at 0 |
| $\lfloor x \rfloor$ | no (jump) | no |
| $x^{1/3}$ | yes | no (vertical tangent) |

$|f(x)|$ can fail to be differentiable where $f$ crosses zero. $|x - a|$ type terms create corners at $a$; $(x - a)|x - a|$ does not.

## Mean value theorems

**Rolle's theorem.** If $f$ is continuous on $[a, b]$, differentiable on $(a, b)$, and $f(a) = f(b)$, then $f'(c) = 0$ for some $c \in (a, b)$.

**Lagrange's mean value theorem.** If $f$ is continuous on $[a, b]$ and differentiable on $(a, b)$, then for some $c \in (a, b)$
$$f'(c) = \frac{f(b) - f(a)}{b - a}.$$
Geometric meaning: some tangent is parallel to the chord.

**Cauchy's mean value theorem.** Under the same conditions for $f$ and $g$, with $g' \ne 0$ on $(a, b)$:
$$\frac{f'(c)}{g'(c)} = \frac{f(b) - f(a)}{g(b) - g(a)}.$$

GATE questions either ask for $c$ or ask which function fails the hypotheses. Hypothesis failures to look for: a discontinuity or a corner inside the interval (for example $|x|$ on $[-1, 1]$ fails Rolle's conditions at 0, and indeed no $c$ has $f'(c) = 0$), or unequal end values for Rolle.

Useful consequence: if $f'(x) = 0$ on an interval, $f$ is constant there; if $f' > 0$, $f$ is strictly increasing.

## Maxima and minima

### One variable

1. Find **critical points**: where $f'(x) = 0$ or $f'$ does not exist.
2. **Second derivative test:** $f''(c) < 0$ gives a local maximum, $f''(c) > 0$ a local minimum. If $f''(c) = 0$, use the first derivative sign change, or higher derivatives: if the first nonzero derivative at $c$ has even order $k$, it is an extremum (max if $f^{(k)}(c) < 0$); if odd, it is an inflection point.
3. **Absolute extrema on a closed interval $[a, b]$:** evaluate $f$ at every critical point inside and at both endpoints, then pick the largest and smallest. Endpoints are often the answer.

### Two variables

For $f(x, y)$, critical points satisfy $f_x = f_y = 0$. With $r = f_{xx}$, $s = f_{xy}$, $t = f_{yy}$ at the point:
- $rt - s^2 > 0$ and $r < 0$: local maximum.
- $rt - s^2 > 0$ and $r > 0$: local minimum.
- $rt - s^2 < 0$: saddle point.
- $rt - s^2 = 0$: test inconclusive.

## Integration

### Standard results

$\int x^n\,dx = \frac{x^{n+1}}{n+1}$ ($n \ne -1$), $\int \frac{1}{x}\,dx = \ln|x|$, $\int e^{ax}\,dx = \frac{e^{ax}}{a}$, $\int \frac{dx}{1 + x^2} = \tan^{-1} x$, $\int \frac{dx}{\sqrt{1 - x^2}} = \sin^{-1} x$.

**Integration by parts:** $\int u\,dv = uv - \int v\,du$. Choose $u$ in the order: logarithm, inverse trig, algebraic, trig, exponential.

**Substitution:** when you see a function and its derivative together, set $u$ = the inner function, and change the limits.

### Properties of definite integrals

- $\int_a^b f(x)\,dx = \int_a^b f(a + b - x)\,dx$ (the "King" property). Adding the two forms often cancels the hard part.
- $\int_{-a}^{a} f(x)\,dx = 2\int_0^a f(x)\,dx$ if $f$ is even, and $0$ if $f$ is odd.
- $\int_0^{2a} f(x)\,dx = 2\int_0^a f(x)\,dx$ if $f(2a - x) = f(x)$, and $0$ if $f(2a - x) = -f(x)$.
- For a periodic $f$ with period $T$: $\int_0^{nT} f = n\int_0^T f$.

**Wallis formula** for $\int_0^{\pi/2} \sin^n x\,dx = \int_0^{\pi/2} \cos^n x\,dx$:
$$\frac{(n-1)(n-3)\cdots}{n(n-2)\cdots} \times \begin{cases} \pi/2 & n \text{ even} \\ 1 & n \text{ odd}\end{cases}$$
For example $\int_0^{\pi/2} \sin^4 x\,dx = \frac{3 \cdot 1}{4 \cdot 2} \cdot \frac{\pi}{2} = \frac{3\pi}{16}$.

**Improper integrals:** $\int_1^\infty x^{-p}\,dx$ converges iff $p > 1$; $\int_0^1 x^{-p}\,dx$ converges iff $p < 1$.

**Leibniz rule:** $\frac{d}{dx}\int_{a(x)}^{b(x)} f(t)\,dt = f(b(x))\,b'(x) - f(a(x))\,a'(x)$.

## Worked examples

### Worked example 1: A $1^\infty$ limit

Find $\lim_{x \to \infty} \left(\frac{x + 3}{x - 1}\right)^{x}$.

1. Base $\to 1$, exponent $\to \infty$, so use $e^{\lim g(f - 1)}$.
2. $f - 1 = \frac{x + 3 - (x - 1)}{x - 1} = \frac{4}{x - 1}$.
3. $g(f - 1) = \frac{4x}{x - 1} \to 4$.

Limit $= e^4$.

### Worked example 2: Making a piecewise function differentiable

$f(x) = ax^2 + b$ for $x \le 1$ and $f(x) = 4x - 1$ for $x > 1$. Find $a, b$ so that $f$ is differentiable at $x = 1$.

1. Continuity: $a + b = 4 - 1 = 3$.
2. Derivatives: left $2a$, right $4$. Equal gives $a = 2$.
3. Then $b = 1$.

### Worked example 3: Absolute extrema with an endpoint

Find the maximum of $f(x) = x e^{-x}$ on $[0, 3]$.

1. $f'(x) = e^{-x}(1 - x)$, zero at $x = 1$.
2. $f(0) = 0$, $f(1) = e^{-1} \approx 0.368$, $f(3) = 3e^{-3} \approx 0.149$.

Maximum $= 1/e$ at $x = 1$, minimum $= 0$ at $x = 0$.

### Worked example 4: King property

Evaluate $I = \int_0^{\pi/2} \frac{\sin x}{\sin x + \cos x}\,dx$.

1. Replace $x$ by $\frac{\pi}{2} - x$: $I = \int_0^{\pi/2} \frac{\cos x}{\cos x + \sin x}\,dx$.
2. Add the two forms: $2I = \int_0^{\pi/2} 1\,dx = \frac{\pi}{2}$.

So $I = \frac{\pi}{4}$.

### Worked example 5: Mean value theorem value

Find $c$ for $f(x) = \ln x$ on $[1, e]$.

1. Chord slope: $\frac{\ln e - \ln 1}{e - 1} = \frac{1}{e - 1}$.
2. $f'(c) = \frac{1}{c} = \frac{1}{e - 1}$ gives $c = e - 1 \approx 1.718$, which lies in $(1, e)$.

## Common traps

- Applying L'Hospital to a form that is not $\frac{0}{0}$ or $\frac{\infty}{\infty}$.
- Assuming continuity implies differentiability.
- Reporting a local maximum as the absolute maximum without checking endpoints.
- For Rolle and Lagrange, ignoring a corner or discontinuity inside the interval.
- Forgetting to change the limits after a substitution.
- Writing $\lim \frac{1 - \cos x}{x^2} = 1$. It is $\frac{1}{2}$.
- Treating $\int_{-1}^{1} \frac{dx}{x^2}$ as a regular integral. It is improper at 0 and diverges.

## Quick revision

- $\frac{\sin x}{x} \to 1$, $\frac{1 - \cos x}{x^2} \to \frac{1}{2}$, $\frac{e^x - 1}{x} \to 1$, $(1 + x)^{1/x} \to e$.
- $1^\infty$: limit $= e^{\lim g(f-1)}$.
- Differentiable implies continuous, not the reverse; check left and right derivatives at joins.
- Rolle: equal end values give $f'(c) = 0$. Lagrange: $f'(c)$ equals the chord slope.
- Absolute extrema on $[a, b]$: compare critical points and endpoints.
- Two variables: $rt - s^2 > 0$ with $r < 0$ max, $r > 0$ min; $rt - s^2 < 0$ saddle.
- $\int_a^b f(x)\,dx = \int_a^b f(a + b - x)\,dx$. Odd function over $[-a, a]$ integrates to 0.
- Wallis: $\int_0^{\pi/2}\sin^n x\,dx$ via the alternating product, times $\pi/2$ only for even $n$.
- $\int_1^\infty x^{-p}$ converges iff $p > 1$.
