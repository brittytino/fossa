#!/usr/bin/env bash
set -e

echo "🍞 Baking Production Images Locally (Docker Buildx Bake)..."

# Set default variables if not provided
export IMAGE_TAG="${IMAGE_TAG:-local}"
export API_CLOUD_MODE="${API_CLOUD_MODE:-true}"

# Ensure buildx builder exists and use it
if ! docker buildx inspect default > /dev/null 2>&1; then
    docker buildx create --use
fi

echo "📋 Configuration:"
echo "   RELEASE_VERSION: $IMAGE_TAG"
echo "   API_CLOUD_MODE: $API_CLOUD_MODE"

# Run docker buildx bake
# - override cache settings to local/none (remove cache-from/to logic from command line overrides or let HCL handle defaults)
# - use --load to import into local docker daemon
# - set args

docker buildx bake --no-cache -f docker-bake.hcl \
    --set base.args.RELEASE_VERSION="${IMAGE_TAG}" \
    --set base.args.API_CLOUD_MODE="${API_CLOUD_MODE}" \
    --set base.cache-from="" \
    --set base.cache-to="" \
    --load

echo "✅ Bake Complete! Images loaded to Docker."
echo "   fossa-ai-api:local"
echo "   fossa-ai-webhook:local"
echo "   fossa-ai-worker:local"
