"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
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
  Store,
  Building,
  Waves,
} from "lucide-react"

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
    id: "feiras",
    title: "Feiras e Mercados",
    icon: Store,
    color: "from-amber-400 to-yellow-500",
    description: "Produtos locais frescos",
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
]

export default function HomePage() {
  const [visibleCards, setVisibleCards] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCards((prev) => {
        if (prev < categories.length) {
          return prev + 1
        }
        return prev
      })
    }, 150)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              ExploraSaquá
            </h1>
          </div>
        </div>
      </header>

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
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">explorar</span>{" "}
            hoje?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubra os melhores lugares de Saquarema com nosso guia completo para moradores e visitantes
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={index < visibleCards ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
              >
                <Link href={`/categoria/${category.id}`}>
                  <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
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

                      <p className="text-gray-600 text-sm">{category.description}</p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent group-hover:via-blue-400 transition-all duration-300" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">ExploraSaquá</h3>
            <p className="text-gray-600">Seu guia completo para descobrir o melhor de Saquarema</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
