import { CourseCard } from '@features/homepage/sections/CourseSection/CourseCard';
import { HomeSection } from '@features/homepage/layout/HomeSection';
import styles from '@features/homepage/sections/CourseSection/CourseSection.module.css';
import COURSES_JSON from '@generated-configs/courses.config.json';
import { Course } from '@builder/transformer/courses';

const COURSES = COURSES_JSON as Course[];

export function CourseSection() {
  return (
    <HomeSection id="courses" title="Alle Kurse" subtitle="Wähle deinen Kurs aus, um auf alle Inhalte zuzugreifen.">
      <div className={styles.courseGrid}>
        {COURSES.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </HomeSection>
  );
}
