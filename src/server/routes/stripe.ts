import express, { Router } from "express";
import { StripeService } from "../services/stripeService";
import { createError } from "../middleware/errorHandler";

const router: Router = express.Router();

// Lazy initialization of StripeService to ensure env vars are loaded
let stripeService: StripeService;
const getStripeService = () => {
  if (!stripeService) {
    stripeService = new StripeService();
  }
  return stripeService;
};

/**
 * GET /api/stripe/config
 * Returns the Stripe publishable key for client-side initialization
 */
router.get("/config", (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

/**
 * POST /api/stripe/create-setup-intent
 * Creates a Setup Intent for saving payment methods without immediate charge
 * Used by Payment Element to securely collect and save card details
 */
router.post("/create-setup-intent", async (req, res, next) => {
  try {
    const { customerId } = req.body;

    const setupIntent = await getStripeService().createSetupIntent(customerId);

    res.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    });
  } catch (err: any) {
    next(
      createError(`Failed to create setup intent: ${err.message || err}`, 400)
    );
  }
});

/**
 * POST /api/stripe/create-payment-intent
 * Creates a Payment Intent for charging a saved payment method
 */
router.post("/create-payment-intent", async (req, res, next) => {
  try {
    const { amount, currency = "usd", paymentMethodId, customerId } = req.body;

    if (!amount || !paymentMethodId) {
      throw createError("Amount and payment method ID are required", 400);
    }

    const paymentIntent = await getStripeService().createPaymentIntent({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      paymentMethodId,
      customerId,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    });
  } catch (err: any) {
    next(
      createError(`Failed to create payment intent: ${err.message || err}`, 400)
    );
  }
});

/**
 * GET /api/stripe/customer/:customerId/payment-methods
 * Retrieves saved payment methods for a customer
 */
router.get("/customer/:customerId/payment-methods", async (req, res, next) => {
  try {
    const { customerId } = req.params;

    const paymentMethods = await getStripeService().getCustomerPaymentMethods(
      customerId
    );

    res.json({
      paymentMethods: paymentMethods.data.map((pm) => ({
        id: pm.id,
        type: pm.type,
        card: pm.card
          ? {
              brand: pm.card.brand,
              last4: pm.card.last4,
              expMonth: pm.card.exp_month,
              expYear: pm.card.exp_year,
            }
          : null,
      })),
    });
  } catch (err: any) {
    next(
      createError(
        `Failed to retrieve payment methods: ${err.message || err}`,
        400
      )
    );
  }
});

/**
 * POST /api/stripe/customer
 * Creates a new Stripe customer
 */
router.post("/customer", async (req, res, next) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      throw createError("Email is required", 400);
    }

    const newCustomer = await getStripeService().createCustomer({
      email,
      name,
    });
    res.json({
      customerId: newCustomer.id,
      email: newCustomer.email,
    });
  } catch (err: any) {
    next(createError(`Failed to create customer: ${err.message || err}`, 400));
  }
});

/**
 * DELETE /api/stripe/payment-method/:paymentMethodId
 * Detaches (removes) a payment method from a customer
 */
router.delete("/payment-method/:paymentMethodId", async (req, res, next) => {
  try {
    const { paymentMethodId } = req.params;

    await getStripeService().detachPaymentMethod(paymentMethodId);

    res.json({ success: true });
  } catch (err: any) {
    next(
      createError(`Failed to remove payment method: ${err.message || err}`, 400)
    );
  }
});

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhooks for payment confirmations and other events
 */
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res, next) => {
//     try {
//       const sig = req.headers["stripe-signature"] as string;
//       const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

//       if (!webhookSecret) {
//         throw createError("Webhook secret not configured", 500);
//       }

//       const event = await stripeService.handleWebhook(
//         req.body,
//         sig,
//         webhookSecret
//       );

//       // Handle different event types
//       switch (event.type) {
//         case "setup_intent.succeeded":
//           console.log("✅ Setup Intent succeeded:", event.data.object.id);
//           break;
//         case "payment_intent.succeeded":
//           console.log("✅ Payment succeeded:", event.data.object.id);
//           break;
//         case "payment_intent.payment_failed":
//           console.log("❌ Payment failed:", event.data.object.id);
//           break;
//         default:
//           console.log(`Unhandled event type: ${event.type}`);
//       }

//       res.json({ received: true });
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : String(error);
//       next(createError(`Webhook error: ${errorMessage}`, 400));
//     }
//   }
// );

export { router as stripeRoutes };
