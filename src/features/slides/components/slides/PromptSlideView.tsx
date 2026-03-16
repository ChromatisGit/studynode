import type { PromptSlide } from "@schema/slideTypes";
import { SlideHeader } from "./SlideHeader";
import { FocusBox } from "./FocusBox";
import { BulletList } from "./BulletList";
import { ResultBox } from "./ResultBox";
import { MaterialRenderer } from "./MaterialRenderer";
import styles from "./slide.module.css";

const ACCENT = "var(--sn-blue-accent)";

type Props = { slide: PromptSlide; revealStep: number; projector?: boolean };

export function PromptSlideView({ slide, revealStep, projector }: Props) {
  const bullets = slide.bullets ?? [];
  const hasResult = slide.result != null;
  const resultVisible = hasResult && revealStep >= bullets.length + 1;
  const hasMaterial = !!slide.material;

  const body = (
    <div className={styles.splitBody}>
      {slide.focus && <FocusBox text={slide.focus} accent={ACCENT} />}
      {bullets.length > 0 && (
        <BulletList
          bullets={bullets}
          accent={ACCENT}
          revealedCount={revealStep}
        />
      )}
    </div>
  );

  return (
    <>
      <SlideHeader title={slide.header} badge="Frage" accent="blue" />
      <div style={{ padding: "var(--sn-space-md) var(--sn-space-xl)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--sn-space-md)", minHeight: 0 }}>
        {hasMaterial ? (
          <div className={styles.split}>
            {body}
            <div className={styles.splitMaterial}>
              <MaterialRenderer item={slide.material!} projector={projector} />
            </div>
          </div>
        ) : body}
        {hasResult && (
          <ResultBox result={slide.result!} visible={resultVisible} />
        )}
      </div>
    </>
  );
}
