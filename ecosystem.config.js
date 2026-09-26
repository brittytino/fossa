module.exports = {
    apps: [
        {
            name: 'webhook-handler',
            script: './dist/apps/webhooks/main.js',
            exec_mode: 'fork',
            instances: 1,
            max_memory_restart: '500M',
            env: {
                COMPONENT_TYPE: 'webhook',
                API_NODE_ENV: 'development',
            },
            env_homolog: {
                COMPONENT_TYPE: 'webhook',
                API_NODE_ENV: 'homolog',
            },
            env_production: {
                COMPONENT_TYPE: 'webhook',
                API_NODE_ENV: 'production',
            },
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            kill_timeout: 5000,
        },
        {
            name: 'fossa-orchestrator',
            script: './dist/apps/api/main.js',
            exec_mode: 'fork',
            instances: 1,
            max_memory_restart: '500M',
            env: {
                COMPONENT_TYPE: 'api',
                API_NODE_ENV: 'development',
            },
            env_homolog: {
                COMPONENT_TYPE: 'api',
                API_NODE_ENV: 'homolog',
            },
            env_production: {
                COMPONENT_TYPE: 'api',
                API_NODE_ENV: 'production',
            },
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            kill_timeout: 5000,
        },
        {
            name: 'workflow-worker',
            script: './dist/apps/worker/main.js',
            exec_mode: 'fork',
            instances: 1,
            max_memory_restart: '500M',
            env: {
                COMPONENT_TYPE: 'worker',
                API_NODE_ENV: 'development',
            },
            env_homolog: {
                COMPONENT_TYPE: 'worker',
                API_NODE_ENV: 'homolog',
            },
            env_production: {
                COMPONENT_TYPE: 'worker',
                API_NODE_ENV: 'production',
            },
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            kill_timeout: 5000,
        },
    ],
};
