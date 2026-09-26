#!/bin/sh
set -e

# Inicia o servidor RabbitMQ em background e captura seu Process ID (PID)
rabbitmq-server &
server_pid=$!

# Espera o broker estar totalmente funcional (RabbitMQ 4.x)
echo "Aguardando o RabbitMQ iniciar completamente..."
ready=false
for i in $(seq 1 90); do
    if rabbitmq-diagnostics -q check_running; then
        ready=true
        break
    fi
    sleep 1
done

if [ "$ready" != "true" ]; then
    echo "RabbitMQ não iniciou dentro do tempo esperado." >&2
    exit 1
fi

ensure_vhost() {
    vhost="$1"

    if ! rabbitmqctl list_vhosts -q | grep -qx "$vhost"; then
        rabbitmqctl add_vhost "$vhost"
    fi

    rabbitmqctl set_permissions -p "$vhost" "$RABBITMQ_DEFAULT_USER" ".*" ".*" ".*"
}

echo "RabbitMQ iniciado. Criando v-hosts manualmente..."
ensure_vhost fossa-ai
ensure_vhost fossa-ast
echo "V-hosts criados e permissões atribuídas com sucesso."

# Traz o processo do RabbitMQ de volta para o primeiro plano
# para que o contêiner não pare, usando o PID que capturamos.
wait $server_pid
