import React, { useEffect, useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import WorkflowSteps from "./WorkflowSteps";
import "./styles.css";
import { CardProps } from "./Card";
import {
  createCustomer,
  createSetupIntent,
  createPaymentIntent,
  loadPaymentMethods as loadPaymentMethodsAPI,
  getStripeConfig,
} from "./StripeActions";
import { Modal, Button } from "antd";
import SaveCardSection from "./SaveCardSection";

interface PaymentMethod {
  id: string;
  type: string;
  card: CardProps | null;
}

const App: React.FC = () => {
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true); // Always show form for debugging
  const [amount, setAmount] = useState("10.00");
  const [chargeStatus, setChargeStatus] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [formReady, setFormReady] = useState(true); // Always ready for debugging
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const config = await getStripeConfig();
      setStripePromise(loadStripe(config.publishableKey));
    })();
  }, []);

  // Always fetch clientSecret for debugging
  useEffect(() => {
    (async () => {
      if (!customerId) return;
      const res = await createSetupIntent(customerId);
      setClientSecret(res.clientSecret);
    })();
  }, [customerId]);

  // Load payment methods
  const loadPaymentMethods = useCallback(async (cid: string) => {
    const res = await loadPaymentMethodsAPI(cid);
    if (res.paymentMethods && res.paymentMethods.length > 0) {
      setPaymentMethod(res.paymentMethods[0]);
      setShowForm(false);
    } else {
      setPaymentMethod(null);
      setShowForm(true);
    }
  }, []);

  // On customerId, load payment methods
  useEffect(() => {
    if (customerId) {
      loadPaymentMethods(customerId);
    }
  }, [customerId, loadPaymentMethods]);

  const fetchSetupIntent = async (cidToUse: string) => {
    const res = await createSetupIntent(cidToUse);
    setClientSecret(res.clientSecret);
  };

  // New: Start save card flow
  const startSaveCardFlow = async () => {
    setShowForm(true);
    setFormReady(true);
    // If no customerId, create one first, then fetch SetupIntent
    let cid = customerId;
    if (!cid) {
      const customer = await createCustomer(
        "User@example.com",
        "User Customer"
      );
      cid = customer.customerId;
      setCustomerId(cid);
    }
    // Wait for customerId to be set before fetching SetupIntent

    if (cid) {
      await fetchSetupIntent(cid);
    } else {
      // Wait for setCustomerId to finish, then fetch
      setTimeout(() => {
        if (customerId) fetchSetupIntent(customerId);
      }, 100);
    }
  };

  // Charge card
  const handleCharge = async () => {
    setChargeStatus("Processing...");
    if (!paymentMethod?.id || !customerId) return;
    const data = await createPaymentIntent(
      parseFloat(amount),
      paymentMethod.id,
      customerId
    );
    if (data.status === "succeeded") setChargeStatus("✅ Payment successful!");
    else setChargeStatus("❌ Payment failed.");
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    startSaveCardFlow();
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="payment-container">
      <div className="header">
        <h1>💳 Stripe Payment Element Demo (React)</h1>
        <p>Save → Display → Charge → Replace (with hooks)</p>
      </div>
      <Button
        type="primary"
        onClick={handleOpenModal}
        style={{ marginBottom: 24 }}
      >
        Add / Update Card
      </Button>
      <Modal
        title="Save Payment Method"
        open={modalOpen}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnClose
      >
        <SaveCardSection
          showForm={showForm}
          clientSecret={clientSecret}
          stripePromise={stripePromise}
          customerId={customerId}
          setCustomerId={setCustomerId}
          onSaved={() => {
            if (customerId) loadPaymentMethods(customerId);
            handleCloseModal();
          }}
          formReady={formReady}
          startSaveCardFlow={startSaveCardFlow}
          paymentMethod={paymentMethod}
        />
      </Modal>
      <WorkflowSteps
        showForm={showForm}
        clientSecret={clientSecret}
        stripePromise={stripePromise}
        customerId={customerId}
        setCustomerId={setCustomerId}
        onSaved={() => {
          if (customerId) loadPaymentMethods(customerId);
        }}
        formReady={formReady}
        startSaveCardFlow={startSaveCardFlow}
        paymentMethod={paymentMethod}
        amount={amount}
        setAmount={setAmount}
        handleCharge={handleCharge}
        chargeStatus={chargeStatus}
      />
    </div>
  );
};

export default App;
