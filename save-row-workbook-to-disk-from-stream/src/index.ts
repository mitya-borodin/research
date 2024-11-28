import { createWriteStream, existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { runStreamGeneration } from "./run-stream-generator";
import { saveStreamToWorkbookOnDisk } from "./save-stream-to-workbook-on-disk";

const input = runStreamGeneration(50_000);

const outputFilePath = path.resolve(__dirname, "../storage/output.xlsx");

if (existsSync(outputFilePath)) {
  unlinkSync(outputFilePath);
}

const output = createWriteStream(outputFilePath);

// output.on("pipe", (src: Readable) => {
//   src.on("data", (data) => {
//     console.log("OUTPUT", { data: data.toString() });
//   });
// });

saveStreamToWorkbookOnDisk({ input, output });
