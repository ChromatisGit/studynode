import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { IconContainer } from '@features/homepage/components/IconContainer';
import { getAccentTokens, type ColorMode } from '@css/colors';
import styles from '@features/homepage/sections/CourseSection/CourseCard.module.css';
import { Course } from '@builder/transformer/courses';

function getDocumentTheme(): ColorMode {
  if (typeof document === 'undefined') {
    return 'light';
  }
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function CourseCard({course}: {course: Course}) {
  const { title, description, tags, icon, color } = course;

  const [mode, setMode] = useState<ColorMode>(() => getDocumentTheme());

  useEffect(() => {
    // Sync with Docusaurus theme toggle by watching the html[data-theme] attribute.
    const updateMode = () => setMode(getDocumentTheme());

    updateMode();
    const observer = new MutationObserver(updateMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  const accent = useMemo(() => getAccentTokens(color, mode), [color, mode]);

  const accentVars: CSSProperties = {
    ['--accent-color' as string]: accent.accent,
    ['--accent-strong' as string]: accent.accentStrong,
    ['--accent-surface' as string]: accent.surface,
    ['--accent-border' as string]: accent.border,
    ['--accent-muted' as string]: accent.mutedText,
  };

  return (
    <article className={styles.courseCard} style={accentVars} aria-label={`Enter ${title} course`}>
      <div className={styles.accentBar} />
      <div className={styles.cardBody}>
        <div className={styles.iconRow}>
          <IconContainer Icon={icon} size="md" bgColor={accent.surface} iconColor={accent.accentStrong} />
        </div>

        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>

        <div className={styles.tagRow}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span>Kurs öffnen</span>
        <ArrowRight size={16} aria-hidden style={{ marginLeft: '0.2rem' }} />
      </div>
    </article>
  );
}
