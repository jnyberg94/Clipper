import { readDir, stat } from '@tauri-apps/plugin-fs'
import { join, appLocalDataDir } from '@tauri-apps/api/path'
import { loadRules } from '$lib/utils/loadRules'

export async function getFolderStats() {
    const rules = await loadRules()
    const appDataDir = await appLocalDataDir();
    const folderPath = await join(appDataDir, 'tmp');
    const entries = await readDir(folderPath, { recursive: true });

    let totalSize = 0;
    let totalFiles = 0;

    for (const entry of entries) {
        if(rules.settings.permaSkip.includes(entry.name)) continue

        if (!entry.isDirectory) {
            totalFiles++;
            const filePath = await join(folderPath, entry.name);
            const fileStats = await stat(filePath);
            totalSize += fileStats.size;
        }
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