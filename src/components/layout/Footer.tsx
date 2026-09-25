"use client"

import React, { useState, useEffect } from 'react';

export default function Footer() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/verify');
        const data = await response.json();
        setIsAdminLoggedIn(data.authenticated || false);
      } catch (error) {
        setIsAdminLoggedIn(false);
      }
    };

    checkAdminStatus();
  }, []);

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-10">
          <div>
            <h3 className="uppercase text-sm font-bold tracking-wider opacity-90">
              Millenium Autos inc
            </h3>
            <p className="mt-3 text-gray-300 text-sm leading-relaxed">
              Achat et vente de véhicules au Québec. Transparence, simplicité
              et service humain.
            </p>
          </div>
          <div>
            <h4 className="uppercase text-sm font-bold tracking-wider opacity-90">
              Coordonnées
            </h4>
            <ul className="mt-3 space-y-2 text-gray-300 text-sm">
              <li>
                <a
                  href="tel:4389258315"
                  className="hover:text-white transition"
                >
                  (438) 925-8315
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@milleniumautos.ca"
                  className="hover:text-white transition"
                >
                  info@milleniumautos.ca
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="uppercase text-sm font-bold tracking-wider opacity-90">
              Adresse
            </h4>
            <p className="mt-3 text-gray-300 text-sm">
              103D20-28 RUE DE L'ÉGLISE S
              <br />
              LACOLLE QC J0J 1J0
            </p>
          </div>
          <div>
            <h4 className="uppercase text-sm font-bold tracking-wider opacity-90">
              Liens
            </h4>
            <ul className="mt-3 space-y-2 text-gray-300 text-sm">
              <li>
                <a href="/" className="hover:text-white transition">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/cars" className="hover:text-white transition">
                  Nos véhicules
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 md:mt-10 border-t border-gray-600 pt-4 md:pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Millenium Autos inc. Tous droits
            réservés.
          </p>
          <div className="flex items-center gap-6">
            <p className="text-xs text-gray-400">
              SAAQ partenaire • Service rapide et fiable
            </p>
            <a
              href={isAdminLoggedIn ? "/admin/dashboard" : "/admin/login"}
              className="text-xs text-gray-400 hover:text-white transition-colors"
              title="Administration"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}


