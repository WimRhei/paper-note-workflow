# Paper Note Workflow

中文 | [English](docs/README.en.md)

一套面向 Codex 和 Obsidian 的论文阅读工作流。

这个仓库包含：

- `paper-note-drafter`：Codex skill，从论文 PDF 草拟中文 Markdown 笔记。
- `paper-note-reader`：Codex skill，用于后续阅读、修订、查证原文和最终 diff review。
- `paper-archiver`：Obsidian 插件，把 review 完成的 Inbox 论文文件夹归档到主题目录。

这套 workflow 的核心是一个稳定的文件契约。draft 和 reading 阶段会保留额外文件用于查证和对比；archive 阶段会移除这些 review artifact，只保留最终知识库需要的文件。

## 工作流

### 1. 草拟

对论文 PDF 使用 `paper-note-drafter`。它会抽取正文、抽取候选图表、写第一版笔记，并准备 Obsidian Inbox 文件夹。

期望输出：

```text
Inbox/xxx/
  xxx.md
  xxx-naive.md
  xxx.pdf
  xxx.txt
  Figure/
    xxx-1.png
    xxx-2.png
```

文件角色：

- `xxx.md`：工作稿。用户后续直接修改它，归档器最终也只保留这一份 Markdown。
- `xxx-naive.md`：第一版 AI 草稿 baseline。review 阶段保留它，方便 `paper-note-reader` 和最终 diff review 对比。
- `xxx.txt`：从 PDF 抽取出的正文文本。review 阶段保留它，方便查证原文。
- `xxx.pdf`：原始论文 PDF。
- `Figure/`：只放 `xxx.md` 实际引用的图表。

`pdffigures2/`、raw `img-*`、`data-*.json`、`stats.json` 等临时抽取输出可以在草拟过程中存在，但 handoff 前应删除。

### 2. 阅读与修订

草稿生成后使用 `paper-note-reader`。

它在 `Inbox/xxx/` 内工作：

- 读取并直接修改 `xxx.md`；
- 需要查证时查看 `xxx.txt` 或 `xxx.pdf`；
- 保留 `xxx-naive.md` 作为 baseline；
- 用户要求最终 diff review 时，对比 `xxx-naive.md` 和 `xxx.md`。

这个阶段结束时，`xxx.md` 就是最终 review 后的笔记。

### 3. 归档

在 Obsidian 中使用 `paper-archiver` 插件。

插件扫描这种论文文件夹：

```text
Inbox/xxx/xxx.md
```

选择目标 topic 后，归档结果是：

```text
<topic>/
  xxx.md
  PDF/
    xxx.pdf
  Figure/
    xxx-1.png
    xxx-2.png
```

归档时会清理：

- `Inbox/xxx/xxx-naive.md`
- `Inbox/xxx/xxx.txt`
- 未引用的临时文件
- 能清理掉的空 `Inbox/xxx/` 文件夹

直接放在 `Inbox/` 一级目录下的文件不会被归档。插件只处理“子文件夹名和 Markdown 文件名一致”的论文文件夹。

## 文件契约

三阶段之间的稳定接口是 Inbox 论文文件夹：

```text
Inbox/xxx/
  xxx.md            # 最终工作稿
  xxx-naive.md      # review-only 第一版 baseline
  xxx.pdf           # 原始论文
  xxx.txt           # review-only 抽取文本
  Figure/           # xxx.md 引用的图表
```

规则：

- 文件夹名、Markdown、PDF、txt 应使用相同的 `xxx` 前缀。
- Markdown 中的图表引用应写成 `Figure/xxx-N.ext`。
- `xxx-naive.md` 和 `xxx.txt` 在归档前有用，但归档后不保留。
- `pdffigures2/`、raw crops 和抽取 metadata 都是临时实现细节。

更完整的说明见 [docs/workflow.md](docs/workflow.md) 和 [docs/inbox-contract.md](docs/inbox-contract.md)。

## 安装

把仓库 clone 到你放 workflow 工具的地方：

```bash
git clone https://github.com/WimRhei/paper-note-workflow.git
cd paper-note-workflow
```

把 Codex skills 复制或软链接到 Codex skills 目录：

```bash
mkdir -p "$HOME/.codex/skills"
ln -s "$PWD/skills/paper-note-drafter" "$HOME/.codex/skills/paper-note-drafter"
ln -s "$PWD/skills/paper-note-reader" "$HOME/.codex/skills/paper-note-reader"
```

把 Obsidian 插件复制或软链接到你的 vault：

```text
<your-vault>/.obsidian/plugins/paper-archiver/
```

然后在 Obsidian 的 community plugins 设置里启用 `paper-archiver`。

## 外部工具

这个仓库不打包、不下载重负载外部工具。

请自行安装这些工具，并确保它们在 `PATH` 上可用：

- `pdftotext`：`paper-note-drafter` 用它抽取论文正文。
- `pdffigures2`：`paper-note-drafter` 用它抽取候选图表和 caption。
- Java runtime：大多数 `pdffigures2` 分发方式需要 Java。

workflow 会用到的命令示例：

```bash
pdftotext Inbox/xxx/xxx.pdf Inbox/xxx/xxx.txt
pdffigures2 --dpi 600 Inbox/xxx/xxx.pdf Inbox/xxx/pdffigures2
```

具体安装方式取决于你的操作系统。请参考上游项目说明，并遵守上游许可证。

## 第三方许可

本仓库自己的代码、skills 和文档使用 MIT License。外部工具保留各自许可证：

- PDFFigures 2.0：Apache License 2.0，见 <https://github.com/allenai/pdffigures2>。
- Poppler / `pdftotext`：遵守 Poppler 项目许可，见 <https://poppler.freedesktop.org/>。
- Java runtimes：遵守你选择的 Java runtime 分发版本的许可证。

本仓库不重新分发这些二进制。

## 仓库结构

```text
skills/
  paper-note-drafter/
  paper-note-reader/
obsidian-plugins/
  paper-archiver/
docs/
  workflow.md
  inbox-contract.md
  README.en.md
```

## 状态

这是从真实 Obsidian/Codex 使用流里抽出来的个人 workflow。文件契约会尽量保持稳定，prompt 和插件 UI 可能继续演进。
