---
title: "DNS and HTTP"
summary: "Covers how DNS names are resolved (iterative and recursive), DNS record types and caching, HTTP methods and status codes, and RTT counting for persistent and non-persistent connections."
order: 6
sources:
  - title: "RFC 1034: Domain Names, Concepts and Facilities"
    url: "https://www.rfc-editor.org/rfc/rfc1034"
  - title: "RFC 9110: HTTP Semantics"
    url: "https://www.rfc-editor.org/rfc/rfc9110"
  - title: "Domain Name System (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/Domain_Name_System"
  - title: "HTTP persistent connection (Wikipedia)"
    url: "https://en.wikipedia.org/wiki/HTTP_persistent_connection"
---

## DNS: what it does

The Domain Name System maps human-readable names such as www.example.com to IP addresses, and also stores mail server names, aliases and other data. It is a distributed, hierarchical database: no single server knows every name. DNS is an application layer protocol, normally carried over UDP port 53 because a query and its reply each fit in one datagram. It falls back to TCP port 53 for zone transfers and for replies too large for UDP.

### The hierarchy

| Level | Example | Knows |
|---|---|---|
| Root servers | "." | Which servers handle each top-level domain |
| Top-level domain (TLD) servers | com, org, in | Which servers are authoritative for each second-level domain |
| Authoritative servers | ns1.example.com | The actual records for their zone |
| Local (recursive) resolver | ISP or campus resolver | Nothing permanently; it asks others and caches |

A zone is the part of the name tree that one organisation administers. A zone has at least one primary authoritative server and usually secondaries that copy the zone by zone transfer.

### Iterative and recursive resolution

A host's stub resolver sends one query to its local DNS server and expects a final answer. That query is recursive. The local server then does the work.

- **Iterative**: the local server asks the root, which replies with a referral to the TLD servers. The local server asks a TLD server, which refers it to the authoritative server. The local server asks the authoritative server and gets the answer. Each referral comes back to the local server, which sends the next query itself.
- **Recursive**: each server, instead of returning a referral, asks the next server on behalf of the one that asked it, and the answer travels back down the chain. Root and TLD servers normally refuse recursion because of load.

Message counts with nothing cached:

| Mode | Messages |
|---|---|
| Host to local, then iterative from the local server | $2 + 2 \times 3 = 8$ |
| Fully recursive (host to local to root to TLD to authoritative, and back) | $2 \times 4 = 8$ |

The message count is the same in the simple model, but the load sits on different servers. Time is what GATE asks for most often: add one RTT per exchange that happens in sequence.

### Caching and TTL

Every record carries a time to live. Any server that sees a reply caches it for that long. Local servers often cache TLD server addresses, so the root is rarely contacted. A cached answer from a server that is not authoritative for the zone is marked non-authoritative.

### Record types

A resource record is (name, TTL, class, type, value).

| Type | Value |
|---|---|
| A | IPv4 address of a host |
| AAAA | IPv6 address |
| NS | Host name of an authoritative name server for a domain |
| CNAME | Canonical name for an alias |
| MX | Mail server for a domain, with a preference number (lower is preferred) |
| PTR | Host name for an address (reverse lookup under in-addr.arpa) |
| SOA | Start of authority: primary server, admin mailbox, serial and timers for the zone |
| TXT | Free text (used for verification and mail policies) |

An NS record gives a name, not an address. The parent zone often supplies the address as a glue A record so that resolution does not loop.

## HTTP

HTTP is the request-response protocol of the web, running over TCP (port 80, or 443 with TLS). It is stateless: the server keeps no memory of earlier requests. Cookies add state on top.

### Request and response

A request has a request line (method, path, version), header lines (Host, User-Agent, Accept, Cookie and so on), a blank line and an optional body. A response has a status line (version, code, phrase), headers (Content-Type, Content-Length, Set-Cookie, Last-Modified) and the body.

### Methods

| Method | Purpose | Safe | Idempotent |
|---|---|---|---|
| GET | Fetch a resource | Yes | Yes |
| HEAD | Like GET but headers only | Yes | Yes |
| POST | Submit data, create or process | No | No |
| PUT | Replace the resource at the given URL | No | Yes |
| DELETE | Remove a resource | No | Yes |
| OPTIONS | Ask which methods are allowed | Yes | Yes |
| PATCH | Partial update | No | Not guaranteed |

