import * as amqp from 'amqplib';

async function runStressTest(numMessages: number) {
    const connection = await amqp.connect(
        'amqp://dev:devpass@localhost:5672/fossa-ai',
    );
    const channel = await connection.createChannel();

    const exchange = 'orchestrator.exchange.delayed';
    const routingKey = 'codeReviewFeedback.syncCodeReviewReactions';

    console.time('Publication Time');
    console.log(
        `🚀 Starting Stress Test: Publishing ${numMessages} LIGHTWEIGHT messages...`,
    );

    for (let i = 0; i < numMessages; i++) {
        const payload = {
            payload: {
                organizationId: 'f9d81b1d-7702-477e-8472-e46c06604ae8',
                teamId: '5effdcbb-1f2d-46a2-a6d8-471f6d852763',
                automationExecutionsPRs: [i + 1000],
            },
        };

        channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(payload)),
            { headers: { 'x-delay': 0 }, persistent: false }, // persistent false to be lighter
        );
    }

    console.timeEnd('Publication Time');
    console.log('✅ All messages published! Now watch the Worker process...');
    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 2000);
}

runStressTest(10000); // Test with 10,000 simultaneous PRs
