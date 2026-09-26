"use server";

import { PostHog } from "posthog-node";

const posthog = process.env.WEB_POSTHOG_KEY
    ? new PostHog(process.env.WEB_POSTHOG_KEY, {
          host: "https://us.i.posthog.com",
      })
    : null;

export async function capturePostHogEvent(event: {
    userId: string;
    event: string;
    properties?: any;
}) {
    if (!posthog) return;

    posthog.capture({
        distinctId: event.userId,
        event: event.event,
        properties: event.properties,
    });

    // In serverless environments, explicitly flush to ensure the event is sent
    // before the function's execution context is terminated.
    await posthog.flush();
}
