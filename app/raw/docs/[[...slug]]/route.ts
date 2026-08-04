import fs from "node:fs";
import path from "node:path";

import { type NextRequest, NextResponse } from "next/server";

import { cleanMarkdown } from "@/lib/clean-md";
import { getStaticDocSlugs } from "@/lib/docs";

const docsDirectory = path.resolve(process.cwd(), "content", "docs");

export const dynamic = "force-static";

export function generateStaticParams() {
  return getStaticDocSlugs().map((slug: string[]) => ({ slug }));
}

function resolveDoc(segments: string[]): string | null {
  const resolved = path.resolve(docsDirectory, ...segments) + ".mdx";
  const within =
    resolved === `${docsDirectory}${path.sep}` || resolved.startsWith(`${docsDirectory}${path.sep}`);
  if (!within || !fs.existsSync(resolved)) {
    return null;
  }
  return resolved;
}

export function GET(_request: NextRequest, context: { params: { slug?: string[] } }) {
  const filePath = resolveDoc(context.params.slug ?? []);
  if (!filePath) {
    return new NextResponse("Not found", { status: 404 });
  }
  const body = cleanMarkdown(fs.readFileSync(filePath, "utf8"));
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
