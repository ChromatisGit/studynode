import { z } from "zod";

const Subject = z.enum(["math", "info"]);
const Group = z.string().regex(/^[a-z0-9]+$/i, "use letters/numbers only");

const TopicValue = z.array(z.string()).nullable().default([]);
const Topics = z.record(z.string(), TopicValue);

export const YamlCoursePlanSchema = z.object({
    course: z.object({
        group: Group,
        subject: Subject,
        label: z.string(),
        variant: z.string().optional(),
    }).strict(),
    current_topic: z.string(),
    current_worksheets: z.array(z.string()).optional().default([]),
    topics: Topics,
}).strict();

export type YamlCoursePlan = z.infer<typeof YamlCoursePlanSchema>;

export const CoursePlanSchema = YamlCoursePlanSchema.transform((y) => ({
    group: y.course.group,
    subject: y.course.subject,
    label: y.course.label,
    course_variant: y.course.variant ? `${y.course.subject}-${y.course.variant}` : y.course.subject,
    current_topic: y.current_topic,
    current_worksheets: y.current_worksheets,
    topics: y.topics,
}));

export type CoursePlan = z.infer<typeof CoursePlanSchema>;