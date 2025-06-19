import React from "react";
import { Elements, PaymentElement } from "@stripe/react-stripe-js";
import SaveCardForm from "./SaveCardForm";
import { loadPaymentMethods, removePaymentMethod } from "./StripeActions";
import { Button, Space, Popconfirm, message } from "antd";
import Card from "./Card";

const SaveCardSection: React.FC<{
  showForm: boolean;
  clientSecret: string | null;
  stripePromise: any;
  customerId: string | null;
  setCustomerId: (id: string) => void;
  onSaved: () => void;
  formReady: boolean;
  startSaveCardFlow: () => void;
  paymentMethod: any;
}> = ({
  showForm,
  clientSecret,
  stripePromise,
  customerId,
  setCustomerId,
  onSaved,
  formReady,
  startSaveCardFlow,
  paymentMethod,
}) => {
  const [showCardForm, setShowCardForm] = React.useState(false);

  const handleRemoveCard = async () => {
    if (paymentMethod && paymentMethod.id) {
      await removePaymentMethod(paymentMethod.id);
      if (customerId) loadPaymentMethods(customerId);
      setShowCardForm(false);
      message.success("Card removed");
    }
  };
  const handleChangeCard = () => {
    setShowCardForm(true);
    startSaveCardFlow();
  };
  return (
    <div className="step-content">
      {paymentMethod && paymentMethod.card && !showCardForm && (
        <div className="saved-card-section">
          <Card {...paymentMethod.card} />
          <Space style={{ marginTop: 16 }}>
            <Popconfirm
              title="Remove this card?"
              onConfirm={handleRemoveCard}
              okText="Yes"
              cancelText="No"
            >
              <Button danger type="primary">
                Remove Card
              </Button>
            </Popconfirm>
            <Button onClick={handleChangeCard} type="default">
              Change Card
            </Button>
          </Space>
        </div>
      )}
      {(!paymentMethod || !paymentMethod.card || showCardForm) &&
        showForm &&
        clientSecret &&
        stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <SaveCardForm
              customerId={customerId}
              setCustomerId={setCustomerId}
              onSaved={() => {
                onSaved();
                setShowCardForm(false);
              }}
              paymentMethod={paymentMethod}
            />
          </Elements>
        )}
    </div>
  );
};

export default SaveCardSection;
