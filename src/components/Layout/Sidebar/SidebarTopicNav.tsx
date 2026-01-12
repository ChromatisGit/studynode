"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

import { AppLink } from "@components/AppLink";
import type { ProgressTopicDTO } from "@domain/progressDTO";
import styles from "./Sidebar.module.css";

type SidebarTopicNavProps = {
  topics: ProgressTopicDTO[];
  currentTopic?: string;
  currentChapter?: string;
  progressCurrentTopicId?: string;
  progressCurrentChapterId?: string;
  onLinkClick: () => void;
  onTopicClick: (event: React.MouseEvent) => void;
};

export function SidebarTopicNav({
  topics,
  currentTopic,
  currentChapter,
  progressCurrentTopicId,
  progressCurrentChapterId,
  onLinkClick,
  onTopicClick,
}: SidebarTopicNavProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    const next = new Set<string>();
    if (currentTopic) {
      next.add(currentTopic);
    }
    if (progressCurrentTopicId) {
      next.add(progressCurrentTopicId);
    }
    if (next.size > 0) {
      setExpandedTopics(next);
    }
  }, [currentTopic, progressCurrentTopicId]);

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const isActiveTopic = (topicId: string): boolean => {
    return currentTopic === topicId && !currentChapter;
  };

  const isActiveChapter = (topicId: string, chapterId: string): boolean => {
    return currentTopic === topicId && currentChapter === chapterId;
  };

  return (
    <nav className={styles.nav}>
      {topics.map((topic) => {
        const isExpanded = expandedTopics.has(topic.topicId);
        const isActive = isActiveTopic(topic.topicId);

        return (
          <div key={topic.topicId} className={styles.topicGroup}>
            <div className={styles.topicHeader}>
              <AppLink
                href={topic.href}
                className={`${styles.topicLink} ${isActive ? styles.topicLinkActive : ""}`.trim()}
                onClick={onTopicClick}
              >
                <h4>{topic.label}</h4>
              </AppLink>
              <button
                className={styles.topicToggle}
                onClick={() => toggleTopic(topic.topicId)}
                aria-expanded={isExpanded}
                aria-label={`Toggle ${topic.label}`}
              >
                <ChevronRight
                  size={20}
                  className={`${styles.topicChevron} ${
                    isExpanded ? styles.topicChevronExpanded : ""
                  }`.trim()}
                />
              </button>
            </div>

            {isExpanded && topic.chapters.length > 0 ? (
              <ul className={styles.chapterList}>
                {topic.chapters.map((chapter) => {
                  const isChapterActive = isActiveChapter(topic.topicId, chapter.chapterId);
                  const isRoadmapCurrent =
                    progressCurrentTopicId === topic.topicId &&
                    progressCurrentChapterId === chapter.chapterId;

                  return (
                    <li key={chapter.chapterId} className={styles.chapterItem}>
                      <AppLink
                        href={chapter.href}
                        className={`${styles.chapterLink} ${
                          isChapterActive ? styles.chapterLinkActive : ""
                        } ${isRoadmapCurrent ? styles.chapterLinkRoadmapCurrent : ""}`.trim()}
                        onClick={onLinkClick}
                      >
                        {isRoadmapCurrent ? (
                          <span className={styles.roadmapMarker} aria-hidden="true" />
                        ) : null}
                        {chapter.label}
                      </AppLink>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
