const test = require("node:test");
const assert = require("node:assert/strict");
const { mapCustomer, mapTransactions } = require("../src/mappers");

test("el cliente solo incluye campos permitidos", () => {
  const customer = mapCustomer({
    id: 1,
    firstName: "Cliente",
    lastName: "Prueba",
    email: "prueba@example.com",
    phone: "+507 6000-0000",
    address: {
      address: "Calle de prueba",
      city: "Panamá",
      country: "Panamá",
      coordinates: { lat: 0, lng: 0 },
    },
    password: "SECRETO",
    ssn: "SECRETO",
    bank: { cardNumber: "SECRETO" },
    crypto: { wallet: "SECRETO" },
  });

  assert.deepEqual(customer, {
    id: 1,
    name: "Cliente Prueba",
    email: "prueba@example.com",
    phone: "+507 6000-0000",
    address: {
      street: "Calle de prueba",
      city: "Panamá",
      country: "Panamá",
    },
  });
});

test("recalcula importes sin confiar en totales del proveedor", () => {
  const transactions = mapTransactions({
    carts: [{
      id: 10,
      total: 999999,
      discountedTotal: 999999,
      products: [
        { price: 10, quantity: 2, discountPercentage: 10 },
        { price: 5, quantity: 1, discountPercentage: 0 },
      ],
    }],
  });

  assert.deepEqual(transactions, [{
    id: 10,
    description: "Consumo simulado - carrito 10",
    currency: "USD",
    itemCount: 3,
    grossAmount: 25,
    discountAmount: 2,
    amount: 23,
  }]);
});

test("distingue una lista vacía de una estructura inválida", () => {
  assert.deepEqual(mapTransactions({ carts: [] }), []);

  assert.throws(
    () => mapTransactions({ carts: null }),
    /INVALID_CARTS/
  );
});

test("rechaza descuentos fuera del rango permitido", () => {
  assert.throws(
    () => mapTransactions({
      carts: [{
        id: 1,
        products: [
          { price: 10, quantity: 1, discountPercentage: 150 },
        ],
      }],
    }),
    /INVALID_PRODUCT/
  );
});