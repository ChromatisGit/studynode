import { CoursePlanSchema } from "@schema/course-plan";
import type { CoursePlan, YamlCoursePlan } from "@schema/course-plan";

import fs from 'node:fs/promises';
import path from "node:path";
import yaml from 'yaml';

const CONTENT_DIR = "./content";
const OUT_DIR = "./website/.generated";


export async function readAllCourses() {
  const root = path.resolve(CONTENT_DIR);
  const res: CoursePlan[] = [];

  for await (const progress_path of fs.glob('courses/*/*/course-plan.yml', { cwd: root })) {
    const raw: YamlCoursePlan = yaml.parse(await fs.readFile(path.join(root, progress_path), "utf8"));
    res.push(CoursePlanSchema.parse(raw));
  }

  return res
}

export async function readFile(relativePath: string): Promise<string> {
  const abs = path.resolve(process.cwd(), CONTENT_DIR, relativePath);
  try {
    const content = await fs.readFile(abs, "utf8");
    return content;
  } catch (err: any) {
    if (err.code === "ENOENT") {
      // For testing only TODO: Remove this and throw an error instead
      return ''
    } else {
      throw err;
    }
  }
}

export async function writeFile({ relativePath, content }: { relativePath: string, content: any }) {
  const abs = path.resolve(process.cwd(), OUT_DIR, relativePath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, content, 'utf8');
}