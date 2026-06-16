---
name: paper-note-drafter
description: Draft structured Chinese research paper notes from PDFs. Use when the user asks to read a paper, extract PDF text or figures, create a literature note, or generate an Obsidian-style paper note from a PDF using the paper-note schema.
---

# Paper Note Drafter

## Overview

Turn a paper PDF into a reviewable Chinese Markdown note that can be archived by the local Obsidian `paper-archiver` plugin. Extract plain text first, infer which figures and tables matter from the text, extract figures/tables separately, then cross-check the note against both sources. Do not mirror the paper's narrative; compress it into the paper's real problem, bottleneck, mechanism, and trade-off.

## Obsidian Archiver Contract

The final output must satisfy the local `paper-archiver` plugin's scan and archive format:

- The plugin scans `03-论文阅读/Inbox` by default.
- Each paper must be a folder under Inbox.
- The folder name and Markdown filename must match exactly: `03-论文阅读/Inbox/xxx/xxx.md`.
- Use `xxx` as the core concept, system, method, or artifact name proposed by the paper. Keep it short, English, and filesystem-safe.
- Put selected figure/table image crops under `03-论文阅读/Inbox/xxx/Figure/`.
- Put the source PDF directly next to the note as `03-论文阅读/Inbox/xxx/xxx.pdf` unless the user asks to preserve the original filename. Do not create an input-side `PDF/` folder.
- Embed figures/tables with stable relative paths such as `![Figure 2: caption](Figure/xxx-1.png)`. Do not use `attachments/` for this workflow.
- Only files referenced by the note, plus PDFs, are preserved by the archiver. Any non-PDF generated file that is not referenced from `xxx.md` may be deleted during archive.
- If the input PDF is loose directly inside Inbox, create the matching `xxx/` folder and move or copy the PDF into `xxx/` before producing the final note.

## Workflow

Run the tools as separate steps.

1. Determine the final Obsidian archive name `xxx`.
   - Use the paper's proposed concept/system/method/artifact name.
   - Prepare the final folder shape: `03-论文阅读/Inbox/xxx/xxx.md`, `03-论文阅读/Inbox/xxx/xxx.pdf`, and `03-论文阅读/Inbox/xxx/Figure/`.
2. Extract text with `pdftotext`.
   - Prefer plain text for reading and reasoning.
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
6. Read the schema and template.
   - Use [references/paper-note-schema.md](references/paper-note-schema.md).
   - Use [references/paper-note-template.md](references/paper-note-template.md) for the final Markdown structure and strict figure/table file rules.
7. Draft the note.
   - Write Chinese Markdown.
   - Keep the note structurally aligned with the schema and template.
   - Prefer the paper's underlying mechanism over its marketing story.
   - Name the Markdown file as `xxx.md` and place it in `03-论文阅读/Inbox/xxx/`.
   - Rename embedded figures/tables according to the strict rules in `references/paper-note-template.md`.
   - Use `Figure/xxx-N.ext` relative paths for embedded figure/table images.
8. Fill gaps carefully.
   - Mark unknown or missing items as `FIX: info`.
   - Do not invent facts, numbers, or results.

## Useful Resources

- `references/paper-note-schema.md`: the living schema distilled from existing notes.
- `references/paper-note-template.md`: the final Markdown template, including strict figure/table embedding and naming rules.

## Output Expectations

- Produce a clean Markdown note suitable for Obsidian.
- Include the paper's core logic, not just the abstract.
- Produce an archiver-ready folder: `03-论文阅读/Inbox/xxx/xxx.md`.
- Put figure/table images in `03-论文阅读/Inbox/xxx/Figure/` and embed them as `Figure/xxx-N.ext`.
- Put the source PDF directly in `03-论文阅读/Inbox/xxx/`; PDFs are preserved by the archiver even if not linked, and the archiver will move them to the archived topic's `PDF/` folder.
- Use the same prefix for all selected figure/table files and follow the numbering, path, alt text, and missing-figure rules in `references/paper-note-template.md`.
