import path from "node:path";
import { WorksheetParser } from "@worksheet/parser/parserClass";
import { WorksheetLocation } from "@builder/loadWorksheets";
import { OUT_DIR, readContentFile, writeGeneratedFile } from "@builder/io";
import { generatePDF } from "./generatePDF";
import { renderWorksheet } from "@builder/template/worksheet";

export type ProcessFormat = "web" | "pdf" | "pdfSolution"

const buildPdfPath = (target: string) =>
  path.resolve(process.cwd(), OUT_DIR, `${target}.pdf`);

export async function buildWorksheet(
  worksheet: WorksheetLocation,
): Promise<void> {
  switch (worksheet.process) {
    case "web": {
      const rawContent = await readContentFile(worksheet.source);
      const parser = new WorksheetParser(worksheet.source, rawContent);
      const renderedWorksheet = renderWorksheet(parser.parse())
      await writeGeneratedFile({
        relativePath: `${worksheet.target}.mdx`,
        content: renderedWorksheet,
      });
      return;
    }

    case "pdf": {
      await generatePDF(worksheet.source, buildPdfPath(worksheet.target), {
        showSolutions: false,
      });
      return;
    }

    case "pdfSolution": {
      await Promise.all([
        generatePDF(worksheet.source, buildPdfPath(worksheet.target), {
          showSolutions: false,
        }),
        generatePDF(worksheet.source, buildPdfPath(`${worksheet.target}-Loesung`), {
          showSolutions: true,
        }),
      ]);
      return;
    }
  }
}

