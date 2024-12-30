"use client";

import React, { useState, useEffect } from "react";
import { PaymentMethod } from "@/components/pricing/PaymentMethod";
import { AdvantageItem } from "@/components/pricing/AdvantageItem";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const advantages = {
  PRO: [
    { text: "Verhoogde zichtbaarheid voor meer exposure" },
    { text: "15 privé contacten per maand voor meer kansen" },
    { text: "Uitgebreid profiel met portfolio showcase" },
    { text: "Bespaar €48 met jaarlijks abonnement" },
  ],
  PREMIUM: [
    { text: "Maximale zichtbaarheid voor optimaal bereik" },
    { text: "Onbeperkt contact voor grenzeloze mogelijkheden" },
    { text: "Prioriteit in zoekresultaten voor maximale exposure" },
    { text: "Bespaar €120 met jaarlijks abonnement" },
  ],
};

const PaymentPage = () => {
  const searchParams = useSearchParams();
  const [selectedPayment, setSelectedPayment] = useState("ideal");
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("PRO");

  // Extract plan parameters from URL
  useEffect(() => {
    const plan = searchParams.get("plan");
    const period = searchParams.get("period");

    if (plan) {
      setSelectedPlan(plan);
    }

    if (period && period.includes("jaar")) {
      setIsYearly(true);
    }
  }, [searchParams]);

  const planPrices = {
    PRO: {
      monthly: "19.99",
      yearly: "191.90",
    },
    PREMIUM: {
      monthly: "49.99",
      yearly: "479.90",
    },
  };

  const currentPrice = planPrices[selectedPlan][isYearly ? "yearly" : "monthly"];
  const period = isYearly ? "per jaar" : "per maand";

  const handlePayment = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(currentPrice),
          description: `Abonnement: ${selectedPlan}`,
          redirectUrl: `http://localhost:3000/paymentpage`, // Redirects to the base of the new `paymentpage/[id]`
          paymentMethod: selectedPayment,
        }),
      });

      const { paymentId } = await response.json(); // Get the payment ID from the backend
      if (paymentId) {
        window.location.href = `/paymentpage/${paymentId}`; // Redirect to the new payment result page
      } else {
        console.error("Payment ID not received from backend");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#27AAE2]/10 to-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-[#27AAE2]/10 text-[#27AAE2] rounded-full text-sm font-medium mb-4">
            Bevestig uw {selectedPlan} abonnement
          </span>
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-[#27AAE2]">Betaling</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Kies uw gewenste betaalmethode en bevestig uw bestelling
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Plan Selection */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Gekozen abonnement</h2>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="bg-[#27AAE2]/10 text-[#27AAE2] px-4 py-2 rounded-lg font-medium"
                  >
                    <option value="PRO">PRO</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                  <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-full">
                    <button
                      onClick={() => setIsYearly(false)}
                      className={`px-4 py-1 rounded-full transition-all ${
                        !isYearly ? "bg-white shadow-sm" : ""
                      }`}
                    >
                      Maandelijks
                    </button>
                    <button
                      onClick={() => setIsYearly(true)}
                      className={`px-4 py-1 rounded-full transition-all ${
                        isYearly ? "bg-white shadow-sm" : ""
                      }`}
                    >
                      Jaarlijks
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#27AAE2]">
                  €{currentPrice}
                  <span className="text-base font-normal text-gray-600 ml-1">
                    {period}
                  </span>
                </div>
                {isYearly && (
                  <span className="text-green-500 text-sm font-medium">
                    20% korting
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {advantages[selectedPlan].map((advantage, index) => (
                <AdvantageItem key={index} text={advantage.text} />
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Betaalmethode</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <PaymentMethod
                title="iDEAL"
                isSelected={selectedPayment === "ideal"}
                onClick={() => setSelectedPayment("ideal")}
              />
              <PaymentMethod
                title="PayPal"
                isSelected={selectedPayment === "paypal"}
                onClick={() => setSelectedPayment("paypal")}
              />
              <PaymentMethod
                title="Bancontact"
                isSelected={selectedPayment === "bancontact"}
                onClick={() => setSelectedPayment("bancontact")}
              />
              <PaymentMethod
                title="SEPA"
                isSelected={selectedPayment === "sepa"}
                onClick={() => setSelectedPayment("sepa")}
              />
              <PaymentMethod
                title="Visa/Mastercard"
                isSelected={selectedPayment === "creditcard"}
                onClick={() => setSelectedPayment("creditcard")}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-[#27AAE2] transition-colors"
            >
              ← Terug naar abonnementen
            </Link>
            <button
              onClick={handlePayment}
              className="px-8 py-4 bg-[#27AAE2] text-white rounded-lg font-medium hover:bg-[#27AAE2]/90 transition-all"
            >
              Bevestig betaling
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;
