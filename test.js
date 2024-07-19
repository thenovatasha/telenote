import fs from "fs/promises";

export default async function appendToFile(pathToWrite, content) {
    try {
        fs.appendFile(pathToWrite, content);
    } catch (e) {
        console.error("ERROR appending line", content, e);
    }
}
