import type { RenderMode, Worksheet } from "@worksheet/types";
import WORKSHEET_TEST from "@worksheet/test.json";
import styles from "@features/worksheet/layout/WorksheetPage.module.css";
import { WorksheetContainer } from "@features/worksheet/components/WorksheetContainer/WorksheetContainer";

const sampleWorksheet: Worksheet = {
  ...WORKSHEET_TEST,
  format: WORKSHEET_TEST.format as RenderMode,
  content: WORKSHEET_TEST.content as Worksheet["content"],
};

export default function Worksheet() {
  return (

      <div className={styles.pageInner}>
        <WorksheetContainer worksheet={sampleWorksheet} />
      </div>
  );
}