---
name: paper-note-drafter
description: Draft structured Chinese research paper notes from PDFs. Use when the user asks to read a paper, extract PDF text or figures, create a literature note, or generate an Obsidian-style paper note from a PDF using the paper-note schema.
---

# Paper Note Drafter

## Overview

Turn a paper PDF into a reviewable Chinese Markdown note. Extract plain text first, infer which figures and tables matter from the text, extract figures/tables separately, then cross-check the note against both sources. Do not mirror the paper's narrative; compress it into the paper's real problem, bottleneck, mechanism, and trade-off.

## Windows Tool Setup

On Windows, verify the local toolchain before processing a PDF:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify-windows.ps1
```

If `pdftotext` or `pdffigures2` is missing, bootstrap the bundled tools:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-windows.ps1
```

The bootstrap script installs wrappers under `.tools\bin` inside this skill directory and prints the PATH entry to add for the current shell. It expects Java for `pdffigures2`; if Java is missing, install a JRE/JDK first, then rerun the script.

When this skill is cloned from GitHub, `bootstrap-windows.ps1` tries to infer the repository from `git remote origin` and download `pdffigures2-assembly.jar` from the latest GitHub Release. If the skill was installed without `.git`, pass `-Repo owner/repo` or set `PAPER_NOTE_DRAFTER_PDFFIGURES2_JAR_URL` to a direct jar URL.

## Workflow

Run the tools as separate steps.

1. Extract text with `pdftotext`.
   - Prefer plain text for reading and reasoning.
   - On Windows, run `.\scripts\verify-windows.ps1` first if tool availability is uncertain.
   - Example: `pdftotext paper.pdf paper.txt`
2. Read the extracted text.
   - Identify the paper type and main sections.
   - Count or list figure/table mentions from captions and in-text references, such as `Figure 1`, `Fig. 2`, `Table 3`.
3. Extract figures and tables with `pdffigures2`.
   - Default to `--dpi 600` for clear figure/table crops.
   - Example: `pdffigures2 --dpi 600 paper.pdf figures`
   - Read the generated figure/table metadata JSON before choosing images to embed.
4. Cross-validate text needs against extracted figures/tables.
   - Match each needed figure/table by number and caption.
   - If a needed item is missing from `pdffigures2`, write `FIX: 手工嵌入 Figure/Table N` at the place where it belongs in the note.
5. Read the schema.
   - Use [references/paper-note-schema.md](references/paper-note-schema.md).
6. Draft the note.
   - Write Chinese Markdown.
   - Keep the note structurally aligned with the schema.
   - Prefer the paper's underlying mechanism over its marketing story.
   - Name the Markdown file as `xxx.md`, where `xxx` is the core concept, system, method, or artifact proposed by the paper.
   - Rename embedded figures/tables with the same `xxx` prefix and a 1-based sequence, such as `xxx-1`, `xxx-2`, `xxx-3`, in the order they appear in the note.
7. Fill gaps carefully.
   - Mark unknown or missing items as `FIX: info`.
   - Do not invent facts, numbers, or results.

## Useful Resources

- `references/paper-note-schema.md`: the living schema distilled from existing notes.

## Output Expectations

- Produce a clean Markdown note suitable for Obsidian.
- Include the paper's core logic, not just the abstract.
- Use the paper's proposed concept/system/method/artifact name as the note filename: `xxx.md`.
- Use the same prefix for all selected figure/table files: `xxx-1`, `xxx-2`, `xxx-3`, and so on.
