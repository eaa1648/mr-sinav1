'use client'

import { useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Users, Activity } from 'lucide-react'

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

export default function InteractiveTurkeyMap() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredHospital, setHoveredHospital] = useState<Hospital | null>(null)

  useEffect(() => {
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

  const getMarkerColor = (hospital: Hospital) => {
    if (hospital.aktif_doktor_sayisi > 20) return '#10B981' // green
    if (hospital.aktif_doktor_sayisi > 15) return '#3B82F6' // blue
    return '#F59E0B' // amber
  }

  const getMarkerSize = (hospital: Hospital) => {
    if (hospital.aktif_hasta_sayisi > 500) return 6
    if (hospital.aktif_hasta_sayisi > 200) return 4
    return 3
  }

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
            <svg viewBox="0 0 100 60" className="w-full h-full">
              {/* Turkey map outline */}
              <path
                d="M15 25 Q20 20, 25 22 Q35 18, 45 20 Q60 15, 75 18 Q85 20, 90 25 Q88 35, 85 40 Q75 45, 65 42 Q50 48, 35 45 Q25 42, 20 38 Q15 35, 15 25 Z"
                fill="#e0e7ff"
                stroke="#6366f1"
                strokeWidth="0.5"
              />
              
              {/* Hospital markers */}
              {hospitals.map((hospital) => {
                // Convert coordinates to map positions
                const x = hospital.koordinat_x ? (hospital.koordinat_x - 26) * 2.5 + 15 : 50
                const y = hospital.koordinat_y ? 60 - (hospital.koordinat_y - 36) * 5 : 30
                const isSelected = selectedHospital?.hastane_id === hospital.hastane_id
                const isHovered = hoveredHospital?.hastane_id === hospital.hastane_id
                const markerSize = getMarkerSize(hospital)
                const markerColor = getMarkerColor(hospital)
                
                return (
                  <g 
                    key={hospital.hastane_id}
                    onMouseEnter={() => setHoveredHospital(hospital)}
                    onMouseLeave={() => setHoveredHospital(null)}
                    onClick={() => setSelectedHospital(hospital)}
                    className="cursor-pointer transition-all duration-200"
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected || isHovered ? markerSize + 1 : markerSize}
                      fill={markerColor}
                      stroke="white"
                      strokeWidth="0.5"
                      className="transition-all duration-200"
                    />
                    {(isSelected || isHovered) && (
                      <text
                        x={x}
                        y={y - markerSize - 2}
                        textAnchor="middle"
                        className="text-xs fill-gray-800 font-medium"
                        style={{ fontSize: '2.5px' }}
                      >
                        {hospital.sehir}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>
            
            {/* Legend */}
            <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded-lg p-2 text-xs">
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