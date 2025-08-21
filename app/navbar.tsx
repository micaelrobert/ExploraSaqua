"use client";

import { useState } from "react";
import Link from "next/link";
import { Instagram, Globe, Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50 shadow-md">
      <div className="relative container mx-auto px-4 py-3 sm:py-4 md:py-5 flex items-center justify-between">

        {/* Logo + Links (Desktop) */}
        <div className="hidden teste:flex items-center gap-">
          <Link href="https://www.saquarema.rj.gov.br/">
            <img
              src="/logo2sq.png"
              alt="Logo ExploreSaquá"
              className="h-16 lg:h-19 w-auto absolute left-0 top-1/2 -translate-y-1/2 cursor-pointer z-30"
            />
          </Link>

          <nav className="flex items-center gap-6 pl-[220px] z-20 ml-auto">

             <Link href="/" className="text-gray-700 hover:text-[#017DB9] transition-colors">
              Home
            </Link>
            <Link href="/sobre" className="text-gray-700 hover:text-[#017DB9] transition-colors">
              Sobre o Projeto
            </Link>
            <Link href="/contato" className="text-gray-700 hover:text-[#017DB9] transition-colors">
              Contato
            </Link>
          </nav>
        </div>




        {/* Título centralizado */}
        <Link
          href="/"
          className="
            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold
            bg-gradient-to-r from-[#017DB9] to-[#007a73] bg-clip-text text-transparent
            select-none cursor-pointer
          "
        >
          ExploreSaquá
        </Link>

        {/* Ícones - visíveis apenas no desktop */}
        <div className="hidden teste:flex items-center space-x-4">
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
          className="teste:hidden text-gray-700 focus:outline-none z-50"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

{/* Menu Mobile */}
{isOpen && (
  <div className="teste:hidden absolute top-full left-0 w-full bg-white border-t border-blue-100 shadow-xl py-4 z-40 rounded-b-lg animate-slide-down">
    <nav className="flex flex-col space-y-4 px-6">
      
       <Link
        href="/"
        className="text-gray-700 hover:text-[#017DB9] transition-colors font-medium"
        onClick={() => setIsOpen(false)}
      >
        Home
      </Link>
      
      <Link
        href="/sobre"
        className="text-gray-700 hover:text-[#017DB9] transition-colors font-medium"
        onClick={() => setIsOpen(false)}
      >
        Sobre o Projeto
      </Link>

      <Link
        href="/contato"
        className="text-gray-700 hover:text-[#017DB9] transition-colors font-medium"
        onClick={() => setIsOpen(false)}
      >
        Contato
      </Link>

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
