import fs from "fs/promises";
// import fss from "fs"; // only needed to check if directory exists
import path from "node:path";
import process from "process";
import telenoteConfig from "./telenote.config.js";

/**
{
    keywords: { toNote: { directory: "./", filename: "newfile" } },
};
*/
const keywords = telenoteConfig.keywords;
console.log(Object.keys(keywords));

console.log();
// read all the files that end with .md
console.log(`currently at ${process.cwd()}`);
console.log();
console.log();
console.log();
console.log();

const fileArray = await fs.readdir(process.cwd());

const filesToCheck = fileArray.filter(
    (fileName) => path.extname(fileName) === ".md"
);
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}
async function parseFiles(files) {
    console.log("the files are: ", files);
    for (let file of files) {
        if (file === "es.md") {
            continue;
        }
        console.log("looking at file : ", file);
        console.log();
        console.log();

        let newContent = [];
        let filePath = path.resolve(path.resolve(file));
        const data = await fs.readFile(filePath, {
            encoding: "utf-8",
        });
        let fileContent = data.split("\n");
        for (let line of fileContent) {
            if (line[0] === "#") {
                // might be a keyword
                if (line[1] === "#") {
                    // not a keyword
                    newContent.push(line);
                    console.log("Skipping", line);
                    continue;
                }
                try {
                    let pathToWrite = path.resolve("./es.md");
                    if (await fileExists(pathToWrite)) {
                        console.log("FILE EXISTS\n");
                    } else {
                        console.log("DOES NOT EXISTS");
                        return;
                    }
                    await fs.appendFile(path.resolve("./es.md"), "\n" + line, {
                        flag: "a+",
                    });
                    console.log("SUCCESSFUL", line);
                } catch (e) {
                    console.error("ERROR appending line", line, e);
                }
            } else {
                newContent.push(line);
            }
        }
        const fp = await fs.open(filePath, "w");
        await fp.write(newContent.join("\n"));
        await fp.close();
    }
}

parseFiles(filesToCheck);
