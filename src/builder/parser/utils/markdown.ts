import type { Heading, RootContent } from "mdast";

export type BlockBoundary = (node: RootContent, index: number) => boolean;

export type ContentBlock = {
  markdown: string;
  endIndex: number;
  nextIndex: number;
};

export type CollectContentBlockOptions = {
  nodes: RootContent[];
  startIndex: number;
  markdown: string;
  stopAtHeadingDepth?: number;
  boundary?: BlockBoundary;
};

/**
 * Consumes all nodes after `startIndex` until a boundary is hit and returns the raw markdown slice.
 * The `nextIndex` points to the first node after the consumed block, making it easy to advance a cursor.
 */
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
    return { markdown: "", endIndex: startIndex, nextIndex: startIndex + 1 };
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
    return { markdown: "", endIndex, nextIndex: startIndex + 1 };
  }

  const sliceStart = Math.max(0, blockStart ?? 0);
  const sliceEnd = Math.max(sliceStart, blockEnd ?? sliceStart);

  return {
    markdown: markdown.slice(sliceStart, sliceEnd),
    endIndex,
    nextIndex: endIndex + 1,
  };
}
