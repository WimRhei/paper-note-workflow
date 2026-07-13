# Workflow

The workflow has four stages: download/prepare, draft, read, archive.

## Download / Prepare

Run `paper-downloader` before drafting when the PDF is not already in the Inbox contract.

The downloader should:

1. resolve the paper title, DOI, arXiv ID, or publisher page;
2. choose the short archive name `xxx`;
3. create or reuse `论文阅读/Inbox/xxx/`;
4. place the verified PDF at `论文阅读/Inbox/xxx/xxx.pdf`;
5. stop without creating `xxx.md`, `xxx-naive.md`, `xxx.txt`, `Figure/`, or `pdffigures2/`.

Source routing:

- arXiv: direct PDF download.
- IEEE: browser-based download with institutional access when needed.
- ACM: manual handoff only. The user downloads the PDF; Codex locates, moves, and verifies it.

The result should be:

```text
Inbox/xxx/
  xxx.pdf
```

## Draft

Run `paper-note-drafter` on a paper PDF.

The drafter should:

1. choose a short archive name `xxx`;
2. create `Inbox/xxx/`;
3. place or reuse the PDF at `Inbox/xxx/xxx.pdf`;
4. extract text to `Inbox/xxx/xxx.txt`;
5. extract candidate figures/tables to a temporary `Inbox/xxx/pdffigures2/`;
6. copy only selected figures/tables into `Inbox/xxx/Figure/`;
7. write the first draft to both `xxx-naive.md` and `xxx.md`;
8. delete temporary extraction outputs before handoff.

The result should be:

```text
Inbox/xxx/
  xxx.md
  xxx-naive.md
  xxx.pdf
  xxx.txt
  Figure/
    xxx-1.png
```

## Read

Run `paper-note-reader` while the paper is still in `Inbox/xxx/`.

The reader should:

- edit `xxx.md` directly;
- leave `xxx-naive.md` unchanged;
- use `xxx.txt` or `xxx.pdf` for source verification;
- preserve figures and their `Figure/xxx-N.ext` references;
- compare `xxx-naive.md` and `xxx.md` during final diff review when asked.

This stage ends when `xxx.md` is accepted as the final note.

## Archive

Run the Obsidian `paper-archiver` plugin.

The plugin scans `Inbox/` for subfolders where the folder name and Markdown name match:

```text
Inbox/xxx/xxx.md
```

For each selected paper, choose a target topic. The plugin writes:

```text
<topic>/
  xxx.md
  PDF/
    xxx.pdf
  Figure/
    xxx-1.png
```

The plugin removes review artifacts:

```text
Inbox/xxx/xxx-naive.md
Inbox/xxx/xxx.txt
```

It also removes unreferenced temporary files and cleans up empty Inbox directories when possible.

## Boundary

Before archive, `xxx-naive.md` and `xxx.txt` are useful and should remain available.

After archive, the knowledge base should keep only:

- the final note;
- the source PDF;
- figures and tables referenced by the final note.
