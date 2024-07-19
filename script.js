import fs from "fs/promises";
// import fss from "fs"; // only needed to check if directory exists
import process from "process";
import telenoteConfig from "./telenote.config.js";
import parseFiles, { appendToFile } from "./file.js";
import { overwriteFile } from "./file.js";
function filterFiles(fileArray, filesToFilter) {
    const filesToCheck = fileArray.filter((file) => {
        const [fileName, extensionName] = file.split(".");
        if (extensionName === "md" && !filesToFilter.includes(fileName)) {
            return true;
        } else {
            return false;
        }
    });
    return filesToCheck;
}
const fileArray = await fs.readdir(process.cwd());

const filesToFilter = [];
Object.values(telenoteConfig.keywords).forEach((tag) => {
    // filesToFilter.push(tag.fileName);
    filesToFilter.push(tag.filename);
});
const filesToCheck = filterFiles(fileArray, filesToFilter);
console.log("ONLY READING FROM", filesToCheck);
const { fileContentDict, tagLines } = await parseFiles(filesToCheck);
for (let file in fileContentDict) {
    await overwriteFile(file, fileContentDict[file].join("\n"));
}

let newTagDict = {};

for (let line of tagLines) {
    let tag = line.split(" ")[0].substring(1);
    if (!newTagDict[tag]) {
        newTagDict[tag] = [line];
    } else {
        newTagDict[tag].push(line);
    }
}
await appendToFile(newTagDict, telenoteConfig.keywords);
