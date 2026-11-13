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

const FULL_MOCKS = 10;
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
  // A full mock needs every subject and General Aptitude.
  const complete = ga.length > 0 && banks.every((b) => b.qs.length > 0);
  for (let m = 0; complete && m < FULL_MOCKS; m++) {
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

  for (const b of banks) {
    if (b.qs.length < 10) continue;
    const p1 = b.qs.filter((q) => q.marks === 1);
    const p2 = b.qs.filter((q) => q.marks === 2);
    // Later questions in each bank, so the subject test overlaps the first mocks least.
    const qs = [...p1.slice(-10), ...p2.slice(-15)].map((q) => toPaper(q, b.slug));
    papers.push({
      id: `subject-${b.slug}`,
      kind: "subject",
      title: b.title,
      blurb: `${qs.length} questions on ${b.title} only.`,
      minutes: 75,
      questions: qs,
    });
  }

  cache = papers;
  return papers;
}

export const totalMarks = (p: Paper) => p.questions.reduce((s, q) => s + q.marks, 0);
