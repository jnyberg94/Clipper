import {
    readTextFile,
    writeTextFile,
    exists,
    mkdir,
    BaseDirectory,
} from "@tauri-apps/plugin-fs";
import defaultRules from "$lib/rules/defaultRules.json";


export async function loadRules() {

    const fileName = "rules.json";
    try {
        await mkdir("", { 
            baseDir: BaseDirectory.AppLocalData, 
            recursive: true 
        });

        const fileExists = await exists(fileName, {
            baseDir: BaseDirectory.AppLocalData,
        });
        
        if (fileExists) {
            const contents = await readTextFile(fileName, {
                baseDir: BaseDirectory.AppLocalData,
            });
            return JSON.parse(contents);
        } else {
            await writeTextFile(
                fileName,
                JSON.stringify(defaultRules, null, 2),
                {
                    baseDir: BaseDirectory.AppLocalData,
                },
            );
            return defaultRules;
        }
    } catch (err) {
        console.error("Initialization error:", err);
        return defaultRules;
    }
}