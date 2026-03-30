import fs from "node:fs/promises";
import JSON5 from "json5";
import { resolveOpenClawConfigPath } from "./paths.js";
export async function readOpenClawConfig() {
    const path = resolveOpenClawConfigPath();
    try {
        const raw = await fs.readFile(path, "utf-8");
        const config = JSON5.parse(raw);
        return { path, config };
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to read OpenClaw config at ${path}: ${message}`);
    }
}
export async function writeOpenClawConfig(configPath, config) {
    // Create a backup before writing so the user can recover if the write
    // fails or produces a corrupt config.
    const backupPath = configPath + ".railgun-backup";
    try {
        await fs.access(configPath);
        await fs.copyFile(configPath, backupPath);
    }
    catch {
        // Config file doesn't exist yet — nothing to back up.
    }
    const content = `${JSON.stringify(config, null, 2)}\n`;
    await fs.writeFile(configPath, content, "utf-8");
}
