const { setTimeout: sleep } = require("node:timers/promises");

async function getJson(provider, url) {
  const timeoutMs = Number(process.env.HTTP_TIMEOUT_MS || 2500);
  const maxRetries = Number(process.env.HTTP_MAX_RETRIES || 1);
  const startedAt = Date.now();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let retryable = false;
    let statusCode = null;

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      statusCode = response.status;

      if (!response.ok) {
        retryable = statusCode >= 500 && statusCode <= 599;
        await response.body?.cancel();
        throw new Error(`HTTP_${statusCode}`);
      }

      const data = await response.json();

      const health = {
        name: provider,
        status: "up",
        latencyMs: Date.now() - startedAt,
        attempts: attempt + 1,
      };

      console.log(JSON.stringify({
        event: "provider_request",
        ...health,
        statusCode,
      }));

      return { data, health };
    } catch (error) {
      const timedOut = controller.signal.aborted;
      retryable = retryable || timedOut;

      const code = timedOut
        ? "TIMEOUT"
        : statusCode
          ? `HTTP_${statusCode}`
          : error instanceof SyntaxError
            ? "INVALID_JSON"
            : "NETWORK_ERROR";

      console.log(JSON.stringify({
        event: "provider_attempt",
        provider,
        attempt: attempt + 1,
        code,
        latencyMs: Date.now() - startedAt,
      }));

      if (!retryable || attempt === maxRetries) {
        return {
          data: null,
          health: {
            name: provider,
            status: "down",
            latencyMs: Date.now() - startedAt,
            attempts: attempt + 1,
            error: code,
          },
        };
      }
    } finally {
      clearTimeout(timer);
    }

    await sleep(300 * (2 ** attempt));
  }
}

module.exports = { getJson };