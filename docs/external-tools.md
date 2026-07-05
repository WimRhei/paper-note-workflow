# 外部工具安装指南

[English](external-tools.en.md)

这个仓库不打包、不下载、不重新分发重负载外部工具。使用者需要自己安装这些命令，并确保它们在 `PATH` 上可用。

## 需要的命令

```text
pdftotext
pdffigures2
java
```

验证：

```bash
pdftotext -v
java -version
pdffigures2 --help
```

这里的 `pdffigures2` 是本 workflow 期望的适配器命令名。上游项目原生提供的是 Scala/sbt CLI，不一定会直接安装一个同名命令。为了让 `paper-note-drafter` 可以自动执行抽图，最终需要在 `PATH` 上提供一个命令，满足下面的接口：

```bash
pdffigures2 --dpi 600 Inbox/xxx/xxx.pdf Inbox/xxx/pdffigures2
```

仓库里提供了一个轻量 wrapper 模板：[examples/pdffigures2-wrapper.sh](../examples/pdffigures2-wrapper.sh)。它不包含 jar，也不下载任何依赖；你需要自己构建或获取 `pdffigures2` jar，然后设置 `PDFFIGURES2_JAR`。

## pdftotext

`pdftotext` 来自 Poppler。它负责把 PDF 正文抽成 `Inbox/xxx/xxx.txt`。

上游：

- Poppler: <https://poppler.freedesktop.org/>
- conda-forge Poppler: <https://anaconda.org/conda-forge/poppler>

常见安装方式：

```bash
# macOS, Homebrew
brew install poppler

# Debian / Ubuntu
sudo apt install poppler-utils

# Conda / Windows / cross-platform
conda install conda-forge::poppler
```

验证：

```bash
pdftotext sample.pdf sample.txt
```

## pdffigures2

`pdffigures2` 负责从论文 PDF 中抽取候选图、表、caption 和 metadata。

上游：

- PDFFigures 2.0: <https://github.com/allenai/pdffigures2>
- 项目页: <https://pdffigures2.allenai.org/>

注意：

- 上游项目是 Scala/sbt 项目。
- 上游 README 的安装方式是 clone 源码后用 sbt 运行。
- 本仓库不提供 jar、不提供 release asset，也不替上游重新分发二进制。
- 如果你使用第三方预构建包或自己构建 jar，需要自己确认来源可信，并遵守上游 Apache License 2.0 及依赖许可证。

推荐做法：

```bash
git clone https://github.com/allenai/pdffigures2.git
cd pdffigures2
```

然后按上游 README 使用 sbt 运行或构建。为了配合本 workflow，最终需要提供一个可执行命令或 wrapper，形如：

```bash
pdffigures2 --dpi 600 Inbox/xxx/xxx.pdf Inbox/xxx/pdffigures2
```

wrapper 可以把上述参数转换成你本地 `FigureExtractorBatchCli` 或 jar 的实际调用方式。只要最终生成 `pdffigures2/` 目录、metadata JSON 和 raw crop 图片，`paper-note-drafter` 就能按文件契约继续工作。

如果你已经有 standalone jar，可以按模板创建命令：

```bash
cp examples/pdffigures2-wrapper.sh ~/.local/bin/pdffigures2
chmod +x ~/.local/bin/pdffigures2
export PDFFIGURES2_JAR=/absolute/path/to/pdffigures2-assembly.jar
export PATH="$HOME/.local/bin:$PATH"
```

然后验证：

```bash
pdffigures2 --dpi 600 Inbox/xxx/xxx.pdf Inbox/xxx/pdffigures2
```

上游 README 给出的批量抽取入口是 `FigureExtractorBatchCli`，形式是：

```bash
sbt "runMain org.allenai.pdffigures2.FigureExtractorBatchCli /path/to/pdf_directory/ -s stat_file.json -m /figure/image/output/prefix -d /figure/data/output/prefix"
```

也可以用上游的 `sbt assembly` 构建 standalone jar，再按同样的 BatchCli 参数方式运行。无论使用 sbt 还是 jar，本 workflow 只关心最终输出目录是否满足：

```text
Inbox/xxx/pdffigures2/
  stats.json
  data-*.json
  img-*
```

如果暂时不写 wrapper，也可以手动运行上游 BatchCli，把输出放到 `Inbox/xxx/pdffigures2/`，再让 `paper-note-drafter` 继续读取这些文件。

## Java

多数 `pdffigures2` 安装方式需要 Java runtime 或 JDK。

常见来源：

- OpenJDK: <https://openjdk.org/>
- Eclipse Temurin: <https://adoptium.net/>

验证：

```bash
java -version
```

## 许可证边界

本仓库自己的代码和文档使用 MIT License。

外部工具保留各自许可证：

- PDFFigures 2.0: Apache License 2.0。
- Poppler / `pdftotext`: 遵守 Poppler 项目许可。
- Java runtime: 遵守你安装的 runtime 分发版本的许可。

本仓库只调用这些外部命令，不把它们打包进仓库，也不重新分发它们的二进制。
