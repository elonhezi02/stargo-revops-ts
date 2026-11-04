import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
if (execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim())
  throw new Error("Commit reviewed changes before packaging.");
const temporary = mkdtempSync(join(tmpdir(), "revops-package-"));
const repo = join(temporary, "stargo-revops-ts");
const output = resolve("../stargo-revops-ts-review.zip");
try {
  execFileSync("git", ["clone", "--no-hardlinks", process.cwd(), repo], {
    stdio: "inherit",
  });
  execFileSync("git", ["remote", "remove", "origin"], { cwd: repo });
  if (existsSync(output)) unlinkSync(output);
  execFileSync("zip", ["-qr", output, "stargo-revops-ts"], { cwd: temporary });
  console.log(output);
  console.log(
    "Review archive only. Complete personal PROCESS.md before submission.",
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
