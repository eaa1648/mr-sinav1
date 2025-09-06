'use client'

import { useState } from 'react'
import { Plus, Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'

interface ClinicalScalesFormProps {
  patientId: string
  onScoreAdded: () => void
}

interface ScaleTemplate {
  name: string
  maxScore: number
  description: string
  questions: string[]
}

const SCALE_TEMPLATES: Record<string, ScaleTemplate> = {
  'YMRS': {
    name: 'Young Mania Rating Scale',
    maxScore: 60,
    description: 'Mani şiddetini değerlendirmek için kullanılır',
    questions: [
      'Yüksek ruh hali ve enerji',
      'Motor aktivite/enerji',
      'Cinsel ilgi',
      'Uyku',
      'İrritabilite',
      'Konuşma (hız ve miktar)',
      'Dil-düşünce bozukluğu',
      'Düşünce içeriği',
      'Disruptif-agresif davranış',
      'Görünüm',
      'İçgörü'
    ]
  },
  'HAM-D': {
    name: 'Hamilton Depression Rating Scale',
    maxScore: 52,
    description: 'Depresyon şiddetini değerlendirmek için kullanılır',
    questions: [
      'Depresif ruh hali',
      'Suçluluk duyguları',
      'İntihar',
      'İlk uykusuzluk',
      'Orta uykusuzluk',
      'Geç uykusuzluk',
      'İş ve aktiviteler',
      'Retardasyon',
      'Ajitasyon',
      'Anksiyete (psişik)',
      'Anksiyete (somatik)',
      'Somatik semptomlar (gastrointestinal)',
      'Somatik semptomlar (genel)',
      'Genital semptomlar',
      'Hipokondriazis',
      'Kilo kaybı',
      'İçgörü'
    ]
  },
  'PANSS': {
    name: 'Positive and Negative Syndrome Scale',
    maxScore: 210,
    description: 'Şizofreni semptomlarını değerlendirmek için kullanılır',
    questions: [
      'Sanrılar',
      'Kavramsal dağınıklık',
      'Halüsinasyonlar',
      'Hiperaktivite',
      'Büyüklük sanrıları',
      'Şüphecilik/zulüm',
      'Düşmanlık'
    ]
  },
  'GAF': {
    name: 'Global Assessment of Functioning',
    maxScore: 100,
    description: 'Genel işlevsellik düzeyini değerlendirmek için kullanılır',
    questions: [
      'Psişik, sosyal ve mesleki işlevsellik'
    ]
  }
}

export default function ClinicalScalesForm({ patientId, onScoreAdded }: ClinicalScalesFormProps) {
  const [selectedScale, setSelectedScale] = useState('')
  const [formData, setFormData] = useState({
    puan: '',
    degerlendirme_tarihi: new Date().toISOString().split('T')[0],
    notlar: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDetails, setShowDetails] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const template = SCALE_TEMPLATES[selectedScale]
      
      const response = await fetch(`/api/patients/${patientId}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          olcek_adi: selectedScale,
          puan: parseFloat(formData.puan),
          max_puan: template?.maxScore,
          degerlendirme_tarihi: formData.degerlendirme_tarihi,
          notlar: formData.notlar
        })
      })

      const data = await response.json()

      if (response.ok) {
        onScoreAdded()
        setFormData({
          puan: '',
          degerlendirme_tarihi: new Date().toISOString().split('T')[0],
          notlar: ''
        })
        setSelectedScale('')
      } else {
        setError(data.error || 'Ölçek puanı eklenirken hata oluştu')
      }
    } catch (error) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const selectedTemplate = selectedScale ? SCALE_TEMPLATES[selectedScale] : null

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Yeni Klinik Ölçek Puanı</h3>
        <TrendingUp className="h-5 w-5 text-indigo-600" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="scale" className="block text-sm font-medium text-gray-700 mb-2">
            Ölçek Türü *
          </label>
          <select
            id="scale"
            value={selectedScale}
            onChange={(e) => setSelectedScale(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Ölçek seçiniz</option>
            {Object.keys(SCALE_TEMPLATES).map((scale) => (
              <option key={scale} value={scale}>
                {scale} - {SCALE_TEMPLATES[scale].name}
              </option>
            ))}
          </select>
        </div>

        {selectedTemplate && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-blue-900">{selectedTemplate.name}</h4>
                <p className="text-sm text-blue-700">{selectedTemplate.description}</p>
                <p className="text-xs text-blue-600">Maksimum Puan: {selectedTemplate.maxScore}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-blue-600 hover:text-blue-800"
              >
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {showDetails && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <h5 className="text-xs font-medium text-blue-900 mb-2">Değerlendirilen Alanlar:</h5>
                <div className="grid grid-cols-2 gap-1">
                  {selectedTemplate.questions.map((question, index) => (
                    <div key={index} className="text-xs text-blue-700">
                      • {question}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="puan" className="block text-sm font-medium text-gray-700 mb-2">
              Toplam Puan *
            </label>
            <input
              type="number"
              id="puan"
              name="puan"
              min="0"
              max={selectedTemplate?.maxScore || 100}
              step="0.1"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ölçek puanı"
              value={formData.puan}
              onChange={handleChange}
            />
            {selectedTemplate && (
              <p className="text-xs text-gray-500 mt-1">
                0 - {selectedTemplate.maxScore} arasında bir değer giriniz
              </p>
            )}
          </div>

          <div>
            <label htmlFor="degerlendirme_tarihi" className="block text-sm font-medium text-gray-900 mb-2">
              Değerlendirme Tarihi *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="date"
                id="degerlendirme_tarihi"
                name="degerlendirme_tarihi"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                value={formData.degerlendirme_tarihi}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="notlar" className="block text-sm font-medium text-gray-900 mb-2">
            Klinik Notlar
          </label>
          <textarea
            id="notlar"
            name="notlar"
            rows={4}
            className="block w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
            placeholder="Değerlendirmeyle ilgili notlarınızı buraya yazabilirsiniz..."
            value={formData.notlar}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setSelectedScale('')
              setFormData({
                puan: '',
                degerlendirme_tarihi: new Date().toISOString().split('T')[0],
                notlar: ''
              })
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
          >
            Temizle
          </button>
          <button
            type="submit"
            disabled={isLoading || !selectedScale}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isLoading ? 'Ekleniyor...' : 'Puanı Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}