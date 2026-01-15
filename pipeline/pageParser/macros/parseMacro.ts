import { Markdown, RawText } from "@schema/page";
import { ProtectedBlock } from "../codeBlockGuard";
import { Macro, parseMacroType } from "./macroRegistry";
import { Params, parseParams } from "./parseParams";
import { parseRawText } from "./parseRawText";
import { RawMacroBlock, RawNode, splitMacroAndText } from "./splitMacroAndText";

export type RawMacro = {
    type: string,
    protectedBlocks: ProtectedBlock[],
    params?: Params,
    inlineMacros?: InlineMacros
    content?: RawText,
}

type MacroGroup = {
    type: "group",
    intro?: Markdown
    macros: Macro[]
}

type InlineMacros = Record<string, RawText>

export function parseGroupMacro(node: RawMacroBlock, protectedBlocks: ProtectedBlock[]): MacroGroup {
    const groupNodes = splitMacroAndText(node.content)

    const macroGroup: MacroGroup = {
        type: "group",
        macros: []
    }

    if ("rawText" in groupNodes[0]) {
        macroGroup.intro = parseRawText(groupNodes.shift() as RawText, protectedBlocks)
    }

    assertOnlyMacroBlocks(groupNodes)

    if (groupNodes.length === 0) {
        //ToDo improve error message
        throw new Error("#group needs at least 1 task macro")
    }

    macroGroup.macros = groupNodes.map((node) => {
        return parseMacro(node, protectedBlocks)
    })

    return macroGroup
}

export function parseMacro(node: RawMacroBlock, protectedBlocks: ProtectedBlock[]): Macro {
    if(node.type === "group") {
        throw new Error("#group cannot be used inside another macro")
    }

    const macro: RawMacro = { type: node.type, protectedBlocks };

    if (node.content) {
        const { inlineMacros, content } = extractInlineMacros(node.content);

        if (Object.keys(inlineMacros).length > 0) {
            macro.inlineMacros = inlineMacros;
        }

        macro.content = content;
    }

    if (node.params) {
        const params = parseParams(node.params);

        if (Object.keys(params).length > 0) {
            macro.params = params;
        }
    }

    return parseMacroType(macro);
}


function extractInlineMacros(src: string): { inlineMacros: InlineMacros, content: RawText } {
    let inlineNodes = splitMacroAndText(src)
    let content: RawText;

    if ("rawText" in inlineNodes[0]) {
        content = inlineNodes.shift() as RawText
    }

    assertOnlyMacroBlocks(inlineNodes)

    if (inlineNodes.some((node) => node.params)) {
        //ToDo improve error message
        throw new Error("Inline macros cannot have any parameter")
    }

    const inlineMacros: InlineMacros = {};

    inlineNodes.forEach((node) => {
        inlineMacros[node.type] = {
            rawText: node.content
        }
    })

    return { inlineMacros, content }
}

function assertOnlyMacroBlocks(nodes: RawNode[]): asserts nodes is RawMacroBlock[] {
    if (nodes.some(n => "rawText" in n)) {
        throw new Error("Text is only allowed before macros inside a macro")
    }
}



