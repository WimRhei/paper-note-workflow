# Security

This project is a Codex skill and Windows bootstrap workflow for local PDF processing.

## Reporting

Report security issues through GitHub issues unless the repository owner enables private vulnerability reporting. Do not include private PDFs, unpublished papers, credentials, access tokens, cookies, or institutional login details in public reports.

## Scope

Relevant issues include:

- Unsafe download or extraction behavior in bootstrap scripts.
- Command injection or path handling bugs.
- Accidental leakage of local file paths, credentials, tokens, or private paper content.
- Supply-chain risks in release asset generation.

Third-party vulnerabilities in Poppler, PDFFigures 2.0, Java, sbt, or their dependencies should also be reported upstream to the relevant project.

## Supported versions

Only the latest GitHub release and the `main` branch are actively maintained.
