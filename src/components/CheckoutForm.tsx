import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface CheckoutFormProps {
  amount: number;
  onSuccess: (paymentIntentId?: string) => void;
}

export function CheckoutForm({ amount, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage(null);

    // Card Details ko Stripe ke secure system par submit karein
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/order-success", // Payment success hone ke baad user kahan jayega
      },
      redirect: "if_required", // Test mode mein extra redirects ko skip karne ke liye
    });

    if (error) {
      setErrorMessage(error.message || "Something went wrong.");
      setLoading(false);
    } else {
      // Payment Successful!
      setLoading(false);
      onSuccess(paymentIntent?.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-xl bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800">Pay ${amount.toFixed(2)} securely via Stripe</h3>
      
      {/* Stripe ka auto card-input design yahan render hoga */}
      <PaymentElement />

      {errorMessage && (
        <div className="p-2 text-sm text-red-600 bg-red-50 rounded-md">
          {errorMessage}
        </div>
      )}

      <button
        disabled={!stripe || loading}
        className="w-full py-3 font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Processing..." : `Pay Now $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}