import { writeFile, readFile } from "./io";

export type PageFile = {
  source: string;
  target: string;
  sidebar?: string;
};

export async function processPageFile(file: PageFile) {
  const { source, target, sidebar } = file;

  let content = await readFile(source);
  const { frontmatter, body } = extractFrontmatter(content, source);

  if (sidebar !== undefined) {
    content = injectSidebar(frontmatter, body, sidebar);
  }

  await writeFile({ relativePath: target, content });
}

const FRONTMATTER_REGEX = /^---\s*([\s\S]*?)\s*---/;

function extractFrontmatter(content: string, source: string): {
  frontmatter: string;
  body: string;
} {
  // For testing only TODO: Remove this
  if (content.length === 0) {
    return { frontmatter: '', body: 'Test Page' };
  }

  const match = content.match(FRONTMATTER_REGEX);

  if (!match) {
    throw new Error(`Missing frontmatter header in file ${source}`);
  }

  const fullMatch = match[0];
  const fmContent = match[1].trim();
  const body = content.slice(fullMatch.length);

  return { frontmatter: fmContent, body };
}

function injectSidebar(
  frontmatter: string,
  body: string,
  sidebar: string
): string {
  return `---\n${frontmatter}\nsidebar: ${sidebar}\n---\n${body}`;
}