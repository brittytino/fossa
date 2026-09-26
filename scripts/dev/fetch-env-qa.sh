#!/usr/bin/env bash

ENVIRONMENT=$1

# Lista de todas as chaves que você precisa
KEYS=(
    "/qa/fossa-orchestrator/API_HOST"
    "/qa/fossa-orchestrator/API_PORT"
    "/qa/fossa-orchestrator/API_RATE_MAX_REQUEST"
    "/qa/fossa-orchestrator/API_RATE_INTERVAL"

    "/qa/fossa-orchestrator/API_JWT_EXPIRES_IN"
    "/qa/fossa-orchestrator/API_JWT_SECRET"
    "/qa/fossa-orchestrator/API_JWT_REFRESH_EXPIRES_IN"

    "/qa/fossa-orchestrator/API_PG_DB_HOST"
    "/qa/fossa-orchestrator/API_PG_DB_PORT"
    "/qa/fossa-orchestrator/API_PG_DB_USERNAME"
    "/qa/fossa-orchestrator/API_PG_DB_PASSWORD"
    "/qa/fossa-orchestrator/API_PG_DB_DATABASE"

    "/qa/fossa-orchestrator/API_MG_DB_HOST"
    "/qa/fossa-orchestrator/API_MG_DB_PORT"
    "/qa/fossa-orchestrator/API_MG_DB_USERNAME"
    "/qa/fossa-orchestrator/API_MG_DB_PASSWORD"
    "/qa/fossa-orchestrator/API_MG_DB_DATABASE"
    "/qa/fossa-orchestrator/API_MG_DB_PRODUCTION_CONFIG"

    "/qa/fossa-orchestrator/API_OPEN_AI_API_KEY"
    "/qa/fossa-orchestrator/API_RABBITMQ_URI"
    "/qa/fossa-orchestrator/API_RABBITMQ_ENABLED"

    "/qa/fossa-orchestrator/API_GITHUB_APP_ID"
    "/qa/fossa-orchestrator/GLOBAL_GITHUB_CLIENT_ID"
    "/qa/fossa-orchestrator/API_GITHUB_CLIENT_SECRET"
    "/qa/fossa-orchestrator/API_GITHUB_PRIVATE_KEY"
    "/qa/fossa-orchestrator/GLOBAL_GITHUB_REDIRECT_URI"

    "/qa/fossa-orchestrator/GLOBAL_GITLAB_CLIENT_ID"
    "/qa/fossa-orchestrator/GLOBAL_GITLAB_CLIENT_SECRET"
    "/qa/fossa-orchestrator/GLOBAL_GITLAB_REDIRECT_URL"
    "/qa/fossa-orchestrator/API_GITLAB_TOKEN_URL"

    "/qa/fossa-orchestrator/API_GITLAB_CODE_MANAGEMENT_WEBHOOK"
    "/qa/fossa-orchestrator/API_GITHUB_CODE_MANAGEMENT_WEBHOOK"

    "/qa/fossa-orchestrator/LANGFUSE_TRACING"
    "/qa/fossa-orchestrator/LANGFUSE_PUBLIC_KEY"
    "/qa/fossa-orchestrator/LANGFUSE_SECRET_KEY"
    "/qa/fossa-orchestrator/LANGFUSE_BASE_URL"
    "/qa/fossa-orchestrator/LANGFUSE_ENVIRONMENT"

    "/qa/fossa-orchestrator/API_BETTERSTACK_DSN"

    "/qa/fossa-orchestrator/API_CRON_SYNC_CODE_REVIEW_REACTIONS"
    "/qa/fossa-orchestrator/API_CRON_FOSSY_LEARNING"
    "/qa/fossa-orchestrator/API_CRON_CHECK_IF_PR_SHOULD_BE_APPROVED"
    "/qa/fossa-orchestrator/API_CRON_SSO_TEST_SESSION_CLEANUP"
    "/qa/fossa-orchestrator/API_CRON_WEEKLY_RECAP"

    "/qa/fossa-orchestrator/FOSSA_SERVICE_TEAMS"

    "/qa/fossa-orchestrator/FOSSA_SERVICE_AZURE_REPOS"

    "/qa/fossa-orchestrator/RESEND_API_KEY"
    "/qa/fossa-orchestrator/RESEND_WEBHOOK_SECRET"
    "/qa/fossa-orchestrator/API_USER_INVITE_BASE_URL"

    "/qa/fossa-orchestrator/API_AWS_REGION"
    "/qa/fossa-orchestrator/API_AWS_USERNAME"
    "/qa/fossa-orchestrator/API_AWS_PASSWORD"
    "/qa/fossa-orchestrator/API_AWS_BUCKET_NAME_ASSISTANT"

    "/qa/fossa-orchestrator/API_GOOGLE_AI_API_KEY"
    "/qa/fossa-orchestrator/API_ANTHROPIC_API_KEY"

    "/qa/fossa-orchestrator/N8N_WEBHOOK_URL"
    "/qa/fossa-orchestrator/API_SIGNUP_NOTIFICATION_WEBHOOK"
    "/qa/fossa-orchestrator/API_CRYPTO_KEY"

    "/qa/fossa-orchestrator/API_SEGMENT_KEY"

    "/qa/fossa-orchestrator/API_VERTEX_AI_API_KEY"
    "/qa/fossa-orchestrator/API_VERTEX_AI_LOCATION"
    "/qa/fossa-orchestrator/API_GOOGLE_AI_PROVIDER"

    "/qa/fossa-orchestrator/API_NOVITA_AI_API_KEY"

    "/qa/fossa-orchestrator/GLOBAL_BITBUCKET_CODE_MANAGEMENT_WEBHOOK"
    "/qa/fossa-orchestrator/BITBUCKET_RATE_GATE_MIN_INTERVAL_MS"

    "/qa/fossa-orchestrator/CODE_MANAGEMENT_SECRET"
    "/qa/fossa-orchestrator/CODE_MANAGEMENT_WEBHOOK_TOKEN"

    "/qa/fossa-orchestrator/GLOBAL_AZURE_REPOS_CODE_MANAGEMENT_WEBHOOK"

    "/qa/fossa-orchestrator/API_POSTHOG_KEY"

    "/qa/fossa-orchestrator/API_MCP_SERVER_ENABLED"
    "/qa/fossa-orchestrator/API_FOSSA_SERVICE_MCP_MANAGER"
    "/qa/fossa-orchestrator/API_FOSSA_MCP_SERVER_URL"

    "/qa/fossa-orchestrator/API_OPENROUTER_KEY"
    "/qa/fossa-orchestrator/API_LLM_TEMPERATURE_OVERRIDE"

    "/qa/fossa-orchestrator/API_URL"
    "/qa/fossa-orchestrator/API_FRONTEND_URL"

    "/qa/fossa-orchestrator/API_GROQ_BASE_URL"
    "/qa/fossa-orchestrator/API_GROQ_API_KEY"

    "/qa/fossa-orchestrator/GLOBAL_FOSSA_SERVICE_BILLING"

    "/qa/fossa-orchestrator/API_WEBHOOKS_PORT"

    "/qa/fossa-orchestrator/API_ECS_AGENT_URI"
    "/qa/fossa-orchestrator/API_WORKER_DRAIN_TIMEOUT_MS"


    "/qa/fossa-orchestrator/API_FIREWORKS_BASE_URL"
    "/qa/fossa-orchestrator/API_FIREWORKS_API_KEY"

    "/qa/fossa-orchestrator/API_DEEPSEEK_BASE_URL"
    "/qa/fossa-orchestrator/API_DEEPSEEK_API_KEY"

    "/qa/fossa-orchestrator/API_MORPHLLM_API_KEY"

    "/qa/fossa-orchestrator/API_E2B_KEY"
    "/qa/fossa-orchestrator/API_E2B_TEMPLATE_ID"

    "/qa/fossa-orchestrator/API_BETTERSTACK_API_TOKEN"
    "/qa/fossa-orchestrator/API_BETTERSTACK_HEARTBEAT_ERROR_RATE_URL"
    "/qa/fossa-orchestrator/API_BETTERSTACK_HEARTBEAT_REVIEW_MONITOR_URL"
    "/qa/fossa-orchestrator/API_BETTERSTACK_HEARTBEAT_OUTBOX_URL"
    "/qa/fossa-orchestrator/API_BETTERSTACK_HEARTBEAT_WEBHOOK_URL"

    "/qa/fossa-orchestrator/API_EXA_KEY"

    "/qa/fossa-orchestrator/WEB_HOSTNAME_HELPDESK"
    "/qa/fossa-orchestrator/WEB_PORT_HELPDESK"
    "/qa/fossa-orchestrator/API_JWT_PRIVATE_KEY"

    "/qa/fossa-orchestrator/API_BILLING_WEBHOOK_SECRET"
)

