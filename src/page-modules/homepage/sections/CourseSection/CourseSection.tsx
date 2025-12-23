"use client";

import { useMemo } from "react";

import { FancyGrid } from "@/components/FancyGrid";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { getHomepageCourseGroups, type CourseGroupId } from "@/data/courses";
import type { Course } from "@/schema/course";
import { CourseCard } from "./CourseCard";
import { HomeSection } from "@pages/homepage/Homepage";
import HOMEPAGE_TEXT from "@pages/homepage/homepage.de.json";
import styles from "@pages/homepage/sections/CourseSection/CourseSection.module.css";

const GROUP_LABELS: Record<CourseGroupId, string> = {
  "your-courses": "Your courses",
  "request-access": "Request access",
};

const GROUP_ACTION_LABELS: Record<CourseGroupId, string> = {
  "your-courses": HOMEPAGE_TEXT.courses.openActionLabel,
  "request-access": "Request access",
};

export function CourseSection() {
  const { courses } = HOMEPAGE_TEXT;
  const { user } = useMockAuth();
  const groups = useMemo(() => getHomepageCourseGroups(user), [user]);

  return (
    <HomeSection id="courses" title={courses.title} subtitle={courses.subtitle}>
      <div className={styles.courseGroups}>
        {groups.map((group) => (
          <section key={group.id} className={styles.courseGroup}>
            <div className={styles.groupHeader}>
              <h3 className={styles.groupTitle}>{GROUP_LABELS[group.id]}</h3>
            </div>
            <FancyGrid
              items={group.courses}
              minItemWidth={240}
              gap={16}
              maxCols={4}
              className={styles.courseGrid}
              rowClassName={styles.courseRow}
              renderItem={(course: Course) => (
                <CourseCard
                  key={`${course.group}-${course.slug}`}
                  course={course}
                  href={
                    group.id === "request-access"
                      ? `/access?groupId=${course.group}&courseId=${course.id}`
                      : `/${course.id}`
                  }
                  actionLabel={GROUP_ACTION_LABELS[group.id]}
                />
              )}
            />
          </section>
        ))}
      </div>
    </HomeSection>
  );
}