Safe means the request does not change server state. Idempotent means doing it twice has the same effect as once.

### Status codes

| Class | Meaning | Common codes |
|---|---|---|
| 1xx | Informational | 100 Continue |
| 2xx | Success | 200 OK, 201 Created, 204 No Content |
| 3xx | Redirection | 301 Moved Permanently, 302 Found, 304 Not Modified |
| 4xx | Client error | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found |
| 5xx | Server error | 500 Internal Server Error, 503 Service Unavailable |

A conditional GET sends If-Modified-Since; if the page has not changed the server replies 304 with no body, which lets caches and proxies stay correct cheaply.

### Persistent and non-persistent connections

Each TCP connection costs one RTT for the handshake before the request can go out. Ignore transmission times unless the question gives sizes.

Let a page have a base file and $n$ embedded objects on the same server.

| Mode | Time |
|---|---|
| Non-persistent, serial | $(n + 1) \times 2\,\text{RTT}$ |
| Non-persistent, $p$ parallel connections | $2\,\text{RTT}$ for the base, then $\lceil n/p \rceil \times 2\,\text{RTT}$ |
| Persistent, no pipelining | $2\,\text{RTT} + n\,\text{RTT}$ |
| Persistent, with pipelining | $2\,\text{RTT} + 1\,\text{RTT}$ |

Add DNS time if the name must be resolved first, and add transmission time ($\text{size}/\text{rate}$) for each object if it is given. HTTP/1.1 uses persistent connections by default. HTTP/2 multiplexes many requests over one connection.

## Worked examples

### Worked example 1: Iterative DNS timing

A client's RTT to its local DNS server is 4 ms. The local server has nothing cached and needs a root, a TLD and an authoritative lookup, with RTTs 40, 30 and 20 ms. Resolution takes $4 + 40 + 30 + 20 = 94$ ms. If the TLD server address were cached, it would take $4 + 30 + 20 = 54$ ms.

### Worked example 2: Non-persistent HTTP

A base file and 5 images, RTT 30 ms, name already cached, transmission ignored.

Serial non-persistent: $6 \times 2 \times 30 = 360$ ms.

With 5 parallel connections after the base file: $2 \times 30 + 2 \times 30 = 120$ ms.

### Worked example 3: Persistent HTTP

Same page. Persistent without pipelining: $2 \times 30 + 5 \times 30 = 210$ ms. With pipelining: $3 \times 30 = 90$ ms.

### Worked example 4: Including transmission time

A 100 KB base file (1 KB $= 1000$ bytes) over 8 Mbps with RTT 25 ms, one non-persistent connection.

Transmission $= 800000 / (8 \times 10^6) = 100$ ms. Total $= 2 \times 25 + 100 = 150$ ms.

## Common traps

- Forgetting the TCP handshake RTT before every non-persistent request.
- Counting the base file once in pipelined mode but forgetting it needs its own RTT before the object requests can be sent.
- Assuming the root is always contacted; check what is cached.
- Saying NS gives an IP address. It gives a server name.
- Saying DNS always uses TCP. Ordinary queries use UDP port 53.
- Calling POST idempotent or PUT non-idempotent.
- Mixing up recursive and iterative: in iterative resolution the local server does all the asking; in recursive each server asks the next one.

## Quick revision

- DNS: hierarchical, distributed; root, TLD, authoritative, local resolver; UDP 53 (TCP 53 for zone transfers).
- Host to local query is recursive; local server usually resolves iteratively.
- Records: A, AAAA, NS (name of server), CNAME (alias), MX (mail, preference), PTR (reverse), SOA.
- Caches keep records for their TTL.
- HTTP over TCP 80 or 443, stateless, cookies for state.
- GET, HEAD, PUT, DELETE idempotent; POST not.
- 200 OK, 301/302 redirect, 304 not modified, 404 not found, 500 server error.
- Non-persistent: 2 RTT per object. Persistent: 2 RTT + 1 RTT per object. Pipelined: 3 RTT total.
