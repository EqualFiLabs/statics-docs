import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const docsRoot = path.join(ROOT, "content", "docs");

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

const docFiles = walk(docsRoot).filter((file) => file.endsWith(".mdx"));
const slugs = new Map();
const ids = new Map();
const errors = [];

for (const file of docFiles) {
  const source = fs.readFileSync(file, "utf8");
  const slug = source.match(/^slug:\s*(.+)$/m)?.[1].trim();
  const id = source.match(/^id:\s*(.+)$/m)?.[1].trim();
  if (!slug || !id) {
    errors.push(`${path.relative(ROOT, file)}: missing frontmatter id or slug`);
    continue;
  }
  if (slugs.has(slug)) errors.push(`${path.relative(ROOT, file)}: duplicate slug ${slug}`);
  if (ids.has(id)) errors.push(`${path.relative(ROOT, file)}: duplicate id ${id}`);
  slugs.set(slug, file);
  ids.set(id, file);
}

const sourceFiles = [
  ...docFiles,
  ...walk(path.join(ROOT, "app")).filter((file) => /\.(ts|tsx)$/.test(file)),
  ...walk(path.join(ROOT, "components")).filter((file) => /\.(ts|tsx)$/.test(file)),
];

for (const file of sourceFiles) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(/\/docs\/([A-Za-z0-9_./-]+)/g)) {
    const slug = match[1].replace(/\/$/, "");
    if (slugs.has(slug)) continue;
    const line = source.slice(0, match.index).split("\n").length;
    errors.push(`${path.relative(ROOT, file)}:${line}: missing /docs/${slug}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`check-internal-links: ${docFiles.length} docs pages, no broken internal docs routes`);
