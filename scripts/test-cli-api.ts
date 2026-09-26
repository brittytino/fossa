/**
 * Script to test CLI API endpoints
 * Run with: ts-node -r tsconfig-paths/register scripts/test-cli-api.ts
 */

import { dataSourceInstance } from '../libs/core/infrastructure/database/typeorm/ormconfig';
import { TeamModel } from '../libs/organization/infrastructure/adapters/repositories/schemas/team.model';
import { UserModel } from '../libs/identity/infrastructure/adapters/repositories/schemas/user.model';

const API_URL = 'http://localhost:3000';

async function getTestData() {
    await dataSourceInstance.initialize();

    // Get first active team
    const team = await dataSourceInstance.getRepository(TeamModel).findOne({
        where: { status: 'active' as any },
        relations: ['organization'],
    });

    // Get first active user
    const user = await dataSourceInstance.getRepository(UserModel).findOne({
        where: {},
    });

    await dataSourceInstance.destroy();

    return { team, user };
}

async function generateCliKey(teamId: string, userId: string): Promise<string> {
    // We can't easily get a JWT token without complex auth flow
    // So we'll use the TeamCliKeyService directly
    console.log('\n⚠️  Cannot test via HTTP without JWT token');
    console.log('Instead, testing service directly...\n');

    await dataSourceInstance.initialize();

    const { TeamCliKeyService } = await import(
        '../libs/organization/infrastructure/adapters/services/team-cli-key.service'
    );
    const { TeamCliKeyDatabaseRepository } = await import(
        '../libs/organization/infrastructure/adapters/repositories/team-cli-key.repository'
    );

    const repository = new TeamCliKeyDatabaseRepository(
        dataSourceInstance.getRepository(
            (await import('../libs/organization/infrastructure/adapters/repositories/schemas/team-cli-key.model')).TeamCliKeyModel
        ),
    );

    const service = new TeamCliKeyService(repository);

    console.log('=== Generating CLI Key ===');
    const key = await service.generateKey(teamId, 'Test CLI Key', userId);
    console.log('✓ Key generated:', key);

    console.log('\n=== Listing CLI Keys ===');
    const keys = await service.findByTeamId(teamId);
    console.log(`✓ Found ${keys.length} keys for team`);
    keys.forEach((k) => {
        console.log(`  - ${k.name} (active: ${k.active}, created: ${k.createdAt})`);
    });

    await dataSourceInstance.destroy();

    return key;
}

async function testReviewEndpoint(teamKey: string) {
    console.log('\n=== Testing Review Endpoint ===');

    const testDiff = `diff --git a/test.js b/test.js
index 123..456 789
--- a/test.js
+++ b/test.js
@@ -1,3 +1,4 @@
+// TODO: fix security issue
 function test() {
-    eval(userInput); // Security issue!
+    console.log(userInput);
 }`;

    try {
        const response = await fetch(`${API_URL}/cli/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Team-Key': teamKey,
            },
            body: JSON.stringify({
                diff: testDiff,
                config: {
                    fast: true,
                },
                userEmail: 'test@example.com',
                gitRemote: 'git@github.com:test/repo.git',
                branch: 'main',
                commitSha: 'abc123def456',
                inferredPlatform: 'GITHUB',
                cliVersion: '1.0.0',
            }),
        });

        console.log('Status:', response.status);

        if (!response.ok) {
            const error = await response.json();
            console.log('✗ Error:', JSON.stringify(error, null, 2));
            return;
        }

        const data: any = await response.json();
        console.log('✓ Review completed successfully!');
        console.log('Issues found:', data.issues?.length || 0);

        if (data.issues && data.issues.length > 0) {
            console.log('\nSample issue:');
            console.log(JSON.stringify(data.issues[0], null, 2));
        }
    } catch (error: any) {
        console.error('✗ Error:', error.message);
    }
}

async function testInvalidKey() {
    console.log('\n=== Testing Invalid Key (should fail) ===');

    try {
        const response = await fetch(`${API_URL}/cli/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Team-Key': 'fossa_invalid_key_12345',
            },
            body: JSON.stringify({
                diff: 'some diff',
                userEmail: 'test@example.com',
            }),
        });

        console.log('Status:', response.status);

        if (response.status === 401) {
            const error: any = await response.json();
            console.log('✓ Correctly rejected invalid key');
            console.log('Error message:', error.message);
        } else {
            console.log('✗ Should have rejected invalid key (got status:', response.status, ')');
        }
    } catch (error: any) {
        console.error('✗ Error:', error.message);
    }
}

async function main() {
    console.log('=====================================');
    console.log('   CLI API Test Suite');
    console.log('=====================================\n');

    try {
        const { team, user } = await getTestData();

        if (!team || !user) {
            console.error('✗ Could not find test data in database');
            console.error('Make sure you have at least one team and user in the database');
            return;
        }

        console.log('Test Data:');
        console.log('  Team:', team.name, '(' + team.uuid + ')');
        console.log('  Org:', team.organization?.name);
        console.log('  User:', user.uuid);

        const teamKey = await generateCliKey(team.uuid, user.uuid);

        await testReviewEndpoint(teamKey);
        await testInvalidKey();

        console.log('\n=====================================');
        console.log('   Tests Complete!');
        console.log('=====================================\n');
        console.log('Next steps:');
        console.log('  1. Check the generated key works:');
        console.log(`     curl -X POST ${API_URL}/cli/review \\`);
        console.log(`       -H "X-Team-Key: ${teamKey}" \\`);
        console.log('       -H "Content-Type: application/json" \\');
        console.log('       -d \'{"diff": "test", "userEmail": "test@example.com"}\'');
        console.log('\n  2. View keys in database:');
        console.log('     SELECT * FROM team_cli_key;');

    } catch (error: any) {
        console.error('Error running tests:', error);
    }
}

main();
