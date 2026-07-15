# Paper Note Workflow

English | [中文](../README.md)

An opinionated paper-reading workflow for Codex and Obsidian.

This repository contains:

- `paper-downloader`: a Codex skill that prepares PDFs in the Inbox. It can automate arXiv/IEEE when appropriate; ACM is manual-download handoff only.
- `paper-note-drafter`: a Codex skill that turns a paper PDF into a reviewable Chinese Markdown note, with isolated schemas and templates for algorithm and architecture papers.
- `paper-note-reader`: a Codex skill for follow-up reading, note revision, source verification, and final diff review.
- `paper-archiver`: an Obsidian plugin that archives a reviewed Inbox paper folder into a topic folder.

The workflow is built around a shared file contract. The draft and reading stages keep extra files for verification. The archive stage removes those review artifacts and keeps only the final knowledge-base files.

## Workflow

### 0. Download / Prepare PDF

Use `paper-downloader` to prepare the PDF at the stable Inbox entry point:

```text
论文阅读/Inbox/xxx/
  xxx.pdf
  route.txt
```

Download sources (`source route`):

- arXiv: download the PDF directly.
- IEEE: use browser institutional access when needed.
- ACM: do not automate by default. ACM Digital Library has unstable Cloudflare and reader/download behavior, so the user downloads the PDF manually; the skill then locates, moves, and verifies the local PDF.

When invoking `paper-downloader`, the user also supplies the `Algorithm` or `Architecture` reading route. The downloader never infers it from the paper; after verifying the PDF, it writes the normalized value to `route.txt`. It creates or fills only `xxx.pdf` and `route.txt`, not notes, extracted text, or figures.

### 1. Draft

Use `paper-note-drafter` on a PDF. It extracts text, extracts candidate figures/tables, writes a first draft, and prepares an Obsidian Inbox folder.

There are two reading routes. The drafter must not infer, verify, or override either from the paper:

- `Algorithm`: the main contribution is a model, method, training objective, inference workflow, task formulation, data construction method, or decoding strategy. The note records source-supported facts that affect inference efficiency and does not infer unreported conclusions.
- `Architecture`: the main contribution is architecture, hardware, systems, compilation, scheduling, deployment, accelerator design, memory/interconnect, quantization implementation, or hardware-software co-design. Co-design papers use this route and retain the existing architecture reading method.

If the downloader already produced a valid `route.txt`, the drafter inherits it. For a manually downloaded bare PDF without that file, the user supplies the reading route when invoking the drafter, which then writes `route.txt`. If the current instruction conflicts with the file, or both are missing, the drafter stops and asks. It then loads only the matching schema/template pair:

```text
Algorithm
  -> references/algorithm-paper-schema.md
  -> references/algorithm-paper-template.md

Architecture
  -> references/architecture-paper-schema.md
  -> references/architecture-paper-template.md
```

Expected draft output:

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

File roles:

- `xxx.md`: the working note. This is the note the user edits and the archiver eventually keeps.
- `xxx-naive.md`: the first generated draft. Keep it through review so `paper-note-reader` can compare it with the edited note.
- `xxx.txt`: text extracted from the PDF. Keep it through review so the reader can verify claims against the source.
- `route.txt`: the user-selected reading route. It contains only `Algorithm` or `Architecture`, and is the reader's only reading-route source.
- `xxx.pdf`: the original paper PDF.
- `Figure/`: only the figures or tables actually referenced by `xxx.md`.

Temporary extraction outputs such as `pdffigures2/`, raw `img-*` crops, `data-*.json`, and `stats.json` may exist while drafting, but should be deleted before handoff.

### 2. Read And Revise

Use `paper-note-reader` after the draft exists.

It works inside `Inbox/xxx/`:

- reads and edits `xxx.md`;
- uses `xxx.txt` or `xxx.pdf` when verification is needed;
- preserves `xxx-naive.md` as the baseline;
- can compare `xxx-naive.md` and `xxx.md` during final diff review.
- reads the reading route from `route.txt`; if the file is missing or invalid, it stops and asks instead of inferring from the paper.

At the end of this stage, `xxx.md` is the final reviewed note.

The reader strictly inherits the reading route recorded in `route.txt` and never reclassifies the paper. Explanations of the paper must be supported by its text, figures, or experiments. During discussion, the model and user may develop personal interpretations, architecture inspiration, optimization opportunities, applicability boundaries, and cross-paper analogies. They are written normally into `xxx.md` only when the user asks, without extra labeling. Final diff review updates only the schema/template for the recorded reading route.

### 3. Archive

Use the Obsidian `paper-archiver` plugin.

It scans paper folders of this form:

```text
Inbox/xxx/xxx.md
```

After selecting a target topic, the archive result is:

```text
<topic>/
  xxx.md
  PDF/
    xxx.pdf
  Figure/
    xxx-1.png
    xxx-2.png
```

Archive cleanup:

