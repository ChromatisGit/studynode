"use client";

import { ChevronDown } from "lucide-react";

import { AppLink } from "@/components/AppLink";
import type { Course } from "@/schema/course";
import type { CourseId } from "@/schema/course";
import { NavbarDropdown } from "./NavbarDropdown";
import styles from "./Navbar.module.css";

type NavbarCourseLinksProps = {
  courses: Course[];
  activeCourseId: CourseId | null;
};

const MAX_INLINE_COURSES = 2;

export function NavbarCourseLinks({ courses, activeCourseId }: NavbarCourseLinksProps) {
  const shouldUseDropdown = courses.length > MAX_INLINE_COURSES;
  const hasActiveCourse = Boolean(activeCourseId);

  if (shouldUseDropdown) {
    return (
      <NavbarDropdown
        trigger={(isOpen) => (
          <button
            className={`${styles.link} ${styles.dropdownTrigger} ${
              hasActiveCourse ? styles.linkActive : ""
            }`.trim()}
          >
            Courses
            <ChevronDown
              size={14}
              className={`${styles.dropdownIcon} ${
                isOpen ? styles.dropdownIconOpen : ""
              }`.trim()}
            />
          </button>
        )}
        align="left"
      >
        {courses.map((course) => {
          const isActive = activeCourseId === course.id;
          return (
            <AppLink
              key={course.id}
              href={`/${course.id}`}
              className={`${styles.dropdownItem} ${
                isActive ? styles.dropdownItemActive : ""
              }`.trim()}
            >
              {course.title}
            </AppLink>
          );
        })}
      </NavbarDropdown>
    );
  }

  return (
    <>
      {courses.map((course) => {
        const isActive = activeCourseId === course.id;
        return (
          <AppLink
            key={course.id}
            href={`/${course.id}`}
            className={styles.link}
            active={isActive}
            activeClassName={styles.linkActive}
          >
            {course.title}
          </AppLink>
        );
      })}
    </>
  );
}
