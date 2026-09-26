# Fossa Test PR Creator

Script para criar PRs de teste em múltiplas plataformas (GitHub, GitLab, Bitbucket, Azure DevOps) usando as integrações da Fossa.

## Pré-requisitos

- Node.js 18+
- 1Password CLI instalado e autenticado
- Tokens de API no 1Password

### Instalar o 1Password CLI

```bash
# macOS
brew install --cask 1password-cli

# Linux
# Visite https://developer.1password.com/docs/cli/get-started
```

## Instalação

```bash
cd scripts/pr-creator
npm install
```

## Uso

### Exportar variáveis de ambiente

```bash
# Fossa
export FOSSA_URL="https://api.fossa.ai"
export FOSSA_EMAIL="seu@email.com"
export FOSSA_PASSWORD="sua-senha"

# Configurações dos PRs
export TOTAL_PRS="10"                      # Total de PRs a criar
export TARGET_BRANCH="main"                # Branch de destino
export SOURCE_BRANCH_PATTERN="feature/"    # Filtro de branches (opcional)
export TEAMS_LIMIT="10"                    # Limite de times a buscar
export REPOS_LIMIT="20"                    # Limite de repositórios

# Tokens das plataformas (via env - PRIORIDADE)
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
export GITLAB_TOKEN="glpat_xxxxxxxxxxxxxxxx"
# export BITBUCKET_TOKEN="ATBBxxxxxxxxxxxxxxxxxx"
# export AZURE_DEVOPS_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Nomes dos itens no 1Password (opcional - fallback)
export OP_GH_TOKEN="GitHub Token"
export OP_GL_TOKEN="GitLab Token"
export OP_BB_TOKEN="Bitbucket Token"
export OP_ADO_TOKEN="Azure Devops Token"
```

### Executar

```bash
npm start
# ou
node create-test-prs.mjs
```

## Como funciona

1. **Login na Fossa** → Obtém token de acesso
2. **Busca informações do usuário** → Org e times disponíveis
3. **Lista repositórios** → Para cada time configurado
4. **Pega tokens** → Das variáveis de ambiente (prioridade) ou 1Password (fallback)
5. **Busca branches sem PR aberto** → Filtra branches candidatos
6. **Cria PRs** → Via API nativa de cada plataforma

## Tokens

### Opção 1: Variáveis de ambiente (recomendado) ⭐

Configure os tokens direto no `.env`:

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITLAB_TOKEN=glpat_xxxxxxxxxxxxxxxx
BITBUCKET_TOKEN=ATBBxxxxxxxxxxxxxxxxxx
AZURE_DEVOPS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Vantagens:**

- Mais simples
- Não precisa de 1Password CLI
- Maior controle

### Opção 2: 1Password CLI (fallback)

Se não configurar env vars, o script tenta buscar do 1Password automaticamente.

### Princípio de funcionamento

O script busca tokens nesta ordem:

1. **Variáveis de ambiente** (`GITHUB_TOKEN`, `GITLAB_TOKEN`, etc) ← PRIORIDADE
2. **1Password CLI** (se instalado e autenticado)

## Variáveis de ambiente

