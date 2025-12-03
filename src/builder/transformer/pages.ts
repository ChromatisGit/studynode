import { renderPageWithFrontmatter } from "@builder/template/pageFrontmatter";
import { readContentFile } from "../io";
import { WorksheetRef } from "@builder/loadWorksheets";

export type PageSource = {
  source: string;
  target: string;
  label: string;
  worksheets?: WorksheetRef[];
};

export async function buildPageFile(page: PageSource) {
  const {source, target, label, worksheets} = page;
  const body = await readContentFile(source);

  return {
    relativePath: target,
    content: renderPageWithFrontmatter({
      label,
      worksheets: worksheets ?? [],
      isIndexPage: (target.endsWith("index.md") || target.endsWith("index.mdx")),
      body,
    }),
  };
}
