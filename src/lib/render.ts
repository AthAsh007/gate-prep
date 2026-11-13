// Renders question text (Markdown + $math$) to HTML at build time.
import { marked } from "marked";
import katex from "katex";

marked.setOptions({ gfm: true, breaks: false });

export function renderMd(src: string, inline = false): string {
  const code: string[] = [];
  const math: string[] = [];

  // Keep code spans and fences away from the math pass.
  let text = src.replace(/```[\s\S]*?```|`[^`\n]+`/g, (m) => {
    code.push(m);
    return `\u0000C${code.length - 1}\u0000`;
  });

  text = text.replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g, (_, display, inl) => {
    const tex = display ?? inl;
    let html: string;
    try {
      html = katex.renderToString(tex, { displayMode: !!display, throwOnError: false, output: "html" });
    } catch {
      html = tex;
    }
    math.push(html);
    return `@@MATH${math.length - 1}@@`;
  });

  text = text.replace(/\u0000C(\d+)\u0000/g, (_, i) => code[+i]);
  let html = (inline ? marked.parseInline(text) : marked.parse(text)) as string;
  html = html.replace(/@@MATH(\d+)@@/g, (_, i) => math[+i]);
  return html;
}
