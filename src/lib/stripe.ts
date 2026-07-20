import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";

// Backend side par Stripe ko initialize karein (.env se secret key lekar)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any, 
});

// Yeh ek secure Server Function hai jo sirf backend par chalega
export const createPaymentIntent = createServerFn()
  .validator((amount: number) => {
    if (typeof amount !== "number" || amount <= 0) {
      throw new Error("Invalid amount");
    }
    return amount;
  })
  .handler(async ({ data: amount }) => {
    try {
      // Stripe se dynamic payment intent create karein
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Rupaye ko paise (cents) mein convert karne ke liye
        currency: "usd", // Humne US test account banaya hai
        automatic_payment_methods: { enabled: true },
      });

      // Frontend ke liye token return karein
      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error: any) {
      console.error("Stripe Error:", error);
      throw new Error(error.message || "Failed to create payment intent");
    }
  });