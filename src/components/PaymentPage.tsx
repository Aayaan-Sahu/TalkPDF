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
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-8 py-6 border-b bg-white/80 backdrop-blur z-10 animate-fade-in-down duration-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-primary">TalkPDF</span>
        </div>
        <div style={{ width: 120 }} /> {/* Spacer for symmetry */}
      </nav>
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center animate-fade-in-up">
          <h1 className="text-3xl font-bold mb-4 text-center">Unlock Full Access to TalkPDF</h1>
          <p className="mb-6 text-lg text-center text-gray-500">
            Get unlimited conversations with your PDFs, instant answers, and advanced AI-powered insights. <br />
            <span className="text-primary font-semibold">One low monthly price. Cancel anytime.</span>
          </p>
          <div className="w-full flex flex-col items-center mb-8">
            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-6 text-center mb-4">
              <span className="block text-4xl font-bold text-primary mb-2">$9</span>
              <span className="block text-gray-600 mb-2">per month</span>
              <ul className="text-gray-700 text-left text-base space-y-2 mx-auto max-w-xs">
                <li>✔️ Unlimited PDF uploads</li>
                <li>✔️ Unlimited chat & questions</li>
                <li>✔️ Fast, AI-powered answers</li>
                <li>✔️ Priority support</li>
                <li>✔️ Cancel anytime</li>
              </ul>
            </div>
          </div>
          <button
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-lg shadow hover:bg-gray-700 transition disabled:opacity-50"
            onClick={handleBuyNow}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 