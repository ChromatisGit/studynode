import type { CSSProperties } from 'react';
import { LucideIcon } from 'lucide-react';
import styles from './IconContainer.module.css';

interface IconContainerProps {
  Icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'square' | 'circle';
  bgColor?: string;
  iconColor?: string;
}

const SIZE_CLASSES = {
  sm: { container: styles.iconSm, icon: 18 },
  md: { container: styles.iconMd, icon: 20 },
  lg: { container: styles.iconLg, icon: 22 },
} as const;

const DEFAULT_BG = 'var(--accent-surface, color-mix(in srgb, var(--ifm-color-primary) 14%, var(--ifm-background-surface-color)))';
const DEFAULT_ICON = 'var(--accent-strong, var(--ifm-color-primary))';

/**
 * Reusable icon container with consistent styling
 */
export function IconContainer({
  Icon,
  size = 'md',
  variant = 'square',
  bgColor = DEFAULT_BG,
  iconColor = DEFAULT_ICON,
}: IconContainerProps) {
  const sizeClasses = SIZE_CLASSES[size];
  const roundedClass = variant === 'circle' ? styles.iconCircle : undefined;
  const style: CSSProperties = {
    backgroundColor: bgColor,
    color: iconColor,
  };

  return (
    <div className={`${styles.icon} ${sizeClasses.container} ${roundedClass || ''}`} style={style}>
      <Icon size={sizeClasses.icon} aria-hidden />
    </div>
  );
}
