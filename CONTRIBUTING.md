# Contributing

Contributions are welcome through GitHub issues and pull requests.

## Before opening a PR

- Keep the skill folder usable as a Codex skill.
- Keep Windows behavior working unless the change is explicitly platform-specific.
- Do not commit downloaded tools, generated `.tools` contents, release artifacts, logs, private PDFs, or paper notes containing non-public content.
- Update `README.md` and `THIRD_PARTY_NOTICES.md` when a change adds or changes third-party tools.
- Prefer small, focused changes with a clear reason.

## Validation

Run these checks before submitting:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-windows.ps1
```

For script edits, also parse PowerShell files:

```powershell
$files = Get-ChildItem -LiteralPath .\scripts -Filter *.ps1
foreach ($f in $files) {
  $null = [scriptblock]::Create((Get-Content -LiteralPath $f.FullName -Raw))
  Write-Host "OK $($f.Name)"
}
```

## Third-party components

Do not vendor third-party binaries into git. If a release asset redistributes third-party code, include the relevant license notice in `THIRD_PARTY_NOTICES.md` and place license copies under `third_party/licenses/` when appropriate.
