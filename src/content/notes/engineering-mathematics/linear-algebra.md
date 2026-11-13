---
title: "Linear algebra"
summary: "Matrix types, determinants, rank, solving linear systems, eigenvalues and eigenvectors with their shortcut properties, Cayley-Hamilton, and LU decomposition."
order: 6
sources:
  - title: "Eigenvalues and eigenvectors (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Eigenvalues_and_eigenvectors"
  - title: "LU decomposition (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/LU_decomposition"
  - title: "MIT OpenCourseWare 18.06 Linear Algebra"
    url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/"
  - title: "GATE Overflow: eigenvalue questions"
    url: "https://gateoverflow.in/tag/eigen-value"
---

Linear algebra questions in GATE CS are mostly computational: an eigenvalue or determinant to find, a rank to determine, a system to classify as having zero, one or infinitely many solutions. Most can be solved in under two minutes if you use the shortcut properties instead of expanding characteristic polynomials by brute force.

## Matrix basics

### Special matrices

| Type | Definition | Useful fact |
|---|---|---|
| Symmetric | $A^T = A$ | real eigenvalues, orthogonal eigenvectors |
| Skew-symmetric | $A^T = -A$ | diagonal is zero; odd order implies $\det A = 0$; eigenvalues are 0 or purely imaginary |
| Orthogonal | $A^T A = I$ | $\det A = \pm 1$, eigenvalues have $|\lambda| = 1$ |
| Idempotent | $A^2 = A$ | eigenvalues are 0 or 1; rank equals trace |
| Nilpotent | $A^k = 0$ for some $k$ | all eigenvalues are 0 |
| Involutory | $A^2 = I$ | eigenvalues are $\pm 1$ |
| Triangular | zero above or below the diagonal | eigenvalues and determinant come from the diagonal |

Every square matrix is the sum of a symmetric and a skew-symmetric matrix: $A = \frac{A + A^T}{2} + \frac{A - A^T}{2}$.

### Determinants

Properties for $n \times n$ matrices:
- $\det(AB) = \det A \det B$, $\det(A^T) = \det A$, $\det(A^{-1}) = 1/\det A$.
- $\det(kA) = k^n \det A$. Watch the exponent.
- Swapping two rows changes the sign. Adding a multiple of one row to another changes nothing. Multiplying one row by $k$ multiplies the determinant by $k$.
- Two equal or proportional rows give $\det = 0$.
- $\det(\operatorname{adj} A) = (\det A)^{n-1}$, and $A \operatorname{adj}(A) = (\det A) I$.

### Rank

The **rank** of $A$ is the number of linearly independent rows (equal to the number of independent columns), which is the number of nonzero rows in its row echelon form.

- $\operatorname{rank}(A) \le \min(m, n)$ for an $m \times n$ matrix.
- $\operatorname{rank}(AB) \le \min(\operatorname{rank} A, \operatorname{rank} B)$.
- **Rank-nullity:** $\operatorname{rank}(A) + \dim \operatorname{null}(A) = n$ (number of columns).
- A square $A$ is invertible iff $\operatorname{rank} A = n$ iff $\det A \ne 0$ iff 0 is not an eigenvalue.
- A nonzero matrix of the form $uv^T$ has rank 1.

## Systems of linear equations

For $Ax = b$ with $n$ unknowns, compare $r = \operatorname{rank}(A)$ and $r' = \operatorname{rank}([A \mid b])$:

| Condition | Solutions |
|---|---|
| $r < r'$ | none (inconsistent) |
| $r = r' = n$ | exactly one |
| $r = r' < n$ | infinitely many, with $n - r$ free variables |

The homogeneous system $Ax = 0$ always has $x = 0$. It has a nonzero solution iff $\operatorname{rank} A < n$; for square $A$, iff $\det A = 0$. The solution set of $Ax = 0$ is a subspace of dimension $n - r$.

For questions with parameters, row reduce once with the parameters kept symbolic, then read off which values make a pivot vanish.

## Eigenvalues and eigenvectors

$\lambda$ is an eigenvalue of $A$ with eigenvector $v \ne 0$ if $Av = \lambda v$. The eigenvalues are the roots of the characteristic polynomial $\det(A - \lambda I) = 0$.

