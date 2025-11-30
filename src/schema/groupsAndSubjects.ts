import { z } from "zod";
import { accentColorSchema } from "@schema/colors";

export const groupsAndSubjectsSchema = z.object({
    groups: z.record(
        z.string(),
        z.object({
            name: z.string(),
            color: accentColorSchema,
        })
    ),
    subjects: z.record(
        z.string(),
        z.object({
            name: z.string(),
            icon: z.string(),
        })
    ),
    variants: z.record(
        z.string(),
        z.object({
            name: z.string(),
            short: z.string(),
        })
    ),
});

export type GroupsAndSubjects = z.infer<typeof groupsAndSubjectsSchema>;
