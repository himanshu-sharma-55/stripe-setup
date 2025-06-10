# 💳 Stripe Payment Element Demo

A complete TypeScript implementation showcasing Stripe's Payment Element with a professional UI. This demo demonstrates the full workflow: **Save → Display → Charge → Replace** payment methods using Stripe's secure, PCI-compliant Payment Element.

## 🌟 Features

- **Professional UI** using Stripe's Payment Element
- **Complete workflow**: Save payment methods, display saved cards, charge payments, replace cards
- **Single card management** (no multiple cards complexity)
- **TypeScript** throughout with full type safety
- **Error boundaries** and comprehensive error handling
- **Responsive design** with modern CSS
- **Security-first** approach with proper CSP headers
- **PCI Compliance** through Stripe's Payment Element

## 🏗️ Architecture

### Frontend (Client)
- **TypeScript** with Stripe.js integration
- **Payment Element** for secure card collection
- **Setup Intents** for saving payment methods
- **Payment Intents** for charging saved cards
- **Modern CSS** with gradients and animations

### Backend (Server)
- **Express.js** with TypeScript
- **Stripe Node.js SDK** for server-side operations
- **Security middleware** (Helmet, CORS)
- **Error handling** with proper HTTP status codes
- **Webhook support** for payment confirmations

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd StripePOC
npm install
```

### 2. Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your Stripe keys:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Webhook Configuration (optional)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4. Run the Application

```bash
# Development mode (runs both server and client)
npm run dev

# Or run separately:
npm run dev:server  # Server on port 3000
npm run dev:client  # Client on port 8080
```

Visit `http://localhost:8080` to see the application.

## 📖 How It Works

### Payment Element Integration

This application uses Stripe's **Payment Element**, which is the recommended way to collect payment information:

```typescript
// 1. Create Setup Intent for saving payment methods
const setupIntent = await stripe.setupIntents.create({
  payment_method_types: ['card'],
  usage: 'off_session',
  customer: customerId
});

// 2. Initialize Payment Element
const elements = stripe.elements({
  clientSecret: setupIntent.client_secret,
  appearance: { theme: 'stripe' }
});

// 3. Create and mount Payment Element
const paymentElement = elements.create('payment');
paymentElement.mount('#payment-element-container');
```

### Complete Workflow

#### 1. **Save Payment Method**
- Creates a **Setup Intent** to collect payment details
- Uses Payment Element for secure, PCI-compliant collection
- Saves payment method to customer without charging

#### 2. **Display Saved Card**
- Shows saved payment method with masked card number
- Displays card brand, last 4 digits, and expiration
- Professional card UI with hover effects

#### 3. **Charge Payment**
- Creates **Payment Intent** with saved payment method
- Processes payment server-side for security
- Shows real-time payment status

#### 4. **Replace Card**
- Allows updating payment method
- Smooth transition between saved and new card states
- Maintains single card per customer model

## 🔒 Security Features

### Content Security Policy
```javascript
helmet({
  contentSecurityPolicy: {
    directives: {
      scriptSrc: ["'self'", "https://js.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com"]
    }
  }
})
```

### Error Handling
- **Client-side**: User-friendly error messages
- **Server-side**: Proper HTTP status codes and logging
- **Stripe errors**: Specific handling for payment failures

### Input Validation
- Amount validation (minimum $0.50)
- Required field validation
- Type-safe TypeScript interfaces

## 🛠️ Development

### Build for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

### Project Structure

```
src/
├── client/
│   ├── index.html          # HTML template
│   ├── index.ts           # Client entry point
│   ├── stripe-app.ts      # Main Stripe integration
│   └── styles.css         # Professional UI styles
└── server/
    ├── server.ts          # Express server
    ├── middleware/
    │   └── errorHandler.ts # Error handling
    ├── routes/
    │   └── stripe.ts      # Stripe API routes
    └── services/
        └── stripeService.ts # Stripe service layer
```

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stripe/config` | Get Stripe publishable key |
| `POST` | `/api/stripe/create-setup-intent` | Create Setup Intent for saving cards |
| `POST` | `/api/stripe/create-payment-intent` | Create Payment Intent for charging |
| `POST` | `/api/stripe/customer` | Create new customer |
| `GET` | `/api/stripe/customer/:id/payment-methods` | Get saved payment methods |
| `DELETE` | `/api/stripe/payment-method/:id` | Remove payment method |
| `POST` | `/api/stripe/webhook` | Handle Stripe webhooks |

## 🧪 Testing

### Test Cards

Use these test card numbers in development:

| Card Number | Description |
|------------|-------------|
| `4242424242424242` | Visa - Success |
| `4000000000000002` | Visa - Declined |
| `4000000000009995` | Visa - Insufficient funds |

**Expiry**: Any future date  
**CVC**: Any 3 digits  
**ZIP**: Any 5 digits

### Testing Workflow

1. **Save a test card** using one of the numbers above
2. **Verify card display** shows correct brand and last 4 digits
3. **Make a test payment** with any amount ≥ $0.50
4. **Replace the card** to test the complete flow

## 🌐 Webhooks (Optional)

For production, set up webhooks to handle payment confirmations:

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events: `setup_intent.succeeded`, `payment_intent.succeeded`
4. Copy webhook secret to your `.env` file

## 🚨 Important Notes

### Security
- Never expose your **Secret Key** in client-side code
- Always validate payments server-side
- Use HTTPS in production
- Implement proper authentication for real customers

### PCI Compliance
- Payment Element handles PCI compliance automatically
- Never store raw card data on your servers
- Use Stripe's secure vault for payment methods

### Production Checklist
- [ ] Replace test keys with live keys
- [ ] Set up proper customer authentication
- [ ] Configure webhooks for payment confirmations
- [ ] Set up proper error monitoring
- [ ] Configure CORS for your domain
- [ ] Set up SSL/HTTPS

## 🔧 Troubleshooting

### Common Issues

**"Failed to load Stripe"**
- Check your publishable key in `.env`
- Ensure key starts with `pk_test_` or `pk_live_`

**"Payment method creation failed"**
- Verify your secret key is correct
- Check server logs for Stripe API errors

**"CORS errors"**
- Update CORS configuration in `server.ts`
- Add your domain to allowed origins

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages and stack traces.

## 📚 Learn More

- [Stripe Payment Element Guide](https://stripe.com/docs/payments/payment-element)
- [Setup Intents Documentation](https://stripe.com/docs/payments/setup-intents)
- [Payment Intents Documentation](https://stripe.com/docs/payments/payment-intents)
- [Stripe.js Reference](https://stripe.com/docs/js)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ using Stripe's Payment Element**
