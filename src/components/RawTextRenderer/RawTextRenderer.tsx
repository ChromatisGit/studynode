import type { RawText } from "@domain/page";
import type { ReactNode } from "react";
import { Fragment, createElement } from "react";
import { unified } from "unified";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeReact from "rehype-react";
import { BlockMath, InlineMath } from "react-katex";
import { visit } from "unist-util-visit";
import type { Node } from "unist";

type MarkdownNode = Node & {
  value?: string;
  alt?: string;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
  children?: MarkdownNode[];
};

function setHName(
  node: MarkdownNode,
  hName: string,
  hProperties?: Record<string, unknown>
) {
  const data = node.data ?? {};
  data.hName = hName;
  if (hProperties) {
    const existing =
      (data.hProperties as Record<string, unknown> | undefined) ?? {};
    data.hProperties = { ...existing, ...hProperties };
  }
  node.data = data;
}

function replaceWithText(node: MarkdownNode, value: string) {
  node.type = "text";
  node.value = value;
  delete node.children;
}

function isUnderlineStrong(node: MarkdownNode, source: string): boolean {
  const start = node.position?.start?.offset;
  const end = node.position?.end?.offset;
  if (start == null || end == null) return false;
  const slice = source.slice(start, end);
  return slice.startsWith("__") && slice.endsWith("__");
}

// Normalize unsupported nodes to allowed tags and map math to React components.
function remarkRawTextTransforms() {
  return (tree: MarkdownNode, file: { value?: unknown }) => {
    const source = typeof file.value === "string" ? file.value : "";
    visit(tree, (node: MarkdownNode) => {
      switch (node.type) {
        case "heading":
          setHName(node, "p");
          break;
        case "strong":
          if (isUnderlineStrong(node, source)) {
            setHName(node, "span", { className: ["sn-underline"] });
          }
          break;
        case "inlineMath":
          setHName(node, "InlineMath", { math: node.value ?? "" });
          break;
        case "math":
          setHName(node, "BlockMath", { math: node.value ?? "" });
          break;
        case "image":
          replaceWithText(node, node.alt ?? "");
          break;
        case "break":
          replaceWithText(node, "\n");
          break;
        case "html":
          replaceWithText(node, node.value ?? "");
          break;
        case "link":
          setHName(node, "a", { target: "_blank", rel: "noreferrer" });
          break;
        default:
          break;
      }
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkRawTextTransforms)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeReact, {
    createElement,
    Fragment,
    jsx: createElement,
    jsxs: createElement,
    components: {
      InlineMath,
      BlockMath,
    },
  });

export function RawTextRenderer({ rawText }: RawText): ReactNode {
  const rendered = processor.processSync(rawText).result as ReactNode;
  return <div className="sn-rawtext">{rendered}</div>;
}
