---
name: paper-note-reader
description: Continue reading and refining an existing Chinese Algorithm or Architecture paper note after the first draft. Use when the user asks what a passage means, wants a verified explanation written back into xxx.md, develops personal or cross-domain interpretations through discussion, or requests a routed diff review against xxx-naive.md.
---

# Paper Note Reader

## Overview

Use this skill after `paper-note-drafter` has produced `Inbox/xxx/xxx-naive.md` and `Inbox/xxx/xxx.md`. The job is not to redraft the paper from scratch, but to help the user read the note, clarify confusing parts, and preserve accepted insights in the right place.

## Boundary

- Do not re-run PDF extraction or figure extraction unless the user explicitly needs missing evidence checked.
- Do not edit `xxx-naive.md`; it is the baseline for later comparison.
- Revise `xxx.md` directly when the user asks to write an explanation back into the note.
- Keep edits surgical: rewrite the passage under discussion or add short parenthetical explanations. Write personal interpretation into the note only when the user asks to preserve it.
- During discussion, the model may develop architecture inspiration, optimization opportunities, applicability boundaries, cross-paper analogies, or other personal interpretations with the user. Do not write them into `xxx.md` unless the user asks.

## Reading Route Contract

- Read `Inbox/xxx/route.txt` before any reading-route-sensitive revision or final diff review.
- Accept only the exact file content `Algorithm` or `Architecture` after trimming the trailing newline.
- Treat `route.txt` as the only reading-route authority. Never infer, verify, or override the reading route from `xxx.md`, `xxx.txt`, the PDF, or the paper topic.
- If `route.txt` is missing or invalid, stop and ask the user to provide the reading route; do not guess.
- Read only the matching drafter schema/template when reading-route context is needed. Do not load both reading routes.
- Keep explanations of the paper source-supported for both reading routes. Personal understanding may also be developed interactively during `paper-note-reader` discussion.

## Reading Workflow

1. Identify the active paper folder and files:
   - `xxx.md`: current working note.
   - `xxx-naive.md`: first draft baseline.
   - `xxx.txt`: extracted paper text for verification.
   - `route.txt`: user-selected `Algorithm` or `Architecture` reading route.
   - `Figure/`: referenced figures.
2. Read and validate `route.txt`; load only the matching drafter schema/template if reading-route context is needed.
3. When the user asks what a passage means, answer in plain language first.
4. If the user approves or asks to write it down, compress the explanation into the note.
5. If the passage involves a figure/table, preserve the figure's role: what question it answers, key numbers, and the conclusion.
6. If the user asks to preserve a personal or cross-domain interpretation supplied by the user or developed during discussion, write it normally into `xxx.md` near the relevant passage. Do not create a separate note.

## What To Look At During Follow-Up Reading

- Definitions that are easy to misread, such as Pareto frontier, cost-efficiency, prefix caching, QPS, LATS, or LLMCompiler.
- Figures where the caption is not enough: identify the x/y axes, the changing variable, the key number, and the source-supported implication.
- Claims that sound broad but are workload-specific.
- Whether the paper is a method paper, a system paper, a characterization paper, or a survey; do not force the same note structure on all types.
- Places where a domain analogy developed during discussion helps the user understand the paper.

## Writing Back Into Notes

- Prefer one clear sentence over a paragraph.
- Use parenthetical notes for brief definitions or reader-derived clarifications.
- Keep key numbers if they support the conclusion.
- Remove filler such as "it supports the judgment that" when the result can be stated directly.
- Do not add facts from memory if they are not in `xxx.md`, `xxx.txt`, the paper PDF, or the user's discussion.
- Write personal understanding back only when the user explicitly asks to preserve it; it may be supplied by the user or developed during discussion.
- If verification is needed, inspect `xxx.txt` or the PDF before writing.

## Final Diff Review

When the user asks for final diff optimization:

1. Read the existing reading route from `route.txt`; do not reclassify the paper.
2. Compare `xxx-naive.md` and `xxx.md`.
3. Separate changes into:
   - expression cleanup;
   - conceptual clarification;
   - structural change;
   - personal or cross-domain interpretation preserved from the discussion;
   - possible general lesson for `paper-note-drafter`.
4. Do not update `paper-note-drafter` directly. If a lesson seems general, state the drafting problem, selected reading route, target file/section, and proposed rule, then wait for user confirmation.
5. After confirmation, update only the file that owns that rule:
   - workflow/process rules -> `../paper-note-drafter/SKILL.md`;
   - Algorithm writing judgment -> `../paper-note-drafter/references/algorithm-paper-schema.md`;
   - Algorithm note body structure -> `../paper-note-drafter/references/algorithm-paper-template.md`;
   - Architecture writing judgment -> `../paper-note-drafter/references/architecture-paper-schema.md`;
   - Architecture note body structure -> `../paper-note-drafter/references/architecture-paper-template.md`.
6. Never modify the other reading route's schema/template from this diff review.
