# Third-party Notices

This repository's own skill files, scripts, and documentation are licensed under the MIT License in `LICENSE`.

The project also downloads, builds, wraps, or redistributes third-party components. Those components remain under their own licenses.

## PDFFigures 2.0

- Source: <https://github.com/allenai/pdffigures2>
- Use: figure, table, and caption extraction from PDF files.
- License: Apache License 2.0.
- Included artifact: GitHub Releases for this repository may include `pdffigures2-assembly.jar`, built from upstream PDFFigures 2.0.
- License copy: `third_party/licenses/pdffigures2-LICENSE.txt`.

## Poppler

- Source: <https://poppler.freedesktop.org/>
- Use: `pdftotext` for PDF text extraction.
- License notes: Poppler is GPL licensed. This skill calls `pdftotext` as an external command and does not link against Poppler libraries.
- This repository does not currently redistribute Poppler binaries in git or release assets.
- Keep and review any license files included with the installed Poppler distribution.

## Java runtimes

- Sources include Eclipse Temurin and OpenJDK distributions.
- Use: Java runtime for the `pdffigures2` command.
- License notes: Java runtime distributions are released under their own open-source licenses. Review the license and NOTICE files included with the installed runtime.
- This repository does not currently redistribute Java runtime binaries in git or release assets.

This repository is not affiliated with Allen Institute for AI, Poppler, conda-forge, Eclipse Foundation, Adoptium, or OpenJDK distribution maintainers.
