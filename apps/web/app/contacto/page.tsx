"use client";

import { useState } from "react";
import { CLINIC_NAME, ADDRESS, PHONE, EMAIL } from "@/lib/constants";

export default function ContactoPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, page: 'contacto' }),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', phone: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h1 className="text-4xl font-bold mb-6">Contáctanos</h1>
          <p className="text-gray-600 mb-8">
            Estamos aquí para resolver tus dudas. Déjanos tus datos y nos pondremos en contacto contigo lo antes posible.
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-blue-600">Dirección</h3>
              <p>{ADDRESS}</p>
            </div>
            <div>
              <h3 className="font-bold text-blue-600">Teléfono</h3>
              <p>{PHONE}</p>
            </div>
            <div>
              <h3 className="font-bold text-blue-600">Email</h3>
              <p>{EMAIL}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Ej. +57 300 123 4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje (Opcional)</label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="¿En qué podemos ayudarte?"
              />
            </div>
            
            <button
              disabled={status === 'loading'}
              type="submit"
              className={`w-full py-4 rounded-xl font-bold text-white transition ${
                status === 'loading' ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar Mensaje'}
            </button>

            {status === 'success' && (
              <p className="text-green-600 text-center font-medium mt-4">
                ¡Gracias! Hemos recibido tu mensaje. Nos contactaremos pronto.
              </p>
            )}
            {status === 'error' && (
              <p className="text-red-600 text-center font-medium mt-4">
                Hubo un error al enviar. Por favor intenta de nuevo.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
