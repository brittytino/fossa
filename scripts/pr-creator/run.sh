#!/usr/bin/env bash

# Carrega variáveis do .env se existir
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Executa o script Node
node create-test-prs.mjs "$@"
