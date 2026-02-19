import {
    readTextFile,
    writeTextFile,
    exists,
    mkdir,
    BaseDirectory,
} from "@tauri-apps/plugin-fs";
import defaultRules from "$lib/rules/defaultRules.json";

const fileName = "rules.json";

export async function getRules() {
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

export async function setRules(update) {
    try {
        await mkdir("", {
            baseDir: BaseDirectory.AppLocalData,
            recursive: true
        });

        const fileExists = await exists(fileName, {
            baseDir: BaseDirectory.AppLocalData,
        })

        if (fileExists) {
            await writeTextFile(fileName, JSON.stringify(update, null, 2), {
                baseDir: BaseDirectory.AppLocalData,
            });
        } else {
            await writeTextFile(
                fileName,
                JSON.stringify(defaultRules, null, 2),
                {
                    baseDir: BaseDirectory.AppLocalData,
                },
            );
        }

    } catch (err) {
        console.error("Initialization error:", err);
    }
}