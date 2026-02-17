import { readDir, remove } from "@tauri-apps/plugin-fs";
import { appDataDir } from "@tauri-apps/api/path";
import { join, } from "@tauri-apps/api/path";
import { loadRules } from "$lib/utils/loadRules";

export async function deleteTmpFolder() {
    const rules = await loadRules()
    try {
        const appDataPath = await appDataDir();
        const tmpPath = await join(appDataPath, 'tmp');

        const entries = await readDir(tmpPath)

        const deletePromises = entries
            .filter(file => !rules.settings.permaSkip.includes(file.name))
            .map(async (file) => {
                const filePath = await join(tmpPath, file.name)
                await remove(filePath)
            })

        await Promise.all(deletePromises)
        console.log('Tmp folder cleared successfully');
        return { success: true, deletedCount: deletePromises.length };
    } catch (err) {
        console.log('Error clearing tmp folder:', err)
        throw err
    }

}