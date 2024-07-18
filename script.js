import fs from "fs/promises";
import path from "node:path";
import process from "process";
// read all the files that end with .md
console.log(`currently at ${process.cwd()}`);
console.log(`using meta.url ${import.meta.url}`);
const fileArray = await fs.readdir(process.cwd());

const filesToCheck = fileArray.filter(
    (fileName) => path.extname(fileName) === ".md"
);
console.log("Resolving to path", path.resolve(filesToCheck[0]));
const data = await fs.readFile(path.resolve(filesToCheck[0]), {
    encoding: "utf-8",
});
