import type { ConceptSlide } from "@schema/slideTypes";
import { SlideHeader } from "./SlideHeader";
import { FocusBox } from "./FocusBox";
import { BulletList } from "./BulletList";
import { MaterialRenderer } from "./MaterialRenderer";
import styles from "./slide.module.css";

const ACCENT = "var(--sn-purple-accent)";

type Props = { slide: ConceptSlide; revealStep: number; projector?: boolean };

export function ConceptSlideView({ slide, revealStep, projector }: Props) {
  const hasMaterial = !!slide.material;
  const bullets = slide.bullets ?? [];

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
      <SlideHeader title={slide.header} badge="Konzept" accent="purple" />
      <div style={{ padding: "var(--sn-space-md) var(--sn-space-xl)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--sn-space-md)", minHeight: 0 }}>
        {hasMaterial ? (
          <div className={styles.split}>
            {body}
            <div className={styles.splitMaterial}>
              <MaterialRenderer item={slide.material!} projector={projector} />
            </div>
          </div>
        ) : body}
      </div>
    </>
  );
}
