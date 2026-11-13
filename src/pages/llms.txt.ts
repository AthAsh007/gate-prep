import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SECTIONS } from "../data/syllabus";
import { getPapers } from "../lib/tests";

const SITE = "https://gate.athash.in";

export const GET: APIRoute = async () => {
  const notes = await getCollection("notes");
  const byId = new Map(notes.map((n) => [n.id, n]));
  const papers = getPapers();

  const lines = [
    "# GATE 2027 CS Prep",
    "",
    "> Free study notes for every topic in the GATE 2027 Computer Science and Information Technology (CS) syllabus published by IIT Madras, plus timed GATE-style mock tests. Independent site, not affiliated with IIT Madras or the GATE organising committee.",
    "",
    "Each topic page has definitions, formulas, worked examples with full solutions, common traps and a quick revision list. Full mocks follow the GATE CS pattern: 65 questions (10 General Aptitude, 55 Engineering Mathematics and CS), 100 marks, 180 minutes, MCQ with 1/3 negative marking, MSQ and NAT with none.",
    "",
    `Author: Atharva Ashtekar (${"https://athash.in/"})`,
    `Full text of all notes: ${SITE}/llms-full.txt`,
    "",
  ];

  for (const s of SECTIONS) {
    lines.push(`## Section ${s.n}: ${s.title}`, "");
    for (const t of s.topics) {
      const n = byId.get(`${s.slug}/${t.slug}`);
      if (n) lines.push(`- [${n.data.title}](${SITE}/notes/${s.slug}/${t.slug}/): ${n.data.summary}`);
    }
    lines.push("");
  }

  lines.push("## Tests", "");
  for (const p of papers) lines.push(`- [${p.title}](${SITE}/tests/${p.id}/): ${p.questions.length} questions, ${p.minutes} minutes`);
  lines.push("", "## Optional", "", `- [About](${SITE}/about/)`, `- [Disclaimer](${SITE}/disclaimer/)`, `- [Privacy](${SITE}/privacy/)`, "");

  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
