#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:?missing AWS_REGION}"
ECR_REGISTRY="${ECR_REGISTRY:?missing ECR_REGISTRY (ex: 123.dkr.ecr.us-east-1.amazonaws.com)}"
TAG="${TAG:-$(git rev-parse HEAD)}"

ECR_REPOSITORY_API="${ECR_REPOSITORY_API:-fossa-orchestrator-api}"
ECR_REPOSITORY_WEBHOOKS="${ECR_REPOSITORY_WEBHOOKS:-fossa-orchestrator-webhook}"
ECR_REPOSITORY_WORKER="${ECR_REPOSITORY_WORKER:-fossa-orchestrator-worker}"

aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

docker push "$ECR_REGISTRY/$ECR_REPOSITORY_API:$TAG"
docker push "$ECR_REGISTRY/$ECR_REPOSITORY_WEBHOOKS:$TAG"
docker push "$ECR_REGISTRY/$ECR_REPOSITORY_WORKER:$TAG"

echo "Pushed:"
echo " - $ECR_REGISTRY/$ECR_REPOSITORY_API:$TAG"
echo " - $ECR_REGISTRY/$ECR_REPOSITORY_WEBHOOKS:$TAG"
echo " - $ECR_REGISTRY/$ECR_REPOSITORY_WORKER:$TAG"
