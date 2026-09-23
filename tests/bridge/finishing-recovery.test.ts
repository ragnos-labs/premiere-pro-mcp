import { mkdtempSync, writeFileSync, existsSync, rmSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { capabilityForTool } from "../../src/security/capabilities.js";
import { expect, it } from "vitest";
import { reconcileBridgeCommand, cleanupTempDir } from "../../src/bridge/file-bridge.js";

it("reconciles a completed command after its writer exits without replaying or deleting live work", () => {
  const root = mkdtempSync(join(tmpdir(), "premiere-recovery-"));
  const exited = spawnSync(process.execPath, ["-e", ""]);
  const cmd = join(root, "cmd_123.jsx"), res = join(root, "res_123.json");
  try {
    writeFileSync(join(root, "bridge-writer.lock"), JSON.stringify({ pid: exited.pid }));
    writeFileSync(join(root, "bridge-uncertain.json"), JSON.stringify({ commandFile: cmd, responseFile: res, pending: true, pid: process.pid }));
    writeFileSync(cmd, "retained");
    writeFileSync(res, JSON.stringify({ success: true, data: { saved: true } }));
    expect(capabilityForTool("reconcile_bridge_command")).toBe("inspect");
    writeFileSync(join(root, "bridge-reconcile.lock"), JSON.stringify({ pid: process.pid }));
    expect(reconcileBridgeCommand({ tempDir: root }).outcome).toBe("uncertain");
    expect(existsSync(cmd)).toBe(true);
    unlinkSync(join(root, "bridge-reconcile.lock"));
    cleanupTempDir({ tempDir: root });
    expect(existsSync(cmd)).toBe(true);
    expect(reconcileBridgeCommand({ tempDir: root }).outcome).toBe("uncertain");
    writeFileSync(join(root, "bridge-uncertain.json"), JSON.stringify({ commandFile: cmd, responseFile: res, pending: true, pid: exited.pid }));
    expect(reconcileBridgeCommand({ tempDir: root })).toMatchObject({ success: true, data: { state: "resolved", result: { success: true } } });
    expect(existsSync(join(root, "bridge-writer.lock"))).toBe(false);
    writeFileSync(join(root, "bridge-writer.lock"), JSON.stringify({ pid: exited.pid }));
    expect(reconcileBridgeCommand({ tempDir: root })).toMatchObject({ success: true, data: { state: "clear" } });
    expect(existsSync(join(root, "bridge-writer.lock"))).toBe(false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
