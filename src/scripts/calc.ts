// Small expression evaluator for the on-screen calculator (no eval).
// Grammar: expr = term (('+'|'-') term)*; term = factor (('*'|'/') factor)*;
// factor = unary ('^' factor)?; unary = '-' unary | postfix; postfix = atom '!'*
const FN: Record<string, (x: number) => number> = {
  sin: (x) => Math.sin((x * Math.PI) / 180),
  cos: (x) => Math.cos((x * Math.PI) / 180),
  tan: (x) => Math.tan((x * Math.PI) / 180),
  log: Math.log10,
  ln: Math.log,
  "√": Math.sqrt,
  sqrt: Math.sqrt,
};

function fact(n: number) {
  if (n < 0 || !Number.isInteger(n) || n > 170) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function evaluate(src: string): number | null {
  const s = src.replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/");
  if (!s) return null;
  let i = 0;
  const peek = () => s[i];
  const eat = (c: string) => (s[i] === c ? (i++, true) : false);

  function expr(): number {
    let v = term();
    for (;;) {
      if (eat("+")) v += term();
      else if (eat("-")) v -= term();
      else return v;
    }
  }
  function term(): number {
    let v = factor();
    for (;;) {
      if (eat("*")) v *= factor();
      else if (eat("/")) v /= factor();
      else return v;
    }
  }
  function factor(): number {
    const b = unary();
    return eat("^") ? Math.pow(b, factor()) : b;
  }
  function unary(): number {
    if (eat("-")) return -unary();
    if (eat("+")) return unary();
    let v = atom();
    while (eat("!")) v = fact(v);
    return v;
  }
  function atom(): number {
    if (eat("(")) {
      const v = expr();
      eat(")");
      return v;
    }
    if (eat("π")) return Math.PI;
    const name = s.slice(i).match(/^(sin|cos|tan|log|ln|sqrt|√)/);
    if (name) {
      i += name[0].length;
      return FN[name[0]](atom());
    }
    if (peek() === "e" && s[i + 1] !== "x") {
      i++;
      return Math.E;
    }
    const num = s.slice(i).match(/^\d*\.?\d+(e[+-]?\d+)?/);
    if (!num) throw new Error("bad");
    i += num[0].length;
    return parseFloat(num[0]);
  }

  try {
    const v = expr();
    return i === s.length && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}
