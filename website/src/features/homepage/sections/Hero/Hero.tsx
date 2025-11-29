import { ArrowRight } from 'lucide-react';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroShell}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Willkommen bei StudyNode</h1>

          <p className={styles.heroLead}>Lernen neu gedacht - mit Sinn und Struktur</p>
          <div className={styles.heroActions}>
            <a href="#courses" className="button button--primary button--lg" aria-label="Navigate to courses section">
              Kurse entdecken
              <ArrowRight size={18} aria-hidden style={{ marginLeft: '0.35rem' }} />
            </a>

            <a href="#about" className={`button button--lg ${styles.ghostButton}`} aria-label="Learn more about StudyNode">
              Über StudyNode
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
