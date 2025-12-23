import { InfoGrid } from "@pages/homepage/components/InfoGrid/InfoGrid";
import { HomeSection } from "@pages/homepage/Homepage";
import { aboutGoals } from "./aboutData";
import HOMEPAGE_TEXT from "@pages/homepage/homepage.de.json";
import styles from "./About.module.css";

export function About() {
  const { about } = HOMEPAGE_TEXT;

  return (
    <HomeSection id="about" title={about.title} subtitle={about.subtitle}>
      <InfoGrid items={aboutGoals} iconVariant="circle" />

      <div className={styles.infoNote}>
        <p>{about.intro}</p>
        <p>{about.note}</p>
      </div>
    </HomeSection>
  );
}
