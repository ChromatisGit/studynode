import { readFile } from "node:fs/promises";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from 'remark-gfm';
import type { Heading, Root, RootContent } from "mdast";

import type { Category } from "./schema";
import { createParserContext } from "./context";
import { processHeading } from "./headingProcessor";  
import { processContent } from "./contentProcessor";
import { collectContentBlock, BlockBoundary } from "./utils/markdown";

export async function extractCategories(markdownPath: string): Promise<Category[]> {
  const markdown = await readFile(markdownPath, "utf8");
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const nodes = tree.children as RootContent[];

  const context = createParserContext(markdownPath);

  const consumeBlock = (options: {
    startIndex: number;
    stopAtHeadingDepth?: number;
    boundary?: BlockBoundary;
  }) => collectContentBlock({ nodes, markdown, ...options });

  let index = 0;
  while (index < nodes.length) {
    const node = nodes[index];
    const nextIndex =
      node.type === "heading"
        ? processHeading({
            heading: node as Heading,
            index,
            nodes,
            tree,
            markdown,
            context,
            filePath: markdownPath,
            consumeBlock,
          })
        : processContent({
            node,
            index,
            markdown,
            context,
          });

    index = nextIndex ?? index + 1;
  }

  return context.categories;
}
