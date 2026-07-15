---
name: paper-note-drafter
description: Draft Chinese research paper notes from PDFs using a user-selected Algorithm or Architecture reading route recorded in route.txt or supplied with a bare PDF. Use when the user asks to read a paper, extract PDF text or figures, create a literature note, or generate an Obsidian-style paper note from a PDF.
---

# Paper Note Drafter

## Overview

Turn a paper PDF into a reviewable Chinese Markdown note that can be archived by the local Obsidian `paper-archiver` plugin. Extract plain text first, infer which figures and tables matter from the text, extract figures/tables separately, then cross-check the note against both sources.

The note is not a paper-summary form. Its job is to reconstruct the paper's technical logic in the shortest structure that makes the mechanism understandable. The selected reading route's schema defines what logic to extract and how to organize it.

This skill owns first-draft generation. After handoff, use `paper-note-reader` for explanation, revision, source verification, and final diff review.

## File Roles

- `SKILL.md` is the execution orchestrator and the single source of truth for the shared Inbox, file naming, figure naming, and cleanup contract.
- `references/algorithm-paper-schema.md` and `references/algorithm-paper-template.md` define only the Algorithm reading logic and note body structure.
- `references/architecture-paper-schema.md` and `references/architecture-paper-template.md` define only the Architecture reading logic and note body structure.

The user owns reading-route selection. Resolve it only from an existing valid `route.txt` written by `paper-downloader` or an explicit `Algorithm`/算法 or `Architecture`/架构/体系结构/硬件 instruction supplied with a bare PDF. Normalize it to `Algorithm` or `Architecture`. If neither source is available, or if they conflict, stop and ask before drafting. Never infer, verify, or override the reading route from the paper's content.

After resolving the user-selected reading route, read only the matching schema/template pair. Do not load the other reading route's reference files into context. Do not duplicate or override reference rules in ad hoc prose unless the user explicitly asks for a different format.

## Context Discipline

- Treat the complete contents of `SKILL.md`, `AGENTS.md`, or a route reference already supplied in the conversation as loaded; do not read and print the same file again from disk.
- If applicable project instructions are already supplied, check only for a closer unprovided `AGENTS.md` when the target path may have narrower rules.
- If the exact PDF path is supplied, use it directly. Do not rediscover it with `find`, broad directory scans, or repeated path searches.
- Do not query memory or prior paper history when the local PDF, user-selected reading route, and current paper identity are already unambiguous.
- Load only the schema/template pair selected by `route.txt`. Never load the other reading route for comparison or classification.
- Do not dump large overlapping ranges from `xxx.txt`. Build a lightweight structural index first, then read non-overlapping ranges selected under the active schema.

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
  route.txt
  Figure/
    xxx-1.png
    xxx-2.png
