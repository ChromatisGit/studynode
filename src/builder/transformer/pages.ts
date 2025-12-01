import { renderPageWithFrontmatter } from "@builder/template/pageFrontmatter";
import { readContentFile } from "../fs";

export type PageSource = {
  source: string;
  target: string;
  label: string;
  sidebar?: string;
};

export async function buildPageFile(page: PageSource) {
  const body = await readContentFile(page.source);

  return {
    relativePath: page.target,
    content: renderPageWithFrontmatter({
      label: page.label,
      sidebar: page.sidebar,
      body,
    }),
  };
}
