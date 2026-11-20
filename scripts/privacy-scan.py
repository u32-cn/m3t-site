#!/usr/bin/env python
"""扫描站点文本文件中的隐私信息（本机路径/密钥/token/内部地址）。
用法: python scripts/privacy-scan.py
仅扫描文本类扩展名，二进制（图片/音视频/字体）跳过。
退出码: 0=干净 1=发现可疑项
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# 站点产物目录之外的文件（脚本/文档）不参与扫描，避免扫描器自身与文档中的示例触发误报
SCAN_SKIP_TOP = {"scripts", "docs", "AGENTS.md", "README.md", ".git"}

TEXT_EXT = {
    ".html", ".htm", ".js", ".css", ".json", ".md", ".txt", ".xml",
    ".svg", ".mjs", ".map",
}

# (标签, 正则) —— 命中即报
PATTERNS = [
    ("本机绝对路径", re.compile(r"[CDYS]:[\\/](Users|vtxf|Windows|Program)", re.I)),
    ("密钥凭证类", re.compile(r"(ACCESS_KEY_SECRET|SECRET_KEY|SECRET_ID|API[_-]?KEY|TOKEN)\s*[:=]", re.I)),
    ("AK/SK 字面值", re.compile(r"\b(LTAI[A-Za-z0-9]{12,}|AKID[A-Za-z0-9]{20,})\b")),
    ("edgeone/oss 内部配置", re.compile(r"(zone-3h9n8ff8t5to|_inner_|eo\.dnse0\.com|u32-cn-data)", re.I)),
    ("wolai 内部 id", re.compile(r"wolai\.com/", re.I)),
    ("内网地址", re.compile(r"(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)")),
    ("用户名标识", re.compile(r"\bvtxf\b", re.I)),
]
# 已人工确认的公开内容白名单（站长本人的公开教程示例，历史已如此公开）：
# - app/js 内 bundle 的 localhost/127.0.0.1 调试回退与教程示例（CesiumLab 默认地址等）
# - docs 教程正文的 localhost/127.0.0.1 本地服务演示
# - 站长公开身份 vtxf（gitee.com/vtxf3d、zhihu.com/people/vtxf 等，本就是公开署名）
WHITELIST_PREFIXES = (
    "v0.9/app/js/",           # bundle：localhost 调试回退、vtxf-xe2 包名、教程示例 IP（已人工核过）
    "v0.9/docs/",             # 站长公开教程：C:\Users\vtxf 示例路径、公开署名（gitee.com/vtxf3d、zhihu.com/people/vtxf）、
                              # geovis token={请输入token} 占位符、dead 标记的 wolai 旧链（不可点击，2026-11-19 首扫人工逐类核过）
    "v0.9/index.html",        # 产品站首页：公开署名与 QQ 群链接
)

def main():
    hits = []
    nfiles = 0
    for p in sorted(ROOT.rglob("*")):
        if not p.is_file() or p.suffix.lower() not in TEXT_EXT:
            continue
        rel = p.relative_to(ROOT).as_posix()
        if rel.split("/")[0] in SCAN_SKIP_TOP:
            continue
        if any(rel.startswith(pre) for pre in WHITELIST_PREFIXES):
            continue
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        nfiles += 1
        for label, pat in PATTERNS:
            for m in pat.finditer(text):
                line_no = text.count("\n", 0, m.start()) + 1
                line = text.splitlines()[line_no - 1].strip()[:120]
                hits.append((rel, line_no, label, line))

    print(f"scanned {nfiles} text files")
    if not hits:
        print("CLEAN: no privacy hits")
        return 0
    for rel, ln, label, line in hits:
        print(f"[{label}] {rel}:{ln}\n    {line}")
    print(f"\n{len(hits)} hit(s) — 逐条人工判断是否为误报")
    return 1

if __name__ == "__main__":
    sys.exit(main())
