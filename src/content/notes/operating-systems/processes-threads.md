---
title: "System calls, processes and threads"
summary: "How programs ask the kernel for service, how processes are created and change state, how threads differ from processes, and how processes communicate."
order: 1
sources:
  - title: "Operating Systems: Three Easy Pieces (free online book)"
    url: "https://pages.cs.wisc.edu/~remzi/OSTEP/"
  - title: "Wikipedia: fork (system call)"
    url: "https://en.wikipedia.org/wiki/Fork_(system_call)"
  - title: "Wikipedia: Thread (computing)"
    url: "https://en.wikipedia.org/wiki/Thread_(computing)"
---

## Why this topic matters

GATE asks two kinds of questions here. The first kind is counting: how many processes a piece of code with `fork()` creates, or how many times it prints. These are 1 or 2 mark NAT questions that are easy to get wrong by one. The second kind is conceptual: which instructions are privileged, which state transitions are legal, what threads share, and what happens when a user-level thread blocks. Both kinds reward a precise mental model more than memorised facts.

## User mode, kernel mode and system calls

The CPU has (at least) two modes, controlled by a bit in a status register.

- **User mode**: ordinary instructions only. The program cannot touch device registers, change memory mappings, or disable interrupts.
- **Kernel mode**: every instruction is allowed. The OS kernel runs here.

A **system call** is how a user program asks the kernel to do something it cannot do itself, such as reading a file or creating a process. The sequence is:

1. The library wrapper (for example `read()` in libc) puts the system call number and arguments in registers or on the stack.
2. It executes a **trap** instruction (`syscall`, `int 0x80`, `svc`, depending on the CPU). The trap itself is a non-privileged instruction; it is the controlled door into the kernel.
3. Hardware switches to kernel mode, saves the user program counter, and jumps to a fixed handler address set up by the OS at boot.
4. The kernel checks the arguments, does the work, puts the return value in a register, and executes a return-from-trap instruction that switches back to user mode.

This is a **mode switch**, not a context switch. A mode switch changes privilege level inside the same process. A **context switch** changes which process (or thread) owns the CPU and involves saving one register set and loading another, often switching the page table as well. Every context switch happens in kernel mode, but most mode switches do not lead to a context switch.

### Privileged instructions

An instruction must be privileged if a user program could use it to take control away from the OS or reach another process's memory. Typical privileged operations:

- enabling or disabling interrupts
- setting the timer that drives preemption
- loading the page table base register or flushing the TLB
- direct I/O port access
- switching to kernel mode directly
- halting the CPU

Reading the time of day, doing arithmetic, or executing the trap instruction do not need to be privileged.

### Interrupts, traps and exceptions

- An **interrupt** comes from outside the running instruction stream (timer, disk, network card). It is asynchronous.
- A **trap** is deliberate: the program executes an instruction to request a service.
- An **exception** (or fault) is caused by the current instruction: divide by zero, page fault, illegal instruction.

All three transfer control to kernel code through a table of handler addresses.

## Processes

A **process** is a program in execution. It owns:

- an address space: code (text), static data, heap, stack
- CPU context: program counter, registers, stack pointer
- OS resources: open files, signal handlers, current directory, credentials

The kernel keeps all this in a **process control block (PCB)**. A context switch saves the running process's context into its PCB and loads the next one from its PCB.

### Process states

The usual five-state model:

| From | To | Cause |
|---|---|---|
| New | Ready | admitted by the long-term scheduler |
| Ready | Running | dispatched by the short-term scheduler |
| Running | Ready | preempted (timer interrupt or higher priority arrival) |
| Running | Blocked | waits for I/O, a semaphore, a child, a signal |
| Blocked | Ready | the awaited event happens |
| Running | Terminated | calls `exit()` or is killed |

Two transitions never happen directly: **Ready to Blocked** (a process must run to request anything) and **Blocked to Running** (it must go through Ready and be picked by the scheduler).

With swapping, the model adds **Suspended Ready** and **Suspended Blocked**: the process image is on disk. The medium-term scheduler moves processes between memory and disk to control the degree of multiprogramming.

### Schedulers

- **Long-term** (job) scheduler: decides which jobs enter memory; controls the degree of multiprogramming. Runs rarely.
- **Short-term** (CPU) scheduler: picks the next ready process; runs very often.
- **Medium-term** scheduler: swaps processes out and back in.

## fork(), exec(), wait() and exit()

`fork()` creates a child that is a copy of the parent: same code, a copy of data, heap and stack, the same open file descriptors. Both continue from the instruction after the call. The return value differs:

- in the child, `fork()` returns 0
- in the parent, it returns the child's PID (positive)
- on failure, it returns -1 in the parent and no child exists

Modern kernels do not copy memory at fork time. They use **copy-on-write**: parent and child share physical pages marked read-only, and a page is copied only when one of them writes to it.

`exec()` replaces the calling process's program with a new one; the PID stays. `wait()` blocks the parent until a child exits and collects its exit status. `exit()` ends the process.

- A **zombie** is a child that has exited but whose parent has not yet called `wait()`. Its PCB entry stays so the status can be collected.
- An **orphan** is a child whose parent exited first. It is adopted by `init` (PID 1), which reaps it.

### Counting rules

For straight-line code with $n$ unconditional `fork()` calls, the number of processes doubles at each call:

$$\text{total processes} = 2^n, \qquad \text{child processes created} = 2^n - 1$$

Printing inside a loop is different. If the loop body is `fork(); printf(...);` and runs $n$ times, the number of processes after iteration $i$ is $2^i$, and all of them print in that iteration:

$$\text{prints} = 2^1 + 2^2 + \cdots + 2^n = 2^{n+1} - 2$$

With `&&` and `||`, short-circuit evaluation decides which `fork()` calls a given process executes. Draw a tree and label each branch with the return value (0 in the child, positive in the parent).

One more trap: `printf` without a newline leaves text in the stdio buffer, and the buffer is copied into the child by `fork()`. On a terminal, `printf("x\n")` flushes at the newline, but `printf("x")` before a fork can appear twice. GATE questions normally assume each print happens once per process that executes it.

## Threads

A **thread** is a unit of execution inside a process. Threads of one process share:

- code, global data and heap
- open files and other OS resources
- the address space (and so the page table)

Each thread has its own:

- program counter and registers
- stack
- thread ID and scheduling state

Creating a thread and switching between threads of the same process are cheaper than for processes because there is no new address space and no page table switch (and often no TLB flush).

### User-level and kernel-level threads

| Property | User-level threads | Kernel-level threads |
|---|---|---|
| Managed by | a library in user space | the kernel |
| Switch cost | very low, no mode switch | needs kernel entry |
| Kernel aware of them | no | yes |
| One thread blocks in a system call | whole process blocks | only that thread blocks |
| Parallel on multiple cores | no (many-to-one) | yes |

**Mapping models:**

- **Many-to-one**: many user threads on one kernel thread. Fast, but no parallelism and a blocking call stops everything.
- **One-to-one**: each user thread has a kernel thread (Linux, Windows). Real parallelism; thread creation costs a system call.
- **Many-to-many**: $m$ user threads multiplexed on $n \le m$ kernel threads. Flexible but complex.

## Inter-process communication

Processes have separate address spaces, so they need kernel help to exchange data.

- **Shared memory**: the kernel maps the same physical pages into both address spaces. After setup, communication needs no system calls, so it is fast, but the processes must synchronise access themselves.
- **Message passing**: `send()` and `receive()` through the kernel (pipes, message queues, sockets). Simpler to get right, but each message costs system calls and copying.
- **Pipes**: a one-way byte stream. An anonymous pipe connects related processes (typically created before `fork()`); a named pipe (FIFO) has a file system name.
- **Signals**: asynchronous notifications such as `SIGINT` or `SIGCHLD`.

Message passing can be **blocking** (synchronous) or **non-blocking** on either side. When both send and receive block, the exchange is called a rendezvous.

## Worked examples

### Worked example 1: prints inside a loop

How many times does this print `hi`?

```c
for (int i = 0; i < 3; i++) {
    fork();
    printf("hi\n");
}
```

Iteration 0: the original forks, so 2 processes print. Iteration 1: each of the 2 forks, so 4 print. Iteration 2: 8 print. Total $2 + 4 + 8 = 14 = 2^{4} - 2$. The number of processes at the end is $2^3 = 8$.

### Worked example 2: fork with a condition

How many processes exist (including the original) after this code?

```c
fork();
if (fork())
    fork();
```

After the first line there are 2 processes. Each then executes `fork()` in the condition. In the parent branch the value is positive, so it forks a third time; in the child branch the value is 0 and it does not. So each of the 2 processes becomes 3: parent, child of the second fork, child of the third fork. Total $2 \times 3 = 6$ processes.

### Worked example 3: blocking with user-level threads

A process has 4 user-level threads on a many-to-one library. Thread T1 calls `read()` on a disk file and the data is not in memory. What happens to T2, T3, T4?

The kernel sees one thread of control. It blocks that kernel entity until the disk read completes, so T2, T3 and T4 cannot run either, even if they are ready. With a one-to-one model only T1 would block. This is the standard argument for kernel threads on I/O-heavy workloads.

### Worked example 4: counting mode switches

A program calls `write()` 3 times and between the calls a timer interrupt occurs once, after which the scheduler picks the same process again. How many user-to-kernel transitions occur?

Each `write()` is one trap into the kernel: 3. The timer interrupt is one more entry into the kernel: 1. Total 4 user-to-kernel transitions. There is no context switch, because the same process was resumed.

## Common traps

- Counting child processes vs total processes. $n$ forks give $2^n$ processes but $2^n - 1$ children.
- Forgetting that `fork()` returns 0 in the child. In `if (fork() == 0)` the body runs in the child.
- Treating a mode switch as a context switch. A system call that returns to the same process involves no context switch.
- Saying the trap instruction is privileged. It cannot be, or user programs could never make system calls.
- Saying threads share the stack. Each thread has its own stack, though all stacks live in the shared address space.
- Assuming a blocking call in a user-level thread blocks only that thread.
- Assuming Ready to Blocked is possible.

## Quick revision

- System call = trap into kernel mode, handled at a fixed address, return with return-from-trap.
- Privileged: interrupts on/off, timer, page table base, I/O, halt. Not privileged: trap, reading the clock.
- States: New, Ready, Running, Blocked, Terminated. No Ready to Blocked, no Blocked to Running.
- `fork()` returns 0 to the child, child PID to the parent, -1 on failure.
- $n$ sequential forks: $2^n$ processes. Loop of $n$ with print after fork: $2^{n+1} - 2$ prints.
- Threads share code, data, heap, files; each has its own PC, registers and stack.
- Many-to-one: no parallelism, one blocking call blocks all. One-to-one: parallel, costlier creation.
- Zombie: exited, not yet reaped. Orphan: parent gone, adopted by init.
- IPC: shared memory (fast, needs synchronisation) or message passing (kernel-mediated).
