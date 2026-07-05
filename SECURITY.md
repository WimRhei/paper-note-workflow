# Security

This project is a Codex and Obsidian workflow for local paper-note drafting, reading, and archiving.

## Reporting

Report security issues through GitHub issues unless the repository owner enables private vulnerability reporting. Do not include private PDFs, unpublished papers, credentials, access tokens, cookies, or institutional login details in public reports.

## Scope

Relevant issues include:

- Command injection or path handling bugs.
- Accidental leakage of local file paths, credentials, tokens, or private paper content.
- Unsafe handling of untrusted PDFs or extracted text/figure files.

Third-party vulnerabilities in PDF extraction tools, Java runtimes, build tools, or their dependencies should be reported upstream to the relevant project. This repository does not bundle or redistribute those tools.

## Supported versions

Only the latest GitHub release and the `main` branch are actively maintained.
