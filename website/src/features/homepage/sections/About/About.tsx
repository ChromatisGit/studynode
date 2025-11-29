import { InfoGrid } from '../../components/InfoGrid';
import { HomeSection } from '../../layout/HomeSection';
import { aboutGoals } from './aboutData';
import styles from './About.module.css';

export function About() {
  return (
    <HomeSection
      id="about"
      title="Was ist StudyNode?"
      subtitle="StudyNode ist eine zentrale Lernplattform für den Informatik- und Mathematikunterricht von Herrn Holst."
    >
      <InfoGrid items={aboutGoals} iconVariant="circle" />

      <div className={styles.infoNote}>
        <p>
          StudyNode soll mehr als nur ein Ablageort für Unterrichtsmaterialien sein. Die Plattform macht Wissen sichtbar und
          zeigt, wie die Themen zusammenhängen und sich gegenseitig ergänzen - wie Knoten in einem Netzwerk! Sie basiert auf
          Docusaurus und modernen Web-Standards, die für Übersicht und Lesbarkeit sorgen. Alles ist fokussiert aufs Lernen
          ohne Werbung, ohne Schnickschnack.
        </p>
        <p>Die Plattform befindet sich noch in der Aufbauphase. Ich freue mich über sämtliches Feedback!</p>
      </div>
    </HomeSection>
  );
}
