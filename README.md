# Paper Note Drafter

面向 Codex 的论文笔记 skill：从 PDF 中抽取正文和图表，辅助生成结构化中文论文笔记，适合 Obsidian 论文阅读工作流。

这个仓库重点照顾 Windows 用户。`pdftotext` 和 `pdffigures2` 不要求用户手工折腾安装路径，仓库提供了 PowerShell bootstrap 脚本：

- `pdftotext`: 通过 Poppler Windows 预编译包提供。
- `pdffigures2`: 通过本仓库 GitHub Release 中的 `pdffigures2-assembly.jar` 提供。
- Java: 如果系统没有 Java，bootstrap 会下载 portable JRE 到 `.tools\java`。
- 本地 wrapper: 安装到 `.tools\bin`，不污染系统目录。

## Install

推荐直接 clone 到 Codex skills 目录：

```powershell
git clone https://github.com/WimRhei/paper-note-drafter.git "$env:USERPROFILE\.codex\skills\paper-note-drafter"
cd "$env:USERPROFILE\.codex\skills\paper-note-drafter"
```

如果你把仓库放在别的位置，也可以手动复制整个 `paper-note-drafter` 文件夹到：

```text
%USERPROFILE%\.codex\skills\paper-note-drafter
```

## Windows Setup

先确认是否已经有可用工具：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify-windows.ps1
```

如果缺少 `pdftotext` 或 `pdffigures2`，运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-windows.ps1
```

脚本会：

1. 如果本机已有 `pdftotext`，直接生成 wrapper；否则下载 Poppler Windows release。
2. 如果本机找不到 `java`，下载 portable JRE 到 `.tools\java`。
3. 从本仓库最新 GitHub Release 下载 `pdffigures2-assembly.jar`。
4. 生成 `pdffigures2.cmd` wrapper。
5. 打印当前 PowerShell 会话需要加入的 PATH。

按脚本输出执行类似下面的命令：

```powershell
$env:Path = "C:\path\to\paper-note-drafter\.tools\bin;" + $env:Path
```

然后再次验证：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify-windows.ps1
```

## Java

`pdffigures2` 需要 Java，但用户通常不需要手动安装系统 Java。`bootstrap-windows.ps1` 会优先使用系统已有 Java；如果没有，就下载 portable JRE 到 `.tools\java`，并让 `pdffigures2.cmd` 直接调用这个本地 Java。

因此首次 bootstrap 可能需要联网下载三类文件：

- Poppler Windows release
- portable JRE
- `pdffigures2-assembly.jar`

如果网络环境不能访问这些下载源，可以预先下载文件，并通过环境变量指定：

```powershell
$env:PAPER_NOTE_DRAFTER_POPPLER_ZIP_URL = "https://example.com/poppler-windows.zip"
$env:PAPER_NOTE_DRAFTER_PDFFIGURES2_JAR_URL = "https://example.com/pdffigures2-assembly.jar"
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-windows.ps1
```

## Use

在 Codex 中让它使用 `$paper-note-drafter`，并给出 PDF 文件路径，例如：

```text
[$paper-note-drafter] 请阅读这篇 PDF，按 schema 生成中文论文笔记。
```

skill 的核心流程是：

1. 用 `pdftotext` 抽取正文。
2. 阅读正文，识别论文主线、章节、图表引用。
3. 用 `pdffigures2 --dpi 600` 抽取图表。
4. 根据 `references/paper-note-schema.md` 生成中文 Markdown 笔记。
5. 只嵌入关键图表，并把缺失图表标成 `FIX: 手工嵌入 Figure/Table N`。

输出文件命名遵循 schema：

- Markdown 文件名使用论文提出的核心概念、系统、方法或 artifact 名称，如 `xxx.md`。
- 图表文件用同一前缀顺序命名，如 `xxx-1`、`xxx-2`、`xxx-3`。

## Release Asset

当前 release 附带：

```text
pdffigures2-assembly.jar
```

Windows bootstrap 脚本会自动从最新 release 查找 `pdffigures2*assembly*.jar`。如果 skill 不是通过 git clone 安装，脚本无法从 `git remote origin` 推断仓库名，可以显式传入：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-windows.ps1 -Repo WimRhei/paper-note-drafter
```

也可以设置直接下载 URL：

```powershell
$env:PAPER_NOTE_DRAFTER_PDFFIGURES2_JAR_URL = "https://github.com/WimRhei/paper-note-drafter/releases/latest/download/pdffigures2-assembly.jar"
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-windows.ps1
```

## Third-party Components

The repository's own skill files, scripts, and documentation are licensed under the MIT License. See [`LICENSE`](LICENSE).

This project is a Codex skill wrapper and workflow. It relies on third-party open-source tools:

| Component | How it is used | Source | License notes |
| --- | --- | --- | --- |
| PDFFigures 2.0 | Extracts figures, tables and captions from scholarly PDFs. The release asset `pdffigures2-assembly.jar` is built from this project. | <https://github.com/allenai/pdffigures2> | Apache-2.0. See the upstream repository and `LICENSE.txt`. |
| poppler-windows | Provides Windows Poppler binaries, including `pdftotext.exe`, when no local `pdftotext` is found. | <https://github.com/oschwartz10612/poppler-windows> | The packaging repository is MIT licensed. The package bundles Poppler binaries and dependencies; keep upstream license files from the downloaded archive. |
| Eclipse Temurin | Provides a portable JRE when no local Java runtime is found. | <https://projects.eclipse.org/projects/adoptium.temurin> | Temurin is distributed under multiple open-source licenses. Specific license and NOTICE files are provided with the downloaded runtime binaries. |

This repository is not affiliated with Allen Institute for AI, Poppler, conda-forge, oschwartz10612/poppler-windows, Eclipse Foundation, or Adoptium. Users are responsible for complying with the licenses of third-party components they download, build, redistribute, or use.

See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for more detailed third-party notes and included license references.

## Maintainer Notes

手动触发 GitHub Actions workflow：

```text
Build pdffigures2 release asset
```

它会从 `allenai/pdffigures2` 构建 jar，并上传 artifact。发布新版本时：

1. 运行 workflow。
2. 下载 artifact `pdffigures2-assembly.jar`。
3. 创建新的 GitHub Release。
4. 把 jar 作为 release asset 上传。

本地也可以运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-pdffigures2-release.ps1
```

需要本机已有 `git`、`sbt` 和 `java`。
