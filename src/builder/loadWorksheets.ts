import { Status } from "@schema/overview";
import { globContent, readContentFile } from "./io";
import { ResolvedCourse, WorksheetFormat } from "./prepareCourses";
import { ProcessFormat } from "@worksheet/parser/buildWorksheet";
import { protectCodeBlocks } from "@worksheet/parser/utils/codeBlocks";
import { extractTitle } from "@worksheet/parser/utils/worksheetParsing";

export type WorksheetLocation = {
  source: string;
  target: string;
  process: ProcessFormat;
};

export type WorksheetRef = {
  href: string;
  label: string;
  process: ProcessFormat;
}

type WorksheetFoldersOutput = (WorksheetLocation & {
  worksheetsRef: WorksheetRef[];
})[];

export async function getAllWorksheets(
  courses: ResolvedCourse[],
): Promise<WorksheetLocation[]> {
  const worksheetLocations = getAllWorksheetFolders(courses);
  const worksheets: WorksheetLocation[] = [];

  for (const {
    source,
    target,
    process,
    worksheetsRef,
  } of worksheetLocations) {
    const pattern = `${source}/*.typ`;
    let counter = 1;

    for await (const relPath of globContent(pattern)) {
      const currentIndex = counter++;
      const targetPath = `${target}_${String(currentIndex).padStart(2, "0")}`;
      const label: string = await getLabel(relPath);

      const files: WorksheetRef[] = [];

      switch (process) {
        case "web":
          files.push({ href: targetPath.slice("resources/".length), label, process });
          break;

        case "pdf":
          files.push({ href: `${targetPath}.pdf`, label, process });
          break;

        case "pdfSolution":
          files.push(
            { href: `${targetPath}.pdf`, label, process: "pdf" as ProcessFormat},
            { href: `${targetPath}-Loesung.pdf`, label, process }
          );
          break;
      }

      files.forEach(f =>
        worksheetsRef.push(f)
      );

      worksheets.push({
        source: relPath,
        target: targetPath,
        process
      });
    }
  }

  return worksheets;
}

function getAllWorksheetFolders(courses: ResolvedCourse[]): WorksheetFoldersOutput {

  const worksheetLocations = courses.flatMap((course) => {
    const { group, slug, subject, topics, worksheetFormat } = course;

    return topics
      .filter((t) => t.status === "finished" || t.status === "current")
      .flatMap(({ topic, chapters }) => {

        const hasMultiChapter = chapters.length > 1;
        const isWeb = worksheetFormat === "web";

        const baseDirParts = ["base", subject.id];
        if (hasMultiChapter) baseDirParts.push(topic, "chapters");

        const targetDirParts = isWeb
          ? ["resources", group.id, slug]
          : ["worksheets", subject.id];

        if (hasMultiChapter) {
          if (isWeb) targetDirParts.push(topic);
          else targetDirParts.push(topic);
        }

        const baseDir = baseDirParts.join("/");
        const targetDir = targetDirParts.join("/");

        return chapters
          .filter((c) => c.status === "finished" || c.status === "current")
          .map(({ chapter, status, worksheets }) => {
            return {
              source: [baseDir, chapter, "worksheets"].join("/"),
              target: [targetDir, chapter.slice(3)].join("/"),
              process: selectWorksheetProcess(status, worksheetFormat),
              worksheetsRef: worksheets
            };
          });
      });
  });

  return worksheetLocations;
}

function selectWorksheetProcess(status: Status, format: WorksheetFormat): ProcessFormat {
  if (format === "web") {
    return "web"
  }
  if (status === "current") {
    return "pdf"
  }
  return "pdfSolution"
}


async function getLabel(relPath: string): Promise<string> {
  const content = await readContentFile(relPath);
  const { safeContent, restoreCodeBlocks } = protectCodeBlocks(content);

  return extractTitle(safeContent, restoreCodeBlocks);
}
