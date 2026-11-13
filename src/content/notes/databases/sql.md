---
title: "SQL"
summary: "How SQL queries are evaluated: duplicates, NULLs and three-valued logic, aggregates with GROUP BY and HAVING, nested and correlated subqueries, ALL/ANY/EXISTS, and outer joins."
order: 3
sources:
  - title: "SQL (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/SQL"
  - title: "Null (SQL) (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Null_(SQL)"
  - title: "GATE Overflow: sql questions"
    url: "https://gateoverflow.in/tag/sql"
---

## How GATE tests SQL

Almost every SQL question in GATE gives you a small table and a query, then asks for the output, the number of rows, or which of several queries is equivalent. You win these by evaluating the query in the order the engine does and by knowing exactly how NULLs and duplicates behave.

## Logical order of evaluation

A query is written SELECT first, but evaluated in this order:

1. **FROM** (and JOIN ... ON): build the product or join of the listed tables.
2. **WHERE**: keep rows where the condition is TRUE.
3. **GROUP BY**: form groups of rows with equal grouping values.
4. **HAVING**: keep groups where the condition is TRUE.
5. **SELECT**: compute output expressions; apply DISTINCT if present.
6. **ORDER BY**: sort.

Consequences:

- WHERE cannot use aggregates, because groups do not exist yet. Group conditions go in HAVING.
- With GROUP BY, the SELECT list may contain only grouping columns, aggregates, and expressions over them.
- A column alias defined in SELECT is not visible in WHERE in standard SQL.

## Duplicates: SQL uses bags

Unlike relational algebra, SQL keeps duplicates unless told not to.

| Construct | Duplicates |
|---|---|
| SELECT | Kept |
| SELECT DISTINCT | Removed |
| UNION, INTERSECT, EXCEPT | Removed |
| UNION ALL, INTERSECT ALL, EXCEPT ALL | Kept (bag semantics) |
| Join of tables | One row per matching pair |

A join can multiply rows. "Find students enrolled in some course" written as a join returns a student once per enrollment; written with IN or EXISTS it returns each student once.

## NULL and three-valued logic

NULL means "unknown or not applicable". Any arithmetic with NULL gives NULL, and any comparison with NULL (including `NULL = NULL`) gives **UNKNOWN**.

| AND | T | U | F |
|---|---|---|---|
| **T** | T | U | F |
| **U** | U | U | F |
| **F** | F | F | F |

| OR | T | U | F |
|---|---|---|---|
| **T** | T | T | T |
| **U** | T | U | U |
| **F** | T | U | F |

NOT U is U. WHERE and HAVING keep a row only when the condition is TRUE; UNKNOWN is treated like FALSE for filtering. So `WHERE x > 5 OR x <= 5` does **not** return rows with NULL x. Use `IS NULL` and `IS NOT NULL` to test for NULL.

Other NULL rules:

- Aggregates other than `COUNT(*)` ignore NULLs. `COUNT(col)` counts non-null values. `AVG(col)` = sum of non-null values / count of non-null values.
- Aggregates over an empty set: `COUNT` gives 0, `SUM`, `AVG`, `MAX`, `MIN` give NULL.
- GROUP BY puts all NULLs of the grouping column into one group.
- DISTINCT and UNION treat NULLs as equal to each other (they collapse into one).
- In a join condition `R.a = S.b`, NULL never matches anything.

## Subqueries

### IN and NOT IN

`x IN (subquery)` is true if x equals some value returned. `x NOT IN (subquery)` is `x <> v` for every v, combined with AND. If the subquery returns even one NULL, `x <> NULL` is UNKNOWN, so NOT IN can never be TRUE: the query returns no rows. NOT EXISTS does not have this problem.

### ANY / SOME and ALL

- `x > ANY (S)`: true if x is greater than at least one value in S. `= ANY` is the same as IN.
- `x > ALL (S)`: true if x is greater than every value in S. `<> ALL` is the same as NOT IN.
- If S is empty: `ANY` is FALSE and `ALL` is TRUE, for every x.

### EXISTS and NOT EXISTS

`EXISTS (subquery)` is TRUE if the subquery returns at least one row, otherwise FALSE. It never returns UNKNOWN. The SELECT list inside does not matter.

### Correlated subqueries

A correlated subquery refers to a column of the outer query, so it is conceptually re-run for each outer row.

```sql
SELECT name FROM Employee e
WHERE salary > (SELECT AVG(salary) FROM Employee x WHERE x.dept = e.dept);
```

For each employee, compute the average of that employee's department and compare.

### "For all" queries with NOT EXISTS

Division is written with two NOT EXISTS: "students for whom there is no course they do not take".

```sql
SELECT s.sid FROM Student s
WHERE NOT EXISTS (
  SELECT * FROM Course c
  WHERE NOT EXISTS (
    SELECT * FROM Takes t WHERE t.sid = s.sid AND t.cid = c.cid));
```

## Joins in SQL

```sql
SELECT ... FROM A JOIN B ON A.k = B.k;          -- inner join
SELECT ... FROM A LEFT OUTER JOIN B ON A.k = B.k;  -- all rows of A
SELECT ... FROM A RIGHT OUTER JOIN B ON A.k = B.k; -- all rows of B
SELECT ... FROM A FULL OUTER JOIN B ON A.k = B.k;  -- both
SELECT ... FROM A NATURAL JOIN B;               -- equal on all same-named columns
```

