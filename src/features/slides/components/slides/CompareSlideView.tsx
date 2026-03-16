import { MarkdownRenderer } from "@features/contentpage/components/MarkdownRenderer/MarkdownRenderer";
import type { CompareSlide } from "@schema/slideTypes";
import { SlideHeader } from "./SlideHeader";
import { FocusBox } from "./FocusBox";
import { ResultBox } from "./ResultBox";
import styles from "./slide.module.css";

const ACCENT = "var(--sn-blue-accent)";
const RESULT_ACCENT = "var(--sn-purple-accent)";

type Props = { slide: CompareSlide; revealStep: number };

export function CompareSlideView({ slide, revealStep }: Props) {
  const colCount = slide.columns.length;
  const resultVisible = slide.result != null && revealStep >= 1;

  return (
    <>
      <SlideHeader title={slide.header} badge="Vergleich" accent="blue" />
      <div style={{ padding: "var(--sn-space-md) var(--sn-space-xl)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--sn-space-md)", minHeight: 0 }}>
        {slide.focus && <FocusBox text={slide.focus} accent={ACCENT} />}
        <div
          className={styles.compareGrid}
          style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
        >
          {slide.columns.map((col, i) => (
            <div key={i} className={styles.compareColumn}>
              <div className={styles.compareColumnTitle}>
                <MarkdownRenderer markdown={col.title} />
              </div>
              <div className={styles.compareColumnBody}>
                <MarkdownRenderer markdown={col.body} />
              </div>
            </div>
          ))}
        </div>
        {slide.result != null && (
          <ResultBox
            result={slide.result}
            visible={resultVisible}
            accent={RESULT_ACCENT}
          />
        )}
      </div>
    </>
  );
}