```

Temporary extraction outputs such as `pdffigures2/data-xxx.json`, `pdffigures2/stats.json`, and raw `img-*` crops are allowed only while drafting and checking the note. Delete the temporary `pdffigures2/` directory before handoff.

`xxx-naive.md`, `xxx.txt`, and `route.txt` are pre-archive review artifacts: `paper-note-reader` uses them for diff review, source verification, and reading-route selection. The local `paper-archiver` removes all three during archive, so the archived paper keeps only the final `xxx.md`, `PDF/xxx.pdf`, and referenced `Figure/xxx-N.ext` files.

Apply these naming and placement rules:

- If the PDF already follows `Inbox/xxx/xxx.pdf`, reuse that folder and prefix as authoritative; do not rename or create a second folder.
- Only choose a new `xxx` for a bare PDF that does not already follow the handoff shape. Use the paper's core concept, system, method, or artifact name; keep it short, avoid spaces, and use `-` only when needed.
- Keep `xxx.md`, `xxx-naive.md`, `xxx.pdf`, `xxx.txt`, and `route.txt` in `Inbox/xxx/`.
- `route.txt` must contain exactly one line: `Algorithm` or `Architecture`, recording the user's reading-route selection.
- Put only figures and tables actually referenced by the note in `Inbox/xxx/Figure/`.
- Name embedded files `xxx-N.ext`, where `N` starts at 1 and follows first appearance in the note. Do not use the paper's Figure/Table number as the filename number.
- Preserve the paper's original `Figure N`, `Fig. N`, or `Table N` in the Markdown alt text.
- Reference only `Figure/xxx-N.ext` from Markdown. Never reference `pdffigures2/`, `extracted/`, or raw `img-*` paths.
- Place each figure/table next to the passage it supports and state the source question it answers. Do not collect figures at the end.
- If extraction misses a figure or table whose visual structure is necessary, write `FIX: 手工嵌入 Figure/Table N` where it belongs.
- If a missing table has complete, unambiguous headers, rows, and values in the paper text, reconstruct it as a Markdown table instead of forcing an image or `FIX:`. Never guess missing cells.
- Before handoff, remove `pdffigures2/`, raw crops, metadata JSON, stats files, unreferenced figures, and empty temporary directories.

## Workflow

Run the tools as separate steps.

1. Resolve the handoff folder and archive name `xxx`.
   - If the source is already `Inbox/xxx/xxx.pdf`, reuse its parent folder and `xxx` prefix without renaming.
   - Only for a bare PDF, choose `xxx` from the paper's proposed concept/system/method/artifact name and prepare `Inbox/xxx/xxx.pdf`.
   - If the bare PDF is in the Inbox root, move it into the new folder and do not leave a duplicate. If it is outside the Inbox, copy it into the new folder and leave the external original untouched.
2. Resolve and record the user-selected reading route.
   - If `Inbox/xxx/route.txt` already contains exactly `Algorithm` or `Architecture`, inherit it as the prior user selection from `paper-downloader`.
   - For a bare PDF without `route.txt`, require an explicit Algorithm/算法 or Architecture/架构/体系结构/硬件 instruction, normalize it, and write only `Algorithm` or `Architecture` plus a trailing newline to `Inbox/xxx/route.txt`.
   - If an existing valid file and the user's current instruction conflict, stop and ask; do not overwrite, infer, or choose one silently.
   - Do not reconsider the established reading route after reading the paper.
3. Read the schema and template selected by the reading route in `route.txt`.
   - For `Algorithm`, read only [references/algorithm-paper-schema.md](references/algorithm-paper-schema.md) and [references/algorithm-paper-template.md](references/algorithm-paper-template.md).
   - For `Architecture`, read only [references/architecture-paper-schema.md](references/architecture-paper-schema.md) and [references/architecture-paper-template.md](references/architecture-paper-template.md).
   - Never read both routes' reference files for the same paper.
4. Extract text with `pdftotext`.
   - Prefer plain text for reading and reasoning.
   - Write extracted text to `Inbox/xxx/xxx.txt`.
   - Example: `pdftotext Inbox/xxx/xxx.pdf Inbox/xxx/xxx.txt`
5. Index and read the extracted text.
   - First build a lightweight index of section headings and Figure/Table captions with line-numbered searches. Do not begin with a broad full-text dump.
   - Use the active reading route's schema to choose which indexed sections and captions matter. The shared workflow must not impose Algorithm-specific or Architecture-specific section names.
   - Define non-overlapping line ranges and read each selected range once. If output truncates, narrow the range instead of issuing another overlapping large read.
   - Return to `xxx.txt` only for a specific missing fact, number, definition, or source check.
6. Extract figures and tables with `pdffigures2`.
   - Default to `--dpi 600` for clear figure/table crops.
   - Write raw `pdffigures2` outputs to temporary `Inbox/xxx/pdffigures2/`, not to `Figure/`.
   - Example: `pdffigures2 --dpi 600 Inbox/xxx/xxx.pdf Inbox/xxx/pdffigures2`
   - The temporary directory contains `data-xxx.json`, `stats.json`, and raw crops such as `img-xxx-Figure1-1.png` and `img-xxx-Table1-1.png`.
   - Inspect the metadata JSON top-level type before iterating it. Use `.[]` for an array and `.figures[]` only when an object actually contains a `figures` array; otherwise inspect the object keys before choosing a query.
   - Use captions and metadata to shortlist relevant items before viewing image files. Do not open every extracted image by default.
7. Cross-validate text needs against extracted figures/tables.
   - Match each needed figure/table by number and caption.
   - Use `Inbox/xxx/xxx.txt` to determine which Figure/Table items matter, and use `Inbox/xxx/pdffigures2/data-xxx.json` to map each selected item to its raw crop.
   - If a needed visual item is missing from `pdffigures2`, write `FIX: 手工嵌入 Figure/Table N` at the place where it belongs in the note.
   - If a missing table can be reconstructed completely and unambiguously from the source text, write a Markdown table and preserve its original Table number in the surrounding explanation; do not add a `FIX:` solely because no image was extracted.
   - Copy only the selected figures/tables that are embedded in the Markdown from `pdffigures2/` into `Figure/`, renaming them as `xxx-N.ext` in first-appearance order.
   - Markdown must reference only `Figure/xxx-N.ext`; never reference `pdffigures2/`, `extracted/`, or raw `img-*` paths.
   - After the note is checked and all selected figures are copied to `Figure/`, delete the entire temporary `Inbox/xxx/pdffigures2/` directory.
8. Draft the note.
   - Write Chinese Markdown.
   - Before writing, privately establish the system boundary, module hierarchy, execution order, and the single owning section for each retained fact.
   - Use the selected reading route's schema for reasoning and organization; derive headings from the paper's technical logic instead of mechanically filling template sections.
   - Keep the smallest structure that preserves the mechanism. Merge or omit sections that would only repeat information.
   - State each fact once. When a later section depends on it, continue the reasoning without restating the same definition, configuration, or result.
   - Prefer short sentences and nested lists for hierarchy. Use tables only when aligned comparison, mapping, or scale conversion is materially clearer than prose.
   - Prefer the paper's underlying mechanism over its marketing story.
   - Use the selected reading route's template only for the note body structure; use the Output Contract above for file and figure rules.
9. Fill gaps carefully.
   - For Algorithm notes, mark missing source information as `未报告` or `FIX: info` according to the algorithm schema/template. For Architecture notes, preserve the existing `FIX: info` rule.
   - Do not invent facts, numbers, or results.
10. Hand off the first draft.
   - First-generation output must include both `Inbox/xxx/xxx-naive.md` and `Inbox/xxx/xxx.md`.
   - Generate the complete note body exactly once in `xxx-naive.md`. Do not repeat the full Markdown body in a second patch, command, or model-generated payload.
   - Copy `xxx-naive.md` to `xxx.md` with `cp`, then verify byte-for-byte equality with `cmp`.
   - Treat `xxx-naive.md` as the baseline draft for later comparison and skill improvement.
   - Treat `xxx.md` as the user's working/final copy. The user edits `xxx.md` directly, and `paper-archiver` archives `xxx.md`.
   - Run one consolidated final verification pass: validate `route.txt`; compare the two Markdown files; verify every image reference exists; detect unreferenced files in `Figure/`; report any remaining `FIX:` markers; confirm no `pdffigures2/`, `extracted/`, raw `img-*`, `data-*.json`, or `stats.json` remains; and inspect the final directory contents once.
   - During that pass, also verify the note covers every visual-evidence role required by the selected route's schema and that each retained diagram agrees with the written hierarchy or execution chain. If a required role has no suitable source figure/table, report that absence instead of substituting an unrelated visual.
   - Hand the folder to `paper-note-reader` for all later reading and revision work.

## Progress Updates

Default to milestone updates instead of narrating each command:

1. PDF, tools, and the user-selected reading route are confirmed.
2. Text indexing and figure/table selection are complete; drafting begins.
3. The draft folder is complete and verified.

Add another update only for a long-running operation, required user action, or blocker.

## Useful Resources

- `references/algorithm-paper-schema.md` and `references/algorithm-paper-template.md`: Algorithm-only reading and output context.
- `references/architecture-paper-schema.md` and `references/architecture-paper-template.md`: Architecture-only reading and output context.

## Output Expectations

- Produce a clean Markdown note suitable for Obsidian.
- Include the paper's core logic, not just the abstract.
- Satisfy the shared Output Contract and the selected reading route's schema/template.
- Hand the clean first-draft folder to `paper-note-reader` for later revision.
