"use client";

import { useState, useEffect } from "react";
import type { CodeTaskMacro as CodeTaskMacroType } from "@domain/macroTypes";
import type { MacroComponentProps } from "../types";
import { MarkdownRenderer } from "../../components/MarkdownRenderer/MarkdownRenderer";
import { getMarkdown } from "../../utils/textUtils";
import { useWorksheetStorage } from "../../storage/WorksheetStorageContext";
import { CodeRunner } from "../../components/CodeRunner/CodeRunner";
import { useTsRunner } from "../../components/CodeRunner/useTsRunner";
import { Stack } from "@components/Stack";
import styles from "./CodeTaskMacro.module.css";

type Props = MacroComponentProps<CodeTaskMacroType>;

export function CodeTaskMacro({ macro, context }: Props) {
  const storage = useWorksheetStorage();
  const [code, setCode] = useState(macro.starter || "");
  const [isChecked, setIsChecked] = useState(false);

  const { isLoading, diagnostics, consoleOutput, runtimeError, hadRuntime, runCode } =
    useTsRunner();

  // Load persisted state
  useEffect(() => {
    if (context.persistState && context.storageKey && storage) {
      const saved = storage.readResponse(context.storageKey);
      if (saved) {
        setCode(saved);
      }
    }
  }, [context.persistState, context.storageKey, storage]);

  // Save state when it changes
  useEffect(() => {
    if (context.persistState && context.storageKey && storage && code !== macro.starter) {
      storage.saveResponse(context.storageKey, code);
    }
  }, [context.persistState, context.storageKey, storage, code, macro.starter]);

  // Respond to check trigger
  useEffect(() => {
    if (context.checkTrigger && context.checkTrigger > 0) {
      setIsChecked(true);
      if (macro.validation) {
        runCode({ code, validate: true, validation: macro.validation });
      } else {
        runCode({ code, validate: false });
      }
    }
  }, [context.checkTrigger]);

  const handleRun = () => {
    runCode({ code, validate: false });
  };

  const instruction = getMarkdown(macro.instruction);
  const hint = getMarkdown(macro.hint);
  const solution = getMarkdown(macro.solution);

  return (
    <Stack gap="md">
      {instruction && <MarkdownRenderer markdown={instruction} />}

      <CodeRunner
        code={code}
        onChange={setCode}
        onRun={handleRun}
        rows={Math.max(3, code.split("\n").length)}
        readOnly={isChecked}
        isLoading={isLoading}
        diagnostics={diagnostics}
        runtimeError={runtimeError}
        consoleOutput={consoleOutput}
        hadRuntime={hadRuntime}
      />

      {isChecked && (hint || solution) && (
        <div className={styles.meta}>
          {hint && (
            <details className={styles.details}>
              <summary>Hint</summary>
              <MarkdownRenderer markdown={hint} />
            </details>
          )}
          {solution && (
            <details className={styles.details}>
              <summary>Solution</summary>
              <MarkdownRenderer markdown={solution} />
            </details>
          )}
        </div>
      )}
    </Stack>
  );
}