| Variável                | Padrão                 | Descrição                                              |
| ----------------------- | ---------------------- | ------------------------------------------------------ |
| `FOSSA_URL`             | `https://api.fossa.ai` | URL da API da Fossa                                    |
| `FOSSA_EMAIL`           | _obrigatório_          | Email da conta Fossa                                   |
| `FOSSA_PASSWORD`        | _obrigatório_          | Senha da conta Fossa                                   |
| `TOTAL_PRS`             | `10`                   | Total de PRs a criar                                   |
| `TARGET_BRANCH`         | `main`                 | Branch de destino                                      |
| `SOURCE_BRANCH_PATTERN` | undefined              | Filtro de branches (ex: `feature/`)                    |
| `TEAMS_LIMIT`           | `10`                   | Limite de times a buscar                               |
| `REPOS_LIMIT`           | `20`                   | Limite de repositórios                                 |
| `SYNC_FORKS`            | `true`                 | Sincroniza forks com upstream antes de buscar branches |
| `CLOSE_EXISTING_PRS`    | `false`                | Fecha todos os PRs existentes antes de criar novos     |
| `GITHUB_TOKEN`          | -                      | Token de API do GitHub (prioridade)                    |
| `GITLAB_TOKEN`          | -                      | Token de API do GitLab (prioridade)                    |
| `BITBUCKET_TOKEN`       | -                      | Token de API do Bitbucket (prioridade)                 |
| `AZURE_DEVOPS_TOKEN`    | -                      | Token de API do Azure DevOps (prioridade)              |
| `OP_GH_TOKEN`           | `GitHub Token`         | Nome do item no 1Password (fallback)                   |
| `OP_GL_TOKEN`           | `GitLab Token`         | Nome do item no 1Password (fallback)                   |
| `OP_BB_TOKEN`           | `Bitbucket Token`      | Nome do item no 1Password (fallback)                   |
| `OP_ADO_TOKEN`          | `Azure Devops Token`   | Nome do item no 1Password (fallback)                   |

## Configurar tokens no 1Password (opcional)

Os tokens devem ser itens de tipo "Password" no 1Password com:

- Label: `password`
- Valor: O token de API da plataforma

### Exemplo com CLI do 1Password

```bash
# Criar item para GitHub
op item create --category=password \
  --title="GitHub Token" \
  password=ghp_xxxxxxxxxxxxxxxxxxxx
```

## Exemplo completo

```bash
# Login no 1Password
eval $(op signin)

# Configurar variáveis
export FOSSA_EMAIL="admin@fossa.ai"
export FOSSA_PASSWORD="minha-senha"
export TOTAL_PRS="5"
export TARGET_BRANCH="main"

# Rodar o script
cd scripts/pr-creator
npm start
```

## Suporte a Forks

O script detecta automaticamente se um repositório é um **fork** e pode sincronizá-lo com o upstream antes de buscar branches.

### Funcionalidades

1. **Detecta forks** em GitHub, GitLab, Bitbucket
2. **Sincroniza com upstream** (opcional, via API nativa)
3. **Usa branches do fork atualizado** para criar PRs

### Suporte por plataforma

| Plataforma   | Detecta Fork | Sync via API        |
| ------------ | ------------ | ------------------- |
| GitHub       | ✅           | ✅ (merge-upstream) |
| GitLab       | ✅           | ✅ (fork sync)      |
| Bitbucket    | ✅           | ⚠️ (manual na UI)   |
| Azure DevOps | ✅           | ❌ (sem API nativa) |

### Desativar sync de forks

```bash
export SYNC_FORKS=false
```

## Saída esperada

```
🚀 Fossa PR Creator

🔐 Logging in...
👤 Logged in as: admin@fossa.ai
🏢 Organization: Fossa (04bd288b-595a-4ee1-87cd-8bbbdc312b3c)

📋 Found 3 teams (limit: 10)

🔍 Fetching repos for team: Engineering (8ee36a59-edd6-4b6a-b282-bd96aad4d63b)
   Found 15 repos

📚 Total repos to process: 15 (limit: 20)

🧩 Platforms detected: github, gitlab

🔑 Fetching token for github...
   ✓ Got GitHub Token
🔑 Fetching token for gitlab...
   ✓ Got GitLab Token

🔑 All required tokens fetched from 1Password ✓

📝 Found 5 PRs to create
   🔗 Fork detected, syncing with upstream...
      🔄 Syncing GitHub fork myuser/react with upstream...
      ✓ Fork synced successfully
📝 Creating GitHub PR for myuser/react: feature/auth → main
   ✅ PR created: https://github.com/myuser/react/pull/123
📝 Creating GitLab MR for fossa/backend: feature/api → main
   ✅ MR created: https://gitlab.com/fossa/backend/-/merge_requests/45

✨ Done!
```
