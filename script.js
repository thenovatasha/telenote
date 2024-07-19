import fs from "fs/promises";
import fss from "fs"; // only needed to check if directory exists
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
async function parseFiles(files) {
    console.log("the files are: ", files);
    for (let file of files) {
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
                console.log("found line: ", line);
                fs.appendFile(path.resolve("./tonote.md"), line).then(
                    (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        } else {
                            console.log(data);
                        }
                    }
                );
            } else {
                newContent.push(line);
            }
        }
        fs.writeFile(filePath, newContent.join("\n"));
    }
}

parseFiles(filesToCheck);
console.log(fss.existsSync("sstonote.md"));
