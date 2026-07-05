# Third-party Notices

This repository's own code, Codex skills, Obsidian plugin files, and documentation are licensed under the MIT License in `LICENSE`.

The workflow depends on external tools that are not bundled, downloaded, built, or redistributed by this repository. Users are responsible for installing those tools and complying with their licenses.

## PDFFigures 2.0

- Source: <https://github.com/allenai/pdffigures2>
- Use: figure, table, and caption extraction from PDF files.
- License: Apache License 2.0.
- Repository status: not bundled and not redistributed here.

## Poppler / pdftotext

- Source: <https://poppler.freedesktop.org/>
- Use: `pdftotext` extracts plain text from PDF files.
- License notes: Poppler is distributed under its own license terms. This workflow invokes `pdftotext` as an external command.
- Repository status: not bundled and not redistributed here.

## Java Runtime

- Use: required by common `pdffigures2` distributions.
- License notes: the selected Java runtime distribution keeps its own license and notices.
- Repository status: not bundled and not redistributed here.

This repository is not affiliated with Allen Institute for AI, Poppler, Eclipse Foundation, Adoptium, OpenJDK, or other external tool maintainers.
