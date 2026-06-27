# Contributing

Contributions are welcome through GitHub issues and pull requests.

## Before opening a PR

- Keep the skill folder usable as a Codex skill.
- Keep platform-specific setup behavior working unless the change intentionally narrows platform support.
- Do not commit downloaded tools, generated `.tools` contents, release artifacts, logs, private PDFs, or paper notes containing non-public content.
- Update `README.md` and `THIRD_PARTY_NOTICES.md` when a change adds or changes third-party tools.
- Prefer small, focused changes with a clear reason.

## Validation

Run the relevant verification flow documented in `README.md` before submitting. For script edits, also run the relevant syntax checks locally.

## Third-party components

Do not vendor third-party binaries into git. If a release asset redistributes third-party code, include the relevant license notice in `THIRD_PARTY_NOTICES.md` and place license copies under `third_party/licenses/` when appropriate.
