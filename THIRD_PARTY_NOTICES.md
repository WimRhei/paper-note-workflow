# Third-party Notices

This repository's own skill files, scripts, and documentation are licensed under the MIT License in `LICENSE`.

The project also downloads, builds, wraps, or redistributes third-party components. Those components remain under their own licenses.

## PDFFigures 2.0

- Source: <https://github.com/allenai/pdffigures2>
- Use: figure, table, and caption extraction from PDF files.
- License: Apache License 2.0.
- Included artifact: GitHub Releases for this repository may include `pdffigures2-assembly.jar`, built from upstream PDFFigures 2.0.
- License copy: `third_party/licenses/pdffigures2-LICENSE.txt`.

## poppler-windows and Poppler

- Source: <https://github.com/oschwartz10612/poppler-windows>
- Use: Windows Poppler binaries, including `pdftotext.exe`, when no local `pdftotext` is found.
- License notes: the poppler-windows packaging repository is MIT licensed. The downloaded archive contains Poppler and dependencies, which may carry their own licenses. Keep and review the license files included in the downloaded archive.
- This repository does not currently redistribute Poppler binaries in git or release assets; `bootstrap-windows.ps1` downloads them when needed.

## Eclipse Temurin

- Source: <https://projects.eclipse.org/projects/adoptium.temurin>
- Use: portable Java runtime when no local Java runtime is found.
- License notes: Temurin binaries are distributed under multiple open-source licenses. Review the license and NOTICE files included in the downloaded runtime archive.
- This repository does not currently redistribute Temurin binaries in git or release assets; `bootstrap-windows.ps1` downloads them when needed.

This repository is not affiliated with Allen Institute for AI, Poppler, conda-forge, oschwartz10612/poppler-windows, Eclipse Foundation, or Adoptium.
