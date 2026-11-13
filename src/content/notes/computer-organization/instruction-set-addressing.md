---
title: "Instruction set and addressing modes"
summary: "How instructions are encoded, how many bits each field needs, how expanding opcodes work, and how every common addressing mode computes its operand."
order: 1
sources:
  - title: "Addressing mode (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Addressing_mode"
  - title: "Instruction set architecture (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Instruction_set_architecture"
  - title: "GATE Overflow: addressing-modes tag"
    url: "https://gateoverflow.in/tag/addressing-modes"
---

## What the instruction set fixes

The instruction set architecture (ISA) is the contract between software and hardware. It fixes:

- the operations available (arithmetic, logic, data transfer, control transfer, I/O),
- the number and size of registers,
- how operands are located (addressing modes),
- the binary format of each instruction.

GATE questions on this topic are mostly about the last two: counting bits in instruction formats and computing effective addresses and operand values. A smaller group asks about the number of memory accesses an instruction needs and about how many instructions a given expression takes on 0, 1, 2 or 3 address machines.

## Instruction formats and bit counting

An instruction word is split into fields. A typical field list is: opcode, register specifiers, a mode field, and an address, displacement or immediate field.

### The basic rules

- To name one of $N$ things you need $\lceil \log_2 N \rceil$ bits. So 50 opcodes need 6 bits, 64 registers need 6 bits, and 5 addressing modes need 3 bits.
- Fields share a fixed width. For a $W$-bit instruction, whatever is not used by the other fields is left for the immediate or address field: $\text{imm} = W - \text{opcode} - \sum \text{other fields}$.
- A signed $m$-bit two's complement immediate covers $-2^{m-1}$ to $2^{m-1} - 1$. An unsigned one covers $0$ to $2^m - 1$.
- A memory-address field that must reach every byte of a $2^a$-byte memory needs $a$ bits.

### Fixed versus variable length

RISC machines use one fixed instruction length (often 32 bits) with few formats, so decoding is simple and pipelines are easy. CISC machines use variable lengths, so a memory-to-memory instruction can carry two full addresses. Variable length complicates fetch because the length is known only after decoding part of the instruction.

### Expanding opcodes

When instructions with fewer operands need fewer address bits, the spare bits can extend the opcode. The rule is a chain of "left over patterns times new combinations":

1. With a $k$-bit primary opcode, there are $2^k$ patterns. If $n_3$ are used by the widest format, $2^k - n_3$ patterns are free.
2. Each free pattern, extended by the $f$ bits freed from one operand field, gives $2^f$ new patterns. So the next format can have at most $(2^k - n_3) \cdot 2^f$ instructions.
3. Subtract what that format actually uses and repeat.

The decoder must be able to tell formats apart, which is why a pattern used for a wider format can never be reused as a prefix for a narrower one.

## Addressing modes

The effective address (EA) is the memory address where the operand lives. Some modes have no EA because the operand is in the instruction or a register.

| Mode | Operand | EA | Memory accesses for operand |
|---|---|---|---|
| Immediate | the field value $A$ itself | none | 0 |
| Register direct | $R$ | none | 0 |
| Direct (absolute) | $M[A]$ | $A$ | 1 |
| Memory indirect | $M[M[A]]$ | $M[A]$ | 2 |
| Register indirect | $M[R]$ | $R$ | 1 |
| Indexed | $M[A + R_{index}]$ | $A + R_{index}$ | 1 |
| Base plus displacement | $M[R_{base} + d]$ | $R_{base} + d$ | 1 |
| PC-relative | $M[PC + d]$ | $PC + d$ | 1 |
| Auto-increment | $M[R]$, then $R \leftarrow R + s$ | $R$ (old value) | 1 |
| Auto-decrement | $R \leftarrow R - s$, then $M[R]$ | $R$ (new value) | 1 |

Here $s$ is the operand size in addressable units.

### What each mode is used for

- **Immediate**: constants, such as `x = x + 5`.
- **Register direct**: fastest operand, no memory traffic.
- **Direct**: global or static variables at a fixed address.
- **Indirect** (memory or register): pointers. `*p` with `p` in a register is register indirect.
- **Indexed**: arrays where the instruction holds the array's base and the register holds the scaled index.
- **Base plus displacement**: fields of a structure or local variables at fixed offsets from a stack or frame pointer. Indexed and base modes compute the same sum; the difference is which part is the constant.
- **PC-relative**: branches and position-independent code. Since only the distance from the current instruction is stored, the program can be loaded anywhere.
- **Auto-increment and auto-decrement**: walking through arrays and implementing stack push and pop. Pre-decrement plus post-increment on the same register give a stack that grows downward.

### Which PC value is used

For PC-relative modes, the PC has normally been updated to point past the current instruction by the time the address is computed. If a 2-word instruction is at address 1000 on a word-addressable machine, then $PC = 1002$ during execution, so a displacement $d$ refers to address $1002 + d$. GATE questions usually state this; if they do not, use the updated PC.

## Number of addresses per instruction

The number of explicit addresses changes how many instructions a computation takes.

- **Three-address**: `ADD X, A, B` means $X \leftarrow A + B$. Short programs, long instructions.
- **Two-address**: `ADD X, A` means $X \leftarrow X + A$. One operand is overwritten.
- **One-address**: an implicit accumulator. `ADD A` means $AC \leftarrow AC + M[A]$.
- **Zero-address**: a stack. `ADD` pops two values and pushes the sum. Only `PUSH` and `POP` carry an address.

## Worked examples

### Worked example 1: field widths in a fixed format

