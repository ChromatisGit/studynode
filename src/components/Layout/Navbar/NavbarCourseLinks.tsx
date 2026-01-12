"use client";

import { ChevronDown } from "lucide-react";

import { AppLink } from "@components/AppLink";
import type { SidebarCourseDTO } from "@domain/sidebarDTO";
import { NavbarDropdown } from "./NavbarDropdown";
import styles from "./Navbar.module.css";

type NavbarCourseLinksProps = {
  courses: SidebarCourseDTO[];
  activeCourseId: string | null;
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
              href={course.href}
              className={`${styles.dropdownItem} ${
                isActive ? styles.dropdownItemActive : ""
              }`.trim()}
            >
              {course.label}
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
            href={course.href}
            className={styles.link}
            active={isActive}
            activeClassName={styles.linkActive}
          >
            {course.label}
          </AppLink>
        );
      })}
    </>
  );
}
