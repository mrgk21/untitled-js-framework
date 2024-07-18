import { dirname, join } from "path";
import { fileURLToPath } from "url";

const srcDir = join(dirname(fileURLToPath(import.meta.url)));
const clientDir = join(dirname(fileURLToPath(import.meta.url)), "./client");
const serverDir = join(dirname(fileURLToPath(import.meta.url)), "./server");

export {
  srcDir,
  clientDir,
  serverDir
}