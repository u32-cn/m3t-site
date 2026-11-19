# m3t-site — m3t.u32.cn 站点仓库

My3dtiles（m3t）官网 m3t.u32.cn 的**唯一产物仓库**。根目录即站点根，无 docs/ 目录。

> My3dtiles 是本地离线的 3dtiles 数据浏览器 + 数字孪生快速搭建工具。

## 定位

- 本仓库只装**线上产物**（构建产物 + 应用），不含内容源码
- 内容源码与构建器在 `S:/vtxf/vtxf-work/projects/vtxf/my3dtiles-docs-2026`（内部资料仓库，不对外）：改内容/样式在那边改源、跑 `node scripts/build-site.mjs`，然后把产物拷入本仓库
- 三维地球应用 `v0.9/app/`（约 107M）唯一副本在本仓库（自 ai-pages 迁入）

## 站点结构（线上 m3t.u32.cn 与本仓库一一对应）

```
/                → 跳转 stub → /v0.9/
/v0.9/           → 产品站首页（含三维地球预览 iframe）
/v0.9/docs/...   → 文档中心（manual/log/download/more + 全文搜索）
/v0.9/app/       → My3dtiles(Web) 三维地球应用（~107M）
/v0.9/app/noeditor.html → 首页预览 iframe 的内嵌地址
```

## 发布链路

```
本仓库 ──ossutil──▶ OSS oss://u32-cn-data/_inner_/zt/p/m3t/web/
                        │
                   EdgeOne 规则引擎（子域映射，配置不在本仓库）
                        ▼
                   https://m3t.u32.cn/
```

EdgeOne 侧：`m3t.u32.cn` → OSS `_inner_/zt/p/m3t/web/`，`/` → 根 index.html，`/xxx/` → 302 到 `/xxx/index.html`。**本仓库改动无需动 EdgeOne。**

## 命令

```bash
node scripts/publish.mjs           # 校验结构 + 隐私扫描（默认，不上传）
node scripts/publish.mjs --sync    # 推送 OSS（需 OSS_ACCESS_KEY_ID/SECRET）
node scripts/publish.mjs --purge   # 刷新 EdgeOne 缓存（需 tccli + 腾讯云密钥）
python scripts/privacy-scan.py     # 单独跑隐私扫描
```

## 发布流程

1. 改内容：去 `my3dtiles-docs-2026` 改源 → `node scripts/build-site.mjs`
2. 拷产物：`web/index.html`、`web/assets`、`web/docs` → 本仓库 `v0.9/` 下同名位置
3. `node scripts/publish.mjs` 校验（结构 + 隐私扫描必须过）
4. `--sync` 推 OSS → `--purge` 刷缓存
5. 验收：`https://m3t.u32.cn/` 跳 `/v0.9/`；首页出地球；`/v0.9/app/noeditor.html` 可打开

## 隐私红线（发布前必查）

`scripts/privacy-scan.py` 自动扫描以下内容，发布前必须人工确认归零：

- 本机绝对路径（`C:\Users\<user>\...` 等）
- 密钥/Token/AK/SK
- OSS bucket 内部路径、EdgeOne zone id
- 内网 IP / 内网端口

已知白名单（文档教程正文中的示例性 localhost/127.0.0.1 属正常教学内容，非泄漏；代码里的 `localhost:8080` 等为调试回退默认值，公开仓库历史已如此）。
