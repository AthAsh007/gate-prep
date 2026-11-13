---
title: "Databases formula sheet"
summary: "ER mapping rules, relational algebra size bounds, SQL NULL rules, keys and normal forms, index and B+ tree counts, and schedule tests on one page."
---

## ER model

| ER construct | Relation produced |
|---|---|
| Strong entity | Table with its simple attributes; composite attributes flattened to their leaves |
| Multivalued attribute | Separate table (owner key, value); key = both |
| Weak entity | Table with owner key + partial key as primary key; identifying relationship folded in |
| 1:1 relationship | FK on either side (prefer the side with total participation); merge both tables if both total |
| 1:N relationship | FK + relationship attributes in the N-side table |
| M:N relationship | Separate table; key = both entity keys |
| Ternary, no constraints | Separate table; key = all three entity keys |
| Ternary with "(X, Y) has at most one Z" | Key = keys of X and Y |
| Specialization, disjoint and total | One table per subclass with inherited attributes is enough |

- Minimum tables (1NF): one per strong entity + one per multivalued attribute + one per M:N or n-ary relationship + one per weak entity. 1:1 and 1:N add no table.
- Max instances of a 1:N relationship (one side $E_1$, many side $E_2$) = size of $E_2$. M:N: $|E_1| \cdot |E_2|$.
- Three binary relationships cannot replace a ternary one.

## Relational algebra and tuple calculus

$r$, $s$ = tuple counts of $R$, $S$ (set semantics, $r, s \ge 1$).

| Expression | Min | Max |
|---|---|---|
| $R \cup S$ | $\max(r, s)$ | $r + s$ |
| $R \cap S$ | 0 | $\min(r, s)$ |
| $R - S$ | $\max(0, r - s)$ | $r$ |
| $R \times S$ | $rs$ | $rs$ |
| $R \bowtie S$, no common attributes | $rs$ | $rs$ |
| $R \bowtie S$, general | 0 | $rs$ |
| $R \bowtie S$, common attributes form a key of $S$ | 0 | $r$ |
| $R \bowtie S$, NOT NULL FK from $R$ to $S$ | $r$ | $r$ |
| $R$ left outer join $S$ | $r$ | $rs$ |
| $R$ full outer join $S$ | $\max(r, s)$ | $\max(rs, r + s)$ |
| $\sigma_c(R)$ | 0 | $r$ |
| $\pi_L(R)$ | 1 | $r$ |
| $R \div S$ | 0 | $\lfloor r / s \rfloor$ |

- Basic independent operators: $\sigma, \pi, \cup, -, \times$ (plus $\rho$). Union cannot be built from the others.
- Derived: $R \cap S = R - (R - S)$; $R \bowtie_c S = \sigma_c(R \times S)$; semijoin $R \ltimes S = \pi_{attr(R)}(R \bowtie S)$; anti-join $R - (R \ltimes S)$.
- Division $R(A, B) \div S(B) = \pi_A(R) - \pi_A((\pi_A(R) \times S) - R)$. If $S$ is empty, the result is $\pi_A(R)$.
- Safe rewrites: $\sigma_{c_1 \wedge c_2} = \sigma_{c_1}\sigma_{c_2}$; push $\sigma$ into the operand whose attributes it uses; $\pi$ distributes over $\cup$ but not over $\cap$ or $-$; $\sigma$ distributes over $\cup, \cap, -$.
- "For all" in a query means division, double NOT EXISTS, or $\forall$ in tuple calculus.
- Tuple calculus: $\forall u \in S\,(P) \equiv \neg \exists u \in S\,(\neg P)$. A query is safe if every result value comes from a relation in the database; $\{t \mid \neg (t \in R)\}$ is unsafe.
- Safe TRC, safe DRC and basic RA are equally expressive; none expresses transitive closure.

## SQL

Logical evaluation order: FROM, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY.

| Rule | Result |
|---|---|
| Any comparison with NULL | UNKNOWN |
| UNKNOWN AND FALSE / UNKNOWN OR TRUE | FALSE / TRUE |
| UNKNOWN AND TRUE / UNKNOWN OR FALSE | UNKNOWN |
| NOT UNKNOWN | UNKNOWN |
| WHERE and HAVING keep | TRUE rows only |
| `x NOT IN (..., NULL)` | Never TRUE: zero rows |
| `x > ALL (empty)` | TRUE |
| `x > ANY (empty)` / `x IN (empty)` | FALSE |
| `EXISTS (subquery)` | TRUE iff subquery has a row; NULLs inside do not matter |

