// Builds the test papers from the question banks at build time.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { SECTIONS } from "../data/syllabus";
import { renderMd } from "./render";

export type RawQuestion = {
  id: string;
  topic: string;
  type: "mcq" | "msq" | "nat";
  marks: 1 | 2;
  q: string;
  options?: string[];
  answer: number | number[] | { min: number; max: number };
  explanation: string;
};

export type PaperQuestion = {
  id: string;
  section: string;
  part: "ga" | "cs";
  topic: string;
  type: RawQuestion["type"];
  marks: 1 | 2;
  html: string;
  options?: string[];
  answer: RawQuestion["answer"];
  explanation: string;
};

export type Paper = {
  id: string;
  kind: "full" | "subject";
  title: string;
  blurb: string;
  minutes: number;
  questions: PaperQuestion[];
};

const GA = "general-aptitude";
const dir = join(process.cwd(), "src/data/questions");

function load(slug: string): RawQuestion[] {
  const f = join(dir, `${slug}.json`);
  return existsSync(f) ? (JSON.parse(readFileSync(f, "utf8")) as RawQuestion[]) : [];
}

function toPaper(q: RawQuestion, section: string): PaperQuestion {
  return {
    id: q.id,
    section,
    part: section === GA ? "ga" : "cs",
    topic: q.topic,
    type: q.type,
    marks: q.marks,
    html: renderMd(q.q),
    options: q.options?.map((o) => renderMd(o, true)),
    answer: q.answer,
    explanation: renderMd(q.explanation),
  };
}

// Takes n items from a pool starting at offset, wrapping if the pool is short.
function take<T>(pool: T[], offset: number, n: number): T[] {
  if (!pool.length) return [];
  return Array.from({ length: Math.min(n, pool.length) }, (_, i) => pool[(offset + i) % pool.length]);
}

const MAX_FULL_MOCKS = 20;
// 1-mark questions per section in a mock (sums to 25); rotated each mock so
// every section gets the same total across the series. 2-mark: 3 each (30).
const ONE_MARK_SPLIT = [3, 2, 3, 3, 3, 2, 2, 3, 2, 2];

let cache: Paper[] | null = null;

export function getPapers(): Paper[] {
  if (cache) return cache;
  const banks = SECTIONS.map((s) => ({ slug: s.slug, title: s.title, qs: load(s.slug) }));
  const ga = load(GA);
  const ga1 = ga.filter((q) => q.marks === 1);
  const ga2 = ga.filter((q) => q.marks === 2);
  const papers: Paper[] = [];

  const used1 = banks.map(() => 0);
  const used2 = banks.map(() => 0);
  // As many full mocks as the banks allow without reusing a question: per mock
  // each section gives 2.5 one-mark (on average) and 3 two-mark questions, and
  // General Aptitude gives 5 of each.
  const count = (qs: RawQuestion[], m: 1 | 2) => qs.filter((q) => q.marks === m).length;
  const fullMocks = Math.min(
    MAX_FULL_MOCKS,
    Math.floor(ga1.length / 5),
    Math.floor(ga2.length / 5),
    ...banks.map((b) => Math.min(Math.floor(count(b.qs, 1) / 2.5), Math.floor(count(b.qs, 2) / 3))),
  );
  for (let m = 0; m < fullMocks; m++) {
    const qs: PaperQuestion[] = [
      ...take(ga1, m * 5, 5).map((q) => toPaper(q, GA)),
      ...take(ga2, m * 5, 5).map((q) => toPaper(q, GA)),
    ];
    const one: PaperQuestion[] = [];
    const two: PaperQuestion[] = [];
    banks.forEach((b, i) => {
      const n1 = ONE_MARK_SPLIT[(i + m) % ONE_MARK_SPLIT.length];
      const p1 = b.qs.filter((q) => q.marks === 1);
      const p2 = b.qs.filter((q) => q.marks === 2);
      one.push(...take(p1, used1[i], n1).map((q) => toPaper(q, b.slug)));
      two.push(...take(p2, used2[i], 3).map((q) => toPaper(q, b.slug)));
      used1[i] += n1;
      used2[i] += 3;
    });
    qs.push(...one, ...two);
    if (qs.length < 20) continue;
    papers.push({
      id: `full-mock-${String(m + 1).padStart(2, "0")}`,
      kind: "full",
      title: `Full mock ${m + 1}`,
      blurb: "65 questions, 100 marks: General Aptitude plus every CS subject.",
      minutes: 180,
      questions: qs,
    });
  }

  // Subject tests: Set A and Set B, 25 questions each (10 one-mark, 15 two-mark),
  // taken from the end of each bank so they overlap the early mocks least.
  for (const b of banks) {
    const p1 = b.qs.filter((q) => q.marks === 1);
    const p2 = b.qs.filter((q) => q.marks === 2);
    const sets = [
      { id: `subject-${b.slug}`, name: "Set A", qs: [...p1.slice(-20, -10), ...p2.slice(-30, -15)] },
      { id: `subject-${b.slug}-b`, name: "Set B", qs: [...p1.slice(-10), ...p2.slice(-15)] },
    ];
    for (const s of sets) {
      if (s.qs.length < 25) continue;
      papers.push({
        id: s.id,
        kind: "subject",
        title: `${b.title}: ${s.name}`,
        blurb: `${s.qs.length} questions on ${b.title} only.`,
        minutes: 75,
        questions: s.qs.map((q) => toPaper(q, b.slug)),
      });
    }
  }

  cache = papers;
  return papers;
}

export const totalMarks = (p: Paper) => p.questions.reduce((s, q) => s + q.marks, 0);
