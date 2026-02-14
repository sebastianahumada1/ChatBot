import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import MobileBar from "@/components/MobileBar";
import CookieBanner from "@/components/CookieBanner";
import { CLINIC_NAME, CITY, ADDRESS, PHONE, SITE_URL } from "@/lib/constants";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: {
    default: `${CLINIC_NAME} | Odontología de Precisión en ${CITY}`,
    template: `%s | ${CLINIC_NAME}`
  },
  description: `Clínica dental líder en ${CITY}. Especialistas en diseño de sonrisa, implantes dentales y ortodoncia invisible con tecnología 3D.`,
  keywords: ["odontología", "dentista", "diseño de sonrisa", "implantes dentales", CITY, CLINIC_NAME],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-display antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 selection:bg-primary/20 selection:text-primary`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalClinic",
              "name": CLINIC_NAME,
              "image": `${SITE_URL}/logo.png`,
              "@id": SITE_URL,
              "url": SITE_URL,
              "telephone": PHONE,
              "address": {
                "@type": "PostalAddress",
                "streetAddress": ADDRESS,
                "addressLocality": CITY,
                "addressCountry": "CO"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 11.225,
                "longitude": -74.197
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "08:00",
                  "closes": "18:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Saturday",
                  "opens": "08:00",
                  "closes": "13:00"
                }
              ]
            })
          }}
        />
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <WhatsAppFloat />
        <MobileBar />
        <CookieBanner />
      </body>
    </html>
  );
}