| Aggregate | NULL handling |
|---|---|
| `COUNT(*)` | Counts rows, including all-NULL rows |
| `COUNT(col)`, `SUM`, `AVG`, `MIN`, `MAX` | Skip NULLs |
| Aggregate over zero rows | `COUNT` gives 0, others give NULL |
| `AVG(x)` vs `SUM(x)/COUNT(*)` | Differ when x has NULLs |

- GROUP BY puts all NULLs in one group. DISTINCT and UNION also treat NULLs as equal.
- UNION, INTERSECT, EXCEPT remove duplicates; UNION ALL keeps them: count = $r + s$.
- Multiset join count: for each value $v$, (count of $v$ in R) times (count of $v$ in S), summed.
- Aggregates are not allowed in WHERE; nested aggregates like `MAX(AVG(x))` are invalid. Use a derived table or `>= ALL (SELECT ... GROUP BY ...)`.
- LEFT JOIN: a filter on the right table in ON keeps unmatched left rows; the same filter in WHERE removes them.
- Anti-join idiom: `LEFT JOIN ... WHERE right.key IS NULL`, or `NOT EXISTS`. `NOT IN` breaks if the subquery yields NULL.
- Updatable view: one base table, no DISTINCT, no aggregates, no GROUP BY or HAVING, no set operations.

## Integrity constraints and normal forms

| Tool | Rule |
|---|---|
| Closure $X^+$ | Repeat: if $Y \subseteq X^+$ and $Y \to Z$, add $Z$ |
| $X \to Y \in F^+$ | iff $Y \subseteq X^+$ |
| Superkey | $X^+ = R$ |
| Candidate key | Minimal superkey |
| Attribute on no RHS | In every key |
| Attribute only on RHS | In no key |
| Prime attribute | Member of some candidate key |

- Superkeys of $R$ with $n$ attributes and one key of $k$ attributes: $2^{n-k}$. Two keys $K_1, K_2$: $2^{n - |K_1|} + 2^{n - |K_2|} - 2^{n - |K_1 \cup K_2|}$.
- Number of FDs $X \to Y$ (non-empty sides) in $F^+$: $\sum_X (2^{|X^+|} - 1)$.
- Minimal cover: split RHS to single attributes, drop extraneous LHS attributes, drop redundant FDs. It may not be unique.

| NF | Condition for every non-trivial FD $X \to A$ |
|---|---|
| 1NF | Atomic values |
| 2NF | No non-prime $A$ depends on a proper subset of a candidate key |
| 3NF | $X$ is a superkey, or $A$ is prime |
| BCNF | $X$ is a superkey |
| 4NF | For every non-trivial MVD $X \twoheadrightarrow Y$, $X$ is a superkey |

- 4NF implies BCNF implies 3NF implies 2NF. All candidate keys single-attribute means 2NF. Only two attributes means BCNF.
- Every FD is an MVD. $X \twoheadrightarrow Y$ implies $X \twoheadrightarrow R - X - Y$.
- Binary decomposition $R_1, R_2$ is lossless iff $R_1 \cap R_2 \to R_1$ or $R_1 \cap R_2 \to R_2$. For three or more parts use the chase.
- Dependency preserving: $(\bigcup F_i)^+ = F^+$, where $F_i$ is $F^+$ projected on $R_i$.

| Method | Lossless | Preserves FDs | Result |
|---|---|---|---|
| 3NF synthesis | Yes | Yes | 3NF |
| BCNF split on violating $X \to Y$ into $XY$, $R - (Y - X)$ | Yes | Not always | BCNF |

- 3NF synthesis: minimal cover, one table per LHS group, add a key table if none holds a key, drop subset tables.
- $R(A, B, C)$ with $AB \to C$, $C \to B$: 3NF, not BCNF, no dependency-preserving BCNF decomposition.
- Referential integrity: insert into the referencing table or delete/update the key in the referenced table can violate it.

## File organization and indexing

$B$ = block size, $R$ = record size, $K$ = key, $P$ = block pointer, $P_r$ = record pointer.

