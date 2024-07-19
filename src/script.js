import fs from "fs/promises";
// import fss from "fs"; // only needed to check if directory exists
import process, { exit } from "process";
import telenoteConfig from "./telenote.config.js";
import parseFiles, { appendToFile, filterFiles } from "./file.js";
import { overwriteFile } from "./file.js";

// the the files from the current directory of the node application
const fileArray = await fs.readdir(process.cwd());

// from the config file, find which files should be ignored for parsing
// these are the files the tags will be written to
const filesToFilter = [];
Object.values(telenoteConfig.keywords).forEach((tag) => {
    filesToFilter.push(tag.filename);
});

const filesToCheck = filterFiles(fileArray, filesToFilter);

// parse all the files to extract the lines that contain the tags
const { fileContentDict, tagLines } = await parseFiles(filesToCheck);

// group the tag lines by their tags so that files only have to be opened once
let newTagDict = {};
for (let line of tagLines) {
    let tag = line.split(" ")[0].substring(1);
    if (!newTagDict[tag]) {
        newTagDict[tag] = [line];
    } else {
        newTagDict[tag].push(line);
    }
}

// first try to move the tags
try {
    await appendToFile(newTagDict, telenoteConfig.keywords);
} catch (e) {
    console.error(e);
    exit(1);
}

// then remove the tags from the files by overwriting the tagless content
for (let file in fileContentDict) {
    await overwriteFile(file, fileContentDict[file].join("\n"));
}