# Lista de todas as chaves que você precisa

ENV_FILE=".env.$ENVIRONMENT"

# Limpe o arquivo .env existente ou crie um novo
> $ENV_FILE

# Loop para buscar cada parâmetro
for KEY in "${KEYS[@]}"; do
  # Tenta obter o parâmetro, redirecionando mensagens de erro para /dev/null
  VALUE=$(aws ssm get-parameter --name "$KEY" --with-decryption --query "Parameter.Value" --output text 2>/dev/null)

  if [ -z "$VALUE" ] || [[ "$VALUE" == "ParameterNotFound" ]]; then
    # Se o comando não retornar valor, registra um aviso (pode ser logado ou mostrado no stderr)
    echo "WARNING: Parâmetro $KEY não encontrado." >&2
  else
    # Remove o caminho e escreve no arquivo .env
    echo "${KEY##*/}=$VALUE" >> "$ENV_FILE"
  fi
done

# API_JWT_REFRESH_SECRET: o código lê o nome com underscore
# (jwt.config.loader.ts), mas o parâmetro no SSM pode ainda usar o typo
# legado API_JWT_REFRESHSECRET. Tenta o nome canônico, cai pro legado,
# e sempre escreve a chave canônica — o .env precisa bater com o código.
REFRESH_SECRET=$(aws ssm get-parameter --name "/qa/fossa-orchestrator/API_JWT_REFRESH_SECRET" --with-decryption --query "Parameter.Value" --output text 2>/dev/null)
if [ -z "$REFRESH_SECRET" ] || [[ "$REFRESH_SECRET" == "ParameterNotFound" ]]; then
  REFRESH_SECRET=$(aws ssm get-parameter --name "/qa/fossa-orchestrator/API_JWT_REFRESHSECRET" --with-decryption --query "Parameter.Value" --output text 2>/dev/null)
fi
if [ -n "$REFRESH_SECRET" ] && [[ "$REFRESH_SECRET" != "ParameterNotFound" ]]; then
  echo "API_JWT_REFRESH_SECRET=$REFRESH_SECRET" >> "$ENV_FILE"
else
  echo "WARNING: API_JWT_REFRESH_SECRET não encontrado (nem o legado API_JWT_REFRESHSECRET)." >&2
fi
