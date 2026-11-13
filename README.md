# GATE 2027 CS prep

Study notes and timed mock tests for the GATE 2027 Computer Science paper, served at https://gate.athash.in.

## Run locally

```bash
bun install
bun run dev
```

## Deploy

The site is static. `bun run deploy` builds it into `dist/` and uploads it to Cloudflare Workers, which serves it on `gate.athash.in` (see `wrangler.jsonc`).

## Exam date

The header countdown reads `EXAM_DATE` in `src/config.ts`. Set it to the CS session once IIT Madras publishes the paper-wise schedule.
