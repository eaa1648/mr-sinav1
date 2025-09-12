'use client'

import { useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Users, Activity } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Hospital interface
interface Hospital {
  hastane_id: string
  hastane_adi: string
  sehir: string
  adres?: string
  telefon?: string
  email?: string
  website?: string
  aktif_doktor_sayisi: number
  aktif_hasta_sayisi: number
  koordinat_x?: number
  koordinat_y?: number
}

// Helper functions
const getMarkerColor = (hospital: Hospital) => {
  if (hospital.aktif_doktor_sayisi > 20) return '#10B981' // green
  if (hospital.aktif_doktor_sayisi > 15) return '#3B82F6' // blue
  return '#F59E0B' // amber
}

const getMarkerSize = (hospital: Hospital) => {
  if (hospital.aktif_hasta_sayisi > 500) return 12
  if (hospital.aktif_hasta_sayisi > 200) return 8
  return 6
}

export default function InteractiveTurkeyMap() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredHospital, setHoveredHospital] = useState<Hospital | null>(null)
  const [MapComponent, setMapComponent] = useState<any>(null)

  useEffect(() => {
    // Dynamically import Leaflet components only on client side
    const loadLeaflet = async () => {
      const L = await import('leaflet')
      const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet')
      
      // Fix for default marker icons in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      
      setMapComponent({ MapContainer, TileLayer, Marker, Popup, L })
    }
    
    loadLeaflet()
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/hospitals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Hastane verileri alınamadı')
      }

      const data = await response.json()
      setHospitals(data.hospitals)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
    } finally {
      setLoading(false)
    }
  }

  // Custom marker icon component
  const createMarkerIcon = (hospital: Hospital) => {
    if (!MapComponent) return null;
    
    const color = getMarkerColor(hospital);
    
    // Create a custom SVG icon
    return MapComponent.L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: ${getMarkerSize(hospital) * 2}px;
          height: ${getMarkerSize(hospital) * 2}px;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 5px rgba(0,0,0,0.5);
          position: relative;
        ">
          <div style="
            background-color: white;
            width: 4px;
            height: 4px;
            border-radius: 50%;
          "></div>
        </div>
      `,
      className: '',
      iconSize: [getMarkerSize(hospital) * 2, getMarkerSize(hospital) * 2],
      iconAnchor: [getMarkerSize(hospital), getMarkerSize(hospital)],
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">İşbirliği Yaptığımız Hastaneler</h3>
          <p className="text-sm text-gray-600">Türkiye genelinde psikiyatri kliniklerinde kullanılmaktadır</p>
        </div>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">İşbirliği Yaptığımız Hastaneler</h3>
          <p className="text-sm text-gray-600">Türkiye genelinde psikiyatri kliniklerinde kullanılmaktadır</p>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            Hata: {error}
          </div>
          <button
            onClick={fetchHospitals}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  // Center of Turkey coordinates
  const turkeyCenter: [number, number] = [38.9637, 35.2433]
  const zoomLevel = 6

  // Show a fallback map while Leaflet is loading
  if (!MapComponent) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">İşbirliği Yaptığımız Hastaneler</h3>
          <p className="text-sm text-gray-600">Türkiye genelinde psikiyatri kliniklerinde kullanılmaktadır</p>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Map Loading */}
            <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Harita yükleniyor...</p>
              </div>
            </div>

            {/* Hospital List */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-indigo-600">{hospitals.length}</div>
                  <div className="text-sm text-indigo-800">Hastane</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {hospitals.reduce((sum, h) => sum + h.aktif_doktor_sayisi, 0)}
                  </div>
                  <div className="text-sm text-green-800">Doktor</div>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {hospitals.map((hospital) => (
                  <div
                    key={hospital.hastane_id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedHospital?.hastane_id === hospital.hastane_id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedHospital(hospital)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div 
                          className="w-4 h-4 rounded-full mr-3 mt-1"
                          style={{ backgroundColor: getMarkerColor(hospital) }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{hospital.hastane_adi}</h4>
                          <p className="text-sm text-gray-600">{hospital.sehir}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-indigo-600 font-medium">{hospital.aktif_doktor_sayisi} doktor</div>
                        <div className="text-gray-500">{hospital.aktif_hasta_sayisi} hasta</div>
                      </div>
                    </div>
                    
                    {selectedHospital?.hastane_id === hospital.hastane_id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        {hospital.telefon && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Phone className="h-4 w-4 mr-2" />
                            {hospital.telefon}
                          </div>
                        )}
                        {hospital.email && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Mail className="h-4 w-4 mr-2" />
                            {hospital.email}
                          </div>
                        )}
                        {hospital.adres && (
                          <div className="text-gray-600 text-sm">
                            {hospital.adres}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponent

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">İşbirliği Yaptığımız Hastaneler</h3>
        <p className="text-sm text-gray-600">Türkiye genelinde psikiyatri kliniklerinde kullanılmaktadır</p>
      </div>

      <div className="p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Interactive Map */}
          <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg relative overflow-hidden">
            <MapContainer 
              center={turkeyCenter} 
              zoom={zoomLevel} 
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {hospitals.map((hospital) => {
                // Only show hospitals with valid coordinates
                if (!hospital.koordinat_x || !hospital.koordinat_y) return null;
                
                const position: [number, number] = [hospital.koordinat_y, hospital.koordinat_x];
                const isSelected = selectedHospital?.hastane_id === hospital.hastane_id;
                
                return (
                  <Marker 
                    key={hospital.hastane_id} 
                    position={position}
                    icon={createMarkerIcon(hospital)}
                    eventHandlers={{
                      click: () => {
                        setSelectedHospital(hospital);
                      },
                      mouseover: () => {
                        setHoveredHospital(hospital);
                      },
                      mouseout: () => {
                        setHoveredHospital(null);
                      }
                    }}
                  >
                    <Popup>
                      <div className="font-medium">{hospital.hastane_adi}</div>
                      <div className="text-sm text-gray-600">{hospital.sehir}</div>
                      <div className="text-sm mt-1">
                        <span className="font-medium">Doktor:</span> {hospital.aktif_doktor_sayisi}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Hasta:</span> {hospital.aktif_hasta_sayisi}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
            
            {/* Legend */}
            <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded-lg p-2 text-xs z-[1000]">
              <div className="font-medium mb-1">Hastane Yoğunluğu</div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span>20+ Doktor</span>
              </div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                <span>15+ Doktor</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                <span>15 Doktor</span>
              </div>
            </div>
          </div>

          {/* Hospital List */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-indigo-600">{hospitals.length}</div>
                <div className="text-sm text-indigo-800">Hastane</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {hospitals.reduce((sum, h) => sum + h.aktif_doktor_sayisi, 0)}
                </div>
                <div className="text-sm text-green-800">Doktor</div>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {hospitals.map((hospital) => (
                <div
                  key={hospital.hastane_id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedHospital?.hastane_id === hospital.hastane_id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedHospital(hospital)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div 
                        className="w-4 h-4 rounded-full mr-3 mt-1"
                        style={{ backgroundColor: getMarkerColor(hospital) }}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{hospital.hastane_adi}</h4>
                        <p className="text-sm text-gray-600">{hospital.sehir}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-indigo-600 font-medium">{hospital.aktif_doktor_sayisi} doktor</div>
                      <div className="text-gray-500">{hospital.aktif_hasta_sayisi} hasta</div>
                    </div>
                  </div>
                  
                  {selectedHospital?.hastane_id === hospital.hastane_id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                      {hospital.telefon && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <Phone className="h-4 w-4 mr-2" />
                          {hospital.telefon}
                        </div>
                      )}
                      {hospital.email && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <Mail className="h-4 w-4 mr-2" />
                          {hospital.email}
                        </div>
                      )}
                      {hospital.adres && (
                        <div className="text-gray-600 text-sm">
                          {hospital.adres}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}