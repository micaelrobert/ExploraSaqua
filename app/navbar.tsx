"use client";

import { useState } from "react";
import Link from "next/link";
import { Instagram, Globe, Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50 shadow-md">
      <div className="relative container mx-auto px-4 py-3 sm:py-4 md:py-5 flex items-center justify-between">

        {/* Logo (visível apenas em telas médias e maiores) */}
        <Link href="/">
          <img
            src="/logo2sq.png"
            alt="Logo ExploreSaquá"
            className="hidden md:block h-16 lg:h-19 w-auto absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer"
          />
        </Link>

        {/* Título centralizado */}
        <h1 className="
          text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold 
          bg-gradient-to-r from-[#017DB9] to-[#007a73] bg-clip-text text-transparent 
          text-center absolute left-1/2 -translate-x-1/2 select-none
        ">
          ExploreSaquá
        </h1>

        {/* Ícones - visíveis apenas no desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <a
            href="https://www.instagram.com/prefeiturasaquarema/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-pink-600 transition-colors"
            aria-label="Instagram da Prefeitura"
          >
            <Instagram size={24} strokeWidth={2} />
          </a>

          <a
            href="https://www.saquarema.rj.gov.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-700 transition-colors"
            aria-label="Site da Prefeitura"
          >
            <Globe size={24} strokeWidth={2} />
          </a>
        </div>

        {/* Botão hamburguer - sempre visível */}
        <button
          className="md:hidden text-gray-700 focus:outline-none z-50"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-blue-100 shadow-xl py-4 z-40 rounded-b-lg animate-slide-down">
          <nav className="flex flex-col space-y-4 px-6">
            <a
              href="https://www.instagram.com/prefeiturasaquarema/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-700 hover:text-pink-600 transition-colors"
            >
              <Instagram size={20} />
              Instagram
            </a>

            <a
              href="https://www.saquarema.rj.gov.br"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-700 transition-colors"
            >
              <Globe size={20} />
              Site da Prefeitura
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
