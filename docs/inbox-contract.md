# Inbox Contract

The Inbox paper folder is the interface between `paper-downloader`, `paper-note-drafter`, `paper-note-reader`, and `paper-archiver`.

## Folder Shape

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

`xxx` should be a short paper, system, method, or artifact name. Avoid spaces when possible.

## Required Files

Before drafting, `paper-downloader` may create only:

```text
Inbox/xxx/
  xxx.pdf
```

After drafting, the complete review folder is:

`xxx.md`

The current working note. This is the only Markdown note preserved after archive.

`xxx-naive.md`

The first generated draft. It is used for review and diff analysis. It is deleted by the archiver.

`xxx.pdf`

The source paper. It is prepared by `paper-downloader`, consumed by `paper-note-drafter`, used for verification by `paper-note-reader`, and moved to `<topic>/PDF/xxx.pdf` by the archiver.

`xxx.txt`

Text extracted from the PDF. It is used for source verification during drafting and reading. It is deleted by the archiver.

`Figure/`

Final selected figures and tables. Files must be referenced by `xxx.md`.

## Figure Rules

Use this form in Markdown:

```markdown
![Figure 1: short caption](Figure/xxx-1.png)
```

Rules:

- use the same `xxx` prefix as the note;
- number files by first appearance in the note;
- keep the real extension, such as `.png`, `.jpg`, or `.webp`;
- do not reference `pdffigures2/`, raw `img-*` files, or extraction metadata.

## Temporary Files

These may exist during drafting:

```text
Inbox/xxx/pdffigures2/
Inbox/xxx/pdffigures2/data-xxx.json
Inbox/xxx/pdffigures2/stats.json
Inbox/xxx/pdffigures2/img-*
```

They should be deleted before handoff. If they remain, `paper-archiver` treats unreferenced temporary files as cleanup candidates.

## Archive Output

After archive:

```text
<topic>/
  xxx.md
  PDF/
    xxx.pdf
  Figure/
    xxx-1.png
    xxx-2.png
```

Not preserved after archive:

```text
xxx-naive.md
xxx.txt
```
