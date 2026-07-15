# Workflow

The workflow has four stages: download/prepare, draft, read, archive.

## Download / Prepare

Run `paper-downloader` before drafting when the PDF is not already in the Inbox contract.

The downloader should:

1. resolve the paper title, DOI, arXiv ID, or publisher page;
2. require the user-selected `Algorithm` or `Architecture` reading route without inferring it from the paper;
3. choose the short archive name `xxx`;
4. create or reuse `论文阅读/Inbox/xxx/`;
5. place the verified PDF at `论文阅读/Inbox/xxx/xxx.pdf`;
6. write the normalized reading route to `论文阅读/Inbox/xxx/route.txt`;
7. stop without creating `xxx.md`, `xxx-naive.md`, `xxx.txt`, `Figure/`, or `pdffigures2/`.

Source routes:

- arXiv: direct PDF download.
- IEEE: browser-based download with institutional access when needed.
- ACM: manual handoff only. The user downloads the PDF; Codex locates, moves, and verifies it.

The result should be:

```text
Inbox/xxx/
  xxx.pdf
  route.txt
```

## Draft

Run `paper-note-drafter` on a paper PDF.

The drafter should:

1. inherit a valid `route.txt` from the downloader, or require an explicit `Algorithm` or `Architecture` reading route for a bare PDF; never infer it from the paper;
2. reuse an existing `Inbox/xxx/xxx.pdf` folder and prefix, or choose `xxx` only for a bare PDF;
3. place or reuse the PDF at `Inbox/xxx/xxx.pdf`;
4. preserve or write the normalized user reading route at `Inbox/xxx/route.txt`;
5. extract text to `Inbox/xxx/xxx.txt`;
6. extract candidate figures/tables to a temporary `Inbox/xxx/pdffigures2/`;
7. copy only selected figures/tables into `Inbox/xxx/Figure/`;
8. write the first draft to both `xxx-naive.md` and `xxx.md`;
9. delete temporary extraction outputs before handoff.

The result should be:

```text
Inbox/xxx/
  xxx.md
  xxx-naive.md
  xxx.pdf
  xxx.txt
  route.txt
  Figure/
    xxx-1.png
```

## Read

Run `paper-note-reader` while the paper is still in `Inbox/xxx/`.

The reader should:

- edit `xxx.md` directly;
- leave `xxx-naive.md` unchanged;
- use `xxx.txt` or `xxx.pdf` for source verification;
- read the reading route only from `route.txt` and stop for missing or invalid content;
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
Inbox/xxx/route.txt
```

It also removes unreferenced temporary files and cleans up empty Inbox directories when possible.

## Boundary

Before archive, `xxx-naive.md`, `xxx.txt`, and `route.txt` are useful and should remain available.

After archive, the knowledge base should keep only:

- the final note;
- the source PDF;
- figures and tables referenced by the final note.
