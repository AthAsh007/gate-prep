import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SECTIONS } from "../data/syllabus";

const SITE = "https://gate.athash.in";

export const GET: APIRoute = async () => {
  const notes = await getCollection("notes");
  const byId = new Map(notes.map((n) => [n.id, n]));
  const out = [
    "# GATE 2027 CS Prep: all notes",
    "",
    `> Study notes for the GATE 2027 CS syllabus by Atharva Ashtekar. Source: ${SITE}/. Math is written in LaTeX between $ signs.`,
    "",
  ];
  for (const s of SECTIONS) {
    for (const t of s.topics) {
      const n = byId.get(`${s.slug}/${t.slug}`);
      if (!n) continue;
      out.push(`# ${s.title}: ${n.data.title}`, "", `URL: ${SITE}/notes/${s.slug}/${t.slug}/`, "", n.body?.trim() ?? "", "", "---", "");
    }
  }
  return new Response(out.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
