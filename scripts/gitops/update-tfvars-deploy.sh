#!/usr/bin/env bash
# Deploy: Atualiza as imagens para ECS Blue/Green nativo
set -euo pipefail

if [ "$#" -lt 4 ] || [ "$#" -gt 5 ]; then
  echo "Usage: $0 <tfvars-file> <api-image> <webhooks-image> <worker-image> [desired-count]" >&2
  exit 2
fi

FILE="$1"
API_IMAGE="$2"
WEBHOOKS_IMAGE="$3"
WORKER_IMAGE="$4"
DESIRED_COUNT="${5:-}" # compatibilidade, nao usado

if [ ! -f "$FILE" ]; then
  echo "Error: File not found: $FILE" >&2
  exit 1
fi

node - "$FILE" "$API_IMAGE" "$WEBHOOKS_IMAGE" "$WORKER_IMAGE" <<'NODE'
const fs = require('fs');
const file = process.argv[2];
const apiImage = process.argv[3];
const webhooksImage = process.argv[4];
const workerImage = process.argv[5];

try {
  const raw = fs.readFileSync(file, 'utf8');
  const obj = JSON.parse(raw);

  obj.api_image = apiImage;
  obj.webhook_image = webhooksImage;
  obj.worker_image = workerImage;

  // Remove variaveis legadas (se existirem)
  delete obj.api_active_side;
  delete obj.webhook_active_side;
  delete obj.api_green_image;
  delete obj.webhook_green_image;
  delete obj.api_green_desired_count;
  delete obj.webhook_green_desired_count;
  delete obj.api_green_weight;
  delete obj.webhook_green_weight;
  delete obj.api_blue_weight;
  delete obj.webhook_blue_weight;

  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n');
  console.log('✅ SUCCESS: Images updated for ECS Blue/Green.');
} catch (error) {
  console.error(`❌ ERROR: ${error.message}`);
  process.exit(1);
}
NODE