A condition placed in WHERE after a LEFT JOIN that tests a column of the right table (for example `WHERE B.x = 5`) removes the NULL-padded rows, turning the left join back into an inner join. Put such conditions in the ON clause if you want to keep unmatched left rows.

## The sample table for the examples

Employee:

| eid | name | dept | salary |
|---|---|---|---|
| 1 | Anu | CS | 60 |
| 2 | Bo | CS | 80 |
| 3 | Cy | EE | NULL |
| 4 | Di | EE | 50 |
| 5 | Ed | NULL | 70 |
| 6 | Fa | CS | 80 |

## Worked examples

### Worked example 1: counting with NULLs

```sql
SELECT COUNT(*), COUNT(salary), COUNT(dept), COUNT(DISTINCT salary), AVG(salary)
FROM Employee;
```

- `COUNT(*)` = 6 rows.
- `COUNT(salary)` = 5 (Cy is NULL).
- `COUNT(dept)` = 5 (Ed is NULL).
- `COUNT(DISTINCT salary)` = 4: the values 60, 80, 50, 70.
- `AVG(salary)` = (60 + 80 + 50 + 70 + 80) / 5 = 340 / 5 = 68. Not 340 / 6.

### Worked example 2: GROUP BY with a NULL group

```sql
SELECT dept, COUNT(*), AVG(salary)
FROM Employee
GROUP BY dept;
```

Three groups come out:

| dept | COUNT(*) | AVG(salary) |
|---|---|---|
| CS | 3 | 73.33 |
| EE | 2 | 50 |
| NULL | 1 | 70 |

EE's average ignores Cy's NULL, so it is 50 / 1 = 50, while its `COUNT(*)` is still 2. Adding `HAVING COUNT(*) >= 2` leaves CS and EE.

### Worked example 3: correlated subquery with NULLs

```sql
SELECT name FROM Employee e
WHERE salary > (SELECT AVG(salary) FROM Employee x WHERE x.dept = e.dept);
```

- CS average 73.33: Bo (80) and Fa (80) qualify; Anu (60) does not.
- EE average 50: Di has 50, not strictly greater. Cy's salary is NULL, so the comparison is UNKNOWN.
- Ed has dept NULL, so `x.dept = e.dept` never holds, the subquery averages an empty set and returns NULL, and `70 > NULL` is UNKNOWN.

Result: Bo, Fa.

### Worked example 4: NOT IN versus NOT EXISTS

```sql
SELECT name FROM Employee
WHERE dept NOT IN (SELECT dept FROM Employee WHERE salary > 65);
```

The subquery returns CS (Bo), NULL (Ed), CS (Fa). Because NULL is in the list, `dept NOT IN (CS, NULL, CS)` is never TRUE. The result is empty.

```sql
SELECT name FROM Employee e
WHERE NOT EXISTS (SELECT * FROM Employee x
                  WHERE x.salary > 65 AND x.dept = e.dept);
```

This returns Cy, Di and Ed. For Cy and Di (EE) no high earner shares the department. For Ed, `x.dept = NULL` never matches, so the inner query is empty and NOT EXISTS is TRUE.

### Worked example 5: second highest salary

```sql
SELECT MAX(salary) FROM Employee
WHERE salary < (SELECT MAX(salary) FROM Employee);
```

The inner query gives 80. Rows with salary below 80 are 60, 50, 70 (NULL is dropped). The maximum of those is 70. A query using `salary >= ALL (SELECT salary FROM Employee WHERE dept = 'CS')` returns Bo and Fa, because 80 is at least every CS salary.

## Views, constraints and other DDL points

- `PRIMARY KEY` implies UNIQUE and NOT NULL. `UNIQUE` columns may hold NULLs in most systems.
- `FOREIGN KEY ... REFERENCES` values must match an existing key or be NULL. ON DELETE CASCADE deletes referencing rows; SET NULL nulls the foreign key; the default rejects the delete.
- `CHECK (condition)` rejects a row only when the condition is FALSE; UNKNOWN passes.
- A view is a stored query. Updatable views generally must come from one table without aggregates, DISTINCT or GROUP BY.

## Common traps

- Counting rows with NULL in `COUNT(col)` or `AVG(col)`. Both ignore NULL; only `COUNT(*)` counts every row.
- Expecting `WHERE col = NULL` to find NULLs. It never does; use `IS NULL`.
- NOT IN with a subquery that can return NULL gives an empty result.
- `> ALL` over an empty set is TRUE for every row; `> ANY` over an empty set is FALSE.
- Forgetting that a plain join repeats rows, so the count is per matching pair, not per entity.
- Assuming UNION keeps duplicates. Only UNION ALL does.
- Putting an aggregate in WHERE. It belongs in HAVING.
- `<> 'CS'` does not return rows where dept is NULL.
- A filter on the right table in WHERE after LEFT JOIN discards the padded rows.

## Quick revision

- Evaluation order: FROM, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY.
- SQL is bag-based; set operators remove duplicates unless ALL is added.
- Comparisons with NULL give UNKNOWN; WHERE keeps only TRUE.
- `COUNT(*)` counts rows; other aggregates skip NULLs; empty-set SUM/AVG/MAX/MIN give NULL, COUNT gives 0.
- `= ANY` is IN; `<> ALL` is NOT IN; empty set: ALL TRUE, ANY FALSE.
- NOT IN with a NULL in the list returns nothing; NOT EXISTS is NULL-safe.
- Correlated subquery: re-evaluated per outer row.
- "For all" = double NOT EXISTS.
- Outer join keeps unmatched rows padded with NULL.
