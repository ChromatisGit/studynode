import type { CoursePlan } from "@schema/course-plan"

export function createOverviewContent(course: CoursePlan): string {
  const { group, subject, label, topics, current_worksheets, current_chapter } = course;


  const index = topics.findIndex(t => t.chapter === current_chapter);
  const hasTopic = current_chapter

  const finished = hasTopic ? topics.slice(0, index) : [];
  const inProgress = hasTopic ? topics[index] : { topic: "", chapter: "" };
  const planned = hasTopic ? topics.slice(index + 1) : topics;

  const title = `${subject} ${group.toUpperCase()}`;

  const mdx = [
    frontMatter(title),
    imports(),
    intro(title, label),
    currentTopic(inProgress),
    worksheets(current_worksheets),
    roadmap(finished, inProgress, planned)
  ]
    .map(str => dedent(str))
    .join("\n\n");

  return mdx;
}

type topic = CoursePlan["topics"][number]

function frontMatter(title: string) {
  return `
    ---
    sidebar_position: 1
    sidebar_label: "Übersicht"
    title: "${title}"
    ---
  `;
}

function imports() {
  return `
    import DocCard from '@site/src/components/DocCard';
  `;
}

function intro(title: string, label: string) {
  return `
    # ${title} - Übersicht

    Willkommen im Kurs **${label}**!
    Hier findest du alle Materialien, Erklärungen und Übungen zu den Themen des Schuljahres.
  `;
}

function currentTopic(
  inProgress: topic
) {
  if(inProgress.topic === "") {
    return ""
  }

  return `
    ## Aktuelles Thema

    ### ${inProgress.topic}
  `;
}

function worksheets(currentWorksheets: CoursePlan["current_worksheets"]) {

  if(currentWorksheets.length === 0) {
    return "";
  }

  const worksheets = currentWorksheets.map(worksheet => {
    return `
      <DocCard
        href="${worksheet}"
        label="Placeholder"
        description="Placeholder"
      />
    `
  })

  return `
    <div className="row">
      ${worksheets}
    </div>
  `;
}

function roadmap(finished: topic[], inProgress: topic, planned: topic[]) {
  return ``
}

function dedent(str: string) {
  const lines = str.replace(/^\n|\s+$/g, "").split("\n");
  const indent = Math.min(
    ...lines.filter(l => l.trim()).map(l => l.match(/^(\s*)/)![1].length)
  );
  return lines.map(l => l.slice(indent)).join("\n");
}