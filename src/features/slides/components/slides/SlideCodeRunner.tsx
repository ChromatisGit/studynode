"use client";

import { useState } from "react";
import { CodeRunner } from "@features/contentpage/components/CodeRunner/CodeRunner";
import { useTsRunner } from "@features/contentpage/components/CodeRunner/useTsRunner";

type Props = {
  code: string;
  language: string;
};

export function SlideCodeRunner({ code: initialCode, language: _language }: Props) {
  const [code, setCode] = useState(initialCode);
  const { isLoading, diagnostics, consoleOutput, runtimeError, hadRuntime, runCode } =
    useTsRunner();

  return (
    <CodeRunner
      code={code}
      onChange={setCode}
      onRun={() => runCode({ code, validate: false })}
      rows={Math.max(3, code.split("\n").length)}
      isLoading={isLoading}
      diagnostics={diagnostics}
      consoleOutput={consoleOutput}
      runtimeError={runtimeError}
      hadRuntime={hadRuntime}
    />
  );
}
