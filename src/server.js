require("dotenv").config();

const express = require("express");
const path = require("node:path");
const { getJson } = require("./httpClient");
const { mapCustomer, mapTransactions } = require("./mappers");

const app = express();
const port = Number(process.env.PORT || 3001);

for (const name of [
  "CORE_URL",
  "PAGOS_URL",
  "UNSTABLE_ERROR_URL",
  "UNSTABLE_SLOW_URL",
]) {
  if (!process.env[name]) {
    throw new Error(`Falta ${name} en el archivo .env`);
  }
}

app.use(express.static(path.join(__dirname, "../public")));

async function loadProvider(name, url, mapper) {
  const result = await getJson(name, url);

  if (result.health.status !== "up") {
    return result;
  }

  try {
    return {
      data: mapper(result.data),
      health: result.health,
    };
  } catch {
    console.log(JSON.stringify({
      event: "provider_mapping",
      provider: name,
      code: "INVALID_PAYLOAD",
    }));

    return {
      data: null,
      health: {
        ...result.health,
        status: "down",
        error: "INVALID_PAYLOAD",
      },
    };
  }
}

app.get("/api/v1/dashboard/:customerId", async (req, res, next) => {
  res.set("Cache-Control", "no-store");

  const rawId = req.params.customerId;
  const customerId = Number(rawId);

  if (!/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(customerId)) {
    return res.status(400).json({
      error: "customerId debe ser un entero positivo",
    });
  }

  try {
    const [core, payments, unstableError, unstableSlow] = await Promise.all([
      loadProvider(
        "CORE",
        `${process.env.CORE_URL}${customerId}`,
        mapCustomer
      ),
      loadProvider(
        "PAGOS",
        `${process.env.PAGOS_URL}${customerId}`,
        mapTransactions
      ),
      getJson("INESTABLE_500", process.env.UNSTABLE_ERROR_URL),
      getJson("INESTABLE_LENTO", process.env.UNSTABLE_SLOW_URL),
    ]);

    const providers = [
      core.health,
      payments.health,
      unstableError.health,
      unstableSlow.health,
    ];

    const warnings = providers
      .filter((provider) => provider.status === "down")
      .map((provider) => `${provider.name}: ${provider.error}`);

    const transactions = payments.data ?? [];
    const paymentsAvailable = payments.data !== null;

    const totalCents = transactions.reduce(
      (sum, transaction) => sum + Math.round(transaction.amount * 100),
      0
    );

    return res.status(200).json({
      customer: core.data,
      transactions,
      summary: {
        currency: "USD",
        transactionCount: paymentsAvailable ? transactions.length : null,
        totalAmount: paymentsAvailable ? totalCents / 100 : null,
      },
      providers,
      partial: warnings.length > 0,
      warnings,
      meta: {
        version: "four-providers-v1",
        mode: "live",
        transactionSource: "simulated_carts",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(JSON.stringify({
    event: "internal_error",
    code: "UNEXPECTED_ERROR",
  }));

  res.status(500).json({
    error: "Error interno inesperado",
  });
});

const server = app.listen(port);

server.on("listening", () => {
  console.log(`Archivo ejecutado: ${__filename}`);
  console.log(`PayLinkHub: http://localhost:${port}`);
  console.log("VERSION: four-providers-v1");
});

server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `Puerto ${port} ocupado: detén la instancia anterior.`
      : `Error al iniciar: ${error.code}`
  );
  process.exit(1);
});