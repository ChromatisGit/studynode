import { readFile } from "node:fs/promises";
import { unified } from "unified";
import remarkParse from "remark-parse";
import type { Heading, Root, RootContent } from "mdast";

import type { Category } from "./schema";
import { createParserContext } from "./context";
import { processHeading } from "./headingProcessor";
import { processInlineDecorator } from "./inlineDecorators";

const DEFAULT_MARKDOWN_PATH =
  "base/math/vektorgeometrie/content-pool/example.md";

export async function extractCategories(
  markdownPath: string = DEFAULT_MARKDOWN_PATH,
): Promise<Category[]> {
  const markdown = await readFile(markdownPath, "utf8");
  const tree = unified().use(remarkParse).parse(markdown) as Root;
  const nodes = tree.children as RootContent[];

  const context = createParserContext(markdownPath);

  nodes.forEach((node, index) => {
    if (node.type === "heading") {
      processHeading({
        heading: node as Heading,
        index,
        nodes,
        tree,
        markdown,
        context,
        filePath: markdownPath,
      });
      return;
    }

    processInlineDecorator({ node, index, nodes, markdown, context });
  });

  return context.categories;
}
