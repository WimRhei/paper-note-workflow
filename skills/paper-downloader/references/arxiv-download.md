# Arxiv Download Route

Use this route when the target paper is available on arXiv and the user did not specifically require the publisher copy.

## Boundary

- No institution state is needed.
- Prefer direct PDF download over Chrome automation.
- Verify the abstract page title before saving the PDF.
- Stop only if the arXiv result is ambiguous or the title does not match.

## Workflow

1. Resolve the arXiv ID from the title, DOI, or search result.
2. Verify the abstract page:
   - `https://arxiv.org/abs/<id>`
   - Confirm title, authors, and PDF URL metadata.
3. Download:
   - `https://arxiv.org/pdf/<id>`
4. Save to the local paper workflow:
   - `/Users/wimrhei/arch-research/论文阅读/Inbox/xxx/xxx.pdf`
5. Verify locally:

```bash
file /Users/wimrhei/arch-research/论文阅读/Inbox/xxx/xxx.pdf
pdfinfo /Users/wimrhei/arch-research/论文阅读/Inbox/xxx/xxx.pdf
```

Minimum verification:

- PDF type/version.
- Page count.
- File size.
- Title metadata when available.
- `Encrypted: no` when `pdfinfo` reports it.

## Handoff

When the PDF is verified and the user wants a note, pass `/Users/wimrhei/arch-research/论文阅读/Inbox/xxx/xxx.pdf` to `paper-note-drafter`.
