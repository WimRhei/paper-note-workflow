---
name: paper-downloader
description: Download or prepare research paper PDFs and record the user's Algorithm or Architecture reading route as the first step of a paper-reading workflow. Use when the user asks to fetch or prepare an arXiv, IEEE, ACM, DOI, or publisher-hosted paper before using paper-note-drafter.
---

# Paper Downloader

## Overview

Acquire the authorized PDF, place it in the local paper workflow `论文阅读/Inbox`, record the user's reading route in `route.txt`, then hand the folder to `paper-note-drafter`. Select one source route and load only that source route's reference file.

This skill is the first stage of the paper-read workflow. It ends when a verified local PDF exists at the workflow interface path and the next note-drafting step can start.

## Context Discipline

- Treat the complete contents of `SKILL.md`, `AGENTS.md`, or a route reference already supplied in the conversation as loaded; do not read and print the same file again from disk.
- If applicable project instructions are already supplied, check only for a closer unprovided `AGENTS.md` when the target path may have narrower rules.
- After selecting the source route, read only that source route's reference file. Do not load unrelated skills or source route references.
- Do not query memory or prior workflow history for a straightforward download when the current request, project instructions, source route, and reading route already determine the destination and procedure.
- Once the destination path is resolved, reuse it directly. Do not repeatedly rediscover it with `find`, directory scans, or equivalent searches.

## Workflow Interface

Default to the local paper workflow Inbox, not the task `outputs/` directory.

The repository skill does not embed a machine-specific default. Resolve `<inbox-root>` from the user's requested paper workflow, applicable project instructions, or an existing vault layout:

```text
<paper-workflow-root>/Inbox
```

The preferred handoff shape is:

```text
论文阅读/Inbox/xxx/
  xxx.pdf
  route.txt
```

`xxx` is the short paper/system/method/artifact name that later becomes the shared prefix for `xxx.md`, `xxx-naive.md`, `xxx.txt`, and `Figure/` when `paper-note-drafter` runs.

This skill creates or fills only the PDF and reading-route handoff. Do not create `xxx.md`, `xxx-naive.md`, `xxx.txt`, `Figure/`, or `pdffigures2/`; those belong to `paper-note-drafter`.

Use this interface:

- If the user provides or implies the paper-reading vault/folder, create or reuse its `论文阅读/Inbox/xxx/` folder and place the verified PDF at `论文阅读/Inbox/xxx/xxx.pdf`.
- If applicable project instructions define the paper workflow Inbox, use that path without searching for a second destination.
- If no `Inbox` can be located, ask for the target paper workflow `Inbox` path before treating the PDF as ready for downstream drafting.
- Only use task `outputs/` for ad hoc delivery when the user asks to download a PDF outside the paper-read workflow.

## Boundaries

- Use normal publisher, DOI, institution, library, or open-access routes only. Do not bypass paywalls, CAPTCHAs, security interstitials, or access controls.
- Do not read, reveal, store, or manually type passwords, OTPs, cookies, or session tokens.
- If Chrome/password manager has already filled credentials, continue only when the user's prompt authorizes clicking the login button for that specific destination. Stop for CAPTCHA, OTP, QR login, missing password autofill, or unexpected account prompts.

## Workflow

1. Determine the target paper and user-selected reading route.
   - Accept a title, DOI, IEEE/ACM URL, arXiv ID, or partial query.
   - Resolve to the publisher record and record the document ID/DOI/title.
   - Choose `xxx`, a short archive-safe paper name. Prefer the paper's system, method, or artifact name.
   - Require an explicit `Algorithm`/算法 or `Architecture`/架构/体系结构/硬件 reading route from the user. If it is missing or ambiguous, ask; never infer it from the paper.
   - Normalize the reading route to exactly `Algorithm` or `Architecture`.
   - For dynamic or ambiguous search results, use current web or Chrome search rather than memory.
2. Select the source route.
   - Route by download source:
     - Arxiv: use direct arXiv PDF download when the paper is on arXiv.
     - IEEE: use Chrome with institutional access when needed.
     - ACM: do not automate; ask the user to download the PDF manually, then locate, move, and verify the local PDF.
3. Read and follow only the selected source route reference.
   - Do not load the other source routes into context.
   - Source-specific prerequisites, browser behavior, authentication flow, and download mechanics belong in that reference.
4. Save and verify the local artifact.
   - Let Chrome download to the user's Downloads folder if needed, then move or copy the verified PDF to `论文阅读/Inbox/xxx/xxx.pdf`.
   - Do not leave the workflow result only in `~/Downloads` or task `outputs/`.
   - Source route references own download-session, temporary-file, and atomic-finalization rules. Follow them before treating a file as complete.
   - Verify with `file` and, when available, `pdfinfo`: PDF type, page count, size, encryption status.
   - After the PDF is verified, write the normalized user-selected reading route plus a trailing newline to `论文阅读/Inbox/xxx/route.txt`.
   - If a valid existing `route.txt` conflicts with the user's current reading route, stop and ask instead of overwriting or choosing one.
   - Report both the source publisher record and the local PDF path.
5. Hand off to paper note drafting.
   - If the user asked for notes too, invoke `paper-note-drafter` on `论文阅读/Inbox/xxx/xxx.pdf`; the drafter must inherit the reading route from the adjacent `route.txt`.
   - If the user only asked for download/setup, stop after reporting the verified PDF.

## Source Route References

Select exactly one source route, then read that source route file:

- [references/arxiv-download.md](references/arxiv-download.md): open arXiv PDFs; no institution state by default.
- [references/ieee-download.md](references/ieee-download.md): IEEE Xplore PDFs; Chrome institutional access and IEEE PDF viewer behavior.
- [references/acm-download.md](references/acm-download.md): ACM Digital Library PDFs; manual download handoff only.

If a paper exists in multiple sources, prefer the source explicitly requested by the user. If the user only wants the paper and arXiv has the same version, prefer arXiv because it is the least stateful route.

## Output Expectations

Report:

- Paper title and publisher record URL.
- Whether institutional access was observed, when applicable.
- Any human intervention required, with the exact blocker.
- Final `论文阅读/Inbox/xxx/xxx.pdf` path and verification result.
- Recorded reading route and `论文阅读/Inbox/xxx/route.txt` path.
- Suggested next step: pass the PDF to `paper-note-drafter` when note drafting is requested.
