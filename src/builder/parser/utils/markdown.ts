import type { Heading, RootContent } from "mdast";

export type BlockBoundary = (node: RootContent, index: number) => boolean;

export interface ContentBlock {
  markdown: string;
  endIndex: number;
}

export interface CollectContentBlockOptions {
  nodes: RootContent[];
  startIndex: number;
  markdown: string;
  stopAtHeadingDepth?: number;
  boundary?: BlockBoundary;
}

export function collectContentBlock({
  nodes,
  startIndex,
  markdown,
  stopAtHeadingDepth,
  boundary,
}: CollectContentBlockOptions): ContentBlock {
  const startNode = nodes[startIndex];
  const referenceDepth =
    stopAtHeadingDepth ??
    (startNode?.type === "heading" ? (startNode as Heading).depth : undefined);

  const fallbackBoundary: BlockBoundary = (node) => {
    if (node.type !== "heading") return false;
    if (referenceDepth == null) return false;
    return (node as Heading).depth <= referenceDepth;
  };

  const shouldStop = boundary ?? fallbackBoundary;
  const firstContentIndex = startIndex + 1;
  if (firstContentIndex >= nodes.length) {
    return { markdown: "", endIndex: startIndex };
  }

  const firstContentNode = nodes[firstContentIndex];
  let blockStart =
    firstContentNode?.position?.start?.offset ??
    startNode?.position?.end?.offset ??
    0;
  let blockEnd = blockStart;
  let endIndex = startIndex;

  for (let i = firstContentIndex; i < nodes.length; i++) {
    const node = nodes[i];
    if (shouldStop(node, i)) {
      break;
    }
    endIndex = i;
    const nodeEnd = node.position?.end?.offset;
    if (nodeEnd != null) {
      blockEnd = nodeEnd;
    }
  }

  if (endIndex === startIndex) {
    return { markdown: "", endIndex };
  }

  const sliceStart = Math.max(0, blockStart ?? 0);
  const sliceEnd = Math.max(sliceStart, blockEnd ?? sliceStart);

  return {
    markdown: markdown.slice(sliceStart, sliceEnd),
    endIndex,
  };
}
