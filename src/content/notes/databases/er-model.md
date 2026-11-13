---
title: "ER model"
summary: "Entities, attributes, relationships, cardinality and participation, weak entities, and the rules for turning an ER diagram into the minimum number of relational tables."
order: 1
sources:
  - title: "Entity-relationship model (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model"
  - title: "Weak entity (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Weak_entity"
  - title: "GATE Overflow: er-diagram questions"
    url: "https://gateoverflow.in/tag/er-diagram"
---

## What the ER model is for

The entity-relationship (ER) model is a design notation. You draw what the data is about (entities), what describes them (attributes) and how they connect (relationships), then convert the drawing into tables. GATE questions on this topic almost always come down to one of two things: reading cardinality and participation correctly, and counting the minimum number of tables after mapping.

## Building blocks

### Entities and entity sets

An **entity** is one distinguishable thing, such as a particular student. An **entity set** is the collection of all entities of one type, such as Student. In a diagram an entity set is a rectangle.

A **strong entity set** has a key of its own. A **weak entity set** does not; it is identified only through a relationship with an owner entity (covered below).

### Attributes

| Kind | Meaning | How it maps |
|---|---|---|
| Simple | Cannot be split (roll number) | One column |
| Composite | Made of parts (name = first + last) | One column per leaf component; the composite itself disappears |
| Single-valued | One value per entity | Column in the entity table |
| Multivalued | Several values per entity (phone numbers) | Separate table (owner key, value), both columns in the key |
| Derived | Computable from others (age from date of birth) | Usually not stored |
| Key | Uniquely identifies an entity | Primary key of the table |

A multivalued attribute is drawn as a double ellipse, a derived one as a dashed ellipse, and a key attribute is underlined.

### Relationships

A **relationship set** associates entities from two or more entity sets. Its **degree** is the number of entity sets involved: unary (recursive), binary or ternary. A relationship can have its own descriptive attributes, for example `grade` on the relationship between Student and Course.

## Cardinality and participation

### Cardinality ratio

For a binary relationship R between A and B, the cardinality ratio says how many B entities one A entity can be related to and vice versa.

- **One-to-one (1:1)**: each A relates to at most one B and each B to at most one A.
- **One-to-many (1:N)**: each A relates to many B, each B to at most one A.
- **Many-to-one (N:1)**: the mirror image.
- **Many-to-many (M:N)**: no limit on either side.

Read the direction carefully. "Each employee works in exactly one department, and a department has many employees" is many-to-one from Employee to Department. The many side is Employee.

### Participation

- **Total participation** (double line): every entity of the set must take part in at least one relationship instance. Example: every loan must belong to some customer.
- **Partial participation** (single line): some entities may take part in none.

Participation is a lower bound (minimum 0 or 1). Cardinality is an upper bound (maximum 1 or many). The (min, max) notation combines them: an entity with (1, 1) on its side takes part in exactly one relationship instance.

### Weak entities

A weak entity set has a **partial key** (discriminator), drawn with a dashed underline, that distinguishes weak entities only among those belonging to the same owner. It is connected to its owner by an **identifying relationship** (double diamond), and it always has total participation in that relationship. The identifying relationship is many-to-one from the weak entity to the owner.

The primary key of the weak entity table is

$$\text{key}(\text{weak}) = \text{key}(\text{owner}) \cup \text{partial key}$$

and the owner key in that table is also a foreign key, typically with ON DELETE CASCADE because a dependent cannot exist without its owner.

## Mapping an ER diagram to relations

The standard rules, assuming you want each table in at least 3NF and you are counting the minimum number of tables:

1. **Strong entity set**: one table with all simple attributes; key = entity key.
2. **Weak entity set**: one table containing its attributes plus the owner key; key = owner key + partial key. The identifying relationship needs no separate table.
3. **Multivalued attribute**: one extra table (owner key, attribute).
4. **M:N relationship**: always a separate table holding both keys plus relationship attributes; key = both keys together.
5. **1:N or N:1 relationship**: no separate table needed. Put the key of the one side into the table of the many side as a foreign key, along with relationship attributes. If the many side has partial participation, that column can be NULL.
6. **1:1 relationship**: no separate table. Put either key into the other table as a foreign key. Prefer the side with total participation so there are no NULLs.
7. **1:1 with total participation on both sides**: the two entity sets and the relationship can be merged into a single table.
8. **Recursive relationship**: same rules. A 1:N recursive relationship such as Supervises becomes a self-referencing foreign key column.
9. **n-ary relationship (degree 3 or more)**: usually a separate table with the keys of all participants.

The minimum table count therefore is:

$$\text{tables} = \#\text{strong} + \#\text{weak} + \#\text{multivalued attrs} + \#\text{M:N rels} + \#\text{n-ary rels} - \#\text{merges from 1:1 total-total}$$

with 1:1, 1:N and N:1 binary relationships contributing nothing extra.

### Why 1:N can be absorbed but M:N cannot

