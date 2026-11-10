/** Limpa o texto rico por lista fechada de elementos (o editor só produz estes). */
const ALLOWED = new Set(["p", "h2", "h3", "ul", "ol", "li", "strong", "b", "em", "i", "u", "s", "a", "blockquote", "br", "hr", "aside", "table", "thead", "tbody", "tr", "th", "td", "figure", "figcaption", "img", "mark"]);

export function sanitize(html: string) {
  return html
    .replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (tag, name: string, attrs: string) => {
      const n = name.toLowerCase();
      if (!ALLOWED.has(n)) return "";
      if (tag.startsWith("</")) return `</${n}>`;
      const keep: string[] = [];
      const href = /href="([^"]*)"/i.exec(attrs)?.[1];
      if (n === "a" && href && /^(\/|https?:|mailto:)/.test(href)) keep.push(`href="${href}"`);
      const src = /src="([^"]*)"/i.exec(attrs)?.[1];
      if (n === "img" && src && /^(\/|https?:|data:image\/)/.test(src)) keep.push(`src="${src}"`, `alt="${(/alt="([^"]*)"/i.exec(attrs)?.[1] ?? "").replace(/"/g, "")}"`);
      if (n === "aside") keep.push('class="callout"');
      return `<${n}${keep.length ? " " + keep.join(" ") : ""}>`;
    });
}
