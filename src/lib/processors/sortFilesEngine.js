import { loadRules } from "../api/loadRules.js";
import { readDir } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';
import { extname, join } from "@tauri-apps/api/path";



export async function sortFilesEngine(folderPath) {
    const rules = await loadRules();

    const results = {
        toProcess: [],
        skipped: [],
        errors: []
    };

    try {
        // Read all files in the folder
        const entries = await readDir(folderPath, { recursive: true });

        for (const entry of entries) {
            // Skip directories
            if (entry.isDirectory) continue;

            const filePath = await join(folderPath, entry.name);
            const fileName = entry.name;

            try {
                let matched = false;

                for (const rule of rules.rules) {
                    if (rule.type === 'fileExtension') {
                        const rawExt = await extname(fileName);
                        const ext = `.${rawExt.toLowerCase()}`;

                        if (rule.extensions.includes(ext)) {
                            if (rule.action === 'skip') {
                                results.skipped.push({
                                    path: filePath,
                                    name: fileName,
                                    reason: rule.reason
                                });
                            }
                            matched = true;
                            break;
                        }
                    }
                    else if (rule.type === 'videoFps') {
                        // Check if it's a video file first
                        const videoExtensions = ['.mov', '.mp4', '.avi', '.mkv', '.m4v', '.webm'];
                        const rawExt = await extname(fileName);
                        const ext = `.${rawExt.toLowerCase()}`;

                        if (!videoExtensions.includes(ext)) continue;

                        const fps = await invoke('get_video_fps', { path: filePath });

                        if (fps >= rule.minFps && fps <= rule.maxFps) {
                            if (rule.action === 'skip') {
                                results.skipped.push({
                                    path: filePath,
                                    name: fileName,
                                    fps: fps,
                                    reason: rule.reason
                                });
                            } else if (rule.action === 'process') {
                                results.toProcess.push({
                                    path: filePath,
                                    name: fileName,
                                    fps: fps,
                                    targetFps: rule.targetFps,
                                    reason: rule.reason
                                });
                            }
                            matched = true;
                            break;
                        }
                    }
                }

                // If no rule matched, skip by default
                if (!matched) {
                    const videoExtensions = ['.mov', '.mp4', '.avi', '.mkv', '.m4v', '.webm'];
                    const rawExt = await extname(fileName);
                    const ext = `.${rawExt.toLowerCase()}`;

                    if (videoExtensions.includes(ext)) {
                        results.skipped.push({
                            path: filePath,
                            name: fileName,
                            reason: 'No matching rule'
                        });
                    }
                }

            } catch (error) {
                results.errors.push({
                    path: filePath,
                    name: fileName,
                    error: error.message
                });
            }
        }

    } catch (error) {
        console.error('Error reading directory:', error);
        throw error;
    }

    return results;
}