If R is N:1 from A to B, each A entity has at most one partner, so a single column in A's table records it and A's key still identifies each row. If R is M:N, an A entity may need several partner values. Storing them in A's table would repeat A's other attributes once per partner, so A's key would no longer be a key and the table would carry redundant data.

### Where relationship attributes go

A relationship attribute follows the relationship. For 1:N it goes into the many-side table. For M:N it goes into the relationship table. For 1:1 it goes into whichever table received the foreign key.

## Worked examples

### Worked example 1: counting tables in a chain

Entity sets: Customer (key `cid`), Account (key `accno`), Branch (key `bcode`), Manager (key `mid`). Relationships:

- Owns: M:N between Customer and Account.
- HeldAt: N:1 from Account to Branch, total participation of Account.
- Heads: 1:1 between Branch and Manager, total participation of Branch, partial of Manager.

Minimum tables:

- Customer, Account, Branch, Manager: 4 tables.
- Owns is M:N: 1 table, Owns(cid, accno).
- HeldAt is N:1: absorbed by putting `bcode` in Account.
- Heads is 1:1 with only one side total: absorbed by putting `mid` in Branch. It cannot merge the two entity tables because some managers head no branch.

Total = 5.

### Worked example 2: weak entity with a multivalued attribute

Employee (key `eid`, attributes `name`, `salary`). Weak entity Dependent (partial key `dname`, attribute `age`, multivalued attribute `hobby`), identified by Employee through HasDep.

| Table | Columns | Primary key |
|---|---|---|
| Employee | eid, name, salary | eid |
| Dependent | eid, dname, age | (eid, dname) |
| DependentHobby | eid, dname, hobby | (eid, dname, hobby) |

Three tables. Note that the multivalued attribute of a weak entity carries the full key of the weak entity, which is itself composite.

### Worked example 3: column count with composite attributes

Entity Book has key `isbn`, composite `publisher` = (`pname`, `pcity`), multivalued `author`, and derived attribute `age` computed from `year`, which is stored.

- Book(isbn, pname, pcity, year): 4 columns. The derived attribute is not stored.
- BookAuthor(isbn, author): 2 columns.

Total 6 columns in 2 tables. A common slip is counting `publisher` as a column in addition to its parts.

### Worked example 4: when 1:1 merges into one table

Person (key `pid`) and Passport (key `pno`) are linked 1:1 by Holds, with total participation on both sides (every person in this database has exactly one passport, and every passport belongs to a person). Since every Person row would have exactly one matching Passport row and vice versa, a single table Person(pid, ..., pno, ...) represents everything without NULLs. Either `pid` or `pno` can be the primary key; the other is a candidate key.

If Person had partial participation (some people with no passport), merging would create NULL passport columns. Then you keep two tables and put `pid` as a foreign key in Passport.

## Specialization and generalization

An entity set can be split into subclasses (specialization) or several sets combined into a superclass (generalization). Two constraints matter:

- **Disjoint vs overlapping**: can an entity be in more than one subclass?
- **Total vs partial**: must every superclass entity belong to some subclass?

Common mappings: one table for the superclass plus one per subclass holding the superclass key (works always), or only subclass tables each repeating the inherited attributes (works only for total specialization, and is cleanest when disjoint).

## Aggregation

Aggregation treats a relationship together with its entity sets as a higher-level entity, so that it can take part in another relationship. Example: the relationship Works between Employee and Project is monitored by a Manager. The Monitors relationship connects Manager to the aggregate (Works), and maps to a table with the key of Works plus the key of Manager.

## Common traps

- Reading cardinality backwards. "One department has many employees" means Employee is the many side, and the department key goes into the Employee table, not the other way round.
- Merging a 1:1 relationship's two entity tables when only one side has total participation. That forces NULLs in the merged table, so the minimum count keeps them separate.
- Forgetting the extra table for a multivalued attribute, or giving it the wrong key. Its key is (owner key, value), not the value alone.
- Using only the partial key for a weak entity table. Two owners can have dependents with the same partial key.
- Counting a separate table for the identifying relationship of a weak entity. The weak entity table already holds the owner key.
- Counting composite attributes as columns. Only the leaf components become columns.
- Assuming total participation changes the number of tables for 1:N. It only decides whether the foreign key column may be NULL.
- For an M:N relationship, making the key only one of the two foreign keys.

## Quick revision

- Strong entity: 1 table. Weak entity: 1 table, key = owner key + partial key.
- Multivalued attribute: extra table (owner key, value).
- M:N relationship: always its own table, key = both keys.
- 1:N or N:1: foreign key on the many side, no extra table.
- 1:1: foreign key on either side, no extra table; total participation on both sides lets the two entity tables merge into one.
- Composite attribute: flatten into components. Derived attribute: not stored.
- Total participation = double line = minimum 1. Cardinality gives the maximum.
- Recursive 1:N: self-referencing foreign key in the same table.
- Ternary relationship: separate table with all participating keys.
