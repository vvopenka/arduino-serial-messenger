const tar = require("tar");
const fsp = require("fsp");
const path = require("path");
const del = require("del");

const DESTINATION = path.join(__dirname, "arduino-serial-messenger");
const TEMPLATES_DIR = path.join(DESTINATION, "templates");
const FILES = ["index.js", "package.json", ".gitignore"];
const DIRS = ["lib", "test"];

async function copyDir(sourcePath, destPath, dirName) {
    let destDirPath = path.join(destPath, dirName);
    let sourceDirPath = path.join(sourcePath, dirName);
    await fsp.mkdirP(destDirPath);
    let files = await fsp.readdirP(sourceDirPath, {withFileTypes: true});

    for (let file of files) {
        if (file.isDirectory()) {
            await copyDir(sourceDirPath, destDirPath, file.name);
        } else {
            await fsp.copyFileP(path.join(sourceDirPath, file.name), path.join(destDirPath, file.name));
        }
    }
}

async function main() {
    await fsp.mkdirP(DESTINATION);
    for (let file of FILES) {
        await fsp.copyFileP(path.join(__dirname, file), path.join(DESTINATION, file));
    }
    for (let dir of DIRS) {
        await copyDir(__dirname, DESTINATION, dir);
    }
    await fsp.mkdirP(TEMPLATES_DIR);
    await fsp.copyFileP(path.join("..", "arduino", "Messenger.h"), path.join(TEMPLATES_DIR, "Messenger.h"));
    await fsp.copyFileP(path.join("..", "arduino", "Messenger.cpp"), path.join(TEMPLATES_DIR, "Messenger.cpp"));
    await tar.c({
        gzip: true,
        file: "arduino-serial-messenger.tgz"
    }, ["arduino-serial-messenger"]);
    await del([DESTINATION]);
}

main();