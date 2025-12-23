import { Hero } from "@pages/homepage/sections/Hero/Hero";
import { CourseSection } from "@pages/homepage/sections/CourseSection/CourseSection";
import { About } from "@pages/homepage/sections/About/About";
import { Footer } from "@pages/homepage/sections/Footer/Footer";
import { NodeNetwork } from "@pages/homepage/sections/Background/NodeNetwork";
import styles from "@pages/homepage/Homepage.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.networkLayer}>
        <NodeNetwork />
        <div className={styles.networkFade} />
      </div>

      <Hero />
      <CourseSection />
      <About />
      <Footer />
    </main>
  );
}
