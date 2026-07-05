# Contributing

Contributions are welcome through GitHub issues and pull requests.

## Before opening a PR

- Keep each skill folder usable as a Codex skill.
- Keep the Obsidian plugin installable from `obsidian-plugins/paper-archiver/`.
- Do not commit downloaded tools, generated `.tools` contents, release artifacts, logs, private PDFs, or paper notes containing non-public content.
- Update `README.md` and `THIRD_PARTY_NOTICES.md` when a change adds or changes third-party tools.
- Prefer small, focused changes with a clear reason.

## Validation

Run the relevant verification flow documented in `README.md` before submitting. For plugin edits, run JavaScript syntax checks locally.

## Third-party components

Do not vendor third-party binaries into git. If the repository ever starts redistributing third-party code or binaries, include the relevant license notices in `THIRD_PARTY_NOTICES.md` and add license copies where appropriate.
