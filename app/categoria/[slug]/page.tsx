"use client"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ArrowLeft, Clock, MapPin, Phone, Globe, Search
} from "lucide-react"
import dynamic from "next/dynamic"
import { db } from "../../firebase" 
import { collection, getDocs, query, where } from "firebase/firestore"
import { useMap } from "react-leaflet"
import { categories } from "../../page"; 
import L from "leaflet"

const defaultIcon = new L.Icon({
  iconUrl: "/marker-icon-blue.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const selectedIcon = new L.Icon({
  iconUrl: "/marker-icon-red.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

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

// Função para calcular distância entre coordenadas (Haversine)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos((lat1 * Math.PI)/180) * Math.cos((lat2 * Math.PI)/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return d;
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
  const markerRefs = useRef<Record<string, L.Marker>>( {} );
  const [searchTerm, setSearchTerm] = useState("");
  
  // Novos estados para geolocalização
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestLocations, setNearestLocations] = useState<any[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
     if (!navigator.geolocation) {
    setLocationError("Geolocalização não é suportada pelo navegador.")
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setUserPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
      setLocationError(null)
    },
    (error) => {
      if (error.code === 1) {
        setLocationError("Permissão negada para acessar localização.")
      } else {
        setLocationError("Erro ao obter localização.")
      }
    }
  )
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
  const cacheKey = `locations_${params.slug}`

  const fetchData = async () => {
    setIsLoading(true);

    // Tenta pegar dados do cache localStorage
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const cacheTimestamp = parsed.timestamp;
        const now = Date.now();
        const oneHour = 60 * 60 * 1000; // 1 hora em ms

        if (now - cacheTimestamp < oneHour) {
          setLocations(parsed.data);
          setIsLoading(false);
          return; // Sai da função, usando cache válido
        }
      }
    } catch (err) {
      console.warn("Erro ao ler cache localStorage", err);
      // Continua para buscar do Firestore se der erro no cache
    }

    // Se não achou cache válido, faz a consulta no Firestore
    const categoryInfo = categories.find(cat => cat.id === params.slug);
    let categoryTitle = categoryInfo ? categoryInfo.title : '';

    if (!categoryTitle) {
      console.warn(`Categoria '${params.slug}' não encontrada ou sem título correspondente.`);
      setLocations([]);
      setIsLoading(false);
      return;
    }

    try {
      const locationsRef = collection(db, "locations");
      const q = query(locationsRef, where("category", "==", categoryTitle));

      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map((doc) => {
        const docData = doc.data();
        let parsedCoordinates = null;

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

      // Salva no cache local com timestamp para expirar depois de 1 hora
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data,
      }));

      setLocations(data);
    } catch (error) {
      console.error("Erro ao buscar locais no Firestore:", error);
      setLocations([]);
    }

    setIsLoading(false);
  };

  fetchData();
}, [params.slug]);


  // Obter geolocalização e calcular locais próximos quando locations mudarem
  useEffect(() => {
    if (!locations || locations.length === 0) {
      setNearestLocations([]);
      return;
    }

    if (!("geolocation" in navigator)) {
      setGeoError("Geolocalização não é suportada pelo seu navegador.");
      setNearestLocations([]);
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const locationsWithDistance = locations
          .map((loc) => {
            if (loc.coordinates && loc.coordinates.lat && loc.coordinates.lng) {
              const dist = getDistanceFromLatLonInKm(
                latitude,
                longitude,
                loc.coordinates.lat,
                loc.coordinates.lng
              );
              return { ...loc, distance: dist };
            }
            return { ...loc, distance: Infinity };
          })
          .filter((loc) => loc.distance !== Infinity)
          .sort((a, b) => a.distance - b.distance);

        setNearestLocations(locationsWithDistance.slice(0, 3));
        setGeoLoading(false);
      },
      (error) => {
        setGeoError("Não foi possível obter sua localização.");
        setNearestLocations([]);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  }, [locations]);

  const focusOnLocation = (location: any) => {
    setSelectedLocation(location)
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

  const category = categories.find(cat => cat.id === params.slug);

  // Filtra os locais com base no termo de busca
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (location.description && location.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );


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

  const CategoryIcon = category.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-3 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </Link>
            <div className="flex items-center gap-3">
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
        {/* --- NOVA SEÇÃO LOCAIS MAIS PRÓXIMOS --- */}
        {geoLoading && (
          <p className="text-center text-gray-600 mb-6">Buscando sua localização...</p>
        )}
        {geoError && (
        <div className="text-center text-red-600 mb-6">
          {geoError} <br />
          Para usar a função de locais mais próximos, por favor habilite a localização no seu navegador.
        </div>
        )}
        {!geoLoading && !geoError && nearestLocations.length > 0 && (
          <section className="mb-10 px-4">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-extrabold text-[#017DB9] mb-4"
            >
              Descubra os locais mais próximos de você
            </motion.h2>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                  },
                },
              }}
              className="flex gap-6 overflow-x-auto pb-2"
            >
              {nearestLocations.map((loc, i) => (
                <motion.div
                  key={loc.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="min-w-[220px] bg-[#017DB9] text-white rounded-xl shadow-lg p-4 cursor-pointer flex-shrink-0 hover:scale-[1.05] transition-transform"
                  onClick={() => focusOnLocation(loc)}
                >
                  {loc.imageUrl && (
                    <img
                      src={loc.imageUrl}
                      alt={loc.name}
                      className="w-full h-32 object-cover rounded-md mb-3 border-2 border-white"
                    />
                  )}
                  <h3 className="text-lg font-bold">{loc.name}</h3>
                  <p className="text-sm mt-1">{loc.address}</p>
                  <p className="text-sm mt-1 font-semibold">{loc.distance.toFixed(2)} km</p>
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-3xl font-bold text-gray-800 tracking-tight"
              >
                Locais Recomendados
              </motion.h2>
              {selectedLocation && (
                <button onClick={resetMapView} className="text-sm text-blue-600 hover:text-blue-800 underline">
                  Ver todos no mapa
                </button>
              )}
            </div>

            {/*Barra de Pesquisa */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              <input
                type="text"
                placeholder="Pesquisar por nome..."
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

            {/*Contêiner com Barra de Rolagem */}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto px-4">
              {filteredLocations.map((location: any, index: number) => (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition-transform duration-300 hover:shadow-xl hover:scale-[1.02] ${
                    selectedLocation?.id === location.id ? "ring-2 ring-offset-2 ring-[#017DB9] shadow-lg" : ""
                  }`}
                  onClick={() => focusOnLocation(location)}
                >
                  {location.imageUrl && (
                    <img src={location.imageUrl} alt={location.name} className="w-full h-32 object-cover" />
                  )}
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
                        <div className="w-2 h-2 bg-[#017DB9] rounded-full animate-pulse"></div>
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
          </div>

          <div className="lg:sticky lg:top-0 h-fit" id="map-container">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mb-4"
            >
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" /> Veja no mapa
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Clique em um ponto para saber mais
              </p>
            </motion.div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200" style={{ height: "500px" }}>

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
              

              {filteredLocations
                .filter(location => location.coordinates && location.coordinates.lat != null && location.coordinates.lng != null)
                .map((location) => {
                  const position: [number, number] = [
                    location.coordinates.lat,
                    location.coordinates.lng,
                  ];

              return (
                <Marker
                  key={location.id}
                  position={position}
                  icon={
                    selectedLocation?.id === location.id ? selectedIcon : defaultIcon
                  }
                  eventHandlers={{
                    click: () => {
                      setSelectedLocation(location);

                      // Aguarda o DOM atualizar antes de abrir o popup
                      setTimeout(() => {
                        const marker = markerRefs.current[location.id];
                        if (marker) marker.openPopup();
                      }, 0);
                    },
                  }}
                  ref={(ref) => {
                    if (ref) markerRefs.current[location.id] = ref;
                  }}
                >
                  <Popup
                    autoPan={true}
                    eventHandlers={{
                      remove: () => setSelectedLocation(null),
                    }}
                  >
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
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Abrir no Maps
                      </a>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

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
            {!selectedLocation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-4 text-center block lg:hidden"
              >
                <a
                  href="#map-container"
                  className="inline-block bg-[#017DB9] text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition"
                >
                  Explorar no mapa
                </a>
              </motion.div>
            )}

            {selectedLocation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-4 bg-blue-50 rounded-2xl p-4 border border-blue-200 shadow"
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
