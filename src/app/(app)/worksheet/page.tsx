import { Worksheet } from "@pages/worksheet/Worksheet";
import { getSampleWorksheet } from "@/data/worksheets";

export default function WorksheetPage() {
  const worksheet = getSampleWorksheet();
  return <Worksheet title={worksheet.title} content={worksheet.content} />;
}
