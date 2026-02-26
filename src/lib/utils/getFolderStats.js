import { readDir, stat } from '@tauri-apps/plugin-fs'
import { join, appLocalDataDir } from '@tauri-apps/api/path'
import { getRules } from '$lib/utils/rulesActions'

export async function getFolderStats() {
    const rules = await getRules()
    const appDataDir = await appLocalDataDir();
    const folderPath = await join(appDataDir, 'tmp');
    const entries = await readDir(folderPath, { recursive: true });

    let totalSize = 0;
    let totalFiles = 0;

    async function processDirectory(path) {
        const entries = await readDir(path)

        for (const entry of entries) {
            if (rules.settings.permaSkip.includes(entry.name)) continue;

            const fullPath = await join(path, entry.name)

            if (entry.isDirectory) {
                await processDirectory(fullPath)
            } else {
                totalFiles++;
                const fileStats = await stat(fullPath)
                totalSize += fileStats.size
            }
        }
    }

    try {
        await processDirectory(folderPath)
    } catch (err) {
        console.error('Error reading directory:', err)
    }

    return {
        count: totalFiles,
        formattedSize: formatBytes(totalSize)
    };
}


function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}