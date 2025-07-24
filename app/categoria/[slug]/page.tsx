"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ArrowLeft, Clock, MapPin, Phone, Globe,
  UtensilsCrossed, Mountain, Dumbbell, GraduationCap, ShoppingCart, 
  Bus, Hotel, Calendar, Building, Waves, Heart, BriefcaseBusiness, 
  Ambulance, Volleyball, Cherry
} from "lucide-react"
import dynamic from "next/dynamic"
import { db } from "../../firebase" 
import { collection, getDocs } from "firebase/firestore"
import { useMap } from "react-leaflet"

import { categories } from "../../page"; 

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

interface PageProps {
  params: {
    slug: string
  }
}

function MapInstanceHandler({ onMapReady }: { onMapReady: (mapInstance: any) => void }) {
  const map = useMap()
  useEffect(() => {
    onMapReady(map)
  }, [map, onMapReady])
  return null
}

export default function CategoryPage({ params }: PageProps) {
  const [locations, setLocations] = useState<any[]>([])
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [mapKey, setMapKey] = useState(0)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-22.9249, -42.5084])
  const [mapZoom, setMapZoom] = useState(13)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true)
    const timer = setTimeout(() => setMapKey((prev) => prev + 1), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet")
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })
    }
  }, [isClient])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(db, "locations"));
      const data = querySnapshot.docs.map((doc) => {
        const docData = doc.data();
        let parsedCoordinates = null;

        // Tenta fazer o parse das coordenadas se for uma string JSON
        if (typeof docData.coordinates === 'string') {
          try {
            parsedCoordinates = JSON.parse(docData.coordinates);
          } catch (e) {
            console.error("Erro ao fazer parse das coordenadas:", docData.coordinates, e);
            parsedCoordinates = null;
          }
        } else if (typeof docData.coordinates === 'object' && docData.coordinates !== null) {
          parsedCoordinates = docData.coordinates;
        }

        return {
          id: doc.id,
          ...docData,
          coordinates: parsedCoordinates,
        };
      });

      // Normaliza a string da categoria para comparar com o slug da URL
      const normalizeString = (str: string) => {
        return str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "")
          .replace(/--+/g, "-");
      };

      const filtered = data.filter((item: any) => {
        const itemCategoryNormalized = normalizeString(item.category || '');
        return itemCategoryNormalized === params.slug;
      });
      
      setLocations(filtered);
      setIsLoading(false);
    };
    fetchData();
  }, [params.slug]);

  const focusOnLocation = (location: any) => {
    setSelectedLocation(location)
    // Verifica se as coordenadas são válidas antes de centralizar o mapa
    if (location.coordinates && typeof location.coordinates.lat === 'number' && typeof location.coordinates.lng === 'number') {
      const newCenter: [number, number] = [location.coordinates.lat, location.coordinates.lng]
      setMapCenter(newCenter)
      setMapZoom(16)

      if (mapInstance) {
        mapInstance.flyTo(newCenter, 16, { duration: 1.5, easeLinearity: 0.1 })
      }
    } else {
      console.warn("Coordenadas inválidas para o local selecionado:", location);
      resetMapView();
    }

    if (window.innerWidth < 1024) {
      const mapElement = document.getElementById("map-container")
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }

  const resetMapView = () => {
    const defaultCenter: [number, number] = [-22.9249, -42.5084]
    setMapCenter(defaultCenter)
    setMapZoom(13)
    setSelectedLocation(null)

    if (mapInstance) {
      mapInstance.flyTo(defaultCenter, 13, { duration: 1.5, easeLinearity: 0.1 })
    }
  }

  // Busca a informação da categoria no array local 'categories'
  const category = categories.find(cat => cat.id === params.slug);

  // Exibe mensagem de categoria não encontrada se o slug não corresponder
  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Categoria não encontrada</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  // Exibe o carregamento enquanto os dados são buscados do Firestore
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando locais...</p>
        </div>
      </div>
    );
  }

  // Exibe mensagem se nenhum local for encontrado após o carregamento
  if (!locations || locations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Nenhum local encontrado para esta categoria.</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">Voltar ao início</Link>
        </div>
      </div>
    )
  }

  // Componente do ícone da categoria
  const CategoryIcon = category.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </Link>
            <div className="flex items-center gap-3">
              {/* Renderiza o ícone e a cor da categoria */}
              <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                <CategoryIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 capitalize">
                  {category.title}
                </h1>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Locais Recomendados</h2>
              {selectedLocation && (
                <button onClick={resetMapView} className="text-sm text-blue-600 hover:text-blue-800">
                  Ver todos no mapa
                </button>
              )}
            </div>

            {locations.map((location: any, index: number) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                  selectedLocation?.id === location.id ? "ring-2 ring-blue-500 shadow-lg" : ""
                }`}
                onClick={() => focusOnLocation(location)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{location.name}</h3>
                  <div className="flex items-center gap-2">
                    {location.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-600">{location.rating}</span>
                      </div>
                    )}
                    {selectedLocation?.id === location.id && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{location.description}</p>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{location.address}</div>
                  {location.hours && <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{location.hours}</div>}
                  {location.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" />{location.phone}</div>}
                  {location.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <a href={location.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800" onClick={(e) => e.stopPropagation()}>
                        Visitar site
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:sticky lg:top-0 h-fit" id="map-container">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Localização no Mapa</h2>
            <div className="bg-white rounded-xl shadow-md overflow-hidden" style={{ height: "500px" }}>
              {isClient ? (
                <MapContainer
                  key={mapKey}
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                  scrollWheelZoom={true}
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                    tileSize={256}
                  />

                  {locations.map((location) => (
                    location.coordinates && typeof location.coordinates.lat === 'number' && typeof location.coordinates.lng === 'number' ? (
                      <Marker
                        key={location.id}
                        position={[location.coordinates.lat, location.coordinates.lng]}
                        eventHandlers={{ click: () => setSelectedLocation(location) }}
                      >
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <h3 className="font-semibold text-gray-800 mb-1">{location.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{location.description}</p>
                            <p className="text-xs text-gray-500 mb-2">{location.address}</p>
                            {location.rating && (
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500 text-sm">★</span>
                                <span className="text-sm text-gray-600">{location.rating}</span>
                              </div>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    ) : null
                  ))}
                  <MapInstanceHandler onMapReady={setMapInstance} />
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando mapa...</p>
                  </div>
                </div>
              )}
            </div>

            {selectedLocation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-1">Local Selecionado</h3>
                    <p className="text-blue-700 text-sm">
                      {selectedLocation.name} - {selectedLocation.address}
                    </p>
                  </div>
                  <button
                    onClick={resetMapView}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Limpar
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
