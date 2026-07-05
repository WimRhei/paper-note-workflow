#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat >&2 <<'EOF'
Usage:
  pdffigures2 [--dpi DPI] INPUT_PDF OUTPUT_DIR

Environment:
  PDFFIGURES2_JAR  Path to a locally built pdffigures2 standalone jar.

This is an adapter for Paper Note Workflow. It does not download or bundle
pdffigures2. Build or obtain pdffigures2 yourself, then point PDFFIGURES2_JAR
to that jar.
EOF
}

dpi="600"
positionals=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dpi|-i)
      [[ $# -ge 2 ]] || { echo "Missing value for $1" >&2; exit 2; }
      dpi="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      while [[ $# -gt 0 ]]; do
        positionals+=("$1")
        shift
      done
      ;;
    -*)
      echo "Unknown option: $1" >&2
      usage
      exit 2
      ;;
    *)
      positionals+=("$1")
      shift
      ;;
  esac
done

if [[ "${#positionals[@]}" -ne 2 ]]; then
  usage
  exit 2
fi

input_pdf="${positionals[0]}"
output_dir="${positionals[1]}"

if [[ -z "${PDFFIGURES2_JAR:-}" || ! -f "$PDFFIGURES2_JAR" ]]; then
  echo "Set PDFFIGURES2_JAR to your local pdffigures2 standalone jar." >&2
  exit 1
fi

mkdir -p "$output_dir"

exec java -Djava.awt.headless=true -jar "$PDFFIGURES2_JAR" \
  --dpi "$dpi" \
  --save-stats "$output_dir/stats.json" \
  --figure-data-prefix "$output_dir/data-" \
  --figure-prefix "$output_dir/img-" \
  "$input_pdf"
