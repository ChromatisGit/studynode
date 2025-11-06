import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'yaml';

const BASE_DIR = './base';
const COURSES_DIR = './courses';
const OUT_DIR = './website/.generated';

async function getCourses() {
  const root = path.resolve(COURSES_DIR);
  const progress_content = [];

  for await (const progress_path of fs.glob('*/*/progress.yml', { cwd: root })) {
    const content = await fs.readFile(path.join(root, progress_path), 'utf8');
    progress_content.push(yaml.parse(content))
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

function writeConfig(configName, content) {
  const filePath = path.resolve(process.cwd(), OUT_DIR, `${configName}.config.json`);
  fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');
}

const courses = await getCourses();

fs.mkdir(path.dirname(OUT_DIR), {recursive: true});

writeConfig('courses', courses.map(c => {
  const { group, course_variant } = c
  return { group, course_variant }
}));


function updateLabelIfUnique(data, subject, newLabel) {
    const items = data.filter(item => item.subject === subject);

    console.log(items)

    if (items.length === 1) {
        items[0].label = newLabel;
        console.log(items[0].label)
    }
}

const navbar = Object.fromEntries(
  Object.entries(Object.groupBy(courses, c => c.group)).map(([group, list]) => {

    if (list.length === 1) {
      list[0].label = 'Übersicht';
    } else {
      updateLabelIfUnique(list, 'math', 'Mathematik');
      updateLabelIfUnique(list, 'info', 'Informatik');
    }

    const navbar = list.map(({ label, group, course_variant }) => ({
      label,
      to: `${group}/${course_variant}`,
      position: 'left'
    }));

    navbar.push({label: 'Leitsätze', to: `${group}/principles`, position: 'left'})

    return [group, navbar];
  })
);

writeConfig('navbar', navbar);