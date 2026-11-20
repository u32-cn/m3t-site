# AGENTS.md — AI 在本仓库的行为纪律

事实性内容（结构、链路、命令）以 [README.md](README.md) 为准，本文件只记纪律与坑。

## 硬性禁令

1. **隐私红线最高优先**：任何文件进本仓库前，必须跑 `python scripts/privacy-scan.py`；发现可疑项逐条人工判断，拿不准就问用户。**不扫描直接提交 = 违规**。历史背景：正文系站长本人 wolai 导出的公开教程，残留的示例路径（如 `C:\Users\vtxf\Downloads\...`）属「已确认可接受的示例」，但**新增内容里的同类内容必须重新请示**，不得自行放行。
2. **本仓库是站点本体**：内容直接改本仓库的 HTML/静态文件（2026-11-20 起与 my3dtiles-docs-2026 彻底解耦，那边构建器已删）。改完 commit → publish 校验 → --push。`v0.9/app/` 是三维地球应用唯一副本，应用升级在此替换。
3. **发布必须经用户同意**：`--push`（推 GitHub 触发 Pages 部署）与 `--purge`（刷缓存）不得擅自执行。
4. **公开仓纪律**：本仓库在 GitHub 公开（u32-cn/m3t-site），任何密钥字面值、内部配置、非公开业务信息一律不得进库；隐私扫描是最后一道闸，绕过它 commit = 违规。

## 已知坑

- `scripts/privacy-scan.py` 会对压缩后的 JS bundle（`v0.9/app/js/**/dist-web/*.js`）报大量误报（`localhost` 调试回退、`inner` 变量名撞 `_inner_`、第三方库含 token 字样）。判断顺序：先看文件路径是否在 `app/js` bundle 白名单，再逐条看正文。
- 文档正文（`v0.9/docs/log/**`）中的 `C:\Users\vtxf\...` 是 2024 年教程写作时的示例路径，作者本人即站长，公开范畴内不构成隐私泄漏；**但 ai-pages 仓库等第三处不得再留同类内容副本**。
- Pages 用 legacy 部署（branch main, path `/`），仓库根必须有 `.nojekyll`；**仓库体积上限 1G**（现 304M），往里塞大文件前先想想。
- EdgeOne 回源指向 GitHub Pages 地址，切换/修改在 EdgeOne 控制台或 tccli；刷缓存凭证在 WSL `~/.vtxf/secrets.env`（不进本仓库）。
- gh 认证走 `GH_TOKEN`（git 操作协议 https）；u32-cn 组下现有仓：git-notes、u32-local-server、m3t-site。

## 审批要求

- commit / push / 发布（--push / --purge）前先向用户说明，经同意后执行
- 删除文件、改 `.gitignore`、改扫描脚本白名单，同样先征得同意
