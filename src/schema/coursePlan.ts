import { z } from "zod";

const Group = z.string().regex(/^[a-z0-9]+$/i, "use letters/numbers only");

const TopicValue = z.array(z.string()).nullable();
const TopicsSchema = z.record(z.string(), TopicValue);

export const yamlCoursePlanSchema = z.object({
  course: z.object({
    group: Group,
    subject: z.string(),
    variant: z.string().optional(),
    icon: z.string().optional(),
  }).strict(),
  current_chapter: z.string().nullable(),
  current_worksheets: z.array(z.string()).nullable(),
  topics: TopicsSchema,
}).strict();

export type YamlCoursePlan = z.infer<typeof yamlCoursePlanSchema>;


type Topics = z.infer<typeof TopicsSchema>

function flattenTopics(topics: Topics) {
  return Object.entries(topics).flatMap(([topic, chapters]) => {
    if (!chapters) {
      return [{ topic, chapter: topic, label: topic }]
    }
    return chapters.map(chapter => {
      return { topic, chapter, label: chapter }
    })
  })
}

function addTitlesToTopics(topics: Topics) {
  return Object.keys(topics).map(topic => {
    return {
      topic,
      label: topic
    }
  })
}

export const CoursePlanSchema = yamlCoursePlanSchema.transform(v => ({
  group: v.course.group,
  subject: v.course.subject,
  course_variant: v.course.variant,
  slug: v.course.variant
    ? `${v.course.subject}-${v.course.variant}`
    : v.course.subject,
  current_chapter: v.current_chapter,
  current_worksheets: v.current_worksheets ?? [],
  topics: addTitlesToTopics(v.topics),
  chapters: flattenTopics(v.topics)
}))
  .refine(
    ({ chapters, current_chapter }) =>
      current_chapter === null ||
      chapters.some(c => c.chapter === current_chapter),
    {
      error: "current_chapter must be null or exist inside of topics!",
    }
  );

export type CoursePlan = z.infer<typeof CoursePlanSchema>;