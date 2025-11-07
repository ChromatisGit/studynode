import { CoursePlanSchema, YamlCoursePlanSchema } from "./course-plan";

import fs from 'node:fs/promises';
import path from "node:path";
import yaml from 'yaml';

const BASE_DIR = "./content/base";
const COURSES_DIR = "./content/courses";
const OUT_DIR = "./website/.generated";


export async function readAllCourses() {
  const root = path.resolve(COURSES_DIR);
  const progress_content: CoursePlanSchema[] = [];

  for await (const progress_path of fs.glob('*/*/progress.yml', { cwd: root })) {
    const raw: YamlCoursePlanSchema = yaml.parse(await fs.readFile(path.join(root, progress_path), "utf8"));
    progress_content.push(CoursePlanSchema.parse(raw));
  }

  return progress_content.map(c => {
    const { label, group, subject, variant } = c.course
    const { current_topic, current_worksheets, topics } = c

    return {
      group,
      label,
      subject,
      course_variant: variant ? `${subject}-${variant}` : subject,
      current_topic,
      current_worksheets: current_worksheets ? current_worksheets : [],
      topics
    }
  })
}

export function writeConfig(configName: string, content: any) {
  const filePath = path.resolve(process.cwd(), OUT_DIR, `${configName}.config.json`);
  fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');
}