# stripe-setup

https://github.com/himanshu-sharma-55/stripe-setup/issues/1#issue-3132751538

sequenceDiagram
    participant User
    participant Frontend as Frontend (React)
    participant Backend as Backend (C#)
    participant Stripe
    participant DB as Database
    
    Note over User, DB: Step 1: Frontend UI Interaction
    User->>Frontend: Opens modal to save card
    User->>Frontend: Fills card info & clicks "Save Card"
    
    Note over Frontend, Backend: Step 2: Get or Create Customer
    Frontend->>Backend: POST /api/payment/get-or-create-customer {userId: "user-123"}
    Backend->>DB: Check for existing Stripe customerId
    
    alt No existing customerId
        Backend->>Stripe: CustomerService().CreateAsync(email)
        Stripe-->>Backend: Return customer object
        Backend->>DB: Save Stripe customerId
    end
    
    Backend-->>Frontend: Response {customerId: "cus_abc123"}
    
    Note over Frontend, Stripe: Step 3: Create Setup Intent
    Frontend->>Backend: POST /api/payment/create-setup-intent {customerId: "cus_abc123"}
    Backend->>Stripe: SetupIntentService().CreateAsync(customerId)
    Stripe-->>Backend: Return setupIntent with clientSecret
    Backend-->>Frontend: Response {clientSecret: "seti_123_secret_abc"}
    
    Note over Frontend, Stripe: Step 4: Process Card with Stripe.js
    Frontend->>Stripe: confirmCardSetup(clientSecret, {payment_method: {card: ...}})
    Stripe-->>Frontend: Response {setupIntent: {id, status, payment_method: "pm_456"}}
    
    Note over Frontend, DB: Step 5: Save Payment Method
    Frontend->>Backend: POST /api/payment/save-method {customerId, paymentMethodId}
    Backend->>Stripe: PaymentMethodService().AttachAsync(paymentMethodId, customerId)
    Backend->>DB: Save customerId and paymentMethodId
    Backend-->>Frontend: Success response
    Frontend-->>User: Display success message
    
    Note over User, DB: Card is now saved for future billing

