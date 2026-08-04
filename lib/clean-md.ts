// Converts raw MDX source into clean, agent-friendly markdown.
// Shared single source of truth for the /raw/docs route handler. The postbuild
// agent-output script reads the pre-rendered clean output this produces, so the
// cleaning logic lives in exactly one place.
//
// Transforms:
//   - strips YAML frontmatter;
//   - renders :::note / :::success / :::warning callouts as labeled blockquotes;
//   - pulls fenced-code titles out into a preceding bold caption line.

const CALLOUT = /^:::(note|success|warning)[ \t]*([^\n]*)\n([\s\S]*?)\n:::[ \t]*$/gm;
const FENCED_TITLE = /(^|\n)```([A-Za-z0-9_]+)[ \t]+([^\n]+)\n/g;

function toneLabel(tone: string): string {
  if (tone === "warning") return "Warning";
  if (tone === "success") return "Success";
  return "Note";
}

export function cleanMarkdown(raw: string): string {
  let src = raw.replace(/^---\n[\s\S]*?\n---\n*/, "");

  src = src.replace(CALLOUT, (_m, tone: string, title: string, body: string) => {
    const label = (title.trim() || toneLabel(tone)).trim();
    const lines = body
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .map((line: string) => `> ${line}`);
    return [`> **${label}**`, ...lines].join("\n");
  });

  src = src.replace(FENCED_TITLE, (_m, lead: string, lang: string, title: string) => {
    const caption = title.trim().replace(/^title="(.*)"$/, "$1");
    return `${lead}**${caption}**\n\n\`\`\`${lang}\n`;
  });

  return `${src.trim()}\n`;
}
