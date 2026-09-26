/**
 * Comprehensive FOSSA Rebranding and Repository Transformation Script
 * Owner: brittytino (https://github.com/brittytino/fossa)
 * Rebranding:
 *   Kodus -> Fossa / fossa / FOSSA
 *   Kody / Koddy -> Fossy / fossy / FOSSY
 *   Kody Rules -> Fossy Rules
 *   @kodus/* -> @fossa/*
 *   @kody -> @fossy
 *   CLI binary -> fossa
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Move features from apps/web/src/features/ee to apps/web/src/features
function migrateWebFeatures() {
    const eeDir = path.join(ROOT_DIR, 'apps', 'web', 'src', 'features', 'ee');
    const targetDir = path.join(ROOT_DIR, 'apps', 'web', 'src', 'features');

    if (!fs.existsSync(eeDir)) {
        console.log('[Step 1] No apps/web/src/features/ee directory found. Skipping move.');
        return;
    }

    console.log('[Step 1] Migrating apps/web/src/features/ee into apps/web/src/features...');
    const entries = fs.readdirSync(eeDir, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(eeDir, entry.name);
        const destPath = path.join(targetDir, entry.name);

        if (!fs.existsSync(destPath)) {
            fs.renameSync(srcPath, destPath);
            console.log(`  Moved ${entry.name} -> features/${entry.name}`);
        } else {
            // merge copy if dest exists
            fs.cpSync(srcPath, destPath, { recursive: true, force: true });
            fs.rmSync(srcPath, { recursive: true, force: true });
            console.log(`  Merged ${entry.name} -> features/${entry.name}`);
        }
    }

    try {
        fs.rmSync(eeDir, { recursive: true, force: true });
        console.log('  Removed apps/web/src/features/ee');
    } catch (err) {
        console.warn('  Could not remove ee dir:', err.message);
    }
}

// Rebrand a string (filenames, dirnames, etc.)
function rebrandIdentifier(str) {
    return str
        .replace(/kodus-kody-rules/g, 'fossa-fossy-rules')
        .replace(/kodus_kody_rules/g, 'fossa_fossy_rules')
        .replace(/kodus-ai/g, 'fossa')
        .replace(/kodus_ai/g, 'fossa')
        .replace(/KODUS_/g, 'FOSSA_')
        .replace(/KODY_/g, 'FOSSY_')
        .replace(/KODUS/g, 'FOSSA')
        .replace(/KODY/g, 'FOSSY')
        .replace(/Kodus/g, 'Fossa')
        .replace(/kodus/g, 'fossa')
        .replace(/Koddy/g, 'Fossy')
        .replace(/koddy/g, 'fossy')
        .replace(/Kody/g, 'Fossy')
        .replace(/kody/g, 'fossy');
}

// 2. Rename directories bottom-up
function renameDirectories() {
    console.log('[Step 2] Scanning directories to rename (bottom-up)...');
    const ignoreDirs = new Set(['.git', 'node_modules', '.next', 'dist', '.pnpm-store']);

    function collectDirs(dir) {
        let results = [];
        let entries = [];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            return results;
        }

        for (const entry of entries) {
            if (entry.isDirectory()) {
                if (ignoreDirs.has(entry.name)) continue;
                const fullPath = path.join(dir, entry.name);
                results.push(...collectDirs(fullPath));
                results.push(fullPath);
            }
        }
        return results;
    }

    const allDirs = collectDirs(ROOT_DIR);
    // Sort deepest first (longest path first)
    allDirs.sort((a, b) => b.length - a.length);

    let renamedCount = 0;
    for (const dirPath of allDirs) {
        if (!fs.existsSync(dirPath)) continue;
        const parent = path.dirname(dirPath);
        const name = path.basename(dirPath);
        const newName = rebrandIdentifier(name);

        if (newName !== name) {
            const newPath = path.join(parent, newName);
            try {
                fs.renameSync(dirPath, newPath);
                console.log(`  Renamed dir: ${path.relative(ROOT_DIR, dirPath)} -> ${newName}`);
                renamedCount++;
            } catch (err) {
                console.warn(`  Failed to rename dir ${dirPath} -> ${newPath}: ${err.message}`);
            }
        }
    }
    console.log(`[Step 2] Renamed ${renamedCount} directories.`);
}

// 3. Rename files
function renameFiles() {
    console.log('[Step 3] Scanning files to rename...');
    const ignoreDirs = new Set(['.git', 'node_modules', '.next', 'dist', '.pnpm-store']);

    function collectFiles(dir) {
        let results = [];
        let entries = [];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            return results;
        }

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (ignoreDirs.has(entry.name)) continue;
                results.push(...collectFiles(fullPath));
            } else if (entry.isFile()) {
                results.push(fullPath);
            }
        }
        return results;
    }

    const allFiles = collectFiles(ROOT_DIR);
    let renamedCount = 0;

    for (const filePath of allFiles) {
        if (!fs.existsSync(filePath)) continue;
        const parent = path.dirname(filePath);
        const name = path.basename(filePath);
        const newName = rebrandIdentifier(name);

        if (newName !== name) {
            const newPath = path.join(parent, newName);
            try {
                fs.renameSync(filePath, newPath);
                console.log(`  Renamed file: ${path.relative(ROOT_DIR, filePath)} -> ${newName}`);
                renamedCount++;
            } catch (err) {
                console.warn(`  Failed to rename file ${filePath} -> ${newPath}: ${err.message}`);
            }
        }
    }
    console.log(`[Step 3] Renamed ${renamedCount} files.`);
}

// 4. Update file contents
function updateFileContents() {
    console.log('[Step 4] Updating file contents...');
    const ignoreDirs = new Set(['.git', 'node_modules', '.next', 'dist', '.pnpm-store']);
    const binaryExts = new Set([
        '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.pdf', '.zip',
        '.tar', '.gz', '.woff', '.woff2', '.ttf', '.eot', '.lockb', '.bin'
    ]);

    function isBinary(buffer) {
        const len = Math.min(buffer.length, 1024);
        for (let i = 0; i < len; i++) {
            if (buffer[i] === 0) return true;
        }
        return false;
    }

    function collectAllFiles(dir) {
        let results = [];
        let entries = [];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            return results;
        }

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (ignoreDirs.has(entry.name)) continue;
                results.push(...collectAllFiles(fullPath));
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (!binaryExts.has(ext)) {
                    results.push(fullPath);
                }
            }
        }
        return results;
    }

    const allFiles = collectAllFiles(ROOT_DIR);
    let modifiedCount = 0;

    for (const filePath of allFiles) {
        // Skip this script itself
        if (filePath === __filename) continue;

        let contentBuffer;
        try {
            contentBuffer = fs.readFileSync(filePath);
        } catch {
            continue;
        }

        if (isBinary(contentBuffer)) continue;

        let content = contentBuffer.toString('utf8');
        const originalContent = content;

        // Apply structured replacements
        // 1. Web features import path decoupling
        content = content.replace(/src\/features\/ee\//g, 'src/features/');
        content = content.replace(/@\/features\/ee\//g, '@/features/');

        // 2. Upstream Git & URL updates
        content = content.replace(/git\+https:\/\/github\.com\/kodustech\/kodus-ai\.git/g, 'git+https://github.com/brittytino/fossa.git');
        content = content.replace(/https:\/\/github\.com\/kodustech\/kodus-ai\.git/g, 'https://github.com/brittytino/fossa.git');
        content = content.replace(/https:\/\/github\.com\/kodustech\/kodus-ai/g, 'https://github.com/brittytino/fossa');
        content = content.replace(/github\.com\/kodustech\/kodus-ai/g, 'github.com/brittytino/fossa');
        content = content.replace(/kodustech\/kodus-ai/g, 'brittytino/fossa');
        content = content.replace(/https:\/\/github\.com\/kodustech/g, 'https://github.com/brittytino');
        content = content.replace(/kodustech/g, 'brittytino');
        content = content.replace(/https:\/\/kodus\.io/g, 'https://github.com/brittytino/fossa');
        content = content.replace(/qa\.api\.kodus\.io/g, 'qa.api.fossa.local');
        content = content.replace(/api\.kodus\.io/g, 'api.fossa.local');
        content = content.replace(/qa\.kodus\.io/g, 'qa.fossa.local');
        content = content.replace(/kodus\.io/g, 'fossa.local');

        // 3. Package & Path Aliases
        content = content.replace(/@libs\/kodyRules/g, '@libs/fossyRules');
        content = content.replace(/@libs\/kodyFineTuning/g, '@libs/fossyFineTuning');
        content = content.replace(/@kodus\//g, '@fossa/');
        content = content.replace(/@kody/g, '@fossy');
        content = content.replace(/@koddy/g, '@fossy');

        // 4. Case-preserving Brand & Token Replacements
        content = content.replace(/kodus-kody-rules/g, 'fossa-fossy-rules');
        content = content.replace(/kodus_kody_rules/g, 'fossa_fossy_rules');
        content = content.replace(/kodus-orchestrator/g, 'fossa-orchestrator');
        content = content.replace(/kodus-web/g, 'fossa-web');
        content = content.replace(/kodus-cli/g, 'fossa-cli');

        content = content.replace(/KODUS_/g, 'FOSSA_');
        content = content.replace(/KODY_/g, 'FOSSY_');
        content = content.replace(/KODUS/g, 'FOSSA');
        content = content.replace(/KODY/g, 'FOSSY');
        content = content.replace(/Kodus/g, 'Fossa');
        content = content.replace(/kodus/g, 'fossa');
        content = content.replace(/Koddy/g, 'Fossy');
        content = content.replace(/koddy/g, 'fossy');
        content = content.replace(/Kody/g, 'Fossy');
        content = content.replace(/kody/g, 'fossy');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            modifiedCount++;
        }
    }

    console.log(`[Step 4] Updated content in ${modifiedCount} files.`);
}

function main() {
    console.log('=== Starting FOSSA Rebranding & Transformation ===\n');
    migrateWebFeatures();
    renameDirectories();
    renameFiles();
    updateFileContents();
    console.log('\n=== Rebranding & Transformation Step Complete ===');
}

main();
