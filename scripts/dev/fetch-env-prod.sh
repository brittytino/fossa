#!/usr/bin/env bash

ENVIRONMENT=$1

# Lista de todas as chaves que você precisa
KEYS=(
    "/prod/fossa-orchestrator/API_HOST"
    "/prod/fossa-orchestrator/API_PORT"
    "/prod/fossa-orchestrator/API_RATE_MAX_REQUEST"
    "/prod/fossa-orchestrator/API_RATE_INTERVAL"

    "/prod/fossa-orchestrator/API_JWT_EXPIRES_IN"
    "/prod/fossa-orchestrator/API_JWT_SECRET"
    "/prod/fossa-orchestrator/API_JWT_REFRESH_EXPIRES_IN"

    "/prod/fossa-orchestrator/API_PG_DB_HOST"
    "/prod/fossa-orchestrator/API_PG_DB_PORT"
    "/prod/fossa-orchestrator/API_PG_DB_USERNAME"
    "/prod/fossa-orchestrator/API_PG_DB_PASSWORD"
    "/prod/fossa-orchestrator/API_PG_DB_DATABASE"

    "/prod/fossa-orchestrator/API_MG_DB_HOST"
    "/prod/fossa-orchestrator/API_MG_DB_PORT"
    "/prod/fossa-orchestrator/API_MG_DB_USERNAME"
    "/prod/fossa-orchestrator/API_MG_DB_PASSWORD"
    "/prod/fossa-orchestrator/API_MG_DB_DATABASE"
    "/prod/fossa-orchestrator/API_MG_DB_PRODUCTION_CONFIG"

    "/prod/fossa-orchestrator/API_OPEN_AI_API_KEY"
    "/prod/fossa-orchestrator/API_RABBITMQ_URI"
    "/prod/fossa-orchestrator/API_RABBITMQ_ENABLED"

    "/prod/fossa-orchestrator/GLOBAL_JIRA_CLIENT_ID"
    "/prod/fossa-orchestrator/GLOBAL_JIRA_REDIRECT_URI"
    "/prod/fossa-orchestrator/API_JIRA_CLIENT_SECRET"
    "/prod/fossa-orchestrator/API_JIRA_BASE_URL"
    "/prod/fossa-orchestrator/API_JIRA_MID_URL"
    "/prod/fossa-orchestrator/API_JIRA_OAUTH_TOKEN_URL"
    "/prod/fossa-orchestrator/API_JIRA_GET_PERSONAL_PROFILE_URL"
    "/prod/fossa-orchestrator/API_JIRA_OAUTH_API_TOKEN_URL"
    "/prod/fossa-orchestrator/API_JIRA_URL_API_VERSION_1"
    "/prod/fossa-orchestrator/JIRA_URL_TO_WEBHOOK"

    "/prod/fossa-orchestrator/API_GITHUB_APP_ID"
    "/prod/fossa-orchestrator/GLOBAL_GITHUB_CLIENT_ID"
    "/prod/fossa-orchestrator/API_GITHUB_CLIENT_SECRET"
    "/prod/fossa-orchestrator/API_GITHUB_PRIVATE_KEY"
    "/prod/fossa-orchestrator/GLOBAL_GITHUB_REDIRECT_URI"

    "/prod/fossa-orchestrator/GLOBAL_GITLAB_CLIENT_ID"
    "/prod/fossa-orchestrator/GLOBAL_GITLAB_CLIENT_SECRET"
    "/prod/fossa-orchestrator/GLOBAL_GITLAB_REDIRECT_URL"
    "/prod/fossa-orchestrator/API_GITLAB_TOKEN_URL"

    "/prod/fossa-orchestrator/API_GITLAB_CODE_MANAGEMENT_WEBHOOK"
    "/prod/fossa-orchestrator/API_GITHUB_CODE_MANAGEMENT_WEBHOOK"

    "/prod/fossa-orchestrator/API_SLACK_CLIENT_ID"
    "/prod/fossa-orchestrator/API_SLACK_CLIENT_SECRET"
    "/prod/fossa-orchestrator/API_SLACK_SIGNING_SECRET"
    "/prod/fossa-orchestrator/API_SLACK_APP_TOKEN"
    "/prod/fossa-orchestrator/API_SLACK_BOT_TOKEN"
    "/prod/fossa-orchestrator/API_SLACK_URL_HEALTH"
    "/prod/fossa-orchestrator/API_SLACK_BOT_DIAGNOSIS_URL"

    "/prod/fossa-orchestrator/LANGFUSE_TRACING"
    "/prod/fossa-orchestrator/LANGFUSE_PUBLIC_KEY"
    "/prod/fossa-orchestrator/LANGFUSE_SECRET_KEY"
    "/prod/fossa-orchestrator/LANGFUSE_BASE_URL"
    "/prod/fossa-orchestrator/LANGFUSE_ENVIRONMENT"

    "/prod/fossa-orchestrator/API_BETTERSTACK_DSN"

    "/prod/fossa-orchestrator/API_CRON_AUTOMATION_INTERACTION_MONITOR"
    "/prod/fossa-orchestrator/API_CRON_AUTOMATION_TEAM_PROGRESS_TRACKER"
    "/prod/fossa-orchestrator/API_CRON_METRICS"
    "/prod/fossa-orchestrator/API_CRON_AUTOMATION_ISSUES_DETAILS"
    "/prod/fossa-orchestrator/CRON_TEAM_ARTIFACTS"
    "/prod/fossa-orchestrator/API_CRON_TEAM_ARTIFACTS_WEEKLY"
    "/prod/fossa-orchestrator/API_CRON_TEAM_ARTIFACTS_DAILY"
    "/prod/fossa-orchestrator/API_CRON_COMPILE_SPRINT"
    "/prod/fossa-orchestrator/API_CRON_SPRINT_RETRO"
    "/prod/fossa-orchestrator/API_CRON_ORGANIZATION_METRICS"
    "/prod/fossa-orchestrator/API_CRON_ORGANIZATION_ARTIFACTS_WEEKLY"
    "/prod/fossa-orchestrator/API_CRON_ORGANIZATION_ARTIFACTS_DAILY"
    "/prod/fossa-orchestrator/API_CRON_ENRICH_TEAM_ARTIFACTS_WEEKLY"
    "/prod/fossa-orchestrator/API_CRON_AUTOMATION_EXECUTIVE_CHECKIN"
    "/prod/fossa-orchestrator/API_CRON_SYNC_CODE_REVIEW_REACTIONS"
    "/prod/fossa-orchestrator/API_CRON_FOSSY_LEARNING"
    "/prod/fossa-orchestrator/API_CRON_CHECK_IF_PR_SHOULD_BE_APPROVED"
    "/prod/fossa-orchestrator/API_CRON_SSO_TEST_SESSION_CLEANUP"

    "/prod/fossa-orchestrator/FOSSA_SERVICE_TEAMS"
    "/prod/fossa-orchestrator/GLOBAL_FOSSA_SERVICE_SLACK"

    "/prod/fossa-orchestrator/FOSSA_SERVICE_AZURE_BOARDS"
    "/prod/fossa-orchestrator/GLOBAL_FOSSA_SERVICE_DISCORD"
    "/prod/fossa-orchestrator/FOSSA_SERVICE_AZURE_REPOS"
    "/prod/fossa-orchestrator/API_CRON_AUTOMATION_DAILY_CHECKIN"
    "/prod/fossa-orchestrator/API_CRON_WEEKLY_RECAP"

    "/prod/fossa-orchestrator/RESEND_API_KEY"
    "/prod/fossa-orchestrator/RESEND_WEBHOOK_SECRET"
    "/prod/fossa-orchestrator/API_USER_INVITE_BASE_URL"

    "/prod/fossa-orchestrator/API_AWS_REGION"
    "/prod/fossa-orchestrator/API_AWS_USERNAME"
    "/prod/fossa-orchestrator/API_AWS_PASSWORD"
    "/prod/fossa-orchestrator/API_AWS_BUCKET_NAME_ASSISTANT"

    "/prod/fossa-orchestrator/API_GOOGLE_AI_API_KEY"
    "/prod/fossa-orchestrator/API_ANTHROPIC_API_KEY"
    "/prod/fossa-orchestrator/COHERE_API_KEY"
    "/prod/fossa-orchestrator/API_FIREWORKS_BASE_URL"
    "/prod/fossa-orchestrator/API_FIREWORKS_API_KEY"

    "/prod/fossa-orchestrator/N8N_WEBHOOK_URL"
    "/prod/fossa-orchestrator/API_SIGNUP_NOTIFICATION_WEBHOOK"
    "/prod/fossa-orchestrator/API_CRYPTO_KEY"

    "/prod/fossa-orchestrator/TAVILY_API_KEY"
    "/prod/fossa-orchestrator/API_SEGMENT_KEY"

    "/prod/fossa-orchestrator/API_VERTEX_AI_API_KEY"
    "/prod/fossa-orchestrator/API_VERTEX_AI_LOCATION"
    "/prod/fossa-orchestrator/API_GOOGLE_AI_PROVIDER"
    "/prod/fossa-orchestrator/TOGETHER_AI_API_KEY"
    "/prod/fossa-orchestrator/API_NOVITA_AI_API_KEY"

    "/prod/fossa-orchestrator/GLOBAL_BITBUCKET_CODE_MANAGEMENT_WEBHOOK"
    "/prod/fossa-orchestrator/BITBUCKET_RATE_GATE_MIN_INTERVAL_MS"

    "/prod/fossa-orchestrator/CODE_MANAGEMENT_SECRET"
    "/prod/fossa-orchestrator/CODE_MANAGEMENT_WEBHOOK_TOKEN"

    "/prod/fossa-orchestrator/GLOBAL_AZURE_REPOS_CODE_MANAGEMENT_WEBHOOK"
    "/prod/fossa-orchestrator/GLOBAL_FOSSA_SERVICE_BILLING"

    "/prod/fossa-orchestrator/API_POSTHOG_KEY"

    "/prod/fossa-orchestrator/API_MCP_SERVER_ENABLED"
    "/prod/fossa-orchestrator/API_FOSSA_SERVICE_MCP_MANAGER"
    "/prod/fossa-orchestrator/API_FOSSA_MCP_SERVER_URL"

    "/prod/fossa-orchestrator/API_OPENROUTER_KEY"
    "/prod/fossa-orchestrator/API_LLM_TEMPERATURE_OVERRIDE"

    "/prod/fossa-orchestrator/API_URL"
    "/prod/fossa-orchestrator/API_FRONTEND_URL"

    "/prod/fossa-orchestrator/API_GROQ_BASE_URL"
    "/prod/fossa-orchestrator/API_GROQ_API_KEY"

    "/prod/fossa-orchestrator/API_WEBHOOKS_PORT"

    "/prod/fossa-orchestrator/API_ECS_AGENT_URI"
    "/prod/fossa-orchestrator/API_WORKER_DRAIN_TIMEOUT_MS"


    "/prod/fossa-orchestrator/API_DEEPSEEK_BASE_URL"
    "/prod/fossa-orchestrator/API_DEEPSEEK_API_KEY"

    "/prod/fossa-orchestrator/API_MORPHLLM_API_KEY"

    "/prod/fossa-orchestrator/API_E2B_KEY"
    "/prod/fossa-orchestrator/API_E2B_TEMPLATE_ID"

    "/prod/fossa-orchestrator/API_BETTERSTACK_API_TOKEN"
    "/prod/fossa-orchestrator/API_BETTERSTACK_HEARTBEAT_ERROR_RATE_URL"
    "/prod/fossa-orchestrator/API_BETTERSTACK_HEARTBEAT_REVIEW_MONITOR_URL"
    "/prod/fossa-orchestrator/API_BETTERSTACK_HEARTBEAT_OUTBOX_URL"
    "/prod/fossa-orchestrator/API_BETTERSTACK_HEARTBEAT_WEBHOOK_URL"

    "/prod/fossa-orchestrator/API_EXA_KEY"

    "/prod/fossa-orchestrator/WEB_HOSTNAME_HELPDESK"
    "/prod/fossa-orchestrator/WEB_PORT_HELPDESK"
    "/prod/fossa-orchestrator/API_JWT_PRIVATE_KEY"

    "/prod/fossa-orchestrator/API_BILLING_WEBHOOK_SECRET"
    "/prod/fossa-orchestrator/API_DISCORD_TRIAL_REQUEST_WEBHOOK_URL"
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
REFRESH_SECRET=$(aws ssm get-parameter --name "/prod/fossa-orchestrator/API_JWT_REFRESH_SECRET" --with-decryption --query "Parameter.Value" --output text 2>/dev/null)
if [ -z "$REFRESH_SECRET" ] || [[ "$REFRESH_SECRET" == "ParameterNotFound" ]]; then
  REFRESH_SECRET=$(aws ssm get-parameter --name "/prod/fossa-orchestrator/API_JWT_REFRESHSECRET" --with-decryption --query "Parameter.Value" --output text 2>/dev/null)
fi
if [ -n "$REFRESH_SECRET" ] && [[ "$REFRESH_SECRET" != "ParameterNotFound" ]]; then
  echo "API_JWT_REFRESH_SECRET=$REFRESH_SECRET" >> "$ENV_FILE"
else
  echo "WARNING: API_JWT_REFRESH_SECRET não encontrado (nem o legado API_JWT_REFRESHSECRET)." >&2
fi
