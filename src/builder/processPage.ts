import { writeFile, readFile } from "./io";

export type PageFile = {
  source: string;
  target: string;
  sidebar?: string;
};

export async function processPageFile(file: PageFile) {
  const { source, target, sidebar } = file;

  let content = await readFile(source);

  if (sidebar !== undefined) {
    content = injectSidebar(sidebar);
  }

  await writeFile({ relativePath: target, content });
}

function injectSidebar(
  title: string,
  body: string,
  sidebar: string
): string {
  return `---\n${title}\nsidebar: ${sidebar}\n---\n${body}`;
}