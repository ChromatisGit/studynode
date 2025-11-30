import { useRef } from 'react';
import { CategorySection } from '@features/worksheet/components/CategorySection/CategorySection';
import styles from './WorksheetContainer.module.css';
import type { Worksheet } from '@worksheet/types';

interface WorksheetContainerProps {
  worksheet: Worksheet;
}

export function WorksheetContainer({ worksheet }: WorksheetContainerProps) {
  // Use a ref to maintain task counter across all categories
  const taskCounterRef = useRef(1);

  return (
    <div className={styles.sheet}>
      <header className={styles.sheetHeader}>
        <h1 className={styles.sheetTitle}>{worksheet.title}</h1>
      </header>

      <div className={styles.categoryList}>
        {worksheet.content.map((block, index) => (
          <CategorySection key={index} block={block} taskCounterRef={taskCounterRef} />
        ))}
      </div>
    </div>
  );
}
