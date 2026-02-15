export const CLINIC_NAME = process.env.NEXT_PUBLIC_CLINIC_NAME || "Clínica Dr. Albeiro García";
export const CITY = process.env.NEXT_PUBLIC_CITY || "Santa Marta";
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573015129925";
export const PHONE = process.env.NEXT_PUBLIC_PHONE || "+573015129925";
export const EMAIL = process.env.NEXT_PUBLIC_EMAIL || "rieodontologia@outlook.com";
export const ADDRESS = process.env.NEXT_PUBLIC_ADDRESS || "Cra. 4 #12-55, Piso 3, Rodadero";
export const DENTALINK_URL = process.env.NEXT_PUBLIC_DENTALINK_BOOKING_URL || "https://albeirogarcavalera.softwaredentalink.com/agendar";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const WHATSAPP_MESSAGE = `Hola, quiero agendar una cita en ${CLINIC_NAME} en ${CITY}.`;
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
