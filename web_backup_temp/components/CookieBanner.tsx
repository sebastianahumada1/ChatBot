"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-4 right-4 md:left-8 md:right-auto md:max-w-md bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 z-[60]">
      <p className="text-gray-600 text-sm mb-4">
        Utilizamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestra{" "}
        <Link href="/legal/cookies" className="text-blue-600 underline">política de cookies</Link>.
      </p>
      <button 
        onClick={accept}
        className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700 transition"
      >
        Aceptar
      </button>
    </div>
  );
}
