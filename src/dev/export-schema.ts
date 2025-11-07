import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";
import { CoursePlanSchema } from "@schema/course-plan";

const OUT_DIR = resolve(process.cwd(), ".vscode\.schemas");

const SCHEMAS = [
  { name: 'course-plan', schema: CoursePlanSchema }
]

mkdirSync(OUT_DIR, { recursive: true });

for (const { name, schema } of SCHEMAS) {
  const json = zodToJsonSchema(schema, name);
  const outFile = resolve(OUT_DIR, `${name}.json`);
  writeFileSync(outFile, JSON.stringify(json, null, 2), "utf-8");
  console.log(`[export-schema] ${name} -> ${outFile} - OK`);
}
