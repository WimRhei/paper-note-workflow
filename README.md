# Paper Note Workflow

中文 | [English](docs/README.en.md)

一套面向 Codex 和 Obsidian 的论文阅读工作流。

这个仓库包含：

- `paper-downloader`：Codex skill，把论文 PDF 准备到 Inbox；arXiv/IEEE 可自动化，ACM 只做人工下载后的归档验证。
- `paper-note-drafter`：Codex skill，从论文 PDF 草拟中文 Markdown 笔记；算法论文和体系结构论文使用相互独立的阅读 schema 与笔记 template。
- `paper-note-reader`：Codex skill，用于后续阅读、修订、查证原文和最终 diff review。
- `paper-archiver`：Obsidian 插件，把 review 完成的 Inbox 论文文件夹归档到主题目录。

这套 workflow 的核心是一个稳定的文件契约。draft 和 reading 阶段会保留额外文件用于查证和对比；archive 阶段会移除这些 review artifact，只保留最终知识库需要的文件。

## 工作流

### 0. 下载 / 准备 PDF

对论文来源使用 `paper-downloader`，把 PDF 准备到稳定入口：

```text
论文阅读/Inbox/xxx/
  xxx.pdf
  route.txt
```

下载来源（source route）：

- arXiv：直接下载 PDF。
- IEEE：使用浏览器中的机构认证状态下载。
- ACM：不默认自动化。ACM Digital Library 的 Cloudflare 和 reader/download UI 不稳定，默认由用户手动下载；skill 只负责找到本地 PDF、移动到 Inbox 并验证。

调用 `paper-downloader` 时，用户同时指定阅读路线（reading route）：`Algorithm` 或 `Architecture`。Downloader 不根据论文内容判断，下载并验证 PDF 后把规范化结果写入 `route.txt`。它只创建或填充 `xxx.pdf` 和 `route.txt`，不创建笔记、正文文本或图表文件。

### 1. 草拟

对论文 PDF 使用 `paper-note-drafter`。它会抽取正文、抽取候选图表、写第一版笔记，并准备 Obsidian Inbox 文件夹。

阅读路线（reading route）只有下面两种。Drafter 不读取论文来判断或纠正路线：

- `Algorithm`：主要贡献是模型、方法、训练目标、推理流程、任务 formulation、数据构造或解码策略。按体系结构研究者的算法读法，忠实提取原文中影响推理效率的信息；原文未报告的信息不自行推断。
- `Architecture`：主要贡献是体系结构、硬件、系统、编译、调度、部署、加速器、存储、互联、量化实现或软硬件协同设计。协同设计归入这一类，并继续使用原有体系结构阅读方式。

如果 Downloader 已经生成合法 `route.txt`，Drafter 直接继承。对于没有 `route.txt` 的手工下载裸 PDF，用户在调用 Drafter 时明确指定 reading route，由 Drafter 写入文件。当前指令与已有文件冲突、或两者都缺失时，Drafter 停止询问，不自行选择。随后只加载对应的一对文件，不把另一类论文的 schema/template 带入上下文：

```text
Algorithm
  -> references/algorithm-paper-schema.md
  -> references/algorithm-paper-template.md

Architecture
  -> references/architecture-paper-schema.md
  -> references/architecture-paper-template.md
```

期望输出：

```text
Inbox/xxx/
  xxx.md
  xxx-naive.md
  xxx.pdf
  xxx.txt
  route.txt
  Figure/
    xxx-1.png
    xxx-2.png
```

文件角色：

- `xxx.md`：工作稿。用户后续直接修改它，归档器最终也只保留这一份 Markdown。
- `xxx-naive.md`：第一版 AI 草稿 baseline。review 阶段保留它，方便 `paper-note-reader` 和最终 diff review 对比。
- `xxx.txt`：从 PDF 抽取出的正文文本。review 阶段保留它，方便查证原文。
- `route.txt`：用户指定的 reading route，只能包含 `Algorithm` 或 `Architecture`。Reader 只从这里读取 reading route。
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
- 从 `route.txt` 读取 reading route；文件缺失或内容非法时停止并询问，不根据论文内容猜测。

这个阶段结束时，`xxx.md` 就是最终 review 后的笔记。

Reader 严格继承 `route.txt` 中的 reading route，不重新分类。解释论文原文时必须有原文、图表或实验支持；在与用户讨论时，模型可以共同推演个人理解、体系结构启发、优化机会、适用边界和跨论文类比。只有用户要求保存时才正常写入 `xxx.md`，无需额外标记。最终 diff review 仍只修改该 reading route 对应的 schema/template。

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
- `Inbox/xxx/route.txt`
- 未引用的临时文件
- 能清理掉的空 `Inbox/xxx/` 文件夹

直接放在 `Inbox/` 一级目录下的文件不会被归档。插件只处理“子文件夹名和 Markdown 文件名一致”的论文文件夹。

## 文件契约

四阶段之间的稳定接口是 Inbox 论文文件夹：

```text
Inbox/xxx/
  xxx.md            # 最终工作稿
  xxx-naive.md      # review-only 第一版 baseline
  xxx.pdf           # 原始论文
  xxx.txt           # review-only 抽取文本
  route.txt         # review-only 用户指定 reading route
  Figure/           # xxx.md 引用的图表
```

规则：

- 已经符合 `Inbox/xxx/xxx.pdf` 的 PDF 以现有目录和前缀为准；只有裸 PDF 由 drafter 命名。
- 文件夹名、Markdown、PDF、正文 txt 应使用相同的 `xxx` 前缀。
- `route.txt` 只包含 `Algorithm` 或 `Architecture`。
- Markdown 中的图表引用应写成 `Figure/xxx-N.ext`。
- `xxx-naive.md`、`xxx.txt` 和 `route.txt` 在归档前有用，但归档后不保留。
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
ln -s "$PWD/skills/paper-downloader" "$HOME/.codex/skills/paper-downloader"
```

### 仓库版与本地副本

- 仓库中的 skill 是可移植事实源，不写个人绝对路径或本机专用工具位置。
- 如果使用复制安装而不是软链接，本地副本只允许保留两类机器相关覆盖：默认 Inbox 绝对路径，以及外部工具的本地 fallback/安装说明。
- Workflow、source route、reading route、schema/template 和文件契约应从仓库同步到本地；同步时不要覆盖上述本地覆盖。
- 不要把本地绝对路径或工具封装反向提交到仓库版。

如果要使用 `paper-downloader` 的 IEEE 自动下载路径，还需要准备浏览器状态：

- 安装 Google Chrome。
- 安装并启用 Codex Chrome 浏览器控制插件/扩展。
- 建议创建专用 Chrome profile：`Papers-Codex`。
- 在该 profile 中完成机构认证和密码管理器配置。

ACM 不走自动下载路径；用户手动下载后，再让 `paper-downloader` 归档和验证 PDF。

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

具体安装方式取决于你的操作系统。请参考 [外部工具安装指南](docs/external-tools.md)、上游项目说明，并遵守上游许可证。

注意：这里的 `pdffigures2` 是本 workflow 期望的命令行接口。上游项目不一定直接安装同名命令；如果需要，可以使用 [examples/pdffigures2-wrapper.sh](examples/pdffigures2-wrapper.sh) 作为 adapter 模板。

## 第三方许可

本仓库自己的代码、skills 和文档使用 MIT License。外部工具保留各自许可证：

- PDFFigures 2.0：Apache License 2.0，见 <https://github.com/allenai/pdffigures2>。
- Poppler / `pdftotext`：遵守 Poppler 项目许可，见 <https://poppler.freedesktop.org/>。
- Java runtimes：遵守你选择的 Java runtime 分发版本的许可证。

本仓库不重新分发这些二进制。

## 仓库结构

```text
CONTRIBUTORS.md
skills/
  paper-downloader/
  paper-note-drafter/
    SKILL.md
    references/
      algorithm-paper-schema.md
      algorithm-paper-template.md
      architecture-paper-schema.md
      architecture-paper-template.md
  paper-note-reader/
obsidian-plugins/
  paper-archiver/
docs/
  workflow.md
  inbox-contract.md
  external-tools.md
  README.en.md
```

## 贡献者

见 [CONTRIBUTORS.md](CONTRIBUTORS.md)。

## 状态

这是从真实 Obsidian/Codex 使用流里抽出来的个人 workflow。文件契约会尽量保持稳定，prompt 和插件 UI 可能继续演进。
