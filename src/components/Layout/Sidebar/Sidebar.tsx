"use client";

import { useRouteContext } from "@/client/contexts/RouteContext";
import { useIsMobile } from "@/client/lib/useMediaQuery";
import type { SidebarDTO } from "@domain/sidebarDTO";

import { SidebarMainNav } from "./SidebarMainNav";
import { SidebarTopicNav } from "./SidebarTopicNav";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  data: SidebarDTO;
};

export function Sidebar({ isOpen, onClose, data }: SidebarProps) {
  const {
    courseId,
    topic,
    chapter,
    hasTopicContext,
    isHome,
    isLibrary,
    isPrinciples,
  } = useRouteContext();
  const isMobile = useIsMobile();

  const showTopicNavigation = hasTopicContext && data.topics.length > 0;
  const showMainNav = isMobile;

  const handleLinkClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  const handleTopicClick = (event: React.MouseEvent) => {
    if (isMobile) {
      const topicElement = event.currentTarget.closest(`.${styles.topicGroup}`);
      const toggle = topicElement?.querySelector("button");
      const isExpanded = toggle?.getAttribute("aria-expanded") === "true";

      if (!isExpanded) {
        event.preventDefault();
        toggle?.click();
        return;
      }
    }
    handleLinkClick();
  };

  const hasMainNavSection = showMainNav;
  const hasTopicNavSection = showTopicNavigation;
  const showSeparator = hasMainNavSection && hasTopicNavSection;

  return (
    <>
      {isOpen && isMobile ? (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      ) : null}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`.trim()}>
        {showMainNav ? (
          <SidebarMainNav
            isAuthenticated={data.isAuthenticated}
            courses={data.courses}
            activeCourseId={courseId ?? null}
            groupKey={data.primaryGroupKey}
            isHome={isHome}
            isLibrary={isLibrary}
            isPrinciples={isPrinciples}
            onLinkClick={handleLinkClick}
          />
        ) : null}

        {showSeparator ? <div className={styles.separator} /> : null}

        {showTopicNavigation ? (
          <SidebarTopicNav
            topics={data.topics}
            currentTopic={topic}
            currentChapter={chapter}
            progressCurrentTopicId={data.currentTopicId}
            progressCurrentChapterId={data.currentChapterId}
            onLinkClick={handleLinkClick}
            onTopicClick={handleTopicClick}
          />
        ) : null}
      </aside>
    </>
  );
}
