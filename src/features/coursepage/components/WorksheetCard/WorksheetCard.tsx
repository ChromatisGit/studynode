import { Card } from "@/components/Card";
import type { WorksheetRef } from "@domain/courseContent";

export default function WorksheetCard({ label, href, worksheetFormat }: WorksheetRef) {
  return (
    <Card
      title={label}
      subtitle={worksheetFormat}
      actionLabel="Open"
      href={href}
    />
  );
}
