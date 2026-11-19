# m3t-site — m3t.u32.cn 站点仓库

My3dtiles（m3t）官网 m3t.u32.cn 的**唯一产物仓库**。根目录即站点根（GitHub Pages 的 `/`），无 docs/ 目录。

> My3dtiles 是本地离线的 3dtiles 数据浏览器 + 数字孪生快速搭建工具。

## 定位

- 本仓库只装**线上产物**（构建产物 + 应用），不含内容源码；公开仓（GitHub `u32-cn/m3t-site`）
- 内容源码与构建器在 `S:/vtxf/vtxf-work/projects/vtxf/my3dtiles-docs-2026`（内部资料仓库，不对外）：改内容/样式在那边改源、跑 `node scripts/build-site.mjs`，然后把产物拷入本仓库
- 三维地球应用 `v0.9/app/`（约 107M）唯一副本在本仓库

## 站点结构（线上 m3t.u32.cn 与本仓库一一对应）

```
/                → 跳转 stub → /v0.9/
/v0.9/           → 产品站首页（含三维地球预览 iframe）
/v0.9/docs/...   → 文档中心（manual/log/download/more + 全文搜索）
/v0.9/app/       → My3dtiles(Web) 三维地球应用（~107M）
/v0.9/app/noeditor.html → 首页预览 iframe 的内嵌地址
```

## 发布链路（同 u32-local-server 模式）

```
本仓库 git push → GitHub Pages（仓库根 = 站点根，main 分支 legacy 部署）
                        │
                   EdgeOne 回源加速（回源 GitHub Pages 地址）
                        ▼
                   https://m3t.u32.cn/
```

`.nojekyll` 必须在仓库根（跳过 Jekyll 构建，带下划线/点开头的路径才能直出）。

## 命令

```bash
node scripts/publish.mjs            # 结构校验 + 隐私扫描（发布前必跑）
node scripts/publish.mjs --push     # 校验通过后 git push github main（触发 Pages 部署）
node scripts/publish.mjs --status   # 查询 Pages 构建状态
node scripts/publish.mjs --purge    # 刷新 EdgeOne 缓存（需 tccli + 腾讯云密钥）
python scripts/privacy-scan.py      # 单独跑隐私扫描
```

## 发布流程

1. 改内容：去 `my3dtiles-docs-2026` 改源 → `node scripts/build-site.mjs`
2. 拷产物：`web/index.html`、`web/assets`、`web/docs` → 本仓库 `v0.9/` 下同名位置，git commit
3. `node scripts/publish.mjs` 校验（结构 + 隐私扫描必须过）
4. `--push` 推 GitHub → `--status` 等 Pages 构建完成
5. 切流后：`--purge` 刷 EdgeOne 缓存
6. 验收：`https://m3t.u32.cn/` 跳 `/v0.9/`；首页出地球；`/v0.9/app/noeditor.html` 可打开

## 隐私红线（发布前必查）

仓库是**公开仓**，`scripts/privacy-scan.py` 自动扫描以下内容，发布前必须人工确认归零：

- 本机绝对路径（`C:\Users\<user>\...` 等）
- 密钥/Token/AK/SK
- OSS bucket 内部路径、EdgeOne zone id
- 内网 IP / 内网端口

已知白名单见 `scripts/privacy-scan.py` 头部注释（教程正文示例路径、站长公开署名等，2026-11-19 首扫逐类人工核过）。
