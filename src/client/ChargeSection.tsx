import React, { ChangeEvent } from "react";

const ChargeSection: React.FC<{
  paymentMethod: any;
  showForm: boolean;
  amount: string;
  setAmount: (val: string) => void;
  handleCharge: () => void;
  chargeStatus: string | null;
}> = ({
  paymentMethod,
  //   showForm,
  amount,
  setAmount,
  handleCharge,
  chargeStatus,
}) => (
  <div className="step-content">
    <h3>Make Payment</h3>
    {paymentMethod && paymentMethod.card ? (
      <div className="charge-section">
        <div className="amount-input">
          <label htmlFor="amount">Amount ($)</label>
          <input
            type="number"
            id="amount"
            min="0.50"
            step="0.01"
            value={amount}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setAmount(e.target.value)
            }
          />
        </div>
        <button className="btn btn-success" onClick={handleCharge}>
          Charge Card
        </button>
        {chargeStatus && <div className="status info">{chargeStatus}</div>}
      </div>
    ) : (
      <p className="message">Save a payment method first</p>
    )}
  </div>
);

export default ChargeSection;
