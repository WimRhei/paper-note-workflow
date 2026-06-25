# Paper Note Drafter

一个用于从论文 PDF 草拟中文结构化笔记的 Codex skill。它会先抽取正文，再抽取关键图表，最后按本仓库的 schema/template 生成适合 Obsidian 归档的 Markdown 笔记。

适合的场景：

- 阅读论文 PDF，并生成中文论文笔记。
- 将笔记落到 `03-论文阅读/Inbox/xxx/xxx.md`。
- 把关键图表放到 `Figure/xxx-N.ext` 并在正文中引用。
- 在缺失信息或漏提取图表处保留 `FIX:` 标记，方便人工复查。

## Install

推荐直接 clone 到 Codex skills 目录：

```powershell
git clone https://github.com/WimRhei/paper-note-drafter.git "$env:USERPROFILE\.codex\skills\paper-note-drafter"
cd "$env:USERPROFILE\.codex\skills\paper-note-drafter"
```

或者把整个 `paper-note-drafter` 文件夹复制到：

```text
%USERPROFILE%\.codex\skills\paper-note-drafter
```

## Windows Setup

这个 skill 依赖两个外部工具：

- `pdftotext`：抽取 PDF 正文。
- `pdffigures2`：抽取论文图表和 caption。

先验证工具是否可用：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify-windows.ps1
```

如果缺少工具，运行 bootstrap：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-windows.ps1
```

脚本会：

1. 准备 `pdftotext`。
2. 准备 `pdffigures2-assembly.jar`。
3. 如果本机没有 Java，下载 portable JRE。
4. 在 `.tools\bin` 下生成本地 wrapper。
5. 打印需要加入当前 PowerShell 会话的 PATH。

按脚本输出执行类似命令：

```powershell
$env:Path = "C:\path\to\paper-note-drafter\.tools\bin;" + $env:Path
```

然后再次验证：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify-windows.ps1
```

## Use

在 Codex 中调用 skill，并提供 PDF 路径：

```text
[$paper-note-drafter] 请阅读这篇 PDF，按 schema 生成中文论文笔记。
```

核心流程：

1. 用 `pdftotext` 抽取正文到 `Inbox/xxx/xxx.txt`。
2. 阅读正文，识别论文主线、机制和图表引用。
3. 用 `pdffigures2 --dpi 600` 临时抽取图表到 `Inbox/xxx/pdffigures2/`。
4. 用 `xxx.txt` 和 `pdffigures2/data-xxx.json` 对照检查图表是否提取完整。
5. 只把正文引用的关键图表复制到 `Inbox/xxx/Figure/xxx-N.ext`，缺失图表用 `FIX: 手工嵌入 Figure/Table N` 标记。
6. 按 `references/paper-note-schema.md` 和 `references/paper-note-template.md` 生成中文 Markdown。
7. 删除临时 `Inbox/xxx/pdffigures2/`，最终不保留 raw crops、metadata 或 stats。

输出约定：

- 笔记路径：`03-论文阅读/Inbox/xxx/xxx.md`
- PDF 路径：`03-论文阅读/Inbox/xxx/xxx.pdf`
- 文本路径：`03-论文阅读/Inbox/xxx/xxx.txt`
- 图表路径：`03-论文阅读/Inbox/xxx/Figure/xxx-N.ext`

## Release Asset

Windows bootstrap 会从最新 GitHub Release 查找：

```text
pdffigures2-assembly.jar
```

如果脚本无法从 `git remote origin` 推断仓库名，可以显式传入：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-windows.ps1 -Repo WimRhei/paper-note-drafter
```

也可以指定 jar URL：

```powershell
$env:PAPER_NOTE_DRAFTER_PDFFIGURES2_JAR_URL = "https://github.com/WimRhei/paper-note-drafter/releases/latest/download/pdffigures2-assembly.jar"
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-windows.ps1
```

## Third-party Components

本仓库的 skill 文件、脚本和文档使用 MIT License。详见 [`LICENSE`](LICENSE)。

外部工具说明见 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)，主要包括：

- PDFFigures 2.0
- Poppler / poppler-windows
- Eclipse Temurin

## Maintainer Notes

构建 `pdffigures2-assembly.jar`：

```text
Build pdffigures2 release asset
```

发布新版本时：

1. 运行 workflow。
2. 下载 artifact `pdffigures2-assembly.jar`。
3. 创建新的 GitHub Release。
4. 把 jar 作为 release asset 上传。

本地构建：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-pdffigures2-release.ps1
```
