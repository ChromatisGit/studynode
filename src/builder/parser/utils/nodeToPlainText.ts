import type { Parent, RootContent, Text } from "mdast";

export function nodeToPlainText(node: RootContent | Parent): string {
  if (node.type === "text") {
    return (node as Text).value;
  }
  if ("children" in node && Array.isArray(node.children)) {
    return node.children.map((child) => nodeToPlainText(child as any)).join("");
  }
  return "";
}
