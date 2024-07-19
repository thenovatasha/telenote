import fs from "fs/promises";
// import fss from "fs"; // only needed to check if directory exists
import path from "node:path";
import telenoteConfig from "./telenote.config.js";
import process from "process";
export default async function parseFiles(files) {
    let fileContentDict = {};
    let tagLines = [];
    for (let file of files) {
        let filePath = path.resolve(process.cwd(), file);
        fileContentDict[filePath] = [];
        const data = await fs.readFile(filePath, {
            encoding: "utf-8",
        });
        let fileContent = data.split("\n");
        // check each line of the file and separate out tags
        fileContent.forEach((line) => {
            if (isTag(line)) {
                tagLines.push(line);
            } else {
                fileContentDict[filePath].push(line);
            }
        });
    }
    // console.log(fileContentDict);
    return { fileContentDict, tagLines };
}

function isTag(line) {
    const words = line.split(" ");
    if (words[0][0] === "#") {
        const tagCandidate = words[0].substring(1);
        if (Object.keys(telenoteConfig.keywords).includes(tagCandidate)) {
            return true;
        }
    }
    return false;
}

async function pathExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch (e) {
        return false;
    }
}

async function createFileWithPath(filePath) {
    // assumption: file does not exist
    if (!(await pathExists(filePath))) {
        await fs.mkdir(filePath, { recursive: true });
    }
}
export async function overwriteFile(filePath, content) {
    try {
        await fs.writeFile(filePath, content);
    } catch (e) {
        console.error(e);
    }
}
export async function appendToFile(tagDict, keywordsDict) {
    for (let tag in tagDict) {
        createFileWithPath(keywordsDict[tag].directory);
        var content = tagDict[tag].join("\n");
        let fullPath =
            path.resolve(
                process.cwd(),
                keywordsDict[tag].directory,
                keywordsDict[tag].filename
            ) + ".md";
        console.log(fullPath);
        try {
            await fs.appendFile(fullPath, "\n" + content);
        } catch (e) {
            console.error("ERROR appending line", content, e);
        }
    }
}
