---
title: "I/O interface: interrupts and DMA"
summary: "Programmed I/O, interrupt-driven I/O and DMA, with the formulas for CPU overhead, cycle stealing and burst transfer times."
order: 4
sources:
  - title: "Direct memory access (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Direct_memory_access"
  - title: "Interrupt (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Interrupt"
  - title: "GATE Overflow: dma tag"
    url: "https://gateoverflow.in/tag/dma"
---

## The I/O problem

Devices are slow and asynchronous compared with the CPU. A disk delivers a sector after milliseconds; a keyboard produces a few characters per second. The I/O interface (controller) sits between the device and the system bus. It has data registers, a status register (ready, busy, error) and a control register. The CPU talks to these registers either through special I/O instructions on a separate address space (**isolated I/O**) or through ordinary loads and stores to reserved memory addresses (**memory-mapped I/O**).

There are three ways to move data, in increasing order of hardware support.

## Programmed I/O (polling)

The CPU repeatedly reads the device's status register until it shows ready, then moves one unit of data itself.

- Simple, no extra hardware.
- The CPU wastes time in the polling loop when the device is slow.

**Polling overhead.** If the device must be checked $f$ times per second and each check costs $c$ cycles on a CPU running at $F$ Hz:

$$\text{fraction of CPU time} = \frac{f \cdot c}{F}.$$

For a device that must not lose data, $f$ is at least the rate at which it produces units: $f = \text{data rate} / \text{bytes per poll}$.

## Interrupt-driven I/O

The device raises an interrupt request (IRQ) when it is ready. The CPU runs other work in between.

### The interrupt cycle

1. The device asserts IRQ.
2. The CPU finishes the current instruction (interrupts are sampled at instruction boundaries).
3. If interrupts are enabled, the CPU acknowledges, saves at least the PC and the status register (often on the stack), and disables further interrupts of equal or lower priority.
4. The CPU finds the service routine (ISR) and jumps to it.
5. The ISR saves any registers it uses, transfers data, clears the request in the device, restores registers and executes return-from-interrupt, which restores PC and status.

**Interrupt latency** is the time from the request to the first instruction of the ISR. It includes the rest of the current instruction and the state saving.

### Finding the service routine

- **Polled (non-vectored)**: one common ISR checks each device's status register in a fixed order. The order gives priority.
- **Vectored**: the device (or interrupt controller) supplies a number or address on the bus during acknowledge. The CPU uses it to index an interrupt vector table, so no polling is needed.

### Priority

- **Daisy chain**: all devices share one request line; the acknowledge passes from device to device. A requesting device keeps the acknowledge and does not pass it on, so the device nearest the CPU wins. Cheap, but priority is fixed and far devices can starve.
- **Parallel priority**: each device has its own request line into a priority encoder, which can also apply a mask register.

### Maskable and non-maskable

Maskable interrupts can be disabled with the interrupt-enable flag or a mask register. A **non-maskable interrupt (NMI)** cannot, and is used for events such as power failure or memory parity errors.

**Interrupt overhead.** If each interrupt moves $u$ bytes and costs $c$ cycles in total:

$$\text{interrupts per second} = \frac{\text{data rate}}{u}, \qquad \text{fraction of CPU time} = \frac{(\text{data rate}/u) \cdot c}{F}.$$

Interrupt-driven I/O beats polling when the device is often not ready, because no cycles are wasted checking. For a very fast device that is almost always ready, the per-interrupt overhead can make it worse than polling.

## Direct memory access (DMA)

For block devices, even one interrupt per word is too expensive. A **DMA controller** moves data between the device and memory without the CPU touching each word.

### DMA controller registers

- **Address register**: memory address for the next word; incremented after each transfer.
- **Word count register**: number of words left; decremented, and the transfer ends at zero.
- **Control register**: direction (read or write), mode, and enable.

### The sequence

1. The CPU programs the controller: start address, count, direction. (Setup cost.)
2. The controller requests the bus (bus request, BR, also called HOLD).
3. The CPU finishes its current bus cycle, floats its bus lines and grants (bus grant, BG, also called HLDA).
4. The controller transfers data directly between device and memory.
5. When the count reaches zero it releases the bus and interrupts the CPU. (Completion cost.)

The CPU's only per-block work is setup plus one completion interrupt. During the transfer the CPU can keep running from its cache and registers; it is blocked only when it needs the bus that the controller holds.

### Transfer modes

| Mode | Bus held for | CPU blocked | Block finishes |
|---|---|---|---|
| Burst (block) | the entire block | for the whole block | fastest |
| Cycle stealing | one word (one bus cycle), then released | one bus cycle per word | slower, paced by the device |
| Transparent (hidden) | only cycles the CPU does not use | never | slowest, depends on idle cycles |

**Burst time.** For a block of $N$ words with bus cycle time $t_b$:

$$T_{burst} = N \cdot t_b.$$

