import type { CoursePlan } from "@schema/course-plan";
import { buildOverviewData } from "./transformer/overview";
import path from "node:path";

type OverviewCourse = ReturnType<typeof buildOverviewData>[number];

function createOverviewFile(course: OverviewCourse): string {
  const {
    group,
    subject,
    label,
    in_progress,
    current_worksheets,
  } = course;

  const title = `${subject} ${group.toUpperCase()}`;
  const todayTopic =
    in_progress
      ? `${in_progress.topic} – ${in_progress.chapter}`
      : "Noch kein Thema in Bearbeitung";

  const firstWorksheet = current_worksheets?.[0];

  return `---
sidebar_position: 1
sidebar_label: "${label}"
title: "${title}"
---

import DocCard from '@site/src/components/DocCard';

# ${title} – Übersicht

Willkommen im Kurs **${label}**!
Hier findest du alle Materialien, Erklärungen und Übungen zu den Themen des Schuljahres.

---

## Heutiges Thema

### **Thema:** ${todayTopic}

${firstWorksheet ? `
<div className="row">
  <DocCard
    href="${firstWorksheet}"
    label="Aktuelles Arbeitsblatt"
    description="PDF mit Beispielen und Erklärungen"
  />
</div>` : "_Aktuell ist kein Arbeitsblatt verknüpft._"}

---
`;
}

export function buildOverview(courses: CoursePlan[]) {
  const coursesData = buildOverviewData(courses);

  coursesData.forEach((course) => {
    const overviewPath = path.join(
      "courses",
      course.group,
      course.course_variant,
      "index.mdx",
    );

    const overviewFile = createOverviewFile(course);
  });
}