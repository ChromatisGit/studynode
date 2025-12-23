"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, type LucideIcon } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import Link from "next/link";
import HOMEPAGE_TEXT from "@pages/homepage/homepage.de.json";
import { IconContainer } from "@pages/homepage/components/IconContainer/IconContainer";
import styles from "@pages/homepage/sections/CourseSection/CourseCard.module.css";
import type { Course } from "@schema/course";

const courseIconCache = new Map<string, LucideIcon>();
const DefaultCourseIcon = BookOpen;
const coursesText = HOMEPAGE_TEXT.courses;

function normalizeLucideIconKey(iconName?: string) {
  if (!iconName) return undefined;

  return iconName
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function useCourseIcon(iconName?: string) {
  const [IconComponent, setIconComponent] = useState<LucideIcon>(() => DefaultCourseIcon);

  useEffect(() => {
    const normalizedKey = normalizeLucideIconKey(iconName);
    if (!normalizedKey) {
      setIconComponent(() => DefaultCourseIcon);
      return;
    }

    const cachedIcon = courseIconCache.get(normalizedKey);
    if (cachedIcon) {
      setIconComponent(() => cachedIcon);
      return;
    }

    const importer = (
      dynamicIconImports as Record<string, () => Promise<{ default: LucideIcon }>>
    )[normalizedKey];
    if (!importer) {
      setIconComponent(() => DefaultCourseIcon);
      return;
    }

    let isActive = true;

    importer()
      .then((mod) => {
        if (!isActive) return;
        const LoadedIcon = mod.default as LucideIcon;
        courseIconCache.set(normalizedKey, LoadedIcon);
        setIconComponent(() => LoadedIcon);
      })
      .catch(() => {
        if (!isActive) return;
        setIconComponent(() => DefaultCourseIcon);
      });

    return () => {
      isActive = false;
    };
  }, [iconName]);

  return IconComponent;
}

type CourseCardProps = {
  course: Course;
  href?: string;
  actionLabel?: string;
};

export function CourseCard({ course, href, actionLabel }: CourseCardProps) {
  const { title, description, tags, icon, color, group, slug } = course;
  const colorClass = styles[`${color}Color`] ?? styles.purpleColor;
  const IconComponent = useCourseIcon(icon);
  const targetHref = href ?? `/${[group, slug].join("/")}`;
  const label = actionLabel ?? coursesText.openActionLabel;

  return (
    <Link
      href={targetHref}
      className={clsx(styles.courseCard, colorClass)}
      aria-label={`Kurs ${title} öffnen`}
    >
      <div className={styles.accentBar} />

      <div className={styles.cardBody}>
        <div className={styles.iconRow}>
          <IconContainer
            Icon={IconComponent}
            size="md"
            backgroundColor="var(--accent-surface)"
            foregroundColor="var(--accent-strong)"
          />
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
        <span>{label}</span>
        <ArrowRight size={16} aria-hidden />
      </div>
    </Link>
  );
}
