const tsConfigPaths = require('tsconfig-paths');

const baseUrl = './dist'; // Points to the dist directory in production

// We define paths explicitly to avoid reading tsconfig.json in runtime
// matching: "@libs/*": ["libs/*"], "@apps/*": ["apps/*/src"]
const cleanup = tsConfigPaths.register({
    baseUrl,
    paths: {
        '@libs/*': ['libs/*'],
        '@apps/*': ['apps/*/src'],
    },
});
