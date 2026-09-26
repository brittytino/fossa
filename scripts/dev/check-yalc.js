#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(process.cwd(), 'package.json');

try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const yalcDependencies = [];

    for (const [name, version] of Object.entries(dependencies)) {
        if (version.includes('.yalc')) {
            yalcDependencies.push(name);
        }
    }

    if (yalcDependencies.length > 0) {
        console.error('\x1b[31m%s\x1b[0m', '⛔ COMMIT BLOCKED: Yalc dependencies detected in package.json!');
        console.error('Please remove the following yalc packages before committing:');
        yalcDependencies.forEach(dep => console.error(` - ${dep}`));
        process.exit(1);
    }

    console.log('\x1b[32m%s\x1b[0m', '✅ No yalc dependencies found.');
    process.exit(0);

} catch (error) {
    console.error('Error checking package.json:', error);
    process.exit(1);
}

