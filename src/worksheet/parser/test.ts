import { writeFile } from "@builder/io";
import { buildWorksheetData } from "@worksheet/parser/buildWorksheet";

async function main() {
  const worksheet = await buildWorksheetData(
    "content/base/math/vektorgeometrie/chapters/10_geraden/worksheets/test.typ",
    "web"
  );

  await writeFile({
    relativePath: "test.json",
    content: JSON.stringify(worksheet, null, 2),
  });
}

main();
