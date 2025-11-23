import {
    Parent,
    Text,
    RootContent,
} from "mdast";

function nodeToPlainText(node: RootContent | Parent): string {
    if ((node as Text).type === "text") {
        return (node as Text).value;
    }
    if ("children" in node && Array.isArray(node.children)) {
        return node.children.map((c) => nodeToPlainText(c as any)).join("");
    }
    return "";
}