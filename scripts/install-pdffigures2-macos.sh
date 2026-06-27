#!/usr/bin/env bash
set -euo pipefail

script_dir="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
skill_root="$(CDPATH= cd -- "$script_dir/.." && pwd)"
bin_dir="$skill_root/.tools/bin"
jar_path="$skill_root/.tools/pdffigures2/pdffigures2-assembly.jar"
cmd_path="$bin_dir/pdffigures2"

if [[ ! -f "$jar_path" ]]; then
  echo "Missing pdffigures2 assembly jar:" >&2
  echo "  $jar_path" >&2
  echo "Build it first:" >&2
  echo "  ./scripts/build-pdffigures2-macos.sh" >&2
  exit 1
fi

mkdir -p "$bin_dir"

cat > "$cmd_path" <<'LAUNCHER'
#!/usr/bin/env bash
set -euo pipefail

cmd_dir="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
jar_path="$cmd_dir/../pdffigures2/pdffigures2-assembly.jar"

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

if [[ ! -f "$jar_path" ]]; then
  echo "pdffigures2 assembly jar not found:" >&2
  echo "  $jar_path" >&2
  exit 1
fi

java_cmd="$(resolve_java || true)"
if [[ -z "$java_cmd" ]]; then
  echo "No runnable Java runtime was found." >&2
  echo "Install one with: brew install openjdk@17" >&2
  exit 1
fi

if [[ $# -eq 0 ]]; then
  exec "$java_cmd" -Djava.awt.headless=true -jar "$jar_path"
fi

args=()
positionals=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dpi|-i|--threads|-t|--save-stats|-s|--figure-data-prefix|-d|--full-text-prefix|-g|--figure-prefix|-m|--figure-format|-f)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for $1" >&2
        exit 2
      fi
      args+=("$1" "$2")
      shift 2
      ;;
    --ignore-error|-e|--quiet|-q|--save-regionless-captions|-c)
      args+=("$1")
      shift
      ;;
    --)
      shift
      while [[ $# -gt 0 ]]; do
        positionals+=("$1")
        shift
      done
      ;;
    -*)
      args+=("$1")
      shift
      ;;
    *)
      positionals+=("$1")
      shift
      ;;
  esac
done

if [[ "${#positionals[@]}" -eq 2 ]]; then
  input="${positionals[0]}"
  output_dir="${positionals[1]}"
  mkdir -p "$output_dir"
  exec "$java_cmd" -Djava.awt.headless=true -jar "$jar_path" \
    "${args[@]}" \
    --save-stats "$output_dir/stats.json" \
    --figure-data-prefix "$output_dir/data-" \
    --figure-prefix "$output_dir/img-" \
    "$input"
fi

exec "$java_cmd" -Djava.awt.headless=true -jar "$jar_path" "${args[@]}" "${positionals[@]}"
LAUNCHER

chmod +x "$cmd_path"

echo "Installed pdffigures2 command:"
echo "  $cmd_path"
echo ""
echo "For this shell session, run:"
echo "  export PATH=\"$bin_dir:\$PATH\""
