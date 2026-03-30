import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { selectRailgunManagedAgents } from "./uninstall.js";

describe("selectRailgunManagedAgents", () => {
  it("removes only workflow-prefixed agents for known Railgun workflow ids", () => {
    const workspaceRoot = path.join("/tmp", "openclaw", "workspaces", "workflows");
    const agents = [
      { id: "main", workspace: "/tmp/openclaw/workspaces/main" },
      { id: "feature-dev_planner", workspace: path.join(workspaceRoot, "feature-dev", "planner") },
      { id: "acme/dev", workspace: "/srv/acme/workspaces/dev" },
      { id: "other/qa", workspace: "/srv/other/workspaces/qa" },
    ] as Array<Record<string, unknown>>;

    const selected = selectRailgunManagedAgents(agents, ["feature-dev"], workspaceRoot);
    assert.deepEqual(
      selected.map((entry) => entry.id),
      ["feature-dev_planner"],
    );
  });

  it("falls back to workspace location for partially-corrupt Railgun state", () => {
    const workspaceRoot = path.join("/tmp", "openclaw", "workspaces", "workflows");
    const agents = [
      { id: "bug-fix_fixer", workspace: path.join(workspaceRoot, "bug-fix", "fixer") },
      { id: "thirdparty/coder", workspace: path.join(workspaceRoot, "bug-fix", "outside") },
      { id: "main", workspace: "/tmp/openclaw/workspaces/main" },
    ] as Array<Record<string, unknown>>;

    const selected = selectRailgunManagedAgents(agents, [], workspaceRoot);
    assert.deepEqual(
      selected.map((entry) => entry.id),
      ["bug-fix_fixer"],
    );
  });
});
