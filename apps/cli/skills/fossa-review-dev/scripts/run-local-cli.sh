#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "${script_dir}/../../.." && pwd)"

entrypoint="${FOSSA_CLI_ENTRYPOINT:-${repo_root}/dist/index.js}"
api_url="${FOSSA_API_URL:-http://localhost:3001}"
verbose="${FOSSA_VERBOSE:-1}"

print_help() {
  cat <<EOF
Run the local Fossa CLI build from this repository.

Usage:
  $(basename "$0") <command> [args...]

Environment:
  FOSSA_API_URL         Defaults to http://localhost:3001
  FOSSA_VERBOSE         Defaults to 1
  FOSSA_CLI_ENTRYPOINT  Defaults to <repo>/dist/index.js

Examples:
  $(basename "$0") --help
  $(basename "$0") auth status
  $(basename "$0") review --prompt-only
EOF
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  print_help
  exit 0
fi

if [[ $# -eq 0 ]]; then
  print_help
  exit 1
fi

if [[ ! -f "$entrypoint" ]]; then
  echo "Local Fossa CLI entrypoint not found: $entrypoint" >&2
  echo "Run 'npm run build' in ${repo_root} or set FOSSA_CLI_ENTRYPOINT." >&2
  exit 1
fi

exec env \
  FOSSA_API_URL="$api_url" \
  FOSSA_VERBOSE="$verbose" \
  node "$entrypoint" "$@"
