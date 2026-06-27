#!/usr/bin/env bash
set -euo pipefail

quiet=0
if [[ "${1:-}" == "--quiet" ]]; then
  quiet=1
elif [[ $# -gt 0 ]]; then
  echo "Usage: scripts/verify-macos.sh [--quiet]" >&2
  exit 2
fi

script_dir="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
skill_root="$(CDPATH= cd -- "$script_dir/.." && pwd)"
local_bin="$skill_root/.tools/bin"
export PATH="$local_bin:$PATH"

failed=()

resolve_java() {
  if [[ -n "${JAVA_CMD:-}" && -x "$JAVA_CMD" ]]; then
    echo "$JAVA_CMD"
    return 0
  fi

  if [[ -x "/opt/homebrew/opt/openjdk@17/bin/java" ]]; then
    echo "/opt/homebrew/opt/openjdk@17/bin/java"
    return 0
  fi

  if [[ -x "/usr/local/opt/openjdk@17/bin/java" ]]; then
    echo "/usr/local/opt/openjdk@17/bin/java"
    return 0
  fi

  if command -v java >/dev/null 2>&1 && java -version >/dev/null 2>&1; then
    command -v java
    return 0
  fi

  return 1
}

check_command() {
  local name="$1"
  if command -v "$name" >/dev/null 2>&1; then
    if [[ "$quiet" -eq 0 ]]; then
      echo "OK   $name: $(command -v "$name")"
    fi
  else
    failed+=("$name")
    if [[ "$quiet" -eq 0 ]]; then
      echo "MISS $name"
    fi
  fi
}

check_command pdftotext
check_command pdffigures2

java_cmd="$(resolve_java || true)"
if [[ -n "$java_cmd" ]]; then
  if [[ "$quiet" -eq 0 ]]; then
    echo "OK   java-runtime: $java_cmd"
  fi
else
  failed+=("java-runtime")
  if [[ "$quiet" -eq 0 ]]; then
    echo "MISS java-runtime"
  fi
fi

if [[ "${#failed[@]}" -gt 0 ]]; then
  if [[ "$quiet" -eq 0 ]]; then
    echo ""
    echo "Install macOS dependencies:"
    echo "  brew install poppler openjdk@17 sbt"
    echo ""
    echo "Build and install pdffigures2:"
    echo "  ./scripts/build-pdffigures2-macos.sh"
    echo "  ./scripts/install-pdffigures2-macos.sh"
    echo "  export PATH=\"$local_bin:\$PATH\""
  fi
  exit 1
fi

exit 0
