"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const PaymentResultPage = () => {
  const params = useParams();
  const { id } = params; // Extract payment ID from the route
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`https://proc-back.onrender.com/api/payments/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch payment details");
        }
        const data = await response.json();
        setPaymentDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [id]);

  const retryPayment = async () => {
    if (!paymentDetails) return;

    try {
      const response = await fetch("https://proc-back.onrender.com/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paymentDetails.amount,
          description: paymentDetails.description,
          redirectUrl: `http://localhost:3000/paymentpage/${id}`,
          paymentMethod: paymentDetails.paymentMethod,
        }),
      });

      const { checkoutUrl } = await response.json();
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      console.error("Error retrying payment:", err);
    }
  };

  if (loading) {
    return <div>Loading payment details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const { paymentStatus, amount, description, checkoutUrl } = paymentDetails;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg">
        <h1 className="text-xl font-bold mb-4">Betalingsresultaat</h1>

        <div className="mb-4">
          <p><strong>Beschrijving:</strong> {description}</p>
          <p><strong>Bedrag:</strong> €{amount.toFixed(2)}</p>
          <p><strong>Status:</strong> {paymentStatus}</p>
        </div>

        {paymentStatus === "pending" && (
          <div>
            <p className="text-yellow-600 mb-4">
              Uw betaling is nog in afwachting. Klik op de knop hieronder om de betaling te voltooien.
            </p>
            <a
              href={checkoutUrl}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Ga naar de betaalpagina
            </a>
          </div>
        )}

        {paymentStatus === "completed" && (
          <p className="text-green-600">
            Uw betaling is succesvol afgerond. Bedankt voor uw bestelling!
          </p>
        )}

        {paymentStatus === "failed" && (
          <div>
            <p className="text-red-600 mb-4">Uw betaling is mislukt.</p>
            <button
              onClick={retryPayment}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-500"
            >
              Probeer opnieuw
            </button>
          </div>
        )}

        {paymentStatus === "canceled" && (
          <p className="text-gray-600">
            Uw betaling is geannuleerd. U kunt teruggaan naar de abonnementspagina om een andere betaalmethode te kiezen.
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentResultPage;
