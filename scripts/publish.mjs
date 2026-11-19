#!/usr/bin/env node
/**
 * m3t-site 发布脚本（GitHub Pages 链路）
 * 链路：本仓库 git push → GitHub Pages（站点根 = 仓库根，main 分支）→ EdgeOne 回源加速 → m3t.u32.cn
 * 参考 u32-local-server 的发布模式。
 *
 * 用法:
 *   node scripts/publish.mjs            结构校验 + 隐私扫描（默认）
 *   node scripts/publish.mjs --push     校验通过后 git push 到 GitHub（触发 Pages 部署）
 *   node scripts/publish.mjs --purge    部署后刷新 EdgeOne 缓存（需 tccli + 腾讯云密钥）
 *   node scripts/publish.mjs --status   查询 Pages 部署状态
 *
 * 发布前必须人工跑：node scripts/publish.mjs（校验）→ --push → 等 Pages 构建 → --purge → 验收
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const REQUIRED = ["index.html", "v0.9/index.html", "v0.9/app/index.html", "v0.9/docs/index.html", ".nojekyll"];
const GITHUB_REMOTE = "github";
const GITHUB_REPO = "u32-cn/m3t-site";
const PURGE_URLS = [
  "https://m3t.u32.cn/",
  "https://m3t.u32.cn/v0.9/",
  "https://m3t.u32.cn/v0.9/app/noeditor.html",
];
const ZONE_ID = "zone-3h9n8ff8t5to";

function run(cmd, args) {
  console.log(`+ ${cmd} ${args.join(" ")}`);
  return execFileSync(cmd, args, { stdio: "inherit", cwd: ROOT });
}

function check() {
  const missing = REQUIRED.filter((f) => !fs.existsSync(path.join(ROOT, f)));
  if (missing.length) {
    console.error("结构校验失败，缺少:", missing);
    process.exit(1);
  }
  // 未提交变更必须先 commit，保证 push 的就是校验过的内容
  const dirty = run("git", ["status", "--porcelain"]).toString();
  if (dirty.trim()) {
    console.error("工作区有未提交变更，先 commit 再发布：\n" + dirty);
    process.exit(1);
  }
  console.log("结构校验通过，工作区干净");
  try {
    run("python", ["scripts/privacy-scan.py"]);
    console.log("隐私扫描通过");
  } catch {
    console.error("隐私扫描发现可疑项。人工逐条确认无泄漏后，可用 --force 强制继续。");
    if (!process.argv.includes("--force")) process.exit(2);
    console.warn("--force：已确认误报，继续");
  }
}

function push() {
  check();
  run("git", ["push", GITHUB_REMOTE, "main"]);
  console.log("已推送 GitHub，Pages 部署已触发。用 --status 轮询构建状态。");
}

function status() {
  run("gh", ["api", `repos/${GITHUB_REPO}/pages`, "--jq", "{status:.status, html_url:.html_url}"]);
  run("gh", ["api", `repos/${GITHUB_REPO}/pages/builds/latest`, "--jq", "{status:.status, created_at:.created_at}"]);
}

function purge() {
  run("tccli", [
    "teo", "CreatePurgeTask",
    "--ZoneId", ZONE_ID,
    "--Type", "purge_url",
    "--Method", "invalidate",
    "--Targets", JSON.stringify(PURGE_URLS),
  ]);
  console.log("EdgeOne 缓存刷新任务已提交");
}

const argv = process.argv;
const mode = argv.includes("--status") ? "status"
  : argv.includes("--purge") ? "purge"
  : argv.includes("--push") ? "push"
  : "check";

if (mode === "check") check();
if (mode === "push") push();
if (mode === "status") status();
if (mode === "purge") purge();
