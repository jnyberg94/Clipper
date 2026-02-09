import { invoke } from '@tauri-apps/api/core'
import { loadRules } from "../api/loadRules.js";
import { readDir } from '@tauri-apps/plugin-fs';
import { extname, join, appLocalDataDir } from "@tauri-apps/api/path";
import {
    readTextFile,
    writeTextFile,
    exists,
    mkdir,
    BaseDirectory,
    rename
} from "@tauri-apps/plugin-fs";

export async function relocateFiles(toProcess) {

    const tmpFolder = 'tmp';
    const movedFiles = [];

    try {
        await mkdir(tmpFolder, {
            baseDir: BaseDirectory.AppLocalData,
            recursive: true
        })

        for (const file of toProcess) {
            const destPath = await join(tmpFolder, file.name)

            const appDataDir = await appLocalDataDir();
            const fullDestPath = await join(appDataDir, destPath);

            await rename(file.path, fullDestPath)

            movedFiles.push({
                ...file,
                originalPath: file.path,
                path: fullDestPath
            })
        }

        return movedFiles

    } catch (err) {
        console.error("Relocation error:", err);
    }
    
}