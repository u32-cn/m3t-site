# AGENTS.md — AI 在本仓库的行为纪律

事实性内容（结构、链路、命令）以 [README.md](README.md) 为准，本文件只记纪律与坑。

## 硬性禁令

1. **隐私红线最高优先**：任何文件进本仓库前，必须跑 `python scripts/privacy-scan.py`；发现可疑项逐条人工判断，拿不准就问用户。**不扫描直接提交 = 违规**。历史教训源：内容来自内部资料仓库（my3dtiles-docs-2026）的 wolai 导出，正文里可能残留作者本机路径示例（如 `C:\Users\vtxf\Downloads\...`）——这些出现在公开教程正文中属「已确认可接受的示例」，但**新增内容里的同类内容必须重新请示**，不得自行放行。
2. **本仓库是产物仓库**：不手改 `v0.9/` 下内容（除发布前隐私清理）；改内容去 `my3dtiles-docs-2026` 改源重建。`v0.9/app/` 例外——它是应用唯一副本，应用升级在此替换。
3. **发布必须经用户同意**：`--sync`（推 OSS）与 `--purge`（刷缓存）不得擅自执行。
4. **凭证不落盘**：OSS/腾讯云密钥只走环境变量，本仓库任何文件不得含密钥字面值或本机绝对路径。

## 已知坑

- `scripts/privacy-scan.py` 会对压缩后的 JS bundle（`v0.9/app/js/**/dist-web/*.js`）报大量误报（`localhost` 调试回退、`inner` 变量名撞 `_inner_`、第三方库含 token 字样）。判断顺序：先看文件路径是否在 `app/js` bundle 白名单，再逐条看正文。
- 文档正文（`v0.9/docs/log/**`）中的 `C:\Users\vtxf\...` 是 2024 年教程写作时的示例路径，作者本人即站长，公开范畴内不构成隐私泄漏；**但 ai-pages 仓库等第三处不得再留同类内容副本**。
- 推 OSS 用 `ossutil64 cp -r -u`（增量）；首次配置 ossutil 需用户手动 `ossutil64 config`。
- EdgeOne 缓存刷新依赖 tccli；凭证在 WSL `~/.vtxf/secrets.env`（不进本仓库）。

## 审批要求

- commit / push / 发布（--sync / --purge）前先向用户说明，经同意后执行
- 删除文件、改 `.gitignore`、改扫描脚本白名单，同样先征得同意
