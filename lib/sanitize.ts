/**
 * lib/sanitize.ts
 * Robust HTML sanitizer for admin blog & CMS inputs to prevent XSS attacks.
 */

const ALLOWED_TAGS = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "strike",
  "a", "img", "ul", "ol", "li", "blockquote",
  "figure", "figcaption", "div", "span", "br", "hr",
  "table", "thead", "tbody", "tr", "th", "td",
  "code", "pre", "sub", "sup"
]);

const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel", "class"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading", "class"]),
  figure: new Set(["class"]),
  figcaption: new Set(["class"]),
  div: new Set(["class"]),
  span: new Set(["class"]),
  p: new Set(["class"]),
  h2: new Set(["class"]),
  h3: new Set(["class"]),
  h4: new Set(["class"]),
  blockquote: new Set(["class"]),
  ul: new Set(["class"]),
  ol: new Set(["class"]),
  li: new Set(["class"]),
  table: new Set(["class"]),
  th: new Set(["class", "colspan", "rowspan"]),
  td: new Set(["class", "colspan", "rowspan"]),
};

export function sanitizeHtml(html: string): string {
  if (!html) return "";

  // 1. Remove dangerous script and style elements entirely with their content
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // 2. Parse and filter tags & attributes using regex scanner
  clean = clean.replace(/<\/?([a-zA-Z0-9_-]+)([^>]*)>/g, (match, tagNameRaw, attrString) => {
    const tagName = tagNameRaw.toLowerCase();
    const isClosing = match.startsWith("</");

    if (!ALLOWED_TAGS.has(tagName)) {
      return ""; // Strip forbidden tags
    }

    if (isClosing) {
      return `</${tagName}>`;
    }

    const allowedAttrs = ALLOWED_ATTRIBUTES[tagName] || new Set(["class"]);
    const cleanedAttrs: string[] = [];

    // Parse attributes: key="value" or key='value' or key=val
    const attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let attrMatch: RegExpExecArray | null;

    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";

      // Block any inline event handler (on*)
      if (attrName.startsWith("on")) {
        continue;
      }

      if (!allowedAttrs.has(attrName)) {
        continue;
      }

      // Check protocol security on href and src
      if (attrName === "href" || attrName === "src") {
        const trimmed = attrValue.trim().toLowerCase();
        if (
          trimmed.startsWith("javascript:") ||
          trimmed.startsWith("vbscript:") ||
          trimmed.startsWith("data:text/html")
        ) {
          continue; // Disallow dangerous protocols
        }
      }

      // Auto-add rel="noopener noreferrer" for external links
      if (tagName === "a" && attrName === "target" && attrValue === "_blank") {
        cleanedAttrs.push('target="_blank"');
        cleanedAttrs.push('rel="noopener noreferrer"');
        continue;
      }

      // Escape quotes in value
      const escapedVal = attrValue
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      cleanedAttrs.push(`${attrName}="${escapedVal}"`);
    }

    const attrsFormatted = cleanedAttrs.length > 0 ? " " + cleanedAttrs.join(" ") : "";
    return `<${tagName}${attrsFormatted}>`;
  });

  return clean;
}
