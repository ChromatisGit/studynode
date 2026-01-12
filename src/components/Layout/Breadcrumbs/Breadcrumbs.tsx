"use client";

import { ChevronRight, House } from "lucide-react";

import { AppLink } from "@components/AppLink";
import { useRouteContext } from "@/client/contexts/RouteContext";
import type { SidebarDTO } from "@domain/sidebarDTO";
import styles from "./Breadcrumbs.module.css";

type BreadcrumbsProps = {
  data: SidebarDTO;
};

export function Breadcrumbs({ data }: BreadcrumbsProps) {
  const {
    hasTopicContext,
    isLibraryRoute,
    subject,
    courseId,
    groupKey,
    subjectKey,
    topic,
    chapter,
  } = useRouteContext();

  if (!hasTopicContext) {
    return null;
  }

  const items: Array<{ label: string; href: string }> = [];

  let homeUrl = "/";
  if (isLibraryRoute && subject) {
    homeUrl = `/library/${subject}`;
  } else if (!isLibraryRoute && courseId) {
    homeUrl = groupKey && subjectKey ? `/${groupKey}/${subjectKey}` : "/";
  }

  let topicLabel = topic;
  let chapterLabel = chapter;

  if (!isLibraryRoute && courseId) {
    const topicData = data.topics.find((entry) => entry.topicId === topic);
    topicLabel = topicData?.label ?? topicLabel;
    const chapterData = topicData?.chapters.find((entry) => entry.chapterId === chapter);
    chapterLabel = chapterData?.label ?? chapterLabel;
  }

  if (topic) {
    const topicUrl =
      isLibraryRoute && subject
        ? `/library/${subject}/${topic}`
        : groupKey && subjectKey
        ? `/${groupKey}/${subjectKey}/${topic}`
        : "/";

    items.push({
      label: topicLabel || topic,
      href: topicUrl,
    });
  }

  if (chapter) {
    const chapterUrl =
      isLibraryRoute && subject && topic
        ? `/library/${subject}/${topic}/${chapter}`
        : groupKey && subjectKey && topic
        ? `/${groupKey}/${subjectKey}/${topic}/${chapter}`
        : "/";

    items.push({
      label: chapterLabel || chapter,
      href: chapterUrl,
    });
  }

  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <ol className={styles.list}>
        <li className={styles.item}>
          <AppLink href={homeUrl} className={`${styles.link} ${styles.home}`.trim()}>
            <House size={16} />
          </AppLink>
        </li>

        {items.flatMap((item, index) => [
          <li key={`sep-${item.href}`} className={styles.separator} aria-hidden="true">
            <ChevronRight size={12} />
          </li>,
          <li key={item.href} className={styles.item}>
            <AppLink
              href={item.href}
              className={styles.link}
              active={index === items.length - 1}
              activeClassName={styles.linkActive}
            >
              {item.label}
            </AppLink>
          </li>,
        ])}
      </ol>
    </nav>
  );
}
