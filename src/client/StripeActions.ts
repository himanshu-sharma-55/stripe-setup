// StripeActions.ts

export async function createCustomer(email: string, name?: string) {
  const res = await fetch("/api/stripe/customer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });
  return res.json();
}

export async function createSetupIntent(customerId: string) {
  const res = await fetch("/api/stripe/create-setup-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId }),
  });
  return res.json();
}

export async function createPaymentIntent(
  amount: number,
  paymentMethodId: string,
  customerId: string,
  currency = "usd"
) {
  const res = await fetch("/api/stripe/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency, paymentMethodId, customerId }),
  });
  return res.json();
}

export async function loadPaymentMethods(customerId: string) {
  const res = await fetch(`/api/stripe/customer/${customerId}/payment-methods`);
  return res.json();
}

export async function getStripeConfig() {
  const res = await fetch("/api/stripe/config");
  return res.json();
}

export async function removePaymentMethod(paymentMethodId: string) {
  const res = await fetch(`/api/stripe/payment-method/${paymentMethodId}`, {
    method: "DELETE",
  });
  return res.json();
}
