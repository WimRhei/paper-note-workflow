#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/build-pdffigures2-macos.sh [--force] [--source-url URL] [--output-dir DIR]

Build pdffigures2 from upstream source on macOS and copy the assembly jar into
this skill's local .tools directory.
USAGE
}

force=0
source_url="https://github.com/allenai/pdffigures2.git"

script_dir="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
skill_root="$(CDPATH= cd -- "$script_dir/.." && pwd)"
output_dir="$skill_root/.tools/pdffigures2"
build_root="$skill_root/.tools/build"
src="$build_root/pdffigures2"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force)
      force=1
      shift
      ;;
    --source-url)
      source_url="${2:-}"
      if [[ -z "$source_url" ]]; then
        echo "Missing value for --source-url" >&2
        exit 2
      fi
      shift 2
      ;;
    --output-dir)
      output_dir="${2:-}"
      if [[ -z "$output_dir" ]]; then
        echo "Missing value for --output-dir" >&2
        exit 2
      fi
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

require_command() {
  local name="$1"
  if ! command -v "$name" >/dev/null 2>&1; then
    echo "$name is required on PATH." >&2
    exit 1
  fi
}

require_command git
require_command sbt

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

java_cmd="$(resolve_java || true)"
if [[ -z "$java_cmd" ]]; then
  echo "No runnable Java runtime was found." >&2
  echo "Install one with: brew install openjdk@17" >&2
  exit 1
fi

java_home="$(cd "$(dirname "$java_cmd")/.." && pwd)"

mkdir -p "$build_root" "$output_dir"

if [[ "$force" -eq 1 && -d "$src" ]]; then
  rm -rf "$src"
fi

if [[ ! -d "$src/.git" ]]; then
  git clone "$source_url" "$src"
else
  git -C "$src" pull --ff-only
fi

(
  cd "$src"
  export JAVA_HOME="$java_home"
  export PATH="$JAVA_HOME/bin:$PATH"
  sbt assembly
)

jar_path="$(
  find "$src" -type f -name '*.jar' ! -path '*/streams/*' -size +1M -print |
    awk '{ print length, $0 }' |
    sort -rn |
    head -n 1 |
    cut -d' ' -f2-
)"

if [[ -z "$jar_path" ]]; then
  echo "No runnable jar found under pdffigures2 target after sbt assembly." >&2
  exit 1
fi

out="$output_dir/pdffigures2-assembly.jar"
cp "$jar_path" "$out"

echo "Built pdffigures2 assembly jar:"
echo "  $out"
