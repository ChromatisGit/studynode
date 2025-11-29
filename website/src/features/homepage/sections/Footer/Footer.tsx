import { Mail } from 'lucide-react';
import styles from './Footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          <div>
            <h3 className={styles.footerTitle}>StudyNode</h3>
            <p className={styles.footerText}>
              Eine digitale Lernplattform für Informatik- und Mathematikunterricht von Herr Holst.
            </p>
          </div>

          <div/>

          <div>
            <h3 className={styles.footerTitle}>Kontakt</h3>
            <a href="mailto:holst@studynode.com" className={styles.footerLink} aria-label="Send email to holst@studynode.com">
              <Mail size={18} aria-hidden />
              <span>holst@studynode.com</span>
            </a>
            <p className={styles.footerText} style={{ marginTop: '0.5rem' }}>
              Fragen zu der Webseite oder den Inhalten? Melde dich gern.
            </p>
          </div>
        </div>

        <div className={styles.footerBar}>
          <span>Gebaut mit 💜 fürs Lernen</span>
          <span>© {currentYear} Christian Holst. Powered by Docusaurus.</span>
        </div>
      </div>
    </footer>
  );
}
