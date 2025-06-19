import React, { useState, FormEvent } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { createCustomer } from "./StripeActions";
import Card, { CardProps } from "./Card";

const SaveCardForm = ({
  customerId,
  setCustomerId,
  onSaved,
  paymentMethod,
}: {
  customerId: string | null;
  setCustomerId: (id: string) => void;
  onSaved: () => void;
  paymentMethod?: { id: string; type: string; card: CardProps | null } | null;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    let cid = customerId;
    if (!cid) {
      try {
        const customer = await createCustomer(
          "User@example.com",
          "User Customer"
        );
        cid = customer.customerId;
        if (cid) setCustomerId(cid);
      } catch (err) {
        setLoading(false);
        setError("Failed to create customer");
        return;
      }
    }
    if (!stripe || !elements || !cid) {
      setLoading(false);
      setError("Stripe not ready or customer missing");
      return;
    }
    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/payment-complete",
      },
      redirect: "if_required",
    });
    setLoading(false);
    if (error) setError(error.message || "Failed to save card");
    else if (setupIntent?.status === "succeeded") onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form-section">
      {/* Show saved card details if present */}
      {paymentMethod && paymentMethod.card && (
        <div style={{ marginBottom: 16 }}>
          <Card {...paymentMethod.card} />
        </div>
      )}
      <PaymentElement />
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Payment Method"}
      </button>
      {error && <div className="status error">{error}</div>}
    </form>
  );
};

export default SaveCardForm;
