---
name: paper-note-drafter
description: Draft Chinese research paper notes from PDFs using separate Algorithm and Architecture reading routes, schemas, and templates. Use when the user asks to read an algorithm, model, architecture, hardware, system, or co-design paper; extract PDF text or figures; create a literature note; or generate an Obsidian-style paper note from a PDF.
---

# Paper Note Drafter

## Overview

Turn a paper PDF into a reviewable Chinese Markdown note that can be archived by the local Obsidian `paper-archiver` plugin. Extract plain text first, infer which figures and tables matter from the text, extract figures/tables separately, then cross-check the note against both sources.

The note is not a paper-summary form. Its job is to reconstruct the paper's technical logic in the shortest structure that makes the mechanism understandable. The selected route's schema defines what logic to extract and how to organize it.

This skill owns first-draft generation. After handoff, use `paper-note-reader` for explanation, revision, source verification, and final diff review.

## File Roles

- `SKILL.md` is the execution orchestrator and the single source of truth for the shared Inbox, file naming, figure naming, and cleanup contract.
- `references/algorithm-paper-schema.md` and `references/algorithm-paper-template.md` define only the Algorithm reading logic and note body structure.
- `references/architecture-paper-schema.md` and `references/architecture-paper-template.md` define only the Architecture reading logic and note body structure.

After routing the paper, read only the matching schema/template pair. Do not load the other route's reference files into context. Do not duplicate or override reference rules in ad hoc prose unless the user explicitly asks for a different format.

## Tool Requirements

Before processing a PDF, the runtime environment must provide these commands on `PATH`:

- `pdftotext`: extracts plain text from the paper PDF.
- `pdffigures2`: extracts figures, tables, captions, metadata, and raw crops.

Prefer commands already available on `PATH`.

This skill is intentionally OS-agnostic at runtime. The repository does not bundle or install external PDF tools; users should install them from upstream sources and make them available on `PATH`.

## Output Contract

The final note must satisfy the local Obsidian `paper-archiver` format. This section is the shared output contract for both routes; route templates must not duplicate it.

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

`xxx-naive.md` and `xxx.txt` are pre-archive review artifacts: `paper-note-reader` uses them for diff review and source verification. The local `paper-archiver` removes both during archive, so the archived paper keeps only the final `xxx.md`, `PDF/xxx.pdf`, and referenced `Figure/xxx-N.ext` files.

Apply these naming and placement rules:

- Use the paper's core concept, system, method, or artifact name as the shared `xxx` prefix; keep it short, avoid spaces, and use `-` only when needed.
- Keep `xxx.md`, `xxx-naive.md`, `xxx.pdf`, and `xxx.txt` in `Inbox/xxx/`.
- Put only figures and tables actually referenced by the note in `Inbox/xxx/Figure/`.
- Name embedded files `xxx-N.ext`, where `N` starts at 1 and follows first appearance in the note. Do not use the paper's Figure/Table number as the filename number.
- Preserve the paper's original `Figure N`, `Fig. N`, or `Table N` in the Markdown alt text.
- Reference only `Figure/xxx-N.ext` from Markdown. Never reference `pdffigures2/`, `extracted/`, or raw `img-*` paths.
- Place each figure/table next to the passage it supports and state the source question it answers. Do not collect figures at the end.
- If extraction misses a required item, write `FIX: 手工嵌入 Figure/Table N` where it belongs.
- Before handoff, remove `pdffigures2/`, raw crops, metadata JSON, stats files, unreferenced figures, and empty temporary directories.

## Workflow

Run the tools as separate steps.

1. Determine the final Obsidian archive name `xxx`.
   - Use the paper's proposed concept/system/method/artifact name.
   - Prepare the folder, PDF, Markdown, and figure paths according to the Output Contract above; route-specific templates are loaded only after the paper is classified.
   - If the source PDF is already in the Inbox root, move it into `Inbox/xxx/xxx.pdf` and do not leave a duplicate in the root. If it is outside the Inbox, copy it into `Inbox/xxx/xxx.pdf` and leave the external original untouched.
2. Extract text with `pdftotext`.
   - Prefer plain text for reading and reasoning.
   - Write extracted text to `Inbox/xxx/xxx.txt`.
   - Example: `pdftotext Inbox/xxx/xxx.pdf Inbox/xxx/xxx.txt`
3. Read the extracted text.
   - Identify the paper type and main sections.
   - Route the paper as either `Algorithm` or `Architecture`.
   - Use `Algorithm` when the paper's main contribution is a model, method, training objective, inference workflow, task formulation, data construction, or decoding strategy. Algorithm notes must use the algorithm schema/template and faithfully record only source-supported facts that affect inference efficiency; write `未报告` or `FIX: info` for missing information.
   - Use `Architecture` when the paper's main contribution is architecture, hardware, systems, compiler/runtime, scheduling, deployment, accelerator design, memory/interconnect, quantization implementation, or software-hardware co-design. Co-design papers are `Architecture` papers and continue to use the existing architecture schema/template.
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
   - For `Algorithm`, read only [references/algorithm-paper-schema.md](references/algorithm-paper-schema.md) and [references/algorithm-paper-template.md](references/algorithm-paper-template.md).
   - For `Architecture`, read only [references/architecture-paper-schema.md](references/architecture-paper-schema.md) and [references/architecture-paper-template.md](references/architecture-paper-template.md).
   - Never read both routes' reference files for the same paper.
7. Draft the note.
   - Write Chinese Markdown.
   - Use the selected route's schema for reasoning and organization; do not mechanically fill every template section.
   - Prefer the paper's underlying mechanism over its marketing story.
   - Use the selected route's template only for the note body structure; use the Output Contract above for file and figure rules.
8. Fill gaps carefully.
   - For Algorithm notes, mark missing source information as `未报告` or `FIX: info` according to the algorithm schema/template. For Architecture notes, preserve the existing `FIX: info` rule.
   - Do not invent facts, numbers, or results.
9. Hand off the first draft.
   - First-generation output must include both `Inbox/xxx/xxx-naive.md` and `Inbox/xxx/xxx.md`.
   - Write the first AI-generated draft to `xxx-naive.md`, then copy the same content to `xxx.md`.
   - Treat `xxx-naive.md` as the baseline draft for later comparison and skill improvement.
   - Treat `xxx.md` as the user's working/final copy. The user edits `xxx.md` directly, and `paper-archiver` archives `xxx.md`.
   - Before handoff, verify the final directory contains no `pdffigures2/`, `extracted/`, raw `img-*`, `data-*.json`, or `stats.json` files.
   - Hand the folder to `paper-note-reader` for all later reading and revision work.

## Useful Resources

- `references/algorithm-paper-schema.md` and `references/algorithm-paper-template.md`: Algorithm-only reading and output context.
- `references/architecture-paper-schema.md` and `references/architecture-paper-template.md`: Architecture-only reading and output context.

## Output Expectations

- Produce a clean Markdown note suitable for Obsidian.
- Include the paper's core logic, not just the abstract.
- Satisfy the shared Output Contract and the selected route's schema/template.
- Hand the clean first-draft folder to `paper-note-reader` for later revision.
