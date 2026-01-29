import {
    readTextFile,
    writeTextFile,
    exists,
    BaseDirectory,
} from "@tauri-apps/plugin-fs";
//import defaultRules from "../rules/defaultRules.json" with { type: 'json'}; //this is IMPORTANT for production version!

export async function loadRules() {
    const fileName = "rules.json";
    try {
        const fileExists = await exists(fileName, {
            dir: BaseDirectory.AppData,
        });
        
        if (fileExists) {
            const contents = await readTextFile(fileName, {
                dir: BaseDirectory.AppData,
            });
            return JSON.parse(contents);
        } else {
            await writeTextFile(
                fileName,
                JSON.stringify(defaultRules, null, 2),
                {
                    dir: BaseDirectory.AppData,
                },
            );
            return defaultRules;
        }
    } catch (err) {
        console.error("Initialization error:", err);
        return defaultRules;
    }
}