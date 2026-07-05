# External Tools

[中文](external-tools.md)

This repository does not bundle, download, build, or redistribute heavyweight external tools. Users should install the required commands themselves and make sure they are available on `PATH`.

## Required Commands

```text
pdftotext
pdffigures2
java
```

Verify them with:

```bash
pdftotext -v
java -version
pdffigures2 --help
```

In this workflow, `pdffigures2` is the expected adapter command name. The upstream project exposes Scala/sbt CLIs and may not install a command with this exact name. To let `paper-note-drafter` run figure extraction automatically, provide a command on `PATH` that satisfies this interface:

```bash
pdffigures2 --dpi 600 Inbox/xxx/xxx.pdf Inbox/xxx/pdffigures2
```

This repository includes a lightweight wrapper template: [examples/pdffigures2-wrapper.sh](../examples/pdffigures2-wrapper.sh). It does not include a jar and does not download dependencies. Build or obtain the `pdffigures2` jar yourself, then set `PDFFIGURES2_JAR`.

## pdftotext

`pdftotext` comes from Poppler. The drafter uses it to write `Inbox/xxx/xxx.txt`.

Upstream:

- Poppler: <https://poppler.freedesktop.org/>
- conda-forge Poppler: <https://anaconda.org/conda-forge/poppler>

Common installation routes:

```bash
# macOS, Homebrew
brew install poppler

# Debian / Ubuntu
sudo apt install poppler-utils

# Conda / Windows / cross-platform
conda install conda-forge::poppler
```

Verify:

```bash
pdftotext sample.pdf sample.txt
```

## pdffigures2

`pdffigures2` extracts candidate figures, tables, captions, and metadata from scholarly PDFs.

Upstream:

- PDFFigures 2.0: <https://github.com/allenai/pdffigures2>
- Project page: <https://pdffigures2.allenai.org/>

Notes:

- The upstream project is a Scala/sbt project.
- The upstream README describes cloning the source and running it with sbt.
- This repository does not provide a jar, release asset, or redistributed binary.
- If you use a third-party prebuilt package or build your own jar, verify the source yourself and comply with the upstream Apache License 2.0 and dependency licenses.

Recommended route:

```bash
git clone https://github.com/allenai/pdffigures2.git
cd pdffigures2
```

Then follow the upstream README to run or build it with sbt. For this workflow, expose a command or wrapper shaped like:

```bash
pdffigures2 --dpi 600 Inbox/xxx/xxx.pdf Inbox/xxx/pdffigures2
```

The wrapper can translate those arguments to your local `FigureExtractorBatchCli` or jar command. As long as it creates a `pdffigures2/` directory with metadata JSON and raw crop images, `paper-note-drafter` can continue from the file contract.

If you already have a standalone jar, create the adapter command from the template:

```bash
cp examples/pdffigures2-wrapper.sh ~/.local/bin/pdffigures2
chmod +x ~/.local/bin/pdffigures2
export PDFFIGURES2_JAR=/absolute/path/to/pdffigures2-assembly.jar
export PATH="$HOME/.local/bin:$PATH"
```

Then verify:

```bash
pdffigures2 --dpi 600 Inbox/xxx/xxx.pdf Inbox/xxx/pdffigures2
```

The upstream README documents `FigureExtractorBatchCli` for batch extraction:

```bash
sbt "runMain org.allenai.pdffigures2.FigureExtractorBatchCli /path/to/pdf_directory/ -s stat_file.json -m /figure/image/output/prefix -d /figure/data/output/prefix"
```

You can also run upstream `sbt assembly` to build a standalone jar, then invoke the same BatchCli-style arguments. Whether you use sbt or a jar, this workflow only requires the final output directory to satisfy:

```text
Inbox/xxx/pdffigures2/
  stats.json
  data-*.json
  img-*
```

If you do not want to write a wrapper, you can manually run the upstream BatchCli and place its outputs in `Inbox/xxx/pdffigures2/`, then let `paper-note-drafter` continue from those files.

## Java

Most `pdffigures2` setups require a Java runtime or JDK.

Common sources:

- OpenJDK: <https://openjdk.org/>
- Eclipse Temurin: <https://adoptium.net/>

Verify:

```bash
java -version
```

## License Boundary

This repository's own code and documentation use the MIT License.

External tools keep their own licenses:

- PDFFigures 2.0: Apache License 2.0.
- Poppler / `pdftotext`: Poppler project license terms apply.
- Java runtime: the selected runtime distribution's license terms apply.

This repository only invokes those commands. It does not bundle or redistribute their binaries.
