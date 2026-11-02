require("dotenv").config();

const express = require("express");
const path = require("node:path");
const { getJson } = require("./httpClient");
const { mapCustomer, mapTransactions } = require("./mappers");

const app = express();
const port = process.env.PORT || 3000;

for (const name of ["CORE_URL", "PAGOS_URL"]) {
  if (!process.env[name]) {
    throw new Error(`Falta ${name}. Copia .env.example a .env`);
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
  const rawId = req.params.customerId;
  const customerId = Number(rawId);

  if (
    !/^[1-9]\d*$/.test(rawId) ||
    !Number.isSafeInteger(customerId)
  ) {
    return res.status(400).json({
      error: "customerId debe ser un entero positivo",
    });
  }

  try {
    const [core, payments] = await Promise.all([
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
    ]);

    const providers = [core.health, payments.health];
    const warnings = providers
      .filter((provider) => provider.status === "down")
      .map((provider) => `${provider.name}: ${provider.error}`);

    const transactions = payments.data ?? [];

    res.set("Cache-Control", "no-store");

    res.json({
      customer: core.data,
      transactions,
      summary: {
        currency: "USD",
        transactionCount: payments.data === null
          ? null
          : transactions.length,
        totalAmount: payments.data === null
          ? null
          : transactions.reduce(
              (sum, transaction) => sum + Math.round(transaction.amount * 100),
              0
            ) / 100,
      },
      providers,
      partial: warnings.length > 0,
      warnings,
      meta: {
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

  res.status(500).json({ error: "Error interno inesperado" });
});

app.listen(port, () => {
  console.log(`PayLinkHub disponible en http://localhost:${port}`);
});