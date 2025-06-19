import React from "react";
import SaveCardSection from "./SaveCardSection";
import ChargeSection from "./ChargeSection";

const WorkflowSteps: React.FC<{
  showForm: boolean;
  clientSecret: string | null;
  stripePromise: any;
  customerId: string | null;
  setCustomerId: (id: string) => void;
  onSaved: () => void;
  formReady: boolean;
  startSaveCardFlow: () => void;
  paymentMethod: any;
  amount: string;
  setAmount: (val: string) => void;
  handleCharge: () => void;
  chargeStatus: string | null;
}> = (props) => (
  <div className="workflow-steps">
    {/* <div className="step">
      <div className="step-number">1</div>
      <SaveCardSection
        showForm={props.showForm}
        clientSecret={props.clientSecret}
        stripePromise={props.stripePromise}
        customerId={props.customerId}
        setCustomerId={props.setCustomerId}
        onSaved={props.onSaved}
        formReady={props.formReady}
        startSaveCardFlow={props.startSaveCardFlow}
        paymentMethod={props.paymentMethod}
      />
    </div> */}
    <div className="step">
      <div className="step-number">2</div>
      <ChargeSection
        paymentMethod={props.paymentMethod}
        showForm={props.showForm}
        amount={props.amount}
        setAmount={props.setAmount}
        handleCharge={props.handleCharge}
        chargeStatus={props.chargeStatus}
      />
    </div>
  </div>
);

export default WorkflowSteps;
