---
title: "Probability and statistics"
summary: "Probability rules, conditional probability and Bayes theorem, random variables, the uniform, binomial, Poisson, exponential and normal distributions, and mean, median, mode and standard deviation."
order: 8
sources:
  - title: "Bayes' theorem (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Bayes%27_theorem"
  - title: "Poisson distribution (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Poisson_distribution"
  - title: "Exponential distribution (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Exponential_distribution"
  - title: "GATE Overflow: probability questions"
    url: "https://gateoverflow.in/tag/probability"
---

Probability is one of the highest scoring parts of the mathematics section in GATE CS, typically worth 2 to 4 marks, and many of the questions are numerical answer type. Most problems combine a counting step with one of a few rules: complement, total probability, Bayes, linearity of expectation, or a standard distribution.

## Basic rules

For events $A, B$ in a sample space $S$:

- $0 \le P(A) \le 1$, $P(S) = 1$, $P(\bar A) = 1 - P(A)$.
- $P(A \cup B) = P(A) + P(B) - P(A \cap B)$.
- For equally likely outcomes: $P(A) = \frac{|A|}{|S|}$.

**Conditional probability:** $P(A \mid B) = \dfrac{P(A \cap B)}{P(B)}$ for $P(B) > 0$.

**Multiplication rule:** $P(A \cap B) = P(B)\,P(A \mid B)$.

**Independence:** $A$ and $B$ are independent iff $P(A \cap B) = P(A)P(B)$. Mutually exclusive events with nonzero probabilities are never independent, because $P(A \cap B) = 0 \ne P(A)P(B)$. Pairwise independence of three events does not imply mutual independence.

### Total probability and Bayes theorem

If $B_1, \dots, B_k$ partition the sample space,
$$P(A) = \sum_i P(B_i)\,P(A \mid B_i),$$
$$P(B_j \mid A) = \frac{P(B_j)\,P(A \mid B_j)}{\sum_i P(B_i)\,P(A \mid B_i)}.$$

A tree diagram is the cleanest way to organise these: branch first on the cause ($B_i$), then on the observation ($A$), multiply along branches, and divide the branch you want by the total of all branches that end in $A$.

## Random variables

A **discrete** random variable has a probability mass function $p(x) = P(X = x)$ with $\sum p(x) = 1$. A **continuous** one has a density $f(x) \ge 0$ with $\int f = 1$, and $P(a \le X \le b) = \int_a^b f(x)\,dx$. For continuous $X$, $P(X = a) = 0$ for every single value $a$.

The **cumulative distribution function** is $F(x) = P(X \le x)$. It is non-decreasing, goes from 0 to 1, and $f = F'$ for continuous $X$.

### Expectation and variance

$$E[X] = \sum x\,p(x) \;\text{ or }\; \int x f(x)\,dx, \qquad \operatorname{Var}(X) = E[X^2] - (E[X])^2.$$

- **Linearity:** $E[aX + bY + c] = aE[X] + bE[Y] + c$, always, even for dependent variables.
- $\operatorname{Var}(aX + b) = a^2 \operatorname{Var}(X)$.
- $\operatorname{Var}(X + Y) = \operatorname{Var}(X) + \operatorname{Var}(Y)$ when $X, Y$ are independent (more generally, uncorrelated).
- $E[XY] = E[X]E[Y]$ for independent $X, Y$.
- Standard deviation $\sigma = \sqrt{\operatorname{Var}(X)}$.

**Indicator trick:** to find the expected count of something, write the count as a sum of indicator variables $I_j$ and use $E[\sum I_j] = \sum P(\text{event } j)$. For example, the expected number of fixed points of a random permutation of $n$ elements is $n \cdot \frac{1}{n} = 1$.

## Standard distributions