**Cycle stealing fraction.** If the device delivers $r$ words per second and each stolen cycle lasts $t_b$:

$$\text{fraction of bus time stolen} = r \cdot t_b.$$

**Preparation and transfer times.** Some questions describe a device that needs time $X$ to prepare each unit and time $Y$ to transfer it on the bus. Then the bus is busy for $Y$ out of every $X + Y$ when preparation and transfer cannot overlap, giving $Y/(X+Y)$; when the device prepares the next unit while the CPU uses the bus and the steal happens only for the transfer, the CPU loses $Y$ out of every $X$, giving $Y/X$. Decide from the wording which model the question intends before picking a formula.

**CPU overhead of DMA.** With setup $s$ cycles and completion $c$ cycles per block of $B$ bytes:

$$\text{fraction} = \frac{(\text{data rate}/B)(s + c)}{F}.$$

## Worked examples

### Worked example 1: polling a slow and a fast device

A 1 GHz CPU spends 200 cycles per poll.

- A mouse polled 50 times per second: $50 \times 200 = 10^4$ cycles per second, $10^4 / 10^9 = 0.001\%$. Polling is fine.
- A disk delivering 8 MB/s ($10^6$ bytes per MB) in 16-byte units must be polled $8 \times 10^6 / 16 = 5 \times 10^5$ times per second: $5 \times 10^5 \times 200 = 10^8$ cycles, so $10\%$ of the CPU. And this assumes every poll finds data ready.

### Worked example 2: the same disk with DMA

The disk now uses DMA with 8000-byte blocks. Setup costs 1500 cycles and the completion interrupt 500 cycles.

Blocks per second $= 8 \times 10^6 / 8000 = 1000$. Cycles $= 1000 \times 2000 = 2 \times 10^6$. Fraction $= 2 \times 10^6 / 10^9 = 0.2\%$, fifty times less than polling.

### Worked example 3: cycle stealing

A device transfers 2 MB/s ($10^6$ bytes per MB) by cycle stealing, 2 bytes per stolen cycle, and each stolen cycle lasts 40 ns. The CPU otherwise uses the bus every cycle.

Steals per second $= 2 \times 10^6 / 2 = 10^6$. Bus time stolen $= 10^6 \times 40 \text{ ns} = 0.04$ s per second, so the CPU is blocked $4\%$ of the time.

### Worked example 4: burst versus cycle stealing for one block

A block of 2048 words. A bus cycle takes 10 ns. In cycle-stealing mode the device produces one word every 200 ns.

- Burst: the bus is held continuously for $2048 \times 10 = 20480$ ns $= 20.48\ \mu$s. The CPU loses the bus for that whole stretch (this assumes the device has a buffer holding the full block).
- Cycle stealing: the block takes $2048 \times 200$ ns $= 409.6\ \mu$s to arrive, but the CPU loses only one 10 ns cycle per word, the same total of $20.48\ \mu$s spread out.

Total bus time taken is the same; what changes is how long the block takes and whether the CPU is blocked in one piece or in small slices.

### Worked example 5: interrupt-driven overhead

A device delivers 4 MB/s ($10^6$ bytes per MB), 16 bytes per interrupt, and each interrupt costs 500 cycles on a 1 GHz CPU. Interrupts per second $= 250000$. Cycles $= 1.25 \times 10^8$, fraction $= 12.5\%$. For a device this fast, DMA is the right choice.

## Common traps

- **Units.** Check whether MB means $10^6$ or $2^{20}$ bytes and KB means 1000 or 1024. The question normally says; if your answer is off by about 5%, this is why.
- **Per-interrupt cost versus per-byte cost.** Divide the data rate by bytes per interrupt first.
- **DMA does not involve the CPU per word.** CPU work per block is setup plus one interrupt.
- **Burst blocks the CPU from the bus, not from computing.** A CPU running out of cache can still execute during a burst. Questions that say "CPU is blocked" mean bus access.
- **Daisy chain priority** is highest nearest the CPU on the acknowledge line.
- **Interrupts are recognised between instructions**, not in the middle (except for page-fault style exceptions, which restart the instruction).
- **NMI ignores the enable flag.**

## Quick revision

- Programmed I/O: CPU polls status; overhead $= f \cdot c / F$.
- Interrupt I/O: overhead $= (\text{rate}/u) \cdot c / F$; vectored interrupts give the ISR address directly.
- Save PC and status before the ISR; return-from-interrupt restores them.
- Daisy chain: nearest device has highest priority.
- DMA registers: address, word count, control. Handshake: BR/HOLD, then BG/HLDA.
- Burst: $N t_b$ of continuous bus use. Cycle stealing: fraction stolen $= r \cdot t_b$.
- Prepare $X$, transfer $Y$: blocked fraction $Y/(X+Y)$ or $Y/X$ depending on whether preparation overlaps CPU use.
- DMA CPU overhead per block $=$ setup $+$ completion cycles.
