/**
 * Script to create a test CLI key directly in the database
 * Bypasses HTTP auth for testing purposes
 */

import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { dataSourceInstance } from '../libs/core/infrastructure/database/typeorm/ormconfig';
import { TeamModel } from '../libs/organization/infrastructure/adapters/repositories/schemas/team.model';
import { UserModel } from '../libs/identity/infrastructure/adapters/repositories/schemas/user.model';
import { TeamCliKeyModel } from '../libs/organization/infrastructure/adapters/repositories/schemas/team-cli-key.model';

async function main() {
    console.log('=====================================');
    console.log('   CLI Key Test Setup');
    console.log('=====================================\n');

    try {
        await dataSourceInstance.initialize();
        console.log('✓ Connected to database\n');

        // 1. Get a team
        const team = await dataSourceInstance.getRepository(TeamModel).findOne({
            where: {},
            relations: ['organization'],
        });

        if (!team) {
            console.error('✗ No teams found in database');
            return;
        }

        console.log('Found team:');
        console.log('  Name:', team.name);
        console.log('  UUID:', team.uuid);
        console.log('  Org:', team.organization?.name);
        console.log('');

        // 2. Get a user
        const user = await dataSourceInstance.getRepository(UserModel).findOne({
            where: {},
        });

        console.log('Found user:');
        console.log('  UUID:', user?.uuid || 'N/A');
        console.log('');

        // 3. Generate CLI key
        console.log('=== Generating CLI Key ===');
        const rawKey = crypto.randomBytes(32).toString('base64url');
        const fullKey = `fossa_${rawKey}`;
        const keyPrefix = crypto.createHash('sha256').update(rawKey).digest('hex').substring(0, 8);
        const keyHash = await bcrypt.hash(rawKey, 10);

        const cliKeyRepo = dataSourceInstance.getRepository(TeamCliKeyModel);

        const cliKey = cliKeyRepo.create({
            name: 'Test CLI Key (auto-generated)',
            keyHash: keyHash,
            keyPrefix: keyPrefix,
            active: true,
            team: team,
            createdBy: user,
        });

        await cliKeyRepo.save(cliKey);

        console.log('✓ CLI Key created successfully!\n');
        console.log('=====================================');
        console.log('   TEST CREDENTIALS');
        console.log('=====================================');
        console.log('');
        console.log('Team ID:', team.uuid);
        console.log('CLI Key:', fullKey);
        console.log('');
        console.log('=====================================');
        console.log('   TEST COMMAND');
        console.log('=====================================');
        console.log('');
        console.log('Test the review endpoint with:');
        console.log('');
        console.log('curl -X POST "http://localhost:3000/cli/review" \\');
        console.log(`  -H "X-Team-Key: ${fullKey}" \\`);
        console.log('  -H "Content-Type: application/json" \\');
        console.log('  -d \'{"diff": "diff --git a/test.js b/test.js\\n--- a/test.js\\n+++ b/test.js\\n@@ -1 +1 @@\\n-console.log(\\"old\\");\\n+console.log(\\"new\\");", "userEmail": "test@example.com", "cliVersion": "1.0.0"}\'');
        console.log('');

        await dataSourceInstance.destroy();

    } catch (error: any) {
        console.error('Error:', error.message);
        await dataSourceInstance.destroy();
    }
}

main();
