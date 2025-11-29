import { CourseCard } from './CourseCard';
import { HomeSection } from '../../layout/HomeSection';
import { courses } from './courseData';
import styles from './CourseSection.module.css';

export function CourseSection() {
  return (
    <HomeSection id="courses" title="Alle Kurse" subtitle="Wähle deinen Kurs aus, um auf alle Inhalte zuzugreifen.">
      <div className={styles.courseGrid}>
        {courses.map((course, index) => (
          <CourseCard key={course.id} course={course} index={index} />
        ))}
      </div>
    </HomeSection>
  );
}
