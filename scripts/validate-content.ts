// Checks notes and question banks against the schema.
// Usage: bun scripts/validate-content.ts [section-slug ...]
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import katex from "katex";
import { SECTIONS } from "../src/data/syllabus";

const GA = "general-aptitude";
const GA_TOPICS = ["verbal", "quantitative", "analytical", "spatial"];
const root = join(import.meta.dir, "..");
const wanted = process.argv.slice(2);
const targets = wanted.length ? wanted : [...SECTIONS.map((s) => s.slug), GA];

let errors = 0;
const fail = (where: string, msg: string) => {
  errors++;
  console.log(`ERROR ${where}: ${msg}`);
};

function checkMath(where: string, text: string) {
  const re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  for (const m of text.matchAll(re)) {
    try {
      katex.renderToString(m[1] ?? m[2], { throwOnError: true, displayMode: !!m[1] });
    } catch (e) {
      fail(where, `bad LaTeX "${(m[1] ?? m[2]).slice(0, 60)}": ${(e as Error).message.slice(0, 120)}`);
    }
  }
}

function checkProse(where: string, text: string) {
  if (/—/.test(text)) fail(where, "contains an em dash");
  if (/[“”‘’]/.test(text)) fail(where, "contains curly quotes");
  if (/\b(AI|LLM)[- ]generated\b/i.test(text)) fail(where, "says it was generated");
}

for (const slug of targets) {
  const section = SECTIONS.find((s) => s.slug === slug);
  const topics = slug === GA ? GA_TOPICS : section?.topics.map((t) => t.slug);
  if (!topics) {
    fail(slug, "unknown section");
    continue;
  }

  // notes
  if (section) {
    for (const t of section.topics) {
      const f = join(root, "src/content/notes", slug, `${t.slug}.md`);
      const where = `notes/${slug}/${t.slug}.md`;
      if (!existsSync(f)) {
        fail(where, "missing");
        continue;
      }
      const raw = readFileSync(f, "utf8");
      const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!fm) {
        fail(where, "no front matter");
        continue;
      }
      for (const k of ["title:", "summary:", "order:", "sources:"]) if (!fm[1].includes(k)) fail(where, `front matter missing ${k}`);
      const body = raw.slice(fm[0].length);
      const words = body.split(/\s+/).filter(Boolean).length;
      if (words < 900) fail(where, `only ${words} words; aim for 1200+`);
      checkMath(where, body.replace(/```[\s\S]*?```/g, ""));
      checkProse(where, raw);
    }
  }

  // formula sheet
  if (section) {
    const f = join(root, "src/content/sheets", `${slug}.md`);
    const where = `sheets/${slug}.md`;
    if (!existsSync(f)) fail(where, "missing");
    else {
      const raw = readFileSync(f, "utf8");
      const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!fm || !fm[1].includes("title:") || !fm[1].includes("summary:")) fail(where, "front matter needs title and summary");
      const body = fm ? raw.slice(fm[0].length) : raw;
      const words = body.split(/\s+/).filter(Boolean).length;
      if (words < 700) fail(where, `only ${words} words`);
      checkMath(where, body.replace(/```[\s\S]*?```/g, ""));
      checkProse(where, raw);
    }
  }

  // questions
  const qf = join(root, "src/data/questions", `${slug}.json`);
  if (!existsSync(qf)) {
    fail(`questions/${slug}.json`, "missing");
    continue;
  }
  let qs: any[];
  try {
    qs = JSON.parse(readFileSync(qf, "utf8"));
  } catch (e) {
    fail(`questions/${slug}.json`, `invalid JSON: ${(e as Error).message}`);
    continue;
  }
  const ids = new Set<string>();
  const count = { 1: 0, 2: 0, mcq: 0, msq: 0, nat: 0 } as Record<string, number>;
  for (const [i, q] of qs.entries()) {
    const where = `questions/${slug}.json #${i} (${q.id})`;
    if (!q.id || ids.has(q.id)) fail(where, "missing or duplicate id");
    ids.add(q.id);
    if (!topics.includes(q.topic)) fail(where, `topic "${q.topic}" not in this section`);
    if (![1, 2].includes(q.marks)) fail(where, "marks must be 1 or 2");
    if (!["mcq", "msq", "nat"].includes(q.type)) fail(where, "type must be mcq, msq or nat");
    if (typeof q.q !== "string" || q.q.length < 15) fail(where, "question text missing");
    if (typeof q.explanation !== "string" || q.explanation.length < 20) fail(where, "explanation missing");
    count[q.marks]++;
    count[q.type]++;
    if (q.type === "mcq" || q.type === "msq") {
      if (!Array.isArray(q.options) || q.options.length !== 4) fail(where, "needs exactly 4 options");
      else if (new Set(q.options).size !== 4) fail(where, "options repeat");
    }
    if (q.type === "mcq" && !(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4)) fail(where, "mcq answer must be an index 0-3");
    if (q.type === "msq" && !(Array.isArray(q.answer) && q.answer.length >= 1 && q.answer.every((a: number) => Number.isInteger(a) && a >= 0 && a < 4) && new Set(q.answer).size === q.answer.length))
      fail(where, "msq answer must be a list of distinct indices 0-3");
    if (q.type === "nat") {
      if (q.options) fail(where, "nat must not have options");
      if (!(q.answer && typeof q.answer.min === "number" && typeof q.answer.max === "number" && q.answer.min <= q.answer.max)) fail(where, "nat answer must be {min, max}");
    }
    const text = [q.q, q.explanation, ...(q.options ?? [])].join("\n");
    checkMath(where, text.replace(/```[\s\S]*?```/g, ""));
    checkProse(where, text);
  }
  const texts = new Map<string, string>();
  for (const q of qs) {
    const key = [q.q, ...(q.options ?? [])].join("|").replace(/\s+/g, " ").trim().toLowerCase();
    if (texts.has(key)) fail(`questions/${slug}.json`, `${q.id} repeats the text of ${texts.get(key)}`);
    texts.set(key, q.id);
  }
  const covered = new Set(qs.map((q) => q.topic));
  for (const t of topics) if (!covered.has(t)) fail(`questions/${slug}.json`, `no question for topic ${t}`);
  console.log(`${slug}: ${qs.length} questions (1-mark ${count[1]}, 2-mark ${count[2]}; mcq ${count.mcq}, msq ${count.msq}, nat ${count.nat})`);
}

console.log(errors ? `\n${errors} error(s)` : "\nOK");
process.exit(errors ? 1 : 0);
