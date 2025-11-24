import { writeFile } from "../io";
import { extractCategories } from "./extractCategories";

async function main() {
    const data = await extractCategories("content/base/math/vektorgeometrie/content-pool/example.md");
    writeFile({relativePath: 'test.json', content: JSON.stringify(data, null, 2)})
}

main()