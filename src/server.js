require("dotenv").config();

const express = require("express");
const path = require("node:path");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/v1/dashboard/:customerId", (req, res) => {
  const customerId = Number(req.params.customerId);

  if (!Number.isSafeInteger(customerId) || customerId <= 0) {
    return res.status(400).json({
      error: "customerId debe ser un entero positivo",
    });
  }

  res.json({
    customer: {
      id: customerId,
      name: "Cliente de demostración",
      email: "demo@example.com",
      phone: null,
      address: null,
    },
    transactions: [],
    summary: {
      currency: "USD",
      transactionCount: 0,
      totalAmount: 0,
    },
    providers: [
      { name: "CORE", status: "not_checked" },
      { name: "PAGOS", status: "not_checked" },
    ],
    partial: false,
    warnings: ["Datos de ejemplo; integración real pendiente"],
    meta: {
      mode: "demo",
      generatedAt: new Date().toISOString(),
    },
  });
});

app.listen(port, () => {
  console.log(`PayLinkHub disponible en http://localhost:${port}`);
});