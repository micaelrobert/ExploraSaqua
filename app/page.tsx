"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import {
  UtensilsCrossed,
  MapPin,
  Mountain,
  Dumbbell,
  GraduationCap,
  ShoppingCart,
  Bus,
  Hotel,
  Calendar,
  Building,
  Waves,
  Heart, 
  BriefcaseBusiness, 
  Ambulance, 
  Volleyball, 
  Cherry,
  Search
  
} from "lucide-react";
export {categories}
const categories = [
  {
    id: "restaurantes",
    title: "Restaurantes e Lanchonetes",
    icon: UtensilsCrossed,
    color: "from-orange-400 to-red-500",
    description: "Sabores únicos da região",
  },
  {
    id: "pontos-turisticos",
    title: "Pontos Turísticos",
    icon: MapPin,
    color: "from-blue-400 to-purple-500",
    description: "Lugares imperdíveis",
  },
  {
    id: "trilhas",
    title: "Trilhas",
    icon: Mountain,
    color: "from-green-400 to-emerald-500",
    description: "Aventuras na natureza",
  },
  {
    id: "academias",
    title: "Academias",
    icon: Dumbbell,
    color: "from-red-400 to-pink-500",
    description: "Mantenha-se ativo",
  },
  {
    id: "escolas",
    title: "Escolas",
    icon: GraduationCap,
    color: "from-indigo-400 to-blue-500",
    description: "Educação de qualidade",
  },
  {
    id: "supermercados",
    title: "Supermercados",
    icon: ShoppingCart,
    color: "from-yellow-400 to-orange-500",
    description: "Tudo que você precisa",
  },
  {
    id: "transporte",
    title: "Transporte Público",
    icon: Bus,
    color: "from-cyan-400 to-blue-500",
    description: "Mobilidade urbana",
  },
  {
    id: "hospedagens",
    title: "Hospedagens",
    icon: Hotel,
    color: "from-purple-400 to-pink-500",
    description: "Conforto e acolhimento",
  },
  {
    id: "eventos",
    title: "Eventos Locais",
    icon: Calendar,
    color: "from-rose-400 to-red-500",
    description: "Cultura e entretenimento",
  },
  {
    id: "lazer-e-esporte",
    title: "Lazer e Esporte",
    icon: Volleyball,
    color: "from-amber-400 to-yellow-500",
    description: "Opções para diversão e atividades físicas",
  },
  {
    id: "espacos-culturais",
    title: "Espaços Culturais",
    icon: Building,
    color: "from-violet-400 to-purple-500",
    description: "Arte e história local",
  },
  {
    id: "praias",
    title: "Praias e Lagoas",
    icon: Waves,
    color: "from-teal-400 to-cyan-500",
    description: "Paraíso natural",
  },
  {
    id: "mulheres-e-criancas",
    title: "Mulheres e Crianças",
    icon: Heart,
    color: "from-pink-400 to-red-600",
    description: "Apoio e serviços essenciais",
  },
  {
    id: "compras",
    title: "Compras",
    icon: BriefcaseBusiness,
    color: "from-gray-400 to-gray-500",
    description: "Melhores lojas e serviços",
  },
  {
    id: "emergencias",
    title: "Emergências",
    icon: Ambulance,
    color: "from-red-600 to-rose-700",
    description: "Serviços de emergência e utilidade pública",
  },
  {
    id: "feiras",
    title: "Feiras e Produtores Rurais",
    icon: Cherry,
    color: "from-green-400 to-lime-300",
    description: "Serviços de saúde e bem-estar",
  }
  
];

export default function HomePage() {
  const [visibleCards, setVisibleCards] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCards((prev) => {
        if (prev < categories.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);
    const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#017DB9] via-white to-[#007a73]">
    {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="relative container mx-auto px-4 py-3 sm:py-4 md:py-5 flex items-center justify-between">

          {/* Logo responsiva e à esquerda */}
          <img
            src="/logosq.png"
            alt="Logo ExploraSaquá"
            // Esconde a logo por padrão (mobile) e a mostra e aumenta a partir de 'md'
            className="hidden md:block h-16 lg:h-20 w-auto absolute left-4 top-1/2 -translate-y-1/2"
          />

          {/* Título centralizado, ajustando para a presença do logo */}
            <h1 className="
              text-xl sm:text-2xl md:text-3xl lg:text-4xl
              font-bold bg-gradient-to-r from-[#017DB9] to-[#007a73] bg-clip-text text-transparent 
              text-center 
              absolute left-1/2 -translate-x-1/2
            ">
              ExploraSaquá
            </h1>

          {/*elemento vazio para equilibrar o espaço*/}
          {/* Este div ainda é útil para manter o h1 centralizado quando a logo está oculta em telas menores */}
          <div className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12"></div>
        </div>
      </header>

      {/* imagem como banner com efeito fade na parte inferior */}
      <div className="relative w-full h-[400px] overflow-hidden">
        <img
          src="/saquarema.jpeg"
          alt="Vista de Saquarema"
          className="w-full h-full object-cover opacity-90 fade-bottom-mask"
        />
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            O que você quer{" "}
            <span className="bg-gradient-to-r from-[#017DB9] to-[#007a73] bg-clip-text text-transparent">
              explorar
            </span>{" "}
            hoje?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubra os melhores lugares de Saquarema com nosso guia completo
            para moradores e visitantes
          </p>
          <div className="max-w-md mx-auto mt-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            <input
              type="text"
              placeholder="Pesquisar por categoria..."
              className="
                w-full pl-12 pr-4 py-3
                rounded-2xl border border-gray-200 bg-white shadow-sm
                focus:outline-none focus:ring-2 focus:ring-[#017DB9] focus:border-transparent
                transition-all duration-300 placeholder-gray-400 text-sm
                hover:shadow-md
              "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
         {categories
          .filter((category) =>
            category.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={
                  index < visibleCards
                    ? { opacity: 1, y: 0, scale: 1 }
                    : { opacity: 0, y: 50, scale: 0.9 }
                }
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
              >
                <Link href={`/categoria/${category.id}`}>
                  <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col justify-between min-h-[220px]">

                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    />

                    <div className="p-6">
                      <div
                        className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${category.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-gray-900">
                        {category.title}
                      </h3>

                      <p className="text-gray-600 text-sm">
                        {category.description}
                      </p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent group-hover:via-blue-400 transition-all duration-300" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ExploraSaquá
            </h3>
            <p className="text-gray-600 mb-4"> {/* mb-4 aqui para espaçar o parágrafo de descrição */}
              Seu guia completo para descobrir o melhor de Saquarema
            </p>
            {/* Linha horizontal sutil */}
            <hr className="w-16 mx-auto border-gray-300 mb-4" /> {/*  uma linha divisória curta e centralizada */}
            <p className="text-gray-500 text-sm"> 
              © Desenvolvido por <span className="font-medium text-gray-600">Micael Robert</span> 
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}