# GATE 2027 CS Prep

Free study notes and timed mock tests for the GATE 2027 Computer Science and Information Technology (CS) paper.

Live site: **https://gate.athash.in**

## What's in it

- **Notes:** one page for each of the 59 topics in the [GATE 2027 CS syllabus](syllabus/CS_GATE2027_Syllabus.pdf) (IIT Madras). Each page has definitions, formulas, worked examples, common traps and a quick revision list.
- **Tests:** 10 full-length mocks in the GATE pattern (65 questions, 100 marks, 180 minutes, General Aptitude included) and 10 subject tests. The test screen copies the real one: question palette, mark for review, MCQ/MSQ/NAT, on-screen calculator, negative marking on MCQs, auto-submit at zero, and a full solution for every question after you submit.
- **Progress:** topics marked done, reading position, unfinished attempts and scores are saved in the browser's local storage. A service worker keeps visited pages available offline. There are no accounts and no tracking.
- **Countdown:** the header counts down to the first GATE 2027 exam day.

## Tech

- [Astro](https://astro.build) static site, Markdown notes in a content collection
- Math rendered at build time with KaTeX (`remark-math` + `rehype-katex` for notes, `marked` + KaTeX for questions)
- Self-hosted fonts: Fraunces, Inter, JetBrains Mono
- Hosted on Cloudflare Workers static assets

## Project layout

```
src/
  config.ts                  exam date for the countdown
  data/syllabus.ts           sections and topics (drives every page)
  data/questions/*.json      question banks, one per section + general-aptitude
  content/notes/<section>/   one Markdown note per topic
  lib/tests.ts               builds the full mocks and subject tests from the banks
  lib/render.ts              Markdown + LaTeX to HTML for questions
  scripts/exam.ts            test runner (timer, palette, scoring, review)
  scripts/progress.ts        local storage for progress and scores
  pages/                     routes, plus llms.txt and llms-full.txt
public/                      robots.txt, service worker, headers, icons
scripts/validate-content.ts  checks notes and question banks
```

## Run locally

Needs [Bun](https://bun.sh).

```bash
bun install
bun run dev        # http://localhost:4321
bun run build      # static output in dist/
```

## Adding or fixing content

Notes are Markdown files with front matter (`title`, `summary`, `order`, `sources`). Questions are JSON objects:

```json
{
  "id": "os-001",
  "topic": "scheduling",
  "type": "mcq",
  "marks": 2,
  "q": "Question text with $LaTeX$",
  "options": ["...", "...", "...", "..."],
  "answer": 2,
  "explanation": "Step-by-step solution"
}
```

`answer` is an option index for `mcq`, a list of indices for `msq`, and `{ "min": x, "max": y }` for `nat`.

Check everything before committing:

```bash
bun scripts/validate-content.ts            # all sections
bun scripts/validate-content.ts databases  # one section
```

## Deploy

Pushing to `main` deploys through Cloudflare Workers Builds (build command `bun run build`, deploy command `npx wrangler deploy`). `wrangler.jsonc` attaches the custom domain `gate.athash.in`. To deploy by hand: `bun run deploy`.

## Exam date

`EXAM_DATE` in `src/config.ts` points at the first exam day (6 February 2027). Change it to the CS session once IIT Madras publishes the paper-wise schedule.

## Disclaimer

An independent study site, not affiliated with IIT Madras or the GATE organising committee. See the [disclaimer](https://gate.athash.in/disclaimer/).

## License

Code and content © Atharva Ashtekar. All rights reserved. See the [terms of use](https://gate.athash.in/terms/).
