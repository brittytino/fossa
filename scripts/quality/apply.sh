#!/usr/bin/env bash
# Applies scripts/quality/signals.sql to fossy-408918.quality. Idempotent.
#   bash scripts/quality/apply.sh
set -euo pipefail
cd "$(dirname "$0")"
bq query --project_id=fossy-408918 --location=northamerica-northeast1 --use_legacy_sql=false --nouse_cache < signals.sql
bq show --project_id=fossy-408918 quality.signals | head -20
