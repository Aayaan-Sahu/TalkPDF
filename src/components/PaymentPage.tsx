import { supabase } from "../lib/supabaseClient";

const PaymentPage: React.FC = () => {
  const handleBuyNow = async () => {
    // Get the user's email from Supabase auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to purchase.");
      return;
    }

    // Call your backend to create a Stripe Checkout session
    const response = await fetch("http://localhost:4242/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    });

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url; // Redirect to Stripe Checkout
    } else {
      alert("Failed to start checkout: " + data.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Unlock Full Access</h1>
      <p className="mb-8 text-lg text-center max-w-md">
        You are not a paying customer yet. Click below to purchase access to the product.
      </p>
      <button
        className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition"
        onClick={handleBuyNow}
      >
        Buy Now
      </button>
    </div>
  );
};

export default PaymentPage; 