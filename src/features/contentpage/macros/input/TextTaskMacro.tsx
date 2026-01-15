"use client";

import { useState, useEffect } from "react";
import type { TextTaskMacro as TextTaskMacroType } from "@domain/macroTypes";
import type { MacroComponentProps } from "../types";
import { MarkdownRenderer } from "../../components/MarkdownRenderer/MarkdownRenderer";
import { getMarkdown } from "../../utils/textUtils";
import { useWorksheetStorage } from "../../storage/WorksheetStorageContext";
import { Stack } from "@components/Stack";
import styles from "./TextTaskMacro.module.css";

type Props = MacroComponentProps<TextTaskMacroType>;

export function TextTaskMacro({ macro, context }: Props) {
  const storage = useWorksheetStorage();
  const [answer, setAnswer] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  // Load persisted state
  useEffect(() => {
    if (context.persistState && context.storageKey && storage) {
      const saved = storage.readResponse(context.storageKey);
      if (saved) {
        setAnswer(saved);
      }
    }
  }, [context.persistState, context.storageKey, storage]);

  // Save state when it changes
  useEffect(() => {
    if (context.persistState && context.storageKey && storage && answer) {
      storage.saveResponse(context.storageKey, answer);
    }
  }, [context.persistState, context.storageKey, storage, answer]);

  // Respond to check trigger
  useEffect(() => {
    if (context.checkTrigger && context.checkTrigger > 0) {
      setIsChecked(true);
    }
  }, [context.checkTrigger]);

  const instruction = getMarkdown(macro.instruction);
  const hint = getMarkdown(macro.hint);
  const solution = getMarkdown(macro.solution);

  return (
    <Stack gap="md">
      {instruction && <MarkdownRenderer markdown={instruction} />}

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={isChecked}
        className={styles.textarea}
        rows={4}
        placeholder="Enter your answer..."
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
