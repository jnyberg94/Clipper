// import { loadRules } from "../utils/loadRules.js";
// import { readDir } from '@tauri-apps/plugin-fs';
// import { invoke } from '@tauri-apps/api/core';
// import { extname, join } from "@tauri-apps/api/path";


// export async function sortFilesEngine(folderPath) {
//     const rules = await loadRules();

//     const results = {
//         toProcess: [],
//         skipped: [],
//         errors: []
//     };

//     try {
//         // Read all files in the folder
//         const entries = await readDir(folderPath, { recursive: true });

//         for (const entry of entries) {
//             // Skip directories
//             if (entry.isDirectory) continue;

//             const filePath = await join(folderPath, entry.name);
//             const fileName = entry.name;

//             try {
//                 let matched = false;

//                 for (const rule of rules.rules) {
//                     if (rule.type === 'fileExtension') {
//                         const rawExt = await extname(fileName);
//                         const ext = `.${rawExt.toLowerCase()}`;

//                         if (rule.extensions.includes(ext)) {
//                             if (rule.action === 'skip') {
//                                 results.skipped.push({
//                                     path: filePath,
//                                     name: fileName,
//                                     reason: rule.reason
//                                 });
//                             }
//                             matched = true;
//                             break;
//                         }
//                     }
//                     else if (rule.type === 'videoFps') {
//                         // Check if it's a video file first
//                         const videoExtensions = ['.mov', '.mp4', '.avi', '.mkv', '.m4v', '.webm'];
//                         const rawExt = await extname(fileName);
//                         const ext = `.${rawExt.toLowerCase()}`;

//                         if (!videoExtensions.includes(ext)) continue;

//                         const fps = await invoke('get_video_fps', { path: filePath });

//                         if (fps >= rule.minFps && fps <= rule.maxFps) {
//                             if (rule.action === 'skip') {
//                                 results.skipped.push({
//                                     path: filePath,
//                                     name: fileName,
//                                     fps: fps,
//                                     reason: rule.reason
//                                 });
//                             } else if (rule.action === 'process') {
//                                 results.toProcess.push({
//                                     path: filePath,
//                                     name: fileName,
//                                     fps: fps,
//                                     targetFps: rule.targetFps,
//                                     reason: rule.reason
//                                 });
//                             }
//                             matched = true;
//                             break;
//                         }
//                     }
//                 }

//                 // If no rule matched, skip by default
//                 if (!matched) {
//                     const videoExtensions = ['.mov', '.mp4', '.avi', '.mkv', '.m4v', '.webm'];
//                     const rawExt = await extname(fileName);
//                     const ext = `.${rawExt.toLowerCase()}`;

//                     if (videoExtensions.includes(ext)) {
//                         results.skipped.push({
//                             path: filePath,
//                             name: fileName,
//                             reason: 'No matching rule'
//                         });
//                     }
//                 }

//             } catch (error) {
//                 results.errors.push({
//                     path: filePath,
//                     name: fileName,
//                     error: error.message
//                 });
//             }
//         }

//     } catch (error) {
//         console.error('Error reading directory:', error);
//         throw error;
//     }

//     return results;
// }

import { loadRules } from "../utils/loadRules.js";
import { readDir } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';
import { extname, join, basename } from "@tauri-apps/api/path";

export async function sortFilesEngine(folderPath) {
    const rules = await loadRules();
    
    async function processDirectory(dirPath, relativePath = '') {
        const results = { toProcess: [], skipped: [], errors: [], folders: [] };
        const entries = await readDir(dirPath);

        for (const entry of entries) {
            const fullPath = await join(dirPath, entry.name);
            
            if (entry.isDirectory) {
                const subResults = await processDirectory(fullPath, await join(relativePath, entry.name));
                
                // Only include folder if it has relevant content
                if (subResults.toProcess.length > 0 || subResults.skipped.length > 0 || 
                    subResults.errors.length > 0 || subResults.folders.length > 0) {
                    results.folders.push({
                        name: entry.name,
                        path: fullPath,
                        ...subResults
                    });
                }
                continue;
            }

            try {
                const fileResult = await processFile(fullPath, entry.name, rules);
                if (fileResult) {
                    results[fileResult.category].push(fileResult.data);
                }
            } catch (error) {
                results.errors.push({
                    path: fullPath,
                    name: entry.name,
                    error: error.message
                });
            }
        }

        return results;
    }

    async function processFile(filePath, fileName, rules) {
        const videoExtensions = ['.mov', '.mp4', '.avi', '.mkv', '.m4v', '.webm'];
        const rawExt = await extname(fileName);
        const ext = `.${rawExt.toLowerCase()}`;

        for (const rule of rules.rules) {
            if (rule.type === 'fileExtension' && rule.extensions.includes(ext)) {
                if (rule.action === 'skip') {
                    return { category: 'skipped', data: { path: filePath, name: fileName, reason: rule.reason } };
                }
                return null;
            }

            if (rule.type === 'videoFps' && videoExtensions.includes(ext)) {
                const fps = await invoke('get_video_fps', { path: filePath });
                
                if (fps >= rule.minFps && fps <= rule.maxFps) {
                    const data = { path: filePath, name: fileName, fps, reason: rule.reason };
                    
                    if (rule.action === 'skip') {
                        return { category: 'skipped', data };
                    }
                    if (rule.action === 'process') {
                        return { category: 'toProcess', data: { ...data, targetFps: rule.targetFps } };
                    }
                }
            }
        }

        // No rule matched
        if (videoExtensions.includes(ext)) {
            return { category: 'skipped', data: { path: filePath, name: fileName, reason: 'No matching rule' } };
        }
        
        return null;
    }

    return processDirectory(folderPath);
}