| Quantity | Formula |
|---|---|
| Blocking factor (unspanned) | $bfr = \lfloor B / R \rfloor$ |
| File blocks | $\lceil n / bfr \rceil$ |
| Index entries per block | $\lfloor B / (K + P) \rfloor$ |
| Heap search on key | $b/2$ average, $b$ worst |
| Sorted file, binary search | $\lceil \log_2 b \rceil$ |
| Single-level index of $b_i$ blocks | $\lceil \log_2 b_i \rceil + 1$ |
| Multilevel index with $t$ levels | $t + 1$ |
| Levels of multilevel index | $\lceil \log_{fo} (\text{first-level blocks}) \rceil + 1$ |

| Index | Built on | Entries | Dense? |
|---|---|---|---|
| Primary | Ordering key | One per data block | Sparse |
| Clustering | Ordering non-key | One per distinct value | Sparse |
| Secondary | Non-ordering field | One per record (key) | Dense |

- At most one primary or clustering index per file; any number of secondary indexes.
- Exact binary search worst case: $\lfloor \log_2 b \rfloor + 1$.

| B-tree / B+ tree fact | Formula |
|---|---|
| B-tree order $p$ | $pP + (p - 1)(K + P_r) \le B$ |
| B+ internal order $p$ | $pP + (p - 1)K \le B$ |
| B+ leaf order | $p_{leaf}(K + P_r) + P \le B$ |
| B-tree, $h$ levels, max keys | $p^h - 1$ |
| B-tree, $h$ levels, min keys | $2\lceil p/2 \rceil^{h-1} - 1$ |
| B+ tree max keys in leaves | $p^{h-1} \cdot p_{leaf}$ |
| B+ min keys in leaves | $2 \lceil p/2 \rceil^{h-2} \cdot \lceil p_{leaf}/2 \rceil$ |
| Non-root min children | $\lceil p/2 \rceil$; root min 2 |

- Leaf split copies the first key of the right half up; internal split moves the middle key up. Height grows only when the root splits.
- Read the question's split rule and "order" definition (max children, max keys or min keys) first.

## Transactions and concurrency control

- Conflict: same item, different transactions, at least one write (RW, WR, WW).
- Conflict serializable iff the precedence graph is acyclic. Serial orders conflict equivalent = number of topological orders.
- View equivalent: same initial reads, same reads-from pairs, same final writes. Conflict serializable implies view serializable. View serializable but not conflict serializable needs a blind write.
- Testing view serializability is NP-complete; testing conflict serializability is polynomial.
- Interleavings of transactions with $n_1, \dots, n_k$ operations: $\frac{(n_1 + \dots + n_k)!}{n_1! \cdots n_k!}$. Serial schedules: $k!$.

| Class | Condition |
|---|---|
| Recoverable | If $T_j$ reads from $T_i$, then $T_i$ commits before $T_j$ |
| Cascadeless (ACA) | Read only committed values |
| Strict | No read or write of an item until its last writer ends |

Strict implies cascadeless implies recoverable.

| Protocol | Serializable | Deadlock-free | Cascadeless |
|---|---|---|---|
| Basic 2PL | Conflict | No | No |
| Strict 2PL (hold X locks to commit) | Conflict | No | Yes, strict |
| Rigorous 2PL (hold all locks) | Conflict, commit order | No | Yes |
| Conservative 2PL (lock all first) | Conflict | Yes | Not by itself |
| Basic timestamp ordering | Conflict | Yes | No, may be unrecoverable |
| TO + Thomas write rule | View | Yes | No |

Timestamp ordering rules for $T$ on item $X$:

| Operation | Roll back $T$ if | Else |
|---|---|---|
| read | $TS(T) < WTS(X)$ | $RTS(X) = \max(RTS(X), TS(T))$ |
| write | $TS(T) < RTS(X)$ or $TS(T) < WTS(X)$ | $WTS(X) = TS(T)$ |
| write, Thomas | $TS(T) < RTS(X)$ | Ignore if $TS(T) < WTS(X)$, else write |

- 2PL check: no lock after the first unlock in each transaction. Strict: no X unlock before commit.
- Deadlock: draw the wait-for graph ($T_i \to T_j$ if $T_i$ waits for $T_j$); a cycle means deadlock. Shared locks are compatible only with shared locks.
- Wait-die: older requester waits, younger requester dies. Wound-wait: older requester wounds (aborts) the holder, younger waits. Restarted transactions keep their timestamp, so both avoid starvation.
