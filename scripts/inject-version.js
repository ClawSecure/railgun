#!/usr/bin/env node
/**
 * Reads the version from package.json and updates version references
 * across README.md and scripts/install.sh.
 * Idempotent -- re-running produces identical output.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const version = pkg.version;

// --- README.md ---
const readmePath = join(root, "README.md");
if (existsSync(readmePath)) {
  let readme = readFileSync(readmePath, "utf8");
  readme = readme.replace(
    /raw\.githubusercontent\.com\/ClawSecure\/railgun\/v[\d.]+\//g,
    `raw.githubusercontent.com/ClawSecure/railgun/v${version}/`
  );
  writeFileSync(readmePath, readme, "utf8");
  console.log(`Injected version ${version} into README.md`);
}

// --- scripts/install.sh ---
const installPath = join(root, "scripts", "install.sh");
if (existsSync(installPath)) {
  let install = readFileSync(installPath, "utf8");
  install = install.replace(
    /raw\.githubusercontent\.com\/ClawSecure\/railgun\/v[\d.]+\//g,
    `raw.githubusercontent.com/ClawSecure/railgun/v${version}/`
  );
  writeFileSync(installPath, install, "utf8");
  console.log(`Injected version ${version} into scripts/install.sh`);
}
