function mapCustomer(data) {
  if (!data || !Number.isSafeInteger(data.id)) {
    throw new Error("INVALID_CUSTOMER");
  }

  // Lista explícita: ningún otro campo del proveedor sale por la API.
  return {
    id: data.id,
    name: [data.firstName, data.lastName].filter(Boolean).join(" "),
    email: data.email ?? null,
    phone: data.phone ?? null,
    address: data.address
      ? {
          street: data.address.address ?? null,
          city: data.address.city ?? null,
          country: data.address.country ?? null,
        }
      : null,
  };
}

function mapTransactions(data) {
  if (!data || !Array.isArray(data.carts)) {
    throw new Error("INVALID_CARTS");
  }

  return data.carts.map((cart) => {
    if (!Number.isSafeInteger(cart.id) || !Array.isArray(cart.products)) {
      throw new Error("INVALID_CART");
    }

    let grossCents = 0;
    let netCents = 0;
    let itemCount = 0;

    for (const product of cart.products) {
      const { price, quantity, discountPercentage } = product;
      const discount = discountPercentage ?? 0;

      if (
        !Number.isFinite(price) || price < 0 ||
        !Number.isSafeInteger(quantity) || quantity < 0 ||
        !Number.isFinite(discount) || discount < 0 || discount > 100
      ) {
        throw new Error("INVALID_PRODUCT");
      }

      const lineGrossCents = Math.round(price * 100) * quantity;
      const lineNetCents = Math.round(
        lineGrossCents * (1 - discount / 100)
      );

      grossCents += lineGrossCents;
      netCents += lineNetCents;
      itemCount += quantity;
    }

    return {
      id: cart.id,
      description: `Consumo simulado - carrito ${cart.id}`,
      currency: "USD",
      itemCount,
      grossAmount: grossCents / 100,
      discountAmount: (grossCents - netCents) / 100,
      amount: netCents / 100,
    };
  });
}

module.exports = { mapCustomer, mapTransactions };