| Distribution | PMF or PDF | Mean | Variance |
|---|---|---|---|
| Bernoulli($p$) | $P(1) = p$, $P(0) = 1 - p$ | $p$ | $p(1-p)$ |
| Binomial($n, p$) | $\binom{n}{k}p^k(1-p)^{n-k}$ | $np$ | $np(1-p)$ |
| Geometric($p$), trials until first success | $(1-p)^{k-1}p$, $k \ge 1$ | $1/p$ | $(1-p)/p^2$ |
| Poisson($\lambda$) | $\dfrac{e^{-\lambda}\lambda^k}{k!}$ | $\lambda$ | $\lambda$ |
| Uniform($a, b$) | $\dfrac{1}{b - a}$ on $[a, b]$ | $\dfrac{a + b}{2}$ | $\dfrac{(b - a)^2}{12}$ |
| Exponential($\lambda$) | $\lambda e^{-\lambda x}$, $x \ge 0$ | $1/\lambda$ | $1/\lambda^2$ |
| Normal($\mu, \sigma^2$) | $\dfrac{1}{\sigma\sqrt{2\pi}}e^{-(x-\mu)^2/(2\sigma^2)}$ | $\mu$ | $\sigma^2$ |

Discrete uniform on $\{1, \dots, n\}$: mean $\frac{n+1}{2}$, variance $\frac{n^2 - 1}{12}$.

### Notes on each

- **Binomial:** number of successes in $n$ independent trials with the same $p$. Given the mean and variance, $1 - p = \frac{\text{variance}}{\text{mean}}$.
- **Poisson:** counts of rare events in a fixed interval. It approximates Binomial($n, p$) with $\lambda = np$ when $n$ is large and $p$ small. The sum of independent Poisson($\lambda_1$) and Poisson($\lambda_2$) is Poisson($\lambda_1 + \lambda_2$). If the rate is $\lambda$ per unit time, the count in time $t$ is Poisson($\lambda t$).
- **Exponential:** waiting time between Poisson events. $P(X > t) = e^{-\lambda t}$. It is **memoryless**: $P(X > s + t \mid X > s) = P(X > t)$. Mean equals standard deviation. The minimum of independent exponentials with rates $\lambda_1, \lambda_2$ is exponential with rate $\lambda_1 + \lambda_2$.
- **Normal:** symmetric about $\mu$, so mean = median = mode. Standardise with $Z = \frac{X - \mu}{\sigma}$. Roughly 68%, 95% and 99.7% of the mass lies within 1, 2 and 3 standard deviations. A linear function $aX + b$ of a normal variable is normal with mean $a\mu + b$ and variance $a^2\sigma^2$. The sum of independent normals is normal.
- **Uniform:** probabilities are lengths (or areas, for two independent uniforms on a square) divided by the total.

## Descriptive statistics

For data $x_1, \dots, x_n$:

- **Mean** $\bar x = \frac{1}{n}\sum x_i$.
- **Median:** middle value after sorting; for even $n$, the average of the two middle values.
- **Mode:** most frequent value (there can be several).
- **Variance** (population) $\frac{1}{n}\sum (x_i - \bar x)^2 = \overline{x^2} - \bar x^2$. The sample variance divides by $n - 1$ instead. GATE usually means the population version unless it says "sample".
- Adding a constant to every value shifts mean, median and mode by that constant and leaves the variance unchanged. Multiplying by $c$ scales the mean by $c$ and the variance by $c^2$.
- For a moderately skewed distribution, an empirical relation is $\text{mode} \approx 3\,\text{median} - 2\,\text{mean}$.
- In a right-skewed (long right tail) data set, typically mode < median < mean; left-skewed reverses it.

## Worked examples

### Worked example 1: Bayes with three sources

Machines $M_1, M_2, M_3$ produce 50%, 30% and 20% of the items in a factory, with defect rates 1%, 2% and 3%. An item is found defective. What is the probability that $M_3$ made it?

