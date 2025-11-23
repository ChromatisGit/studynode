import type { RootContent } from "mdast";

import { applyInlineDecorator, ParserContext } from "./context";
import { readInlineDecorator } from "./utils/decorators";
import { collectContentBlock } from "./utils/markdown";

export function processInlineDecorator({
  node,
  index,
  nodes,
  markdown,
  context,
}: {
  node: RootContent;
  index: number;
  nodes: RootContent[];
  markdown: string;
  context: ParserContext;
}) {
  const paraDeco = readInlineDecorator(node);
  if (!paraDeco) return;

  const { markdown: blockMarkdown } = collectContentBlock({
    nodes,
    startIndex: index,
    markdown,
    boundary: (candidate) =>
      candidate.type === "heading" || Boolean(readInlineDecorator(candidate)),
  });

  applyInlineDecorator(context, paraDeco.name, blockMarkdown, node);
}
