import { MarkdownRenderer } from "@features/contentpage/components/MarkdownRenderer/MarkdownRenderer";
import type { RecapSlide } from "@schema/slideTypes";
import { SlideHeader } from "./SlideHeader";
import styles from "./slide.module.css";

type Props = { slide: RecapSlide };

export function RecapSlideView({ slide }: Props) {
  return (
    <>
      <SlideHeader title={slide.header} badge="Zusammenfassung" accent="orange" />
      <div style={{ padding: "var(--sn-space-md) var(--sn-space-xl)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--sn-space-md)", minHeight: 0, justifyContent: "center" }}>
        <div className={styles.recapCard}>
          <ul className={styles.recapBulletList}>
            {slide.bullets.map((bullet, i) => (
              <li key={i} className={styles.recapBulletItem}>
                <span className={styles.recapBulletMarker}>▸</span>
                <span>
                  <MarkdownRenderer markdown={bullet} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
