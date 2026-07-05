---
name: paper-note-reader
description: Continue reading and refining an existing Chinese paper note after the first draft, especially when the user asks what a passage means, wants concise explanations written back into xxx.md, compares xxx-naive.md with the edited note, or develops cross-paper/cross-domain insights from an Obsidian paper note.
---

# Paper Note Reader

## Overview

Use this skill after `paper-note-drafter` has produced `Inbox/xxx/xxx-naive.md` and `Inbox/xxx/xxx.md`. The job is not to redraft the paper from scratch, but to help the user read the note, clarify confusing parts, and preserve accepted insights in the right place.

## Boundary

- Do not re-run PDF extraction or figure extraction unless the user explicitly needs missing evidence checked.
- Do not edit `xxx-naive.md`; it is the baseline for later comparison.
- Revise `xxx.md` directly when the user asks to write an explanation back into the note.
- Keep edits surgical: rewrite the passage under discussion, add short parenthetical explanations, or add a compact final thought section.
- Put cross-paper or cross-domain reflections in a separate note when they would distract from the paper's own logic.

## Reading Workflow

1. Identify the active paper folder and files:
   - `xxx.md`: current working note.
   - `xxx-naive.md`: first draft baseline.
   - `xxx.txt`: extracted paper text for verification.
   - `Figure/`: referenced figures.
2. When the user asks what a passage means, answer in plain language first.
3. If the user approves or asks to write it down, compress the explanation into the note.
4. If the passage involves a figure/table, preserve the figure's role: what question it answers, key numbers, and the conclusion.
5. If the discussion produces a transferable comparison, decide whether it belongs in:
   - the paper note, if it explains this paper's contribution or limitation;
   - a separate companion note, if it compares this paper to another area such as VLA, robotics, or architecture methodology.

## What To Look At During Follow-Up Reading

- Definitions that are easy to misread, such as Pareto frontier, cost-efficiency, prefix caching, QPS, LATS, or LLMCompiler.
- Figures where the caption is not enough: identify the x/y axes, the changing variable, the key number, and the system implication.
- Claims that sound broad but are workload-specific.
- Whether the paper is a method paper, a system paper, a characterization paper, or a survey; do not force the same note structure on all types.
- Places where the user's domain analogy is useful but should not be mixed into the core paper summary.

## Writing Back Into Notes

- Prefer one clear sentence over a paragraph.
- Use parenthetical notes for brief definitions or reader-derived clarifications.
- Keep key numbers if they support the conclusion.
- Remove filler such as "it supports the judgment that" when the result can be stated directly.
- Do not add facts from memory if they are not in `xxx.md`, `xxx.txt`, the paper PDF, or the user's discussion.
- If verification is needed, inspect `xxx.txt` or the PDF before writing.

## Companion Notes

Create a separate note under `Inbox/` when the user is building a reusable comparison that is not part of the original paper. Keep it short and question-driven.

Recommended structure:

```markdown
# Topic

## 1. Question

- Short answer.

## 2. Question

- Short answer.
```

## Final Diff Review

When the user asks for final diff optimization:

1. Compare `xxx-naive.md` and `xxx.md`.
2. Separate changes into:
   - expression cleanup;
   - conceptual clarification;
   - structural change;
   - cross-domain insight;
   - possible general lesson for `paper-note-drafter`.
3. Do not update `paper-note-drafter` directly. If a lesson seems general, state the drafting problem, target file/section, and proposed rule, then wait for user confirmation.
4. After confirmation, update the appropriate file in `paper-note-drafter`:
   - workflow/process rules -> `SKILL.md`;
   - writing judgment -> `references/paper-note-schema.md`;
   - formatting/output contract -> `references/paper-note-template.md`.
