// Reading progress and test history, kept in this browser's localStorage.
const KEY = "gate27:v1";

type Attempt = { at: number; score: number; total: number; correct: number; wrong: number; seconds: number };
type State = {
  done: Record<string, number>;
  last?: { key: string; title: string; href: string; at: number };
  scroll: Record<string, number>;
  results: Record<string, Attempt[]>;
};

function read(): State {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return { done: s.done ?? {}, last: s.last, scroll: s.scroll ?? {}, results: s.results ?? {} };
  } catch {
    return { done: {}, scroll: {}, results: {} };
  }
}

function write(s: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export const isDone = (key: string) => !!read().done[key];
export const doneKeys = () => Object.keys(read().done);

export function markDone(key: string, on: boolean) {
  const s = read();
  if (on) s.done[key] = Date.now();
  else delete s.done[key];
  write(s);
}

export function setLast(key: string, title: string, href: string) {
  const s = read();
  s.last = { key, title, href, at: Date.now() };
  write(s);
}
export const getLast = () => read().last;

export function saveScroll(key: string, y: number) {
  const s = read();
  s.scroll[key] = Math.round(y);
  write(s);
}
export const getScroll = (key: string) => read().scroll[key] ?? 0;

export function addResult(testId: string, a: Attempt) {
  const s = read();
  (s.results[testId] ??= []).push(a);
  write(s);
}
export const getResults = (testId?: string) => (testId ? read().results[testId] ?? [] : read().results);

export function resetAll() {
  try {
    localStorage.removeItem(KEY);
    for (const k of Object.keys(localStorage)) if (k.startsWith("gate27:")) localStorage.removeItem(k);
  } catch {}
}
