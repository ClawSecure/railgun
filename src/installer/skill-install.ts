import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

/**
 * Get the path to the railgun skills directory (bundled with railgun).
 */
function getRailgunSkillsDir(): string {
  // Skills are in the railgun package under skills/
  return path.join(import.meta.dirname, "..", "..", "skills");
}

/**
 * Get the user's OpenClaw skills directory.
 */
function getUserSkillsDir(): string {
  return path.join(os.homedir(), ".openclaw", "skills");
}

/**
 * Install the railgun-workflows skill to the user's skills directory.
 */
export async function installRailgunSkill(): Promise<{ installed: boolean; path: string }> {
  const srcDir = path.join(getRailgunSkillsDir(), "railgun-workflows");
  const destDir = path.join(getUserSkillsDir(), "railgun-workflows");
  
  // Ensure user skills directory exists
  await fs.mkdir(getUserSkillsDir(), { recursive: true });
  
  // Copy skill files
  try {
    // Check if source exists
    await fs.access(srcDir);
    
    // Create destination directory
    await fs.mkdir(destDir, { recursive: true });
    
    // Copy SKILL.md
    const skillContent = await fs.readFile(path.join(srcDir, "SKILL.md"), "utf-8");
    await fs.writeFile(path.join(destDir, "SKILL.md"), skillContent, "utf-8");
    
    return { installed: true, path: destDir };
  } catch (err) {
    // Source doesn't exist or copy failed
    return { installed: false, path: destDir };
  }
}

/**
 * Uninstall the railgun-workflows skill from the user's skills directory.
 */
export async function uninstallRailgunSkill(): Promise<void> {
  const destDir = path.join(getUserSkillsDir(), "railgun-workflows");
  
  try {
    await fs.rm(destDir, { recursive: true, force: true });
  } catch {
    // Already gone
  }
}
