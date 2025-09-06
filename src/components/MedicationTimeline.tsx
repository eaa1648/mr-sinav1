'use client'

import { useState } from 'react'
import { Calendar, Pill, Clock, TrendingUp, Filter } from 'lucide-react'

interface Medication {
  tedavi_id: string
  ilac_adi: string
  dozaj: string
  birim: string | null
  baslangic_tarihi: string
  bitis_tarihi: string | null
  aktif: boolean
  notlar: string | null
}

interface MedicationTimelineProps {
  medications: Medication[]
}

export default function MedicationTimeline({ medications }: MedicationTimelineProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all')
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null)

  // Filter medications based on status
  const filteredMedications = medications.filter(med => {
    if (filterStatus === 'active') return med.aktif
    if (filterStatus === 'completed') return !med.aktif
    return true
  })

  // Sort medications by start date
  const sortedMedications = filteredMedications.sort((a, b) => 
    new Date(a.baslangic_tarihi).getTime() - new Date(b.baslangic_tarihi).getTime()
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateDuration = (start: string, end: string | null) => {
    const startDate = new Date(start)
    const endDate = end ? new Date(end) : new Date()
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} gün`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} ay`
    } else {
      const years = Math.floor(diffDays / 365)
      const remainingMonths = Math.floor((diffDays % 365) / 30)
      return `${years} yıl ${remainingMonths > 0 ? `${remainingMonths} ay` : ''}`
    }
  }

  const getMedicationColor = (medication: Medication) => {
    if (!medication.aktif) return 'bg-gray-400'
    
    const drugType = medication.ilac_adi.toLowerCase()
    if (drugType.includes('lithium') || drugType.includes('lityum')) return 'bg-blue-500'
    if (drugType.includes('valproat') || drugType.includes('depakine')) return 'bg-purple-500'
    if (drugType.includes('quetiapine') || drugType.includes('seroquel')) return 'bg-green-500'
    if (drugType.includes('olanzapine') || drugType.includes('zyprexa')) return 'bg-yellow-500'
    if (drugType.includes('risperidone') || drugType.includes('risperdal')) return 'bg-red-500'
    return 'bg-indigo-500'
  }

  if (medications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tedavi Geçmişi Bulunamadı</h3>
        <p className="text-gray-600">Bu hasta için kayıtlı ilaç tedavisi bulunmamaktadır.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Tedavi Zaman Çizelgesi</h3>
            <p className="text-sm text-gray-600">
              İlaç tedavilerinin kronolojik görünümü ({medications.length} tedavi)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="completed">Tamamlanan</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {medications.filter(m => m.aktif).length}
            </div>
            <div className="text-sm text-gray-600">Aktif Tedavi</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {medications.filter(m => !m.aktif).length}
            </div>
            <div className="text-sm text-gray-600">Tamamlanan</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(medications.map(m => m.ilac_adi)).size}
            </div>
            <div className="text-sm text-gray-600">Farklı İlaç</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {medications.length}
            </div>
            <div className="text-sm text-gray-600">Toplam Tedavi</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-6">
            {sortedMedications.map((medication, index) => (
              <div key={medication.tedavi_id} className="relative flex items-start">
                {/* Timeline dot */}
                <div className={`absolute left-6 w-4 h-4 rounded-full border-4 border-white ${getMedicationColor(medication)} z-10`}></div>
                
                {/* Content */}
                <div className="ml-16 flex-1">
                  <div 
                    className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                      selectedMedication === medication.tedavi_id ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    onClick={() => setSelectedMedication(
                      selectedMedication === medication.tedavi_id ? null : medication.tedavi_id
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">
                          {medication.ilac_adi}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {medication.dozaj} {medication.birim && `(${medication.birim})`}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(medication.baslangic_tarihi)}
                          </div>
                          {medication.bitis_tarihi && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDate(medication.bitis_tarihi)}
                            </div>
                          )}
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {calculateDuration(medication.baslangic_tarihi, medication.bitis_tarihi)}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          medication.aktif 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {medication.aktif ? 'Aktif' : 'Tamamlandı'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Expanded details */}
                    {selectedMedication === medication.tedavi_id && medication.notlar && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Notlar:</h5>
                        <p className="text-sm text-gray-600">{medication.notlar}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Duration bar */}
                <div className="ml-4 hidden md:block">
                  <div className="text-xs text-gray-500 text-right mb-1">
                    {calculateDuration(medication.baslangic_tarihi, medication.bitis_tarihi)}
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getMedicationColor(medication)} ${!medication.aktif ? 'opacity-60' : ''}`}
                      style={{
                        width: medication.aktif ? '100%' : '100%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {filteredMedications.length === 0 && (
          <div className="text-center py-8">
            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {filterStatus === 'active' && 'Aktif tedavi bulunamadı.'}
              {filterStatus === 'completed' && 'Tamamlanan tedavi bulunamadı.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}