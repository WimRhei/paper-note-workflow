# Arxiv Source Route

Use this source route when the target paper is available on arXiv and the user did not specifically require the publisher copy.

## Boundary

- No institution state is needed.
- Prefer direct PDF download over Chrome automation.
- Verify the abstract page title before saving the PDF.
- Stop only if the arXiv result is ambiguous or the title does not match.

## Workflow

1. Resolve the arXiv ID from the title, DOI, or search result.
2. Confirm the record once with the arXiv API or abstract metadata:
   - `https://export.arxiv.org/api/query?id_list=<id>`
   - `https://arxiv.org/abs/<id>`
   - Confirm the title and canonical PDF URL. Stop only if the result is ambiguous or mismatched.
3. Resolve the final path once and check whether it already exists:
   - Final: `<inbox-root>/xxx/xxx.pdf`
   - Temporary: `<inbox-root>/xxx/xxx.pdf.part`
   - If the final file already exists and passes one local verification, reuse it and do not download again.
4. Download only to the temporary file:

```bash
curl --fail --location --output "<inbox-root>/xxx/xxx.pdf.part" "https://arxiv.org/pdf/<id>"
```

   - Keep the complete command-tool response, including `session_id`; do not reduce it to stdout only.
   - If the command is still running, poll that same `session_id` until it exits.
   - Only one process may write the temporary path. Never launch another `curl` or `curl -C -` while the original session may still be active.
   - If `session_id` is lost, do not start another writer. First establish that the original process has exited; if that cannot be established, stop and report the blocked download.
   - Do not resume by default. After a confirmed nonzero exit, one `curl -C -` retry is allowed only when no writer remains and the existing `.part` file belongs to that failed attempt.
5. After the download process exits successfully, verify the temporary file exactly once:

```bash
file "<inbox-root>/xxx/xxx.pdf.part"
pdfinfo "<inbox-root>/xxx/xxx.pdf.part"
```

6. Only after verification passes, atomically rename the temporary file within the same directory:

```bash
mv "<inbox-root>/xxx/xxx.pdf.part" "<inbox-root>/xxx/xxx.pdf"
```

   - Do not expose a partial or failed download at the final path.
   - Do not repeat `file`, `pdfinfo`, directory scans, or status checks after a successful rename.

Minimum verification:

- PDF type/version.
- Page count.
- File size.
- Title metadata when available.
- `Encrypted: no` when `pdfinfo` reports it.

## Report

Report only the confirmed title and arXiv record, final local path, file size, page count, encryption status, and any required human intervention.

## Handoff

When the PDF is verified and the user wants a note, pass `<inbox-root>/xxx/xxx.pdf` to `paper-note-drafter`.
