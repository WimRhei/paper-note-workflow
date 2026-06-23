---
name: paper-note-drafter
description: Draft Chinese research paper notes from PDFs by reconstructing the paper's technical logic, mechanism, hardware/system dataflow, and key experiments. Use when the user asks to read a paper, extract PDF text or figures, create a literature note, or generate an Obsidian-style paper note from a PDF.
---

# Paper Note Drafter

## Overview

Turn a paper PDF into a reviewable Chinese Markdown note that can be archived by the local Obsidian `paper-archiver` plugin. Extract plain text first, infer which figures and tables matter from the text, extract figures/tables separately, then cross-check the note against both sources.

The note is not a paper-summary form. Its job is to reconstruct the paper's technical logic in the shortest structure that makes the mechanism understandable: what problem blocks the target metric, what essential abstraction or insight unlocks the design, what each layer of the solution changes, how data/control actually flows, which experiments prove the chain, and what transferable research lesson remains after reading.

The note should support an iterative reading workflow: draft a first note from the paper, let the user read and challenge it, then revise the note to preserve the sharper understanding. Do not overfit the skill to one paper's quirks; use each revision to improve how the note captures essence, abstraction, mechanism, evidence, and transferable thinking.

## File Roles

- `SKILL.md` is the execution orchestrator: tool setup, extraction workflow, revision workflow, and when to update the skill.
- `references/paper-note-schema.md` is the thinking guide: what to understand, how to identify the essential abstraction, how to write mechanisms, experiments, limitations, and transferable lessons.
- `references/paper-note-template.md` is the output contract: final Markdown skeleton, file naming, figure embedding, and Obsidian archiver compatibility.

Before drafting, read both reference files and follow their division of labor. Do not duplicate or override reference rules in ad hoc prose unless the user explicitly asks for a different format.

## Windows Tool Setup

On Windows, verify the local toolchain before processing a PDF:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify-windows.ps1
```

If `pdftotext` or `pdffigures2` is missing, bootstrap the bundled tools:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-windows.ps1
```

The bootstrap script installs wrappers under `.tools\bin` inside this skill directory and prints the PATH entry to add for the current shell. It uses system Java when available; if Java is missing, it downloads a portable JRE under `.tools\java` and points the `pdffigures2` wrapper at that local runtime.

When this skill is cloned from GitHub, `bootstrap-windows.ps1` tries to infer the repository from `git remote origin` and download `pdffigures2-assembly.jar` from the latest GitHub Release. If the skill was installed without `.git`, pass `-Repo owner/repo` or set `PAPER_NOTE_DRAFTER_PDFFIGURES2_JAR_URL` to a direct jar URL.

## Output Contract

The final note must satisfy the local Obsidian `paper-archiver` format. Do not restate the rules from memory; read and follow `references/paper-note-template.md` for folder layout, file naming, figure paths, and final `xxx.md` promotion.

## Workflow

Run the tools as separate steps.

1. Determine the final Obsidian archive name `xxx`.
   - Use the paper's proposed concept/system/method/artifact name.
   - Prepare the folder, PDF, Markdown, and figure paths according to `references/paper-note-template.md`.
2. Extract text with `pdftotext`.
   - Prefer plain text for reading and reasoning.
   - On Windows, run `.\scripts\verify-windows.ps1` first if tool availability is uncertain.
   - Example: `pdftotext paper.pdf paper.txt`
3. Read the extracted text.
   - Identify the paper type and main sections.
   - Count or list figure/table mentions from captions and in-text references, such as `Figure 1`, `Fig. 2`, `Table 3`.
4. Extract figures and tables with `pdffigures2`.
   - Default to `--dpi 600` for clear figure/table crops.
   - Example: `pdffigures2 --dpi 600 paper.pdf figures`
   - Read the generated figure/table metadata JSON before choosing images to embed.
5. Cross-validate text needs against extracted figures/tables.
   - Match each needed figure/table by number and caption.
   - If a needed item is missing from `pdffigures2`, write `FIX: 手工嵌入 Figure/Table N` at the place where it belongs in the note.
   - Keep extracted text, figure metadata, and other intermediate files during reading and revision; they are useful for later AI/user inspection. Do not clean them up manually unless the user asks.
6. Read the schema and template.
   - Use [references/paper-note-schema.md](references/paper-note-schema.md).
   - Use [references/paper-note-template.md](references/paper-note-template.md) for the final Markdown structure and strict figure/table file rules.
7. Draft the note.
   - Write Chinese Markdown.
   - Use `references/paper-note-schema.md` for reasoning and organization; do not mechanically fill every template section.
   - Prefer the paper's underlying mechanism over its marketing story.
   - Use `references/paper-note-template.md` for Markdown skeleton, figure naming, and file placement.
8. Fill gaps carefully.
   - Mark unknown or missing items as `FIX: info`.
   - Do not invent facts, numbers, or results.

### Revision / Learning Workflow

When revising an existing note after user discussion:

1. Preserve the first generated note as the baseline draft. Before substantial revision, copy `xxx.md` to `xxx-edit.md` in the same paper folder and revise `xxx-edit.md`; keep figures and the original PDF unchanged.
2. Compare the baseline draft, the edited note, and the user's critique before deciding what should become the final note.
3. Preserve useful basic facts, figures, experimental setup, and reproducibility context unless they are wrong or pure bookkeeping.
4. Replace template-shaped sections with sharper mechanism explanations when the discussion reveals a better abstraction.
5. Add reader-derived insights as `适用边界与思考` or an equivalent final section, but keep them general enough to transfer beyond the current paper.
6. After the edited note is accepted, compare the diff between `xxx.md` and `xxx-edit.md` to identify process lessons. If the lesson improves future paper-note drafting in a general way, update this skill before finalizing the paper note.
7. After the skill reflection, promote the accepted edited note by overwriting `xxx.md` with `xxx-edit.md` for archiving. Keep `xxx-edit.md` unless the user asks to delete it.
8. Keep extracted text, figure metadata, and other intermediate files through the whole reading/revision process. The Obsidian archiver/plugin may clean unreferenced non-PDF generated files later; do not preemptively delete them.
9. Do not update this skill from a single paper unless the lesson improves the drafting process across future papers.

## Useful Resources

- `references/paper-note-schema.md`: the living schema distilled from existing notes.
- `references/paper-note-template.md`: flexible Markdown skeletons plus strict figure/table embedding and naming rules.

## Output Expectations

- Produce a clean Markdown note suitable for Obsidian.
- Include the paper's core logic, not just the abstract.
- Produce an archiver-ready folder and final `xxx.md` according to `references/paper-note-template.md`.
- Keep useful extraction intermediates during reading/revision unless the user asks to clean them.
