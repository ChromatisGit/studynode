import { writeFile } from "../../builder/io";
import { buildWorksheetData } from "./buildWorksheet";

async function main() {
  const worksheet = await buildWorksheetData(
    "content/base/math/vektorgeometrie/content-pool/example.md",
    { title: "Worksheet Demo", format: "web" }
  );

  await writeFile({
    relativePath: "test.json",
    content: JSON.stringify(worksheet, null, 2),
  });
}

main();
