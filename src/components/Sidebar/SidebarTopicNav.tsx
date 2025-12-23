"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

import { AppLink } from "@/components/AppLink";
import type { CourseOverviewTopic } from "@/schema/overview";
import styles from "./Sidebar.module.css";

type SidebarTopicNavProps = {
  topics: CourseOverviewTopic[];
  currentTopic?: string;
  currentChapter?: string;
  roadmapCurrentTopic?: string;
  roadmapCurrentChapter?: string;
  buildTopicUrl: (topicSlug: string) => string;
  buildChapterUrl: (topicSlug: string, chapterSlug: string) => string;
  onLinkClick: () => void;
  onTopicClick: (event: React.MouseEvent) => void;
};

export function SidebarTopicNav({
  topics,
  currentTopic,
  currentChapter,
  roadmapCurrentTopic,
  roadmapCurrentChapter,
  buildTopicUrl,
  buildChapterUrl,
  onLinkClick,
  onTopicClick,
}: SidebarTopicNavProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    const next = new Set<string>();
    if (currentTopic) {
      next.add(currentTopic);
    }
    if (roadmapCurrentTopic) {
      next.add(roadmapCurrentTopic);
    }
    if (next.size > 0) {
      setExpandedTopics(next);
    }
  }, [currentTopic, roadmapCurrentTopic]);

  const toggleTopic = (topicSlug: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicSlug)) {
        next.delete(topicSlug);
      } else {
        next.add(topicSlug);
      }
      return next;
    });
  };

  const isActiveTopic = (topicSlug: string): boolean => {
    return currentTopic === topicSlug && !currentChapter;
  };

  const isActiveChapter = (topicSlug: string, chapterSlug: string): boolean => {
    return currentTopic === topicSlug && currentChapter === chapterSlug;
  };

  return (
    <nav className={styles.nav}>
      {topics.map((topic) => {
        const isExpanded = expandedTopics.has(topic.slug);
        const isActive = isActiveTopic(topic.slug);

        return (
          <div key={topic.id} className={styles.topicGroup}>
            <div className={styles.topicHeader}>
              <AppLink
                href={buildTopicUrl(topic.slug)}
                className={`${styles.topicLink} ${isActive ? styles.topicLinkActive : ""}`.trim()}
                onClick={onTopicClick}
              >
                <h4>{topic.title}</h4>
              </AppLink>
              <button
                className={styles.topicToggle}
                onClick={() => toggleTopic(topic.slug)}
                aria-expanded={isExpanded}
                aria-label={`Toggle ${topic.title}`}
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
                  const isChapterActive = isActiveChapter(topic.slug, chapter.slug);
                  const isRoadmapCurrent =
                    roadmapCurrentTopic === topic.slug &&
                    roadmapCurrentChapter === chapter.slug;

                  return (
                    <li key={chapter.id} className={styles.chapterItem}>
                      <AppLink
                        href={buildChapterUrl(topic.slug, chapter.slug)}
                        className={`${styles.chapterLink} ${
                          isChapterActive ? styles.chapterLinkActive : ""
                        } ${isRoadmapCurrent ? styles.chapterLinkRoadmapCurrent : ""}`.trim()}
                        onClick={onLinkClick}
                      >
                        {isRoadmapCurrent ? (
                          <span className={styles.roadmapMarker} aria-hidden="true" />
                        ) : null}
                        {chapter.title}
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
