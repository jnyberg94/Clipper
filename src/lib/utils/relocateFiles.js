// import { invoke } from '@tauri-apps/api/core'
// import { loadRules } from "./loadRules.js";
// import { readDir } from '@tauri-apps/plugin-fs';
// import { extname, join, appLocalDataDir } from "@tauri-apps/api/path";
// import {
//     readTextFile,
//     writeTextFile,
//     exists,
//     mkdir,
//     BaseDirectory,
//     rename
// } from "@tauri-apps/plugin-fs";

// export async function relocateFiles(toProcess) {

//     const tmpFolder = 'tmp';
//     const movedFiles = [];

//     try {
//         await mkdir(tmpFolder, {
//             baseDir: BaseDirectory.AppLocalData,
//             recursive: true
//         })

//         for (const file of toProcess) {
//             const destPath = await join(tmpFolder, file.name)

//             const appDataDir = await appLocalDataDir();
//             const fullDestPath = await join(appDataDir, destPath);

//             await rename(file.path, fullDestPath)

//             movedFiles.push({
//                 ...file,
//                 originalPath: file.path,
//                 path: fullDestPath
//             })
//         }

//         return movedFiles

//     } catch (err) {
//         console.error("Relocation error:", err);
//     }
    
// }


import { invoke } from '@tauri-apps/api/core'
import { readDir } from '@tauri-apps/plugin-fs';
import { extname, join, appLocalDataDir, basename } from "@tauri-apps/api/path";
import {
    readTextFile,
    writeTextFile,
    exists,
    mkdir,
    BaseDirectory,
    rename
} from "@tauri-apps/plugin-fs";

export async function relocateFiles(results) {
    const tmpFolder = 'tmp';
    const movedFiles = { toProcess: [], folders: [] };
    
    try {
        const appDataDir = await appLocalDataDir();
        await mkdir(tmpFolder, {
            baseDir: BaseDirectory.AppLocalData,
            recursive: true
        });

        for (const file of results.toProcess) {
            const destPath = await join(tmpFolder, file.name);
            const fullDestPath = await join(appDataDir, destPath);
            await rename(file.path, fullDestPath);
            
            movedFiles.toProcess.push({
                ...file,
                originalPath: file.path,
                path: fullDestPath
            });
        }

        async function relocateFolder(folder, parentTmpPath = tmpFolder) {
            if (folder.toProcess.length === 0 && 
                !folder.folders?.some(f => hasFilesToProcess(f))) {
                return null;
            }

            const folderTmpPath = await join(parentTmpPath, folder.name);
            const fullFolderPath = await join(appDataDir, folderTmpPath);
            
            await mkdir(folderTmpPath, {
                baseDir: BaseDirectory.AppLocalData,
                recursive: true
            });

            const movedFolder = {
                name: folder.name,
                originalPath: folder.path,
                path: fullFolderPath,
                toProcess: [],
                folders: []
            };

            // Move files in this folder
            for (const file of folder.toProcess) {
                const destPath = await join(folderTmpPath, file.name);
                const fullDestPath = await join(appDataDir, destPath);
                await rename(file.path, fullDestPath);
                
                movedFolder.toProcess.push({
                    ...file,
                    originalPath: file.path,
                    path: fullDestPath
                });
            }

            // Recursively process subfolders
            if (folder.folders) {
                for (const subfolder of folder.folders) {
                    const movedSubfolder = await relocateFolder(subfolder, folderTmpPath);
                    if (movedSubfolder) {
                        movedFolder.folders.push(movedSubfolder);
                    }
                }
            }

            return movedFolder;
        }

        // Helper to check if folder or any subfolder has files to process
        function hasFilesToProcess(folder) {
            if (folder.toProcess.length > 0) return true;
            return folder.folders?.some(f => hasFilesToProcess(f)) ?? false;
        }

        // Process all folders
        if (results.folders) {
            for (const folder of results.folders) {
                const movedFolder = await relocateFolder(folder);
                if (movedFolder) {
                    movedFiles.folders.push(movedFolder);
                }
            }
        }

        return movedFiles;
    } catch (err) {
        console.error("Relocation error:", err);
        throw err;
    }
}