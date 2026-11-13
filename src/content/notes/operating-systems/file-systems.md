---
title: "File systems"
summary: "Files and directories, directory structures, hard and symbolic links, contiguous, linked, FAT and indexed allocation, inode block pointers and maximum file size, and free-space management."
order: 6
sources:
  - title: "Operating Systems: Three Easy Pieces (free online book)"
    url: "https://pages.cs.wisc.edu/~remzi/OSTEP/"
  - title: "Wikipedia: inode"
    url: "https://en.wikipedia.org/wiki/Inode"
  - title: "Wikipedia: File Allocation Table"
    url: "https://en.wikipedia.org/wiki/File_Allocation_Table"
---

## Why this topic matters

File systems carry fewer marks than scheduling or memory, but the questions are predictable: maximum file size from an inode layout, number of disk accesses to reach a given block, size of a FAT or free-space bitmap, and statements comparing allocation methods or link types. These are quick marks if the formulas are fresh.

## Files and directories

A **file** is a named, persistent sequence of bytes plus metadata: size, owner, permissions, timestamps, and the locations of its data blocks. On Unix-like systems the metadata lives in an **inode**; the file name lives only in a directory.

A **directory** maps names to files (to inode numbers on Unix). Opening a file walks the path one component at a time, reading each directory and each inode along the way. The kernel keeps a **per-process open file table** (file descriptors pointing to entries with the current offset) and a **system-wide open file table** (one entry per open inode).

Access methods:

- **Sequential**: read the next block; the offset advances.
- **Direct (random)**: read block $i$ in any order.
- **Indexed**: an index maps keys to blocks.

## Directory structures

| Structure | Idea | Limitation |
|---|---|---|
| Single-level | one directory for everyone | name clashes, no grouping |
| Two-level | one directory per user | no subdirectories, sharing awkward |
| Tree | arbitrary nesting, absolute and relative paths | no sharing of a file in two places |
| Acyclic graph | tree plus links, so a file or subdirectory can appear in several directories | must avoid cycles; deletion needs reference counts |
| General graph | links may create cycles | traversal must detect cycles; garbage collection needed |

### Hard links and symbolic links

- A **hard link** is an extra directory entry pointing to the **same inode**. The inode keeps a link count; the file's data is freed only when the count reaches 0 and no process has it open. Deleting the "original" name leaves the other names working. Hard links normally cannot cross file systems (inode numbers are per file system) and usually cannot point to directories (to keep the graph acyclic).
- A **symbolic (soft) link** is a small file containing a path. It can point to directories and across file systems, but it **dangles** if the target is removed or renamed.

## Allocation methods

### Contiguous allocation

A file occupies consecutive blocks; the directory stores (start, length).

- Sequential and direct access are both fast: block $i$ is at start + $i$, one disk access.
- Suffers from **external fragmentation** and makes growing a file hard. Needs the final size up front or compaction later.

### Linked allocation

Each block holds a pointer to the next; the directory stores the first (and maybe last) block.

- No external fragmentation; files grow easily.
- **Direct access is slow**: reaching block $k$ means reading the $k - 1$ blocks before it.
- Pointer space is lost from every block, and one corrupt pointer loses the rest of the file.

### File Allocation Table (FAT)

Linked allocation with the pointers moved into a table at the start of the disk, one entry per block. `FAT[b]` holds the number of the block that follows $b$, or an end-of-file marker; free blocks are marked 0. If the FAT is cached in memory, following the chain needs no disk reads, so direct access becomes reasonable.

$$\text{FAT size} = (\text{number of blocks}) \times (\text{entry size})$$

### Indexed allocation

All block pointers for a file go into an **index block**. Direct access needs one read of the index block, then one read of the data. No external fragmentation. The index block is wasted for very small files, and a single index block limits the file size; the fixes are linked index blocks, multi-level indexes, or the combined scheme used by Unix inodes.

### The Unix inode (combined scheme)

An inode holds, besides metadata, a fixed set of pointers, for example:

- $D$ **direct** pointers, each to a data block
- 1 **single indirect** pointer, to a block full of data block pointers
- 1 **double indirect** pointer, to a block of pointers to single indirect blocks
- 1 **triple indirect** pointer, one more level

With block size $B$ bytes and pointer size $p$ bytes, one block holds $n = B / p$ pointers, and

$$\text{max file size} = \left(D + n + n^2 + n^3\right) \times B$$

(drop the terms for indirect levels that are not present). Small files need only the inode; large files pay one extra disk access per indirection level.

## Free-space management

- **Bitmap**: one bit per block. Size = number of blocks bits. Finding a run of free blocks is easy, and the map is small enough to cache.
- **Linked free list**: each free block points to the next; no extra space, but finding many free blocks is slow.
- **Grouping**: the first free block stores the addresses of $n$ free blocks, the last of which stores the next $n$.
- **Counting**: store (start, count) for each run of free blocks.

## Disk performance basics

Access time = seek time + rotational latency + transfer time. Average rotational latency is half a rotation. For a disk at $r$ RPM, one rotation takes $60/r$ seconds. Disk scheduling (SSTF, SCAN and the rest) is covered with CPU scheduling.

## Worked examples

### Worked example 1: maximum file size

An inode has 12 direct pointers and one each of single, double and triple indirect. Block size 4 KB, pointer 4 bytes.

Pointers per block $n = 4096 / 4 = 1024 = 2^{10}$.

| Part | Blocks | Bytes |
|---|---|---|
| Direct | 12 | 48 KB |
| Single indirect | $2^{10}$ | 4 MB |
| Double indirect | $2^{20}$ | 4 GB |
| Triple indirect | $2^{30}$ | 4 TB |

Maximum size $= 48\,\text{KB} + 4\,\text{MB} + 4\,\text{GB} + 4\,\text{TB}$, which is a little over 4 TB. In GATE the answer is usually asked in exact units, so keep the sum: $(12 + 2^{10} + 2^{20} + 2^{30}) \times 2^{12}$ bytes.

### Worked example 2: blocks used by a 5 MB file

Same inode layout. A file of 5 MB needs $5 \times 2^{20} / 2^{12} = 1280$ data blocks.

- Direct: 12 data blocks. Remaining 1268.
- Single indirect: 1 index block covering 1024 data blocks. Remaining 244.
- Double indirect: 1 top-level block plus $\lceil 244 / 1024 \rceil = 1$ second-level block.

Index blocks $= 1 + 1 + 1 = 3$. Total disk blocks used $= 1280 + 3 = 1283$ (not counting the inode).

### Worked example 3: disk reads to reach a byte

Same layout. The inode is already in memory, nothing else is cached. How many disk reads to read the byte at offset 6 MB?

Logical block $= 6 \times 2^{20} / 2^{12} = 1536$ (numbering from 0). Blocks 0-11 are direct, 12-1035 go through the single indirect block, 1036 and above through the double indirect block. So block 1536 needs: the double indirect block, one second-level block, then the data block. That is **3 reads**.

With linked allocation the same block would need 1537 reads; with contiguous allocation, 1 read.

### Worked example 4: FAT and bitmap sizes

A 32 GB disk with 4 KB blocks has $2^{35} / 2^{12} = 2^{23}$ blocks.

- Bitmap: $2^{23}$ bits $= 2^{20}$ bytes $= 1$ MB.
- FAT with 4-byte entries: $2^{23} \times 4 = 2^{25}$ bytes $= 32$ MB.

The bitmap is 32 times smaller because it stores one bit per block instead of a 32-bit pointer.

## Common traps

- Forgetting the direct blocks, or adding the number of pointers instead of blocks times block size.
- Using bits instead of bytes for pointer size, or the wrong pointers per block ($B / p$, not $B \times p$).
- Counting the inode read when the question says the inode is already in memory, or forgetting it when it is not.
- Saying linked allocation supports fast random access. Only FAT with a cached table makes it practical.
- Saying deleting a file's original name breaks its hard links. Only symbolic links dangle.
- Mixing up which allocation method has external fragmentation: contiguous does; linked and indexed do not.
- Measuring a bitmap in bytes as one byte per block.

## Quick revision

- Contiguous: fast direct access, external fragmentation. Linked: no fragmentation, slow direct access. Indexed: direct access, index overhead.
- FAT = linked allocation with pointers in a table; size = blocks times entry size.
- Inode max size $= (D + n + n^2 + n^3) B$ with $n = B / p$.
- Reaching block $k$ via an indirect level costs one extra read per level.
- Bitmap size = number of blocks bits.
- Hard link: same inode, link count, same file system. Symbolic link: path, may dangle, can cross file systems.
- Acyclic-graph directories allow sharing; general graphs need cycle handling.
