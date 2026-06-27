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

## Tool Requirements

Before processing a PDF, the runtime environment must provide these commands on `PATH`:

- `pdftotext`: extracts plain text from the paper PDF.
- `pdffigures2`: extracts figures, tables, captions, metadata, and raw crops.

Prefer commands already available on `PATH`. If `pdffigures2` is not on `PATH` and `.tools/bin/pdffigures2` exists under this skill directory, prepend `.tools/bin` to `PATH` for extraction commands.

This skill is intentionally OS-agnostic at runtime. Installation and platform-specific setup are documented in `README.md`; do not run setup/bootstrap scripts during normal note drafting unless the user explicitly asks for tool installation or repair.

## Output Contract

The final note must satisfy the local Obsidian `paper-archiver` format. Do not restate the rules from memory; read and follow `references/paper-note-template.md` for folder layout, file naming, figure paths, and final `xxx.md` promotion.

The required handoff directory is intentionally clean. The final `Inbox/xxx/` folder must contain only:

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

Temporary extraction outputs such as `pdffigures2/data-xxx.json`, `pdffigures2/stats.json`, and raw `img-*` crops are allowed only while drafting and checking the note. Delete the temporary `pdffigures2/` directory before handoff.

## Workflow

Run the tools as separate steps.

1. Determine the final Obsidian archive name `xxx`.
   - Use the paper's proposed concept/system/method/artifact name.
   - Prepare the folder, PDF, Markdown, and figure paths according to `references/paper-note-template.md`.
   - Keep the archive clean: final files are `xxx.md`, `xxx-naive.md`, `xxx.pdf`, `xxx.txt`, and `Figure/`.
   - Do not create or preserve an `extracted/` directory in the final handoff.
   - If the source PDF is already in the Inbox root, move it into `Inbox/xxx/xxx.pdf` and do not leave a duplicate in the root. If it is outside the Inbox, copy it into `Inbox/xxx/xxx.pdf` and leave the external original untouched.
2. Extract text with `pdftotext`.
   - Prefer plain text for reading and reasoning.
   - Write extracted text to `Inbox/xxx/xxx.txt`.
   - Example: `pdftotext Inbox/xxx/xxx.pdf Inbox/xxx/xxx.txt`
3. Read the extracted text.
   - Identify the paper type and main sections.
   - Count or list figure/table mentions from captions and in-text references, such as `Figure 1`, `Fig. 2`, `Table 3`.
4. Extract figures and tables with `pdffigures2`.
   - Default to `--dpi 600` for clear figure/table crops.
   - Write raw `pdffigures2` outputs to temporary `Inbox/xxx/pdffigures2/`, not to `Figure/`.
   - Example: `pdffigures2 --dpi 600 Inbox/xxx/xxx.pdf Inbox/xxx/pdffigures2`
   - The temporary directory contains `data-xxx.json`, `stats.json`, and raw crops such as `img-xxx-Figure1-1.png` and `img-xxx-Table1-1.png`.
   - Read the generated figure/table metadata JSON before choosing images to embed.
5. Cross-validate text needs against extracted figures/tables.
   - Match each needed figure/table by number and caption.
   - Use `Inbox/xxx/xxx.txt` to determine which Figure/Table items matter, and use `Inbox/xxx/pdffigures2/data-xxx.json` to map each selected item to its raw crop.
   - If a needed item is missing from `pdffigures2`, write `FIX: 手工嵌入 Figure/Table N` at the place where it belongs in the note.
   - Copy only the selected figures/tables that are embedded in the Markdown from `pdffigures2/` into `Figure/`, renaming them as `xxx-N.ext` in first-appearance order.
   - Markdown must reference only `Figure/xxx-N.ext`; never reference `pdffigures2/`, `extracted/`, or raw `img-*` paths.
   - After the note is checked and all selected figures are copied to `Figure/`, delete the entire temporary `Inbox/xxx/pdffigures2/` directory.
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
9. Hand off the first draft.
   - First-generation output must include both `Inbox/xxx/xxx-naive.md` and `Inbox/xxx/xxx.md`.
   - Write the first AI-generated draft to `xxx-naive.md`, then copy the same content to `xxx.md`.
   - Treat `xxx-naive.md` as the baseline draft for later comparison and skill improvement.
   - Treat `xxx.md` as the user's working/final copy. The user edits `xxx.md` directly, and `paper-archiver` archives `xxx.md`.
   - Before handoff, verify the final directory contains no `pdffigures2/`, `extracted/`, raw `img-*`, `data-*.json`, or `stats.json` files.

### Revision / Learning Workflow

When revising an existing note after user discussion:

1. Preserve `xxx-naive.md` as the first generated baseline. Revise `xxx.md` directly; if `xxx-naive.md` is missing, recreate it before substantial revision only if the original first draft can be recovered. Keep figures and the original PDF unchanged.
2. Compare `xxx-naive.md`, the current `xxx.md`, and the user's critique before deciding what should become the final note.
3. Preserve useful basic facts, figures, experimental setup, and reproducibility context unless they are wrong or pure bookkeeping.
4. Replace template-shaped sections with sharper mechanism explanations when the discussion reveals a better abstraction.
5. Add reader-derived insights as `适用边界与思考` or an equivalent final section, but keep them general enough to transfer beyond the current paper.
6. After the edited note is accepted, compare the diff between `xxx-naive.md` and `xxx.md` to identify process lessons. If the lesson improves future paper-note drafting in a general way, update this skill before finalizing the paper note.
7. After the skill reflection, leave the accepted edited note as `xxx.md` for archiving. Keep `xxx-naive.md` through revision unless the user asks to delete it.
8. Keep `xxx.txt` through revision. Do not keep temporary `pdffigures2/` outputs after selected figures have been copied to `Figure/`; regenerate them from `xxx.pdf` if deeper figure inspection is needed later.
9. Do not update this skill from a single paper unless the lesson improves the drafting process across future papers.

## Useful Resources

- `references/paper-note-schema.md`: the living schema distilled from existing notes.
- `references/paper-note-template.md`: flexible Markdown skeletons plus strict figure/table embedding and naming rules.

## Output Expectations

- Produce a clean Markdown note suitable for Obsidian.
- Include the paper's core logic, not just the abstract.
- Produce an archiver-ready folder and final `xxx.md` according to `references/paper-note-template.md`.
- Keep only the clean handoff files: `xxx.md`, `xxx-naive.md`, `xxx.pdf`, `xxx.txt`, and `Figure/`. Temporary `pdffigures2/` outputs must be deleted before handoff.
