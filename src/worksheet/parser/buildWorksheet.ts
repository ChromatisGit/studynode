import { readFile } from "node:fs/promises";
import path from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Root, RootContent } from "mdast";
import { Parser } from "./parserClass";
import type { RenderMode, Worksheet } from "../types";

type BuildOptions = {
  title?: string;
  format?: RenderMode;
};

export async function buildWorksheetData(
  markdownPath: string,
  options: BuildOptions = {}
): Promise<Worksheet> {
  const markdown = await readFile(markdownPath, "utf8");
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const nodes = tree.children as RootContent[];

  const parser = new Parser(markdownPath);

  nodes.forEach((node) => {
    parser.processNode(node);
  });

  const categories = parser.finalize();

  const resolvedTitle =
    options.title ?? path.basename(markdownPath, path.extname(markdownPath));

  return {
    title: resolvedTitle,
    format: options.format ?? "web",
    content: categories,
  };
}