### Shortcut properties

For an $n \times n$ matrix with eigenvalues $\lambda_1, \dots, \lambda_n$ (counted with multiplicity):

- $\sum \lambda_i = \operatorname{tr}(A)$ and $\prod \lambda_i = \det A$.
- For $2 \times 2$: $\lambda^2 - (\operatorname{tr} A)\lambda + \det A = 0$.
- Eigenvalues of a triangular or diagonal matrix are its diagonal entries.
- $A^T$ has the same eigenvalues as $A$ (eigenvectors may differ).
- If $Av = \lambda v$ then for any polynomial $p$, $p(A)v = p(\lambda)v$. So $A^k$, $A + cI$, $kA$ have eigenvalues $\lambda^k$, $\lambda + c$, $k\lambda$ with the same eigenvectors.
- $A^{-1}$ has eigenvalues $1/\lambda_i$, and $\operatorname{adj}(A)$ has eigenvalues $\det A / \lambda_i$ (for invertible $A$).
- $AB$ and $BA$ have the same eigenvalues.
- If every row sums to $s$, then $s$ is an eigenvalue with eigenvector $(1, 1, \dots, 1)^T$.
- A rank 1 matrix $n \times n$ has eigenvalue 0 with multiplicity at least $n - 1$; the remaining eigenvalue equals the trace.

### Multiplicity and diagonalization

The **algebraic multiplicity** of $\lambda$ is its multiplicity as a root. The **geometric multiplicity** is $\dim \operatorname{null}(A - \lambda I) = n - \operatorname{rank}(A - \lambda I)$, the number of independent eigenvectors for $\lambda$. Always
$$1 \le \text{geometric} \le \text{algebraic}.$$

$A$ is **diagonalizable** ($A = PDP^{-1}$) iff for every eigenvalue the two multiplicities match, iff $A$ has $n$ independent eigenvectors. Sufficient conditions: $n$ distinct eigenvalues, or $A$ real symmetric. Eigenvectors for distinct eigenvalues are always linearly independent.

When $A = PDP^{-1}$, $A^k = PD^kP^{-1}$, which is how large powers are computed.

### Cayley-Hamilton theorem

Every square matrix satisfies its own characteristic equation. For $2 \times 2$:
$$A^2 - (\operatorname{tr} A)A + (\det A)I = 0.$$
Uses: express $A^{-1}$ as a polynomial in $A$, or reduce a high power $A^k$ to a combination of $I$ and $A$.

## LU decomposition

$A = LU$ with $L$ lower triangular and $U$ upper triangular. In **Doolittle** form $L$ has 1s on its diagonal; in **Crout** form $U$ does.

How to get Doolittle factors by elimination: run Gaussian elimination without row swaps. $U$ is the final upper triangular matrix. The entry $l_{ij}$ ($i > j$) is the multiplier used to clear position $(i, j)$, that is, $R_i \leftarrow R_i - l_{ij} R_j$.

Facts:
- $\det A = \det U$ in Doolittle form (product of the pivots).
- For an invertible matrix, the factorization without row swaps exists iff every leading principal minor is nonzero (so no pivot becomes zero). Otherwise use $PA = LU$ with a permutation matrix $P$. Example: $\begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix}$ has no LU factorization without a row swap.
- Solving $Ax = b$: first $Ly = b$ by forward substitution, then $Ux = y$ by back substitution, each $O(n^2)$. The factorization costs $O(n^3)$ once and is reused for many right-hand sides.

## Worked examples

### Worked example 1: Eigenvalues by trace and determinant

$A = \begin{bmatrix} 2 & 2 & 1 \\ 1 & 3 & 1 \\ 1 & 2 & 2 \end{bmatrix}$ has one eigenvalue equal to 5. Find the others.

1. Each row sums to 5, so 5 is an eigenvalue with eigenvector $(1,1,1)^T$.
2. $\operatorname{tr} A = 7$, so the other two sum to 2.
3. $\det A = 2(6 - 2) - 2(2 - 1) + 1(2 - 3) = 8 - 2 - 1 = 5$, so the other two multiply to 1.
4. $\lambda^2 - 2\lambda + 1 = 0$ gives $\lambda = 1, 1$.

Eigenvalues: $5, 1, 1$. Since $A - I$ has rank 1, the eigenvalue 1 has 2 independent eigenvectors and $A$ is diagonalizable.

### Worked example 2: Classifying a system

For which $k$ does $x + 2y = 3$, $2x + ky = 6$ have infinitely many solutions? No solution?

1. $\det \begin{bmatrix} 1 & 2 \\ 2 & k \end{bmatrix} = k - 4$. For $k \ne 4$, unique solution.
2. For $k = 4$ the second equation is $2x + 4y = 6$, exactly twice the first. Rank 1 for both $A$ and $[A \mid b]$: infinitely many solutions.
3. There is no $k$ giving no solution, because $b$ was chosen proportional. If the right side were 7 instead of 6, $k = 4$ would give no solution.

### Worked example 3: Power via Cayley-Hamilton

$A = \begin{bmatrix} 1 & 1 \\ 0 & 2 \end{bmatrix}$. Express $A^4$ in terms of $A$ and $I$.

1. $\operatorname{tr} A = 3$, $\det A = 2$, so $A^2 = 3A - 2I$.
2. $A^3 = 3A^2 - 2A = 3(3A - 2I) - 2A = 7A - 6I$.
3. $A^4 = 7A^2 - 6A = 7(3A - 2I) - 6A = 15A - 14I$.

Check through eigenvalues 1 and 2: $15(1) - 14 = 1 = 1^4$ and $15(2) - 14 = 16 = 2^4$.

### Worked example 4: Doolittle factorization

Factor $A = \begin{bmatrix} 3 & 1 \\ 6 & 5 \end{bmatrix}$.

1. Multiplier $l_{21} = 6 / 3 = 2$.
2. $R_2 - 2R_1 = (0, 3)$.
3. $L = \begin{bmatrix} 1 & 0 \\ 2 & 1 \end{bmatrix}$, $U = \begin{bmatrix} 3 & 1 \\ 0 & 3 \end{bmatrix}$.

Check: $LU = \begin{bmatrix} 3 & 1 \\ 6 & 2 + 3 \end{bmatrix} = A$, and $\det A = 15 - 6 = 9 = 3 \cdot 3$.

### Worked example 5: Rank-nullity

A $4 \times 6$ matrix has rank 3. What is the dimension of the solution space of $Ax = 0$?

Nullity $= n - \operatorname{rank} = 6 - 3 = 3$. Note $n$ is the number of columns (unknowns), not rows.

## Common traps

- $\det(kA) = k^n \det A$, not $k \det A$.
- Sum of eigenvalues is the trace, product is the determinant. Swapping these is a frequent error.
- Eigenvalues of $A + B$ are not sums of eigenvalues of $A$ and $B$ in general.
- A repeated eigenvalue does not automatically mean "not diagonalizable". Check the rank of $A - \lambda I$.
- Row operations change eigenvalues. Do not row reduce before finding eigenvalues.
- In rank-nullity, use the number of columns.
- Forgetting that a homogeneous system is never inconsistent.
- In LU, the multiplier goes into $L$ with a plus sign: if you did $R_i - 3R_j$, then $l_{ij} = 3$.

## Quick revision

- $\det(AB) = \det A \det B$; $\det(kA) = k^n \det A$; $\det(\operatorname{adj} A) = (\det A)^{n-1}$.
- Rank + nullity = number of columns.
- $r < r'$: no solution. $r = r' = n$: unique. $r = r' < n$: infinitely many.
- $\sum \lambda = \operatorname{tr}$, $\prod \lambda = \det$.
- Triangular: eigenvalues on the diagonal. Equal row sums $s$: $s$ is an eigenvalue.
- $p(A)$ has eigenvalues $p(\lambda)$; $A^{-1}$ has $1/\lambda$.
- Symmetric: real eigenvalues, diagonalizable. Distinct eigenvalues: diagonalizable.
- Geometric multiplicity $= n - \operatorname{rank}(A - \lambda I)$.
- Cayley-Hamilton ($2 \times 2$): $A^2 - (\operatorname{tr} A)A + (\det A)I = 0$.
- Doolittle LU: $L$ holds the elimination multipliers, $U$ is the echelon form, $\det A = \prod u_{ii}$.
