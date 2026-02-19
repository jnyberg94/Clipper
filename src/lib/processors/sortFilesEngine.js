import { getRules } from "../utils/rulesActions.js";
import { readDir } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';
import { extname, join, basename } from "@tauri-apps/api/path";

export async function sortFilesEngine(folderPath) {
    const config = await getRules();
    
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
                const fileResult = await processFile(fullPath, entry.name);
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

    async function processFile(filePath, fileName) {
        const videoExtensions = ['.mov', '.mp4', '.avi', '.mkv', '.m4v', '.webm'];
        const rawExt = await extname(fileName);
        const ext = `.${rawExt.toLowerCase()}`;

        for (const rule of config.rules) {
            if (rule.type === 'fileExtension' && rule.extensions.includes(ext)) {
                if (rule.action === 'skip') {
                    return { category: 'skipped', data: { path: filePath, name: fileName, reason: rule.reason } };
                }
                return null;
            }
        }

        if (videoExtensions.includes(ext)) {
            const fps = await invoke('get_video_fps', { path: filePath });
            const { minFps, maxFps, targetFps } = config.settings.videoProcessing;
            
            const data = { path: filePath, name: fileName, fps };

            if (fps >= minFps && fps <= maxFps) {
                return { 
                    category: 'toProcess', 
                    data: { ...data, targetFps, reason: "Variable framerate recording" } 
                };
            } else if (fps > maxFps) {
                return { category: 'skipped', data: { ...data, reason: "Already 60fps" } };
            } else {
                return { category: 'skipped', data: { ...data, reason: "Standard framerate video" } };
            }
        }

        // 3. Fallback
        if (videoExtensions.includes(ext)) {
            return { category: 'skipped', data: { path: filePath, name: fileName, reason: 'No matching rule' } };
        }
        
        return null;
    }

    return processDirectory(folderPath);
}