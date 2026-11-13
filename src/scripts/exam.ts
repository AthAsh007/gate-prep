// GATE-style test runner. State lives in localStorage so a reload resumes the attempt.
import { addResult } from "./progress";
import { evaluate } from "./calc";

type Answer = number | number[] | { min: number; max: number };
type Q = {
  id: string;
  section: string;
  part: "ga" | "cs";
  topic: string;
  type: "mcq" | "msq" | "nat";
  marks: 1 | 2;
  html: string;
  options?: string[];
  answer: Answer;
  explanation: string;
};
type Paper = { id: string; kind: string; title: string; minutes: number; questions: Q[] };
type Status = "nv" | "na" | "a" | "m" | "am";
type Given = number | number[] | string;
type Attempt = {
  startedAt: number;
  endsAt: number;
  current: number;
  saved: Record<string, Given>;
  status: Record<string, Status>;
  submittedAt?: number;
};

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const LETTERS = ["A", "B", "C", "D"];
const STATUS_LABEL: Record<Status, string> = {
  nv: "Not visited",
  na: "Not answered",
  a: "Answered",
  m: "Marked for review",
  am: "Answered and marked",
};

export function startExam() {
  const paper: Paper = JSON.parse($("paper-data").textContent!);
  const qs = paper.questions;
  const KEY = `gate27:attempt:${paper.id}`;
  const parts = [...new Set(qs.map((q) => q.part))];
  const PART_LABEL = { ga: "General Aptitude", cs: "Computer Science" } as const;

  let att: Attempt | null = load();
  let draft: Given | undefined;
  let timer = 0;

  function load(): Attempt | null {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "null");
    } catch {
      return null;
    }
  }
  function persist() {
    try {
      if (att) localStorage.setItem(KEY, JSON.stringify(att));
      else localStorage.removeItem(KEY);
    } catch {}
  }

  function show(screen: "intro" | "exam" | "results") {
    for (const s of ["intro", "exam", "results"]) $(`screen-${s}`).hidden = s !== screen;
    document.body.classList.toggle("exam-mode", screen === "exam");
    scrollTo(0, 0);
  }

  // ---------- intro ----------
  const agree = $<HTMLInputElement>("agree");
  const startBtn = $<HTMLButtonElement>("start-btn");
  agree.addEventListener("change", () => (startBtn.disabled = !agree.checked));
  startBtn.addEventListener("click", () => {
    const now = Date.now();
    att = { startedAt: now, endsAt: now + paper.minutes * 60_000, current: 0, saved: {}, status: {} };
    persist();
    enterExam();
  });

  if (att && !att.submittedAt) {
    if (att.endsAt <= Date.now()) {
      finish(true);
    } else {
      $("resume-box").hidden = false;
      $("resume-left").textContent = fmt(att.endsAt - Date.now());
      $("resume-btn").addEventListener("click", enterExam);
      $("discard-btn").addEventListener("click", () => {
        att = null;
        persist();
        $("resume-box").hidden = true;
      });
    }
  } else if (att?.submittedAt) {
    renderResults();
    show("results");
  }

  // ---------- exam ----------
  function enterExam() {
    show("exam");
    buildTabs();
    go(att!.current);
    tick();
    clearInterval(timer);
    timer = window.setInterval(tick, 1000);
    addEventListener("beforeunload", warn);
  }
  const warn = (e: BeforeUnloadEvent) => {
    if (att && !att.submittedAt) e.preventDefault();
  };

  function fmt(ms: number) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
  }
  function tick() {
    if (!att) return;
    const left = att.endsAt - Date.now();
    const el = $("timer");
    el.textContent = fmt(left);
    el.parentElement!.classList.toggle("low", left < 5 * 60_000);
    if (left <= 0) finish(true);
  }

  function buildTabs() {
    const tabs = $("q-tabs");
    if (parts.length < 2) return;
    tabs.hidden = false;
    tabs.innerHTML = parts
      .map((p) => `<button type="button" role="tab" data-part="${p}">${PART_LABEL[p]}</button>`)
      .join("");
    tabs.querySelectorAll<HTMLButtonElement>("button").forEach((b) =>
      b.addEventListener("click", () => {
        const first = qs.findIndex((q) => q.part === b.dataset.part);
        go(first);
      }),
    );
  }

  const statusOf = (q: Q): Status => att!.status[q.id] ?? "nv";

  function go(i: number) {
    if (!att) return;
    i = Math.max(0, Math.min(qs.length - 1, i));
    att.current = i;
    const q = qs[i];
    if (statusOf(q) === "nv") att.status[q.id] = "na";
    persist();
    draft = att.saved[q.id];
    if (Array.isArray(draft)) draft = [...draft];
    renderQuestion();
    renderPalette();
    closePalette();
  }

  function renderQuestion() {
    const i = att!.current;
    const q = qs[i];
    const local = qs.filter((x) => x.part === q.part).indexOf(q) + 1;
    $("q-num").textContent = `Question ${parts.length > 1 ? local : i + 1}`;
    const neg = q.type === "mcq" ? (q.marks === 1 ? "−1/3" : "−2/3") : "0";
    $("q-meta").innerHTML = `<span class="chip">${q.type.toUpperCase()}</span><span class="chip">+${q.marks}</span><span class="chip">Wrong: ${neg}</span>`;
    $("q-text").innerHTML = q.html;
    $("q-tabs").querySelectorAll<HTMLButtonElement>("button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.part === q.part)));
    $<HTMLButtonElement>("prev-btn").disabled = i === 0;

    const box = $("q-answer");
    if (q.type === "nat") {
      box.innerHTML = `
        <label class="nat-label" for="nat-input">Your answer</label>
        <input class="nat-input" id="nat-input" inputmode="decimal" autocomplete="off" value="${typeof draft === "string" ? draft : ""}" />
        <div class="keypad">${["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "-", "⌫", "Clear"]
          .map((k) => `<button type="button" data-k="${k}">${k}</button>`)
          .join("")}</div>`;
      const input = $<HTMLInputElement>("nat-input");
      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^0-9.\-]/g, "");
        draft = input.value;
      });
      box.querySelectorAll<HTMLButtonElement>(".keypad button").forEach((b) =>
        b.addEventListener("click", () => {
          const k = b.dataset.k!;
          if (k === "⌫") input.value = input.value.slice(0, -1);
          else if (k === "Clear") input.value = "";
          else if (k === "-") input.value = input.value.startsWith("-") ? input.value.slice(1) : `-${input.value}`;
          else if (!(k === "." && input.value.includes("."))) input.value += k;
          draft = input.value;
        }),
      );
    } else {
      const multi = q.type === "msq";
      box.innerHTML = `<p class="pick-hint">${multi ? "Select all correct options." : "Select one option."}</p>` +
        q.options!
          .map((o, k) => {
            const on = multi ? Array.isArray(draft) && draft.includes(k) : draft === k;
            return `<label class="opt${on ? " on" : ""}">
              <input type="${multi ? "checkbox" : "radio"}" name="opt" value="${k}" ${on ? "checked" : ""} />
              <span class="opt-key">${LETTERS[k]}</span><span class="opt-text">${o}</span></label>`;
          })
          .join("");
      box.querySelectorAll<HTMLInputElement>("input").forEach((inp) =>
        inp.addEventListener("change", () => {
          const k = Number(inp.value);
          if (multi) {
            const set = new Set(Array.isArray(draft) ? draft : []);
            inp.checked ? set.add(k) : set.delete(k);
            draft = [...set].sort();
          } else draft = k;
          box.querySelectorAll("label.opt").forEach((l) => l.classList.toggle("on", (l.querySelector("input") as HTMLInputElement).checked));
        }),
      );
    }
    $("q-text").closest(".q-scroll")!.scrollTop = 0;
  }

  const hasValue = (v: Given | undefined) =>
    v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0) && !(typeof v === "string" && isNaN(Number(v)));

  function commit(mark: boolean) {
    const q = qs[att!.current];
    if (hasValue(draft)) {
      att!.saved[q.id] = draft!;
      att!.status[q.id] = mark ? "am" : "a";
    } else {
      delete att!.saved[q.id];
      att!.status[q.id] = mark ? "m" : "na";
    }
    persist();
  }

  $("save-btn").addEventListener("click", () => {
    commit(false);
    att!.current < qs.length - 1 ? go(att!.current + 1) : renderPalette();
  });
  $("mark-btn").addEventListener("click", () => {
    commit(true);
    att!.current < qs.length - 1 ? go(att!.current + 1) : renderPalette();
  });
  $("clear-btn").addEventListener("click", () => {
    const q = qs[att!.current];
    draft = undefined;
    delete att!.saved[q.id];
    att!.status[q.id] = "na";
    persist();
    renderQuestion();
    renderPalette();
  });
  $("prev-btn").addEventListener("click", () => go(att!.current - 1));

  function counts(list: Q[]) {
    const c: Record<Status, number> = { nv: 0, na: 0, a: 0, m: 0, am: 0 };
    list.forEach((q) => c[statusOf(q)]++);
    return c;
  }

  function renderPalette() {
    const cur = qs[att!.current];
    const list = qs.filter((q) => q.part === cur.part);
    const c = counts(list);
    $("legend").innerHTML = (Object.keys(STATUS_LABEL) as Status[])
      .map((s) => `<li><span class="pal ${s}">${c[s]}</span>${STATUS_LABEL[s]}</li>`)
      .join("");
    $("palette-section").textContent = parts.length > 1 ? PART_LABEL[cur.part] : "";
    $("palette-grid").innerHTML = list
      .map((q, n) => {
        const idx = qs.indexOf(q);
        const s = statusOf(q);
        return `<button type="button" class="pal ${s}${idx === att!.current ? " cur" : ""}" data-i="${idx}" aria-label="Question ${n + 1}, ${STATUS_LABEL[s]}">${n + 1}</button>`;
      })
      .join("");
    $("palette-grid").querySelectorAll<HTMLButtonElement>("button").forEach((b) => b.addEventListener("click", () => go(Number(b.dataset.i))));
  }

  const palette = $("palette");
  const openPalette = () => palette.classList.add("open");
  const closePalette = () => palette.classList.remove("open");
  $("palette-open").addEventListener("click", openPalette);
  $("palette-close").addEventListener("click", closePalette);

  // ---------- submit ----------
  const dlg = $<HTMLDialogElement>("submit-dialog");
  $("submit-btn").addEventListener("click", () => {
    const rows = parts
      .map((p) => {
        const c = counts(qs.filter((q) => q.part === p));
        return `<tr><td>${parts.length > 1 ? PART_LABEL[p] : "All"}</td><td>${c.a + c.am}</td><td>${c.na + c.m}</td><td>${c.nv}</td><td>${c.m + c.am}</td></tr>`;
      })
      .join("");
    $("submit-summary").innerHTML = `<p>Time left: <b>${fmt(att!.endsAt - Date.now())}</b></p>
      <table><thead><tr><th>Section</th><th>Answered</th><th>Not answered</th><th>Not visited</th><th>Marked</th></tr></thead><tbody>${rows}</tbody></table>`;
    dlg.showModal();
  });
  $("submit-cancel").addEventListener("click", () => dlg.close());
  $("submit-confirm").addEventListener("click", () => {
    dlg.close();
    finish(false);
  });

  function finish(timeUp: boolean) {
    if (!att || att.submittedAt) return;
    clearInterval(timer);
    removeEventListener("beforeunload", warn);
    att.submittedAt = Math.min(Date.now(), att.endsAt);
    persist();
    const r = score();
    addResult(paper.id, {
      at: att.submittedAt,
      score: r.score,
      total: r.total,
      correct: r.correct,
      wrong: r.wrong,
      seconds: Math.round((att.submittedAt - att.startedAt) / 1000),
    });
    renderResults(timeUp);
    show("results");
  }

  // ---------- scoring ----------
  function judge(q: Q, given: Given | undefined): "right" | "wrong" | "skipped" {
    if (!hasValue(given)) return "skipped";
    if (q.type === "mcq") return given === q.answer ? "right" : "wrong";
    if (q.type === "msq") {
      const want = [...(q.answer as number[])].sort().join(",");
      return [...(given as number[])].sort().join(",") === want ? "right" : "wrong";
    }
    const v = Number(given);
    const { min, max } = q.answer as { min: number; max: number };
    return v >= min - 1e-9 && v <= max + 1e-9 ? "right" : "wrong";
  }
  const points = (q: Q, j: ReturnType<typeof judge>) =>
    j === "right" ? q.marks : j === "wrong" && q.type === "mcq" ? -q.marks / 3 : 0;

  function score() {
    let s = 0, total = 0, correct = 0, wrong = 0;
    const bySection: Record<string, { score: number; total: number }> = {};
    for (const q of qs) {
      const j = judge(q, att!.saved[q.id]);
      const p = points(q, j);
      s += p;
      total += q.marks;
      if (j === "right") correct++;
      if (j === "wrong") wrong++;
      const b = (bySection[q.section] ??= { score: 0, total: 0 });
      b.score += p;
      b.total += q.marks;
    }
    return { score: Math.round(s * 100) / 100, total, correct, wrong, skipped: qs.length - correct - wrong, bySection };
  }

  const pretty = (slug: string) => slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

  function renderResults(timeUp = false) {
    const r = score();
    const used = Math.round((att!.submittedAt! - att!.startedAt) / 60000);
    const pct = Math.max(0, (r.score / r.total) * 100);
    $("score-card").innerHTML = `
      <div class="score-main">
        <div class="score-ring" style="--p:${pct.toFixed(1)}"><b>${r.score}</b><span>of ${r.total}</span></div>
        <div>
          ${timeUp ? `<p class="time-up">Time ran out, so the paper was submitted automatically.</p>` : ""}
          <dl class="score-stats">
            <div><dt>Correct</dt><dd class="good">${r.correct}</dd></div>
            <div><dt>Wrong</dt><dd class="bad">${r.wrong}</dd></div>
            <div><dt>Not attempted</dt><dd>${r.skipped}</dd></div>
            <div><dt>Time used</dt><dd>${used} min</dd></div>
            <div><dt>Accuracy</dt><dd>${r.correct + r.wrong ? Math.round((r.correct / (r.correct + r.wrong)) * 100) : 0}%</dd></div>
          </dl>
        </div>
      </div>`;
    $("section-scores").innerHTML =
      Object.keys(r.bySection).length > 1
        ? `<h2>By subject</h2><div class="bars">${Object.entries(r.bySection)
            .map(([k, v]) => {
              const w = Math.max(0, (v.score / v.total) * 100);
              return `<div class="bar-row"><span>${pretty(k)}</span><div class="bar"><i style="width:${w}%"></i></div><b>${Math.round(v.score * 100) / 100} / ${v.total}</b></div>`;
            })
            .join("")}</div>`
        : "";
    renderReview("all");
  }

  function renderReview(filter: string) {
    $("review-filter").querySelectorAll<HTMLButtonElement>("button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.f === filter)));
    $("review-list").innerHTML = qs
      .map((q, i) => ({ q, i, given: att!.saved[q.id], j: judge(q, att!.saved[q.id]) }))
      .filter((x) => filter === "all" || x.j === filter)
      .map(({ q, i, given, j }) => {
        const p = points(q, j);
        let ans = "";
        if (q.type === "nat") {
          const a = q.answer as { min: number; max: number };
          ans = `<p class="nat-review">Your answer: <b>${hasValue(given) ? given : "not attempted"}</b> · Accepted: <b>${a.min === a.max ? a.min : `${a.min} to ${a.max}`}</b></p>`;
        } else {
          const correct = Array.isArray(q.answer) ? q.answer : [q.answer as number];
          const mine = Array.isArray(given) ? given : typeof given === "number" ? [given] : [];
          ans = `<div class="opts-review">${q.options!
            .map((o, k) => {
              const cls = correct.includes(k) ? "ok" : mine.includes(k) ? "no" : "";
              const tag = correct.includes(k) ? "Correct" : mine.includes(k) ? "Your pick" : "";
              return `<div class="opt-r ${cls}"><span class="opt-key">${LETTERS[k]}</span><span class="opt-text">${o}</span>${tag ? `<em>${mine.includes(k) && correct.includes(k) ? "Your pick, correct" : tag}</em>` : ""}</div>`;
            })
            .join("")}</div>`;
        }
        return `<li class="rev ${j}">
          <div class="rev-head"><b>Q${i + 1}</b><span class="chip">${q.type.toUpperCase()}</span><span class="chip">${pretty(q.section)}</span><span class="rev-pts ${j}">${p > 0 ? "+" : ""}${Math.round(p * 100) / 100}</span></div>
          <div class="rev-q">${q.html}</div>${ans}
          <details><summary>Solution</summary><div class="rev-exp">${q.explanation}</div></details>
        </li>`;
      })
      .join("") || `<li class="rev-empty">Nothing here.</li>`;
  }
  $("review-filter").querySelectorAll<HTMLButtonElement>("button").forEach((b) => b.addEventListener("click", () => renderReview(b.dataset.f!)));

  $("retake-btn").addEventListener("click", () => {
    att = null;
    persist();
    agree.checked = false;
    startBtn.disabled = true;
    $("resume-box").hidden = true;
    show("intro");
  });

  // ---------- calculator ----------
  const calc = $<HTMLDialogElement>("calc-dialog");
  const display = $<HTMLInputElement>("calc-display");
  const result = $("calc-result");
  const recalc = () => {
    const v = evaluate(display.value);
    result.textContent = v === null ? (display.value ? "…" : "0") : String(+v.toPrecision(12));
  };
  $("calc-open").addEventListener("click", () => calc.show());
  $("calc-close").addEventListener("click", () => calc.close());
  display.addEventListener("input", recalc);
  $("calc-keys").querySelectorAll<HTMLButtonElement>("button").forEach((b) =>
    b.addEventListener("click", () => {
      const k = b.dataset.k!;
      if (k === "C") display.value = "";
      else if (k === "⌫") display.value = display.value.slice(0, -1);
      else if (k === "=") {
        const v = evaluate(display.value);
        if (v !== null) display.value = String(+v.toPrecision(12));
      } else display.value += k;
      recalc();
    }),
  );
}
