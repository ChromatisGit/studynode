import { WorksheetRef } from "@builder/loadWorksheets";

// ToDo needs to convert to a button component
export function worksheetCards(worksheets: WorksheetRef[]) {
  if (worksheets.length === 0) return "";

  const cards = worksheets
    .map(
      (worksheet) => `<DocCard
  href="${worksheet.href}"
  label="${worksheet.label}"
  icon="${processToIcon[worksheet.process]}"
/>`
    )
    .join("\n");

  return `import DocCard from '@site/src/features/overview/DocCard';

<div className="row">
  ${cards}
</div>
  `;
}

// ToDo use fitting icons from lucide-react
const processToIcon = {
  "web": "",
  "pdf": "",
  "pdfSolution": ""
}