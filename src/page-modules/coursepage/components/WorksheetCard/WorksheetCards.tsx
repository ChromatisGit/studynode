import type { WorksheetRef } from "@worksheet/worksheetModel";
import WorksheetCard from "@pages/worksheet/components/WorksheetCard/WorksheetCard";
import styles from "./WorksheetCards.module.css";

type WorksheetCardsProps = {
  worksheets: WorksheetRef[];
};

export function WorksheetCards({ worksheets }: WorksheetCardsProps) {
  return (
    <div className={styles.grid}>
      {worksheets.map((worksheet) => (
        <WorksheetCard key={`${worksheet.href}-${worksheet.process}`} {...worksheet} />
      ))}
    </div>
  );
}
