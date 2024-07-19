import fs from "fs/promises";
// import fss from "fs"; // only needed to check if directory exists
import path from "node:path";
import telenoteConfig from "./telenote.config.js";
import process, { exit } from "process";

/** Go through each of the file, and extract all the lines that contain valid
    tags. Also accumulate all the content without the tags. Return
    {
        {filename: array of filtered file content},
        {tagname: array of tag lines}
    }
 */
export default async function parseFiles(files) {
    let fileContentDict = {};
    let tagLines = [];

    for (let file of files) {
        let filePath = path.resolve(process.cwd(), file);
        // create a content array for this file
        fileContentDict[filePath] = [];
        const data = await fs.readFile(filePath, {
            encoding: "utf-8",
        });

        // tags can only appear at the start of a line
        // hence, check each line of the file and separate out tags
        let fileContent = data.split("\n");
        fileContent.forEach((line) => {
            if (isTag(line)) {
                tagLines.push(line);
            } else {
                fileContentDict[filePath].push(line);
            }
        });
    }
    return { fileContentDict, tagLines };
}

/** Go through each line, compare with config file and check if 
    the line contains a tag.
    Return true when line contains a valid tag, false otherwise */
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

/** Check if the file exists and handle any errors */
async function pathExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch (e) {
        return false;
    }
}

/** Read a file path, if path does not exist, 
    ensure a the path exists by creating one */
async function createFileWithPath(filePath) {
    // assumption: file does not exist
    if (!(await pathExists(filePath))) {
        await fs.mkdir(filePath, { recursive: true });
    }
}

/** Wrap the fs.writeFile by with error handling */
export async function overwriteFile(filePath, content) {
    try {
        await fs.writeFile(filePath, content);
    } catch (e) {
        exit(1);
    }
}

/** Append the tag contents of each file to
    the directory and file specified (in the config file) for that tag */
export async function appendToFile(tagDict, keywordsDict) {
    for (let tag in tagDict) {
        await createFileWithPath(keywordsDict[tag].directory);
        var content = tagDict[tag].join("\n");
        let fullPath =
            path.resolve(
                process.cwd(),
                keywordsDict[tag].directory,
                keywordsDict[tag].filename
            ) + ".md";
        try {
            await fs.appendFile(fullPath, "\n" + content);
        } catch (e) {
            exit(1);
        }
    }
}

/** Takes an array of filenames, and an array of files where tags will be 
    written to and returns a filtered array of filenames */
export function filterFiles(fileArray, tagsToFilter) {
    const filesToCheck = fileArray.filter((file) => {
        const [fileName, extensionName] = file.split(".");
        if (extensionName === "md" && !tagsToFilter.includes(fileName)) {
            return true;
        } else {
            return false;
        }
    });
    return filesToCheck;
}
