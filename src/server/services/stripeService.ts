import Stripe from "stripe";

export class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      typescript: true,
    });
  }

  /**
   * Creates a Setup Intent for saving payment methods
   * Setup Intents are used with Payment Element to collect payment details
   * without immediately charging the customer
   */
  async createSetupIntent(customerId?: string): Promise<Stripe.SetupIntent> {
    const params: Stripe.SetupIntentCreateParams = {
      // Specify payment method types you want to accept
      payment_method_types: ["card"],
      usage: "off_session", // For future payments
    };

    // If customerId is provided, attach the setup intent to the customer
    if (customerId) {
      params.customer = customerId;
    }

    return await this.stripe.setupIntents.create(params);
  }

  /**
   * Creates a Payment Intent for charging a customer
   */
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    customerId?: string;
  }): Promise<Stripe.PaymentIntent> {
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: params.amount,
      currency: params.currency,
      payment_method: params.paymentMethodId,
      confirmation_method: "manual",
      confirm: true,
      return_url: `${
        process.env.CLIENT_URL || "http://localhost:8080"
      }/payment-complete`,
    };

    if (params.customerId) {
      paymentIntentParams.customer = params.customerId;
    }

    return await this.stripe.paymentIntents.create(paymentIntentParams);
  }

  /**
   * Creates a new Stripe customer
   */
  async createCustomer(params: {
    email: string;
    name?: string;
  }): Promise<Stripe.Customer> {
    return await this.stripe.customers.create({
      email: params.email,
      name: params.name,
    });
  }

  /**
   * Retrieves all payment methods for a customer
   */
  async getCustomerPaymentMethods(
    customerId: string
  ): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
    return await this.stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });
  }

  /**
   * Detaches a payment method from a customer (removes it)
   */
  async detachPaymentMethod(
    paymentMethodId: string
  ): Promise<Stripe.PaymentMethod> {
    return await this.stripe.paymentMethods.detach(paymentMethodId);
  }

  /**
   * Handles Stripe webhooks by verifying the signature and parsing the event
   */
  async handleWebhook(
    body: Buffer,
    signature: string,
    webhookSecret: string
  ): Promise<Stripe.Event> {
    return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }

  /**
   * Retrieves a Setup Intent by ID
   */
  async getSetupIntent(setupIntentId: string): Promise<Stripe.SetupIntent> {
    return await this.stripe.setupIntents.retrieve(setupIntentId);
  }

  /**
   * Retrieves a Payment Intent by ID
   */
  async getPaymentIntent(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }
}