- removes `Inbox/xxx/xxx-naive.md`;
- removes `Inbox/xxx/xxx.txt`;
- removes `Inbox/xxx/route.txt`;
- removes unreferenced temporary files;
- removes the emptied `Inbox/xxx/` folder when possible.

Files directly under `Inbox/` are not archived. The plugin only processes subfolders containing a same-name Markdown file.

## File Contract

The stable interface between all stages is the Inbox paper folder:

```text
Inbox/xxx/
  xxx.md            # final working note
  xxx-naive.md      # review-only first draft baseline
  xxx.pdf           # original paper
  xxx.txt           # review-only extracted text
  route.txt         # review-only user-selected reading route
  Figure/           # figures referenced by xxx.md
```

Rules:

- If a PDF already follows `Inbox/xxx/xxx.pdf`, its folder and prefix are authoritative; the drafter names only bare PDFs.
- The folder name, Markdown name, PDF name, and extracted-text name should share the same `xxx` prefix.
- `route.txt` contains only `Algorithm` or `Architecture`.
- Markdown should reference figures as `Figure/xxx-N.ext`.
- `xxx-naive.md`, `xxx.txt`, and `route.txt` are useful before archive, but are intentionally not preserved after archive.
- `pdffigures2/`, raw crops, and extraction metadata are temporary implementation details.

See [docs/workflow.md](docs/workflow.md) and [docs/inbox-contract.md](docs/inbox-contract.md) for the longer version.

## Install

Clone this repository anywhere you keep workflow tools:

```bash
git clone https://github.com/WimRhei/paper-note-workflow.git
cd paper-note-workflow
```

Install the Codex skills by copying or symlinking the skill folders into your Codex skills directory:

```bash
mkdir -p "$HOME/.codex/skills"
ln -s "$PWD/skills/paper-note-drafter" "$HOME/.codex/skills/paper-note-drafter"
ln -s "$PWD/skills/paper-note-reader" "$HOME/.codex/skills/paper-note-reader"
ln -s "$PWD/skills/paper-downloader" "$HOME/.codex/skills/paper-downloader"
```

### Repository And Local Copies

- Repository skills are the portable source of truth and must not contain personal absolute paths or machine-specific tool locations.
- For copied installations rather than symlinks, local copies may preserve only two machine-specific overrides: the default absolute Inbox path and local tool fallback/setup instructions.
- Workflow, source-route behavior, reading-route behavior, schemas/templates, and file contracts should sync from the repository while preserving those local overrides.
- Never copy local absolute paths or tool packaging back into the repository version.

To use the IEEE automation route in `paper-downloader`, also prepare the browser state:

- Install Google Chrome.
- Install and enable the Codex Chrome browser-control extension/plugin.
- Prefer a dedicated Chrome profile named `Papers-Codex`.
- Complete institutional access and password-manager setup in that profile.

ACM is not an automated download route. Download ACM PDFs manually, then let `paper-downloader` archive and verify the local PDF.

Install the Obsidian plugin by copying or symlinking `obsidian-plugins/paper-archiver` into your vault:

```text
<your-vault>/.obsidian/plugins/paper-archiver/
```

Then enable `paper-archiver` in Obsidian's community plugins settings.

## External Tools

This repository does not bundle or download heavyweight external tools.

Install these tools yourself and make sure they are available on `PATH`:

- `pdftotext`: used by `paper-note-drafter` to extract paper text.
- `pdffigures2`: used by `paper-note-drafter` to extract figure/table candidates and captions.
- Java runtime: required by most `pdffigures2` distributions.

Example commands used by the workflow:

```bash
pdftotext Inbox/xxx/xxx.pdf Inbox/xxx/xxx.txt
pdffigures2 --dpi 600 Inbox/xxx/xxx.pdf Inbox/xxx/pdffigures2
```

The exact installation method depends on your operating system. See the [external tools guide](external-tools.en.md), follow the upstream project instructions, and comply with their licenses.

Note: `pdffigures2` is the command-line interface expected by this workflow. The upstream project may not install a command with that exact name. If needed, use [examples/pdffigures2-wrapper.sh](../examples/pdffigures2-wrapper.sh) as an adapter template.

## Third-party Licensing

This repository's own code, skills, and documentation are licensed under MIT. External tools keep their own licenses:

- PDFFigures 2.0: Apache License 2.0, see <https://github.com/allenai/pdffigures2>.
- Poppler / `pdftotext`: Poppler project license terms apply, see <https://poppler.freedesktop.org/>.
- Java runtimes: the selected runtime distribution's license terms apply.

This repository does not redistribute those binaries.

## Repository Layout

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
  external-tools.en.md
  README.en.md
```

## Contributors

See [CONTRIBUTORS.md](../CONTRIBUTORS.md).

## Status

This is a personal workflow extracted from a real Obsidian/Codex setup. Expect the file contract to stay stable, while the prompts and plugin UI may evolve.
