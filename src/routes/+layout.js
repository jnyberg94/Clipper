import { loadRules } from "$lib/api/loadRules";
import { loadDatabase } from "$lib/api/loadDatabase";

export const ssr = false;

export async function load() {
    const db = await loadDatabase() //move to history page
    const rules = await loadRules()
    return { rules }
}


