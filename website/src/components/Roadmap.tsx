import * as React from "react";
import type { RoadmapTopic } from "@schema/overview";

type RoadmapProps = {
  roadmap: RoadmapTopic[];
};

export default function Roadmap({ roadmap }: RoadmapProps) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  return (
    <div className="roadmap">
      <div className="roadmap__line" />
      <ul className="roadmap__list">
        {roadmap.map((topic) => {
          const hasMultiple = topic.chapters.length > 1;
          const isExpanded = expanded[topic.topic] ?? !hasMultiple;

          return (
            <li
              key={topic.topic}
              className={`roadmap__item roadmap__item--${topic.status}`}
            >
              <div className="roadmap__row">
                <span
                  className={`roadmap__bullet roadmap__bullet--${topic.status}`}
                >
                  {topic.status === "finished" ? "✓" : ""}
                </span>

                <div className="roadmap__content">
                  <div className="roadmap__topic">{topic.topic}</div>

                  {hasMultiple && isExpanded && (
                    <ul className="roadmap__chapters">
                      {topic.chapters.map((ch) => (
                        <li
                          key={ch.label}
                          className={`roadmap__chapter roadmap__chapter--${ch.status}`}
                        >
                          <span
                            className={`roadmap__chapter-dot roadmap__chapter-dot--${ch.status}`}
                          >
                            {ch.status === "finished" ? "✓" : ""}
                          </span>
                          <span className="roadmap__chapter-label">
                            {ch.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {hasMultiple && (
                  <button
                    type="button"
                    className="roadmap__toggle"
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [topic.topic]: !isExpanded,
                      }))
                    }
                  >
                    <span
                      className={`roadmap__chevron ${
                        isExpanded ? "roadmap__chevron--open" : ""
                      }`}
                    >
                      ▶
                    </span>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}