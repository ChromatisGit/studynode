import type {
  Code,
  Heading,
  InlineCode,
  List,
  ListItem,
  Parent,
  RootContent,
  Text,
} from "mdast";

export function nodeToPlainText(node: RootContent | Parent): string {
  if (node.type === "text") {
    return (node as Text).value;
  }
  if ("children" in node && Array.isArray(node.children)) {
    return node.children.map((child) => nodeToPlainText(child as any)).join("");
  }
  return "";
}

export function nodesToMarkdown(contentNodes: RootContent[]): string {
  return contentNodes.map((node) => serializeNode(node)).join("\n\n");
}

function serializeNode(node: RootContent | Parent): string {
  switch (node.type) {
    case "text":
      return (node as Text).value;
    case "paragraph":
      return serializeChildren(node as Parent);
    case "list": {
      const listNode = node as List;
      const start = listNode.start ?? 1;

      return listNode.children
        .map((child, index) => {
          const prefix = listNode.ordered ? `${start + index}. ` : "- ";
          const content = serializeListItem(child as ListItem);
          return `${prefix}${content}`;
        })
        .join("\n");
    }
    case "listItem":
      return serializeListItem(node as ListItem);
    case "heading": {
      const heading = node as Heading;
      return `${"#".repeat(heading.depth)} ${serializeChildren(heading as Parent)}`;
    }
    case "inlineCode":
      return `\`${(node as InlineCode).value}\``;
    case "code": {
      const codeNode = node as Code;
      const lang = codeNode.lang ? codeNode.lang : "";
      return `\`\`\`${lang}\n${codeNode.value}\n\`\`\``;
    }
    case "break":
      return "\n";
    default:
      if ("children" in node && Array.isArray((node as any).children)) {
        return serializeChildren(node as Parent);
      }
      if ("value" in (node as any)) {
        return String((node as any).value ?? "");
      }
      return "";
  }
}

function serializeChildren(node: Parent): string {
  return (node.children as any[])
    .map((child) => serializeNode(child as any))
    .join("");
}

function serializeListItem(item: ListItem): string {
  const checkbox = item.checked === true ? "[x] " : item.checked === false ? "[ ] " : "";
  const content = serializeChildren(item as unknown as Parent).trim();
  return `${checkbox}${content}`;
}