A processor has 32-bit instructions, 50 distinct opcodes, 64 general registers and 5 addressing modes. One format holds an opcode, two register fields, a mode field and a signed displacement. How wide is the displacement, and what range does it cover?

- Opcode: $\lceil \log_2 50 \rceil = 6$ bits.
- Two registers: $2 \times \log_2 64 = 12$ bits.
- Mode: $\lceil \log_2 5 \rceil = 3$ bits.
- Displacement: $32 - 6 - 12 - 3 = 11$ bits, range $-2^{10}$ to $2^{10} - 1$, that is $-1024$ to $1023$.

### Worked example 2: expanding opcode

A machine has 16-bit instructions and 6-bit address fields. Two-address instructions use a 4-bit opcode with two address fields. One-address instructions use a 10-bit opcode, and zero-address instructions use all 16 bits as opcode. There are 15 two-address and 40 one-address instructions. What is the maximum number of zero-address instructions?

- Two-address level: $2^4 = 16$ patterns, 15 used, 1 free.
- One-address level: the free pattern extended by 6 bits gives $1 \times 2^6 = 64$ patterns. 40 used, 24 free.
- Zero-address level: each free pattern extended by 6 more bits gives $24 \times 2^6 = 1536$.

The answer is 1536. The common mistake is to compute $2^{16} - 15 - 40$, which ignores that a used pattern blocks all its extensions.

### Worked example 3: operand values for every mode

The instruction is two words at addresses 1002 and 1003 of a word-addressable memory, so $PC = 1004$ after fetch. The address field is $A = 200$. Registers: $R1 = 400$ (base), $R2 = 10$ (index). Memory: $M[200] = 600$, $M[210] = 900$, $M[400] = 800$, $M[600] = 300$, $M[1204] = 50$.

| Mode | EA | Operand |
|---|---|---|
| Immediate | none | 200 |
| Direct | 200 | 600 |
| Memory indirect | $M[200] = 600$ | $M[600] = 300$ |
| Register direct (R1) | none | 400 |
| Register indirect (R1) | 400 | 800 |
| Indexed ($A + R2$) | 210 | 900 |
| Base ($R1 + A$) | 600 | 300 |
| PC-relative ($PC + A$) | 1204 | 50 |

Notice that two modes reach the same operand by different routes. GATE options often list the EA instead of the operand, so always finish with the final memory read.

### Worked example 4: instruction count by address style

Compute $X = (A + B) \times (C - D)$, where all names are memory locations, using the fewest instructions. Temporaries may be used.

| Style | Program | Count |
|---|---|---|
| 3-address | `ADD T, A, B`; `SUB X, C, D`; `MUL X, T, X` | 3 |
| 2-address | `MOV T, A`; `ADD T, B`; `MOV X, C`; `SUB X, D`; `MUL X, T` | 5 |
| 1-address | `LOAD C`; `SUB D`; `STORE T`; `LOAD A`; `ADD B`; `MUL T`; `STORE X` | 7 |
| 0-address | `PUSH A`; `PUSH B`; `ADD`; `PUSH C`; `PUSH D`; `SUB`; `MUL`; `POP X` | 8 |

In the 1-address version one partial result must be parked in a temporary because the accumulator holds only one value. Fewer addresses per instruction means more instructions but shorter ones.

### Worked example 5: memory accesses for one instruction

An instruction `ADD @A, (R3)+` computes $M[M[A]] \leftarrow M[M[A]] + M[R3]$ and then increments R3. It is two words long and memory is accessed one word at a time, no cache.

- Fetch: 2 accesses.
- Read the pointer $M[A]$: 1.
- Read $M[M[A]]$: 1.
- Read $M[R3]$: 1. The increment of R3 happens inside the CPU, no memory access.
- Write the result to $M[M[A]]$: 1.

Total: 6 memory accesses.

## Common traps

- **EA versus operand.** For indexed mode with $A = 300$ and $R = 200$, the EA is 500 and the operand is $M[500]$. Options often include 500 as a distractor.
- **Updated PC.** PC-relative uses the address of the next instruction, not the current one. For branch offsets counted in words, multiply by the instruction size and then add to the updated PC.
- **Signed range.** An $m$-bit signed field goes up to $2^{m-1} - 1$, not $2^m - 1$.
- **Ceiling of log.** 50 opcodes need 6 bits, not $\log_2 50 \approx 5.64$ rounded down.
- **Expanding opcodes.** Multiply the free patterns by $2^f$ at each level. Do not subtract from the total $2^{16}$.
- **Auto-increment step.** For a 4-byte operand on a byte-addressable machine the register grows by 4, not 1.
- **Indirect costs an extra access.** Memory indirect needs two memory reads for the operand (pointer, then data).

## Quick revision

- Bits to name $N$ items: $\lceil \log_2 N \rceil$.
- Immediate width $= W - $ (all other fields); signed range $[-2^{m-1}, 2^{m-1} - 1]$.
- Expanding opcode: free patterns $\times 2^{\text{freed bits}}$, then subtract used, repeat.
- Immediate: operand in the instruction. Direct: $M[A]$. Indirect: $M[M[A]]$. Register indirect: $M[R]$. Indexed or base: $M[A + R]$. PC-relative: $M[PC_{next} + d]$.
- Auto-increment uses the old register value then adds the operand size; auto-decrement subtracts first.
- PC-relative gives position-independent code; base plus displacement suits locals and struct fields; indexed suits arrays.
- 3-address code is shortest in instruction count; 0-address code is longest but has the shortest instructions.
