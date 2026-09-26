#!/usr/bin/env bash
set -euo pipefail

DOCKERFILE="${DOCKERFILE:-docker/Dockerfile}"
CONTEXT_DIR="${CONTEXT_DIR:-.}"

ECR_REGISTRY="${ECR_REGISTRY:?missing ECR_REGISTRY (ex: 123.dkr.ecr.us-east-1.amazonaws.com)}"
TAG="${TAG:-$(git rev-parse HEAD)}"
RELEASE_VERSION="${RELEASE_VERSION:-$TAG}"

ECR_REPOSITORY_API="${ECR_REPOSITORY_API:-fossa-orchestrator-api}"
ECR_REPOSITORY_WEBHOOKS="${ECR_REPOSITORY_WEBHOOKS:-fossa-orchestrator-webhook}"
ECR_REPOSITORY_WORKER="${ECR_REPOSITORY_WORKER:-fossa-orchestrator-worker}"

echo "Building targets from $DOCKERFILE (tag=$TAG)"

docker build \
  --build-arg RELEASE_VERSION="$RELEASE_VERSION" \
  -f "$DOCKERFILE" \
  --target api \
  -t "$ECR_REGISTRY/$ECR_REPOSITORY_API:$TAG" \
  "$CONTEXT_DIR"

docker build \
  --build-arg RELEASE_VERSION="$RELEASE_VERSION" \
  -f "$DOCKERFILE" \
  --target webhooks \
  -t "$ECR_REGISTRY/$ECR_REPOSITORY_WEBHOOKS:$TAG" \
  "$CONTEXT_DIR"

docker build \
  --build-arg RELEASE_VERSION="$RELEASE_VERSION" \
  -f "$DOCKERFILE" \
  --target worker \
  -t "$ECR_REGISTRY/$ECR_REPOSITORY_WORKER:$TAG" \
  "$CONTEXT_DIR"

echo "Built:"
echo " - $ECR_REGISTRY/$ECR_REPOSITORY_API:$TAG"
echo " - $ECR_REGISTRY/$ECR_REPOSITORY_WEBHOOKS:$TAG"
echo " - $ECR_REGISTRY/$ECR_REPOSITORY_WORKER:$TAG"
