import { createCoursePlanSchema, type CoursePlan } from "@schema/coursePlan";
import { GroupsAndSubjects, groupsAndSubjectsSchema } from "@schema/groupsAndSubjects";
import { TopicPlan, topicPlanSchema } from "@schema/topicPlan";
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "yaml";
import { ZodError } from "zod";
import { CONTENT_DIR } from "../fs";

export type LoadedContent = {
  groupsAndSubjects: GroupsAndSubjects;
  topics: Record<string, TopicPlan>;
  courses: CoursePlan[];
};

export async function loadContent(): Promise<LoadedContent> {
  const groupsAndSubjects = await loadGroupsAndSubjects();
  const topics = await loadTopicPlans();
  const courses = await loadCoursePlans(groupsAndSubjects);

  return { groupsAndSubjects, topics, courses };
}

export async function loadGroupsAndSubjects(): Promise<GroupsAndSubjects> {
  const root = path.resolve(CONTENT_DIR);
  const abs = path.join(root, "groupsAndSubjects.yml");
  const raw = yaml.parse(await fs.readFile(abs, "utf8"));

  try {
    return groupsAndSubjectsSchema.parse(raw);
  } catch (err) {
    if (err instanceof ZodError) {
      err.message = `Error in file: groupsAndSubjects.yml\n${err.message}`;
    }
    throw err;
  }
}

export async function loadTopicPlans(): Promise<Record<string, TopicPlan>> {
  const root = path.resolve(CONTENT_DIR);
  const res: Record<string, TopicPlan> = {};

  for await (const relPath of fs.glob("base/*/*/topicPlan.yml", { cwd: root })) {
    const absPath = path.join(root, relPath);
    const rawText = await fs.readFile(absPath, "utf8");
    const raw = yaml.parse(rawText);

    try {
      const parsed = topicPlanSchema.parse(raw);

      const folderPath = path.dirname(relPath);
      const id = path.basename(folderPath);

      res[id] = parsed;
    } catch (err) {
      if (err instanceof ZodError) {
        err.message = `Error in file: ${relPath}\n${err.message}`;
      }
      throw err;
    }
  }

  return res;
}

export async function loadCoursePlans(groupsAndSubjects: GroupsAndSubjects): Promise<CoursePlan[]> {
  const root = path.resolve(CONTENT_DIR);
  const res: CoursePlan[] = [];
  const courseSchema = createCoursePlanSchema(groupsAndSubjects);

  for await (const relPath of fs.glob("courses/*/*/coursePlan.yml", { cwd: root })) {
    const abs = path.join(root, relPath);
    const raw = yaml.parse(await fs.readFile(abs, "utf8"));

    try {
      res.push(courseSchema.parse(raw));
    } catch (err) {
      if (err instanceof ZodError) {
        err.message = `Error in file: ${relPath}\n${err.message}`;
      }
      throw err;
    }
  }

  return res;
}
