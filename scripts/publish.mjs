#!/usr/bin/env node
/**
 * m3t-site 发布脚本
 * 链路：本地根目录(站点根) → 阿里云 OSS oss://u32-cn-data/_inner_/zt/p/m3t/web/ → EdgeOne → m3t.u32.cn
 *
 * 用法:
 *   node scripts/publish.mjs --check   仅校验结构与隐私扫描，不上传（默认）
 *   node scripts/publish.mjs --sync    实际推送 OSS（需 ossutil/OSS_ACCESS_KEY_ID/SECRET 已配置）
 *   node scripts/publish.mjs --purge   推送后刷新 EdgeOne 缓存（需 tccli + TENCENTCLOUD 密钥）
 *
 * 设计要点：
 * - 上传前强制跑隐私扫描（privacy-scan.py），发现可疑项需人工确认后 --force 才能继续
 * - OSS 端点与 bucket 固定写死（u32-cn-data，杭州），凭证一律走环境变量，不落盘
 * - 增量上传：ossutil cp -r -u（只传有变化的文件）
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const OSS_TARGET = "oss://u32-cn-data/_inner_/zt/p/m3t/web/";
const REQUIRED = ["index.html", "v0.9/index.html", "v0.9/app/index.html", "v0.9/docs/index.html"];
const PURGE_URLS = [
  "https://m3t.u32.cn/",
  "https://m3t.u32.cn/v0.9/",
  "https://m3t.u32.cn/v0.9/app/noeditor.html",
];

function run(cmd, args, opts = {}) {
  console.log(`+ ${cmd} ${args.join(" ")}`);
  return execFileSync(cmd, args, { stdio: "inherit", cwd: ROOT, ...opts });
}

function check() {
  const missing = REQUIRED.filter((f) => !fs.existsSync(path.join(ROOT, f)));
  if (missing.length) {
    console.error("结构校验失败，缺少:", missing);
    process.exit(1);
  }
  console.log("结构校验通过");
  try {
    run("python", ["scripts/privacy-scan.py"]);
    console.log("隐私扫描通过");
  } catch {
    console.error("隐私扫描发现可疑项。人工逐条确认无泄漏后，可用 --force 强制继续。");
    if (!process.argv.includes("--force")) process.exit(2);
    console.warn("--force：已确认误报，继续");
  }
}

function sync() {
  const ak = process.env.OSS_ACCESS_KEY_ID;
  const sk = process.env.OSS_ACCESS_KEY_SECRET;
  if (!ak || !sk) {
    console.error("缺少 OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET 环境变量");
    process.exit(1);
  }
  // ossutil64 已配置在 PATH；-u 增量，-f 强制，--meta 与缓存头由 EdgeOne 统一处理
  run("ossutil64", ["cp", "-r", "-u", "-f", path.join(ROOT).replace(/\//g, "\\"), OSS_TARGET]);
  console.log("OSS 同步完成:", OSS_TARGET);
}

function purge() {
  run("tccli", [
    "teo", "CreatePurgeTask",
    "--ZoneId", "zone-3h9n8ff8t5to",
    "--Type", "purge_url",
    "--Method", "invalidate",
    "--Targets", JSON.stringify(PURGE_URLS),
  ]);
  console.log("EdgeOne 缓存刷新任务已提交");
}

const mode = process.argv.includes("--purge") ? "purge"
  : process.argv.includes("--sync") ? "sync"
  : "check";

if (mode === "check" || mode === "sync") check();
if (mode === "sync") sync();
if (mode === "purge") purge();
