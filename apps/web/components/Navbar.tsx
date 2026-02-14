"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { CLINIC_NAME, DENTALINK_URL, PHONE } from "@/lib/constants";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
      isScrolled 
        ? "bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-primary/10 py-2" 
        : "bg-white dark:bg-background-dark border-transparent py-4"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-lg transition-transform group-hover:scale-110">
            <span className="material-icons text-white text-xl">medical_services</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
            {CLINIC_NAME.split(' ')[0]}<span className="text-primary">{CLINIC_NAME.split(' ').slice(1).join('')}</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/servicios" className="text-sm font-medium hover:text-primary transition-colors">Servicios</Link>
          <Link href="/nosotros" className="text-sm font-medium hover:text-primary transition-colors">Nosotros</Link>
          <Link href="/testimonios" className="text-sm font-medium hover:text-primary transition-colors">Testimonios</Link>
          <Link href="/educacion" className="text-sm font-medium hover:text-primary transition-colors">Educación</Link>
          <Link href="/contacto" className="text-sm font-medium hover:text-primary transition-colors">Contacto</Link>
        </div>

        <div className="flex items-center gap-4">
          <a className="hidden lg:flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400" href={`tel:${PHONE}`}>
            <span className="material-icons text-primary text-sm">phone</span>
            {PHONE}
          </a>
          <a 
            href={DENTALINK_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-semibold transition-all transform active:scale-95 shadow-lg shadow-primary/20"
          >
            Reservar
          </a>
        </div>
      </div>
    </nav>
  );
}
