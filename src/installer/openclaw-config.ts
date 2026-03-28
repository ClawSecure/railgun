import fs from "node:fs/promises";
import JSON5 from "json5";
import { resolveOpenClawConfigPath } from "./paths.js";

export type OpenClawConfig = {
  cron?: {
    sessionRetention?: string | false;
  };
  session?: {
    maintenance?: {
      mode?: "enforce" | "warn";
      pruneAfter?: string | number;
      pruneDays?: number;
      maxEntries?: number;
      rotateBytes?: number | string;
    };
  };
  agents?: {
    defaults?: {
      model?: string | { primary?: string };
      subagents?: {
        allowAgents?: string[];
      };
    };
    list?: Array<Record<string, unknown>>;
  };
};

export async function readOpenClawConfig(): Promise<{ path: string; config: OpenClawConfig }> {
  const path = resolveOpenClawConfigPath();
  try {
    const raw = await fs.readFile(path, "utf-8");
    const config = JSON5.parse(raw) as OpenClawConfig;
    return { path, config };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read OpenClaw config at ${path}: ${message}`);
  }
}

export async function writeOpenClawConfig(
  configPath: string,
  config: OpenClawConfig,
): Promise<void> {
  // Create a backup before writing so the user can recover if the write
  // fails or produces a corrupt config.
  const backupPath = configPath + ".railgun-backup";
  try {
    await fs.access(configPath);
    await fs.copyFile(configPath, backupPath);
  } catch {
    // Config file doesn't exist yet — nothing to back up.
  }
  const content = `${JSON.stringify(config, null, 2)}\n`;
  await fs.writeFile(configPath, content, "utf-8");
}
