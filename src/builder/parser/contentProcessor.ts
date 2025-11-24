import type { RootContent } from "mdast";
import { ensureTaskSet, ParserContext } from "./context";
import { nodeToPlainText } from "./utils/nodeToPlainText";

export function processContent({
    node,
    index,
    markdown,
    context,
}: {
    node: RootContent;
    index: number;
    markdown: string;
    context: ParserContext;
}): number {
    // Attach stray content (paragraphs, code blocks, etc.) to the current task set as descriptive text.
    const taskSet = ensureTaskSet(context, node);
    const raw = sliceMarkdown(node, markdown);
    if (!raw.trim()) return index + 1;

    taskSet.text = taskSet.text ? `${taskSet.text}\n\n${raw.trim()}` : raw.trim();
    return index + 1;
}

function sliceMarkdown(node: RootContent, markdown: string): string {
    const start = node.position?.start?.offset;
    const end = node.position?.end?.offset;
    if (start != null && end != null) {
        return markdown.slice(start, end);
    }
    return nodeToPlainText(node);
}
