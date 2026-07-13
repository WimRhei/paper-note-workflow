---
name: paper-downloader
description: Download or prepare research paper PDFs as the first step of a paper-reading workflow. Use when the user asks to fetch, download, or prepare an arXiv, IEEE, ACM, DOI, or publisher-hosted paper before using paper-note-drafter; use automated routes for arXiv/IEEE when appropriate, and use manual-download handoff for ACM.
---

# Paper Downloader

## Overview

Acquire the authorized PDF first, place it in the local paper workflow `论文阅读/Inbox`, then hand the local PDF path to `paper-note-drafter`. Prefer the user's signed-in Chrome profile over script scraping when publisher access depends on institution cookies, SSO redirects, password managers, or PDF viewer pages.

This skill is the first stage of the paper-read workflow. It ends when a verified local PDF exists at the workflow interface path and the next note-drafting step can start.

## Workflow Interface

Default to the local paper workflow Inbox, not the task `outputs/` directory.

For this user's vault, the default root is:

```text
/Users/wimrhei/arch-research/论文阅读/Inbox
```

The preferred handoff shape is:

```text
论文阅读/Inbox/xxx/
  xxx.pdf
```

`xxx` is the short paper/system/method/artifact name that later becomes the shared prefix for `xxx.md`, `xxx-naive.md`, `xxx.txt`, and `Figure/` when `paper-note-drafter` runs.

This skill creates or fills only the PDF handoff. Do not create `xxx.md`, `xxx-naive.md`, `xxx.txt`, `Figure/`, or `pdffigures2/`; those belong to `paper-note-drafter`.

Use this interface:

- If the user provides or implies the paper-reading vault/folder, create or reuse its `论文阅读/Inbox/xxx/` folder and place the verified PDF at `论文阅读/Inbox/xxx/xxx.pdf`.
- If the current working directory is inside `/Users/wimrhei/arch-research`, resolve Inbox as `/Users/wimrhei/arch-research/论文阅读/Inbox`.
- If no `Inbox` can be located, ask for the target paper workflow `Inbox` path before treating the PDF as ready for downstream drafting.
- Only use task `outputs/` for ad hoc delivery when the user asks to download a PDF outside the paper-read workflow.

## Browser Prerequisites

IEEE automation depends on the user's real Chrome state, not a fresh script browser.

Before using the IEEE route, the environment should have:

- Google Chrome installed.
- The Codex Chrome browser-control extension/plugin installed and enabled for the Chrome profile used by the workflow.
- A dedicated Chrome profile, preferably named `Papers-Codex`.
- Publisher and institution sessions prepared in that profile when possible.
- Chrome password manager or the user's normal password manager configured by the user, if institutional login should be auto-filled.

The agent should verify the available Chrome browser backends before opening publisher pages. If Chrome control is unavailable, the Chrome extension/plugin is not enabled, or the `Papers-Codex` profile cannot be reached, stop and ask the user to fix that browser setup instead of falling back to unauthenticated scraping.

Do not ask the user for passwords. The allowed automation boundary is to use the already configured browser profile and click through only when credentials are already filled and the user has authorized that login action.

## Boundaries

- Use normal publisher, DOI, institution, library, or open-access routes only. Do not bypass paywalls, CAPTCHAs, security interstitials, or access controls.
- Do not read, reveal, store, or manually type passwords, OTPs, cookies, or session tokens.
- If Chrome/password manager has already filled credentials, continue only when the user's prompt authorizes clicking the login button for that specific destination. Stop for CAPTCHA, OTP, QR login, missing password autofill, or unexpected account prompts.
- Prefer browser-based downloading over shell `curl`/`wget` for IEEE when access depends on cookies. Shell requests usually lose the institution state.
- Do not attempt to automate ACM downloads by default. ACM Digital Library is too unstable for this workflow because Cloudflare checks and the ACM reader/download UI can diverge across browser states.

## Workflow

1. Determine the target paper.
   - Accept a title, DOI, IEEE/ACM URL, arXiv ID, or partial query.
   - Resolve to the publisher record and record the document ID/DOI/title.
   - Choose `xxx`, a short archive-safe paper name. Prefer the paper's system, method, or artifact name.
   - For dynamic or ambiguous search results, use current web or Chrome search rather than memory.
2. Select the right access surface.
   - Route by source:
     - Arxiv: use direct arXiv PDF download when the paper is on arXiv.
     - IEEE: use Chrome with institutional access when needed.
     - ACM: do not automate; ask the user to download the PDF manually, then locate, move, and verify the local PDF.
   - For IEEE/publisher pages with institutional access, use Chrome, not the in-app browser.
   - Prefer the dedicated `Papers-Codex` Chrome profile when available.
   - Before browser actions, read and follow the relevant browser/Chrome skill if it is available in the session.
3. Reuse existing authenticated state.
   - First list Chrome browser backends and open tabs.
   - Prefer claiming an already-open publisher tab in the `Papers-Codex` profile.
   - Verify authorization on the visible page before assuming access. For IEEE, look for `Access provided by:` and the expected institution.
4. If authorization is missing, run the institution flow.
   - Use the publisher's `Institutional Sign In`, `Access Through Your Institution`, or equivalent route.
   - If the institution is known, search/select it exactly. For the user's current IEEE setup, use `University of Chinese Academy of Sciences`.
   - Follow the redirect back to the identity provider.
   - If credentials are auto-filled and user has authorized submission, click login. Otherwise stop and ask the user to complete login in Chrome.
   - After redirect back, verify the publisher page shows institutional access.
5. Open or download the PDF.
   - Click the publisher's `PDF` or `Download PDF` control only for routes that are still automated.
   - If a PDF viewer page opens, prefer the browser runtime media/download API over scraping with unauthenticated shell commands.
   - For IEEE, a successful authorized PDF page often uses `stamp/stamp.jsp?...` with an iframe pointing at `stampPDF/getPDF.jsp?...`.
   - For ACM, stop before browser automation and use the ACM manual handoff route.
6. Save and verify the local artifact.
   - Let Chrome download to the user's Downloads folder if needed, then move or copy the verified PDF to `论文阅读/Inbox/xxx/xxx.pdf`.
   - Do not leave the workflow result only in `~/Downloads` or task `outputs/`.
   - Verify with `file` and, when available, `pdfinfo`: PDF type, page count, size, encryption status.
   - Report both the source publisher record and the local PDF path.
7. Hand off to paper note drafting.
   - If the user asked for notes too, invoke `paper-note-drafter` on `论文阅读/Inbox/xxx/xxx.pdf`.
   - If the user only asked for download/setup, stop after reporting the verified PDF.

## Route References

Select exactly one primary route, then read that route file:

- [references/arxiv-download.md](references/arxiv-download.md): open arXiv PDFs; no institution state by default.
- [references/ieee-download.md](references/ieee-download.md): IEEE Xplore PDFs; Chrome institutional access and IEEE PDF viewer behavior.
- [references/acm-download.md](references/acm-download.md): ACM Digital Library PDFs; manual download handoff only.

If a paper exists in multiple sources, prefer the source explicitly requested by the user. If the user only wants the paper and arXiv has the same version, prefer arXiv because it is the least stateful route.

## Output Expectations

Report:

- Paper title and publisher record URL.
- Whether institutional access was observed.
- Any human intervention required, with the exact blocker.
- Final `论文阅读/Inbox/xxx/xxx.pdf` path and verification result.
- Suggested next step: pass the PDF to `paper-note-drafter` when note drafting is requested.
