# ACM Manual Source Route

Use this source route for ACM Digital Library papers.

## Boundary

- Do not automate ACM PDF downloads by default.
- Do not click ACM `Download PDF`, `PDF/eReader`, or direct `/doi/pdf/...` links unless the user explicitly asks to re-test ACM automation.
- ACM Digital Library is unstable for this workflow:
  - Cloudflare checks can appear only in the controlled browser session.
  - The visible browser state and automation state can diverge.
  - `Download PDF` may open a challenge page, a reader shell, or a browser download depending on state.
  - The ACM reader loads dynamic resources that can fail independently of the article page.
- The reliable Codex role is post-download handling: locate the user's manually downloaded PDF, move it into the paper workflow, and verify it.

## Manual Workflow

1. Resolve and report the ACM article page:
   - `https://dl.acm.org/doi/<doi>`
2. Ask the user to manually download the PDF from ACM in their browser.
3. After the user says the file is downloaded, locate the newest plausible PDF in the download folder.
   - Match by DOI, title, short paper name, or recent modified time.
   - Ignore `.crdownload` files and unrelated active downloads.
4. Verify the candidate is a real PDF before moving it:

```bash
file <candidate.pdf>
pdfinfo <candidate.pdf>
```

5. Save to the local paper workflow:

```text
<inbox-root>/xxx/xxx.pdf
```

6. Report the final path and verification result.

## Notes

- ACM may show `PDF/eReader`, `Download PDF`, `/doi/pdf/<doi>?download=true`, and `/doi/epdf/<doi>` controls. Treat these as user-facing instructions, not automation targets.
- If the user already downloaded the ACM PDF, do not reopen ACM unless needed to confirm metadata.
- If no matching PDF is found, ask the user for the downloaded filename or to download it again.
