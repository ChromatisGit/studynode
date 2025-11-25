import { readFile } from "node:fs/promises";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from 'remark-gfm';
import type { Root, RootContent } from "mdast";
import { Parser } from "./parserClass";

export async function extractCategories(markdownPath: string) {
  const markdown = await readFile(markdownPath, "utf8");
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const nodes = tree.children as RootContent[];

  const parser = new Parser(markdownPath);

  nodes.forEach((node) => {{parser.processNode(node)  }})

  return parser.finalize()
}
