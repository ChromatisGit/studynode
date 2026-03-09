"use client";

import { Check } from "lucide-react";
import type { QuizResultsDTO } from "@schema/quizTypes";
import { renderInlineMarkdown } from "@ui/lib/renderInlineMarkdown";
import styles from "./QuizProjectorOverlay.module.css";

type Props = {
  /** Live quiz state pushed from the DO via the projector's WebSocket stream. */
  quizState: QuizResultsDTO | null;
};

export function QuizProjectorOverlay({ quizState }: Props) {
  if (!quizState) return null;

  const { phase, question, options, correctIndices, why, participants, answeredCount, optionCounts } = quizState;
  const maxCount = Math.max(1, ...optionCounts);

  // ── Waiting phase ───────────────────────────────────────────────────────────
  if (phase === "waiting") {
    return (
      <div className={styles.slide}>
        <div className={styles.waitingCard}>
          <div className={styles.waitingIcon}>📋</div>
          <h1 className={styles.waitingTitle}>Quiz startet gleich</h1>
          <p className={styles.waitingHint}>
            Wechsle auf deinem Gerät zum Quiz-Tab und mach dich bereit.
          </p>
          <span className={styles.waitingBadge}>Quiz-Tab öffnen</span>
        </div>
      </div>
    );
  }

  // ── Active phase ────────────────────────────────────────────────────────────
  if (phase === "active") {
    return (
      <div className={styles.slide}>
        <div className={styles.activeCard}>
          <p className={styles.questionMeta}>
            Frage {quizState.currentIndex + 1} / {quizState.totalQuestions}
          </p>
          <div className={styles.questionText}>{renderInlineMarkdown(question)}</div>
          <div className={styles.activeOptions}>
            {options.map((opt, i) => (
              <div key={i} className={styles.activeOption}>
                <span className={styles.optionBadge}>{String.fromCharCode(65 + i)}</span>
                <span>{renderInlineMarkdown(opt)}</span>
              </div>
            ))}
          </div>
          <div className={styles.progressRow}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: participants > 0 ? `${(answeredCount / participants) * 100}%` : "0%" }}
              />
            </div>
            <span className={styles.progressLabel}>
              {answeredCount} / {participants}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Reveal phase ────────────────────────────────────────────────────────────
  if (phase === "reveal_dist" || phase === "reveal_correct") {
    return (
      <div className={styles.slide}>
        <div className={styles.revealCard}>
          <p className={styles.questionMeta}>
            Frage {quizState.currentIndex + 1} / {quizState.totalQuestions}
          </p>
          <div className={styles.questionText}>{renderInlineMarkdown(question)}</div>

          <div className={styles.bars}>
            {options.map((opt, i) => {
              const isCorrect = phase === "reveal_correct" && correctIndices.includes(i);
              const barPct = (optionCounts[i] / maxCount) * 100;
              const label = `${Math.round(participants > 0 ? (optionCounts[i] / participants) * 100 : 0)}%`;

              return (
                <div
                  key={i}
                  className={`${styles.barRow} ${phase === "reveal_correct" && isCorrect ? styles.barRowCorrect : ""} ${phase === "reveal_correct" && !isCorrect ? styles.barRowNeutral : ""}`}
                >
                  <div className={styles.barLabel}>
                    {phase === "reveal_correct" && isCorrect ? (
                      <Check size={28} className={styles.checkIcon} aria-label="Richtig" />
                    ) : (
                      <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                    )}
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={`${styles.barFill} ${isCorrect ? styles.barFillCorrect : ""}`}
                      style={{ width: `${barPct}%` }}
                    />
                    <span className={styles.barOptionText}>{renderInlineMarkdown(opt)}</span>
                  </div>
                  <span className={styles.barPct}>{label}</span>
                </div>
              );
            })}
          </div>

          {phase === "reveal_correct" && why && (
            <div className={styles.why}>
              <span className={styles.whyLabel}>Erklärung</span>
              <p className={styles.whyText}>{renderInlineMarkdown(why)}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