1. Branch products: $0.5 \times 0.01 = 0.005$, $0.3 \times 0.02 = 0.006$, $0.2 \times 0.03 = 0.006$.
2. $P(\text{defective}) = 0.017$.
3. $P(M_3 \mid \text{defective}) = \frac{0.006}{0.017} \approx 0.353$.

### Worked example 2: Expected value by indicators

Each of 10 people throws their hat into a pile and takes one back at random. Each of 6 balls is then thrown independently into one of 4 bins. Find (a) the expected number of people who get their own hat, and (b) the expected number of empty bins.

(a) Each person has probability $\frac{1}{10}$ of getting their own hat, so the expected number is $10 \times \frac{1}{10} = 1$.

(b) A given bin stays empty with probability $\left(\frac{3}{4}\right)^6 \approx 0.178$, so the expected number of empty bins is $4 \times 0.178 \approx 0.712$.

Linearity works even though the events are dependent.

### Worked example 3: Poisson count

Requests arrive at a server as a Poisson process at 3 per second. What is the probability of at least 2 requests in a given second?

$$P(X \ge 2) = 1 - P(0) - P(1) = 1 - e^{-3}(1 + 3) = 1 - 4e^{-3} \approx 1 - 0.199 = 0.801.$$

### Worked example 4: Continuous density

$X$ has density $f(x) = c(1 - x^2)$ on $[-1, 1]$. Find $c$ and $P(X > 0.5)$.

1. $\int_{-1}^{1} (1 - x^2)\,dx = 2 - \frac{2}{3} = \frac{4}{3}$, so $c = \frac{3}{4}$.
2. $P(X > 0.5) = \frac{3}{4}\int_{0.5}^{1}(1 - x^2)\,dx = \frac{3}{4}\left[(1 - 0.5) - \frac{1 - 0.125}{3}\right] = \frac{3}{4}\left(0.5 - 0.2917\right) \approx 0.156$.

### Worked example 5: Geometric waiting

A fair die is rolled until a 6 appears. What is the probability that more than 3 rolls are needed, and what is the expected number of rolls?

1. More than 3 rolls means the first 3 are not 6: $\left(\frac{5}{6}\right)^3 = \frac{125}{216} \approx 0.579$.
2. Geometric with $p = \frac{1}{6}$: $E = \frac{1}{p} = 6$.

## Common traps

- Treating mutually exclusive as independent.
- Dividing by the wrong total in Bayes: the denominator is the probability of the observed evidence, summed over all causes.
- Writing $\operatorname{Var}(aX + b) = a\operatorname{Var}(X) + b$. The constant disappears and $a$ is squared.
- Adding variances of dependent variables.
- Forgetting memorylessness: for an exponential lifetime, the time already survived does not matter.
- Using the Poisson rate for the wrong interval length. Scale $\lambda$ to the interval asked.
- In "at least one" questions, multiplying the success probabilities instead of using $1 - P(\text{none})$.
- Confusing population and sample variance.

## Quick revision

- $P(A \cup B) = P(A) + P(B) - P(A \cap B)$; $P(A \mid B) = P(A \cap B)/P(B)$.
- Bayes: prior times likelihood, divided by the sum over all causes.
- $E$ is always linear; variances add only for independent variables.
- $\operatorname{Var}(X) = E[X^2] - E[X]^2$; $\operatorname{Var}(aX + b) = a^2\operatorname{Var}(X)$.
- Binomial: $np$, $np(1-p)$. Poisson: mean = variance = $\lambda$.
- Uniform$[a, b]$: $\frac{a+b}{2}$, $\frac{(b-a)^2}{12}$.
- Exponential: mean $1/\lambda$, $P(X > t) = e^{-\lambda t}$, memoryless.
- Normal: $aX + b \sim N(a\mu + b, a^2\sigma^2)$; mean = median = mode.
- Geometric: mean $1/p$; $P(X > k) = (1-p)^k$.
- Indicator variables turn expected counts into sums of probabilities.
