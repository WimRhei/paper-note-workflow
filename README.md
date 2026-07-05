# Paper Note Workflow

An opinionated paper-reading workflow for Codex and Obsidian.

This repository contains:

- `paper-note-drafter`: a Codex skill that turns a paper PDF into a reviewable Chinese Markdown note.
- `paper-note-reader`: a Codex skill for follow-up reading, note revision, source verification, and final diff review.
- `paper-archiver`: an Obsidian plugin that archives a reviewed Inbox paper folder into a topic folder.

The workflow is built around a shared file contract. The draft and reading stages keep extra files for verification. The archive stage removes those review artifacts and keeps only the final knowledge-base files.

## Workflow

### 1. Draft

Use `paper-note-drafter` on a PDF. It extracts text, extracts candidate figures/tables, writes a first draft, and prepares an Obsidian Inbox folder.

Expected draft output:

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

File roles:

- `xxx.md`: the working note. This is the note the user edits and the archiver eventually keeps.
- `xxx-naive.md`: the first generated draft. Keep it through review so `paper-note-reader` can compare it with the edited note.
- `xxx.txt`: text extracted from the PDF. Keep it through review so the reader can verify claims against the source.
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

At the end of this stage, `xxx.md` is the final reviewed note.

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
  Figure/           # figures referenced by xxx.md
```

Rules:

- The folder name, Markdown name, PDF name, and text name should share the same `xxx` prefix.
- Markdown should reference figures as `Figure/xxx-N.ext`.
- `xxx-naive.md` and `xxx.txt` are useful before archive, but are intentionally not preserved after archive.
- `pdffigures2/`, raw crops, and extraction metadata are temporary implementation details.

See [docs/workflow.md](docs/workflow.md) and [docs/inbox-contract.md](docs/inbox-contract.md) for the longer version.

## Install

Clone this repository anywhere you keep workflow tools:

```bash
git clone https://github.com/WimRhei/paper-note-workflow.git
```

Install the Codex skills by copying or symlinking the skill folders into your Codex skills directory:

```bash
mkdir -p "$HOME/.codex/skills"
ln -s "$PWD/skills/paper-note-drafter" "$HOME/.codex/skills/paper-note-drafter"
ln -s "$PWD/skills/paper-note-reader" "$HOME/.codex/skills/paper-note-reader"
```

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

The exact installation method depends on your operating system. Follow the upstream project instructions and comply with their licenses.

## Third-party Licensing

This repository's own code, skills, and documentation are licensed under MIT. External tools keep their own licenses:

- PDFFigures 2.0: Apache License 2.0, see <https://github.com/allenai/pdffigures2>.
- Poppler / `pdftotext`: Poppler project license terms apply, see <https://poppler.freedesktop.org/>.
- Java runtimes: the selected runtime distribution's license terms apply.

This repository does not redistribute those binaries.

## Repository Layout

```text
skills/
  paper-note-drafter/
  paper-note-reader/
obsidian-plugins/
  paper-archiver/
docs/
  workflow.md
  inbox-contract.md
```

## Status

This is a personal workflow extracted from a real Obsidian/Codex setup. Expect the file contract to stay stable, while the prompts and plugin UI may evolve.
