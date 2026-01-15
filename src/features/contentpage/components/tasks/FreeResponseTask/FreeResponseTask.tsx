'use client';

import { useMemo } from 'react';
import { CollapsibleSection } from '@features/contentpage/components/CollapsibleSection/CollapsibleSection';
import { MarkdownRenderer } from '@features/contentpage/components/MarkdownRenderer/MarkdownRenderer';

import CONTENTPAGE_TEXT from '@features/contentpage/contentpage.de.json';
import sharedStyles from '@features/contentpage/styles/shared.module.css';
import styles from './FreeResponseTask.module.css';
import type { MathTaskMacro, TextTaskMacro } from '@domain/macroTypes';
import { useTaskPersistence } from '@features/contentpage/storage/useTaskPersistence';
import { getMarkdown } from '@features/contentpage/utils/textUtils';

type FreeResponseTaskType = TextTaskMacro | MathTaskMacro;

interface FreeResponseTaskProps {
  task: FreeResponseTaskType;
  isSingleTask?: boolean;
  triggerCheck: number;
  placeholder?: string;
  taskKey: string;
}

export function FreeResponseTask({
  task,
  isSingleTask = false,
  triggerCheck,
  placeholder = CONTENTPAGE_TEXT.freeResponseTask.placeholder,
  taskKey,
}: FreeResponseTaskProps) {
  const { value: answer, setValue: setAnswer } = useTaskPersistence<string>(taskKey, '');
  const isChecked = triggerCheck > 0 && Boolean(answer.trim());
  const instructionText = getMarkdown(task.instruction) ?? "";
  const hintText = getMarkdown(task.hint) ?? null;
  const solutionText = getMarkdown(task.solution) ?? null;

  const textareaRows = useMemo(() => {
    const solutionLines = solutionText ? solutionText.split('\n').length : 0;
    return Math.max(3, solutionLines + 1);
  }, [solutionText]);

  return (
    <div className={`${sharedStyles.stackMedium} ${isSingleTask ? sharedStyles.stackTight : ''}`}>
      <div className={sharedStyles.bodyText}>
        <MarkdownRenderer markdown={instructionText} />
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={placeholder}
        rows={textareaRows}
        className={styles.responseField}
      />

      <div className={sharedStyles.stackSmall}>
        {hintText ? (
          <CollapsibleSection type="hint" content={<MarkdownRenderer markdown={hintText} />} />
        ) : null}

        {solutionText && isChecked ? (
          <CollapsibleSection type="solution" content={<MarkdownRenderer markdown={solutionText} />} />
        ) : null}
      </div>
    </div>
  );
}
