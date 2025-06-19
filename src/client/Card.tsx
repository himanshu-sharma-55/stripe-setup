import React from "react";

export interface CardProps {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

const Card: React.FC<CardProps> = ({ brand, last4, expMonth, expYear }) => (
  <div className="saved-card">
    <div className="card-icon">💳</div>
    <div className="card-details">
      <div className="card-brand">{brand.toUpperCase()}</div>
      <div className="card-number">•••• •••• •••• {last4}</div>
      <div className="card-expiry">
        {expMonth}/{expYear}
      </div>
    </div>
    <div className="card-status">✅ Saved</div>
  </div>
);

export default Card;
