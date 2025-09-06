'use client'

import { useState, useEffect } from 'react'
import { X, User, Calendar, Phone, MapPin, Building } from 'lucide-react'

interface AddPatientModalProps {
  isOpen: boolean
  onClose: () => void
  onPatientAdded: () => void
}

interface Module {
  modul_id: string
  modul_adi: string
  aciklama: string
}

export default function AddPatientModal({ isOpen, onClose, onPatientAdded }: AddPatientModalProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [formData, setFormData] = useState({
    tc_kimlik_no: '',
    ad: '',
    soyad: '',
    dogum_tarihi: '',
    cinsiyet: '',
    telefon: '',
    adres: '',
    modul_id: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchModules()
    }
  }, [isOpen])

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/modules', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setModules(data.modules)
      }
    } catch (error) {
      console.error('Fetch modules error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        onPatientAdded()
        onClose()
        setFormData({
          tc_kimlik_no: '',
          ad: '',
          soyad: '',
          dogum_tarihi: '',
          cinsiyet: '',
          telefon: '',
          adres: '',
          modul_id: ''
        })
      } else {
        setError(data.error || 'Hasta eklenirken hata oluştu')
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Yeni Hasta Ekle</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <label htmlFor="tc_kimlik_no" className="block text-sm font-medium text-gray-900 mb-2">
                T.C. Kimlik Numarası *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  id="tc_kimlik_no"
                  name="tc_kimlik_no"
                  required
                  maxLength={11}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                  placeholder="12345678901"
                  value={formData.tc_kimlik_no}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="ad" className="block text-sm font-medium text-gray-900 mb-2">
                Ad *
              </label>
              <input
                type="text"
                id="ad"
                name="ad"
                required
                className="block w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                placeholder="Hasta adı"
                value={formData.ad}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="soyad" className="block text-sm font-medium text-gray-900 mb-2">
                Soyad *
              </label>
              <input
                type="text"
                id="soyad"
                name="soyad"
                required
                className="block w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                placeholder="Hasta soyadı"
                value={formData.soyad}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="dogum_tarihi" className="block text-sm font-medium text-gray-900 mb-2">
                Doğum Tarihi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="date"
                  id="dogum_tarihi"
                  name="dogum_tarihi"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  value={formData.dogum_tarihi}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="cinsiyet" className="block text-sm font-medium text-gray-900 mb-2">
                Cinsiyet
              </label>
              <select
                id="cinsiyet"
                name="cinsiyet"
                className="block w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                value={formData.cinsiyet}
                onChange={handleChange}
              >
                <option value="">Seçiniz</option>
                <option value="Erkek">Erkek</option>
                <option value="Kadın">Kadın</option>
              </select>
            </div>

            <div>
              <label htmlFor="telefon" className="block text-sm font-medium text-gray-900 mb-2">
                Telefon
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="tel"
                  id="telefon"
                  name="telefon"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                  placeholder="0532 123 45 67"
                  value={formData.telefon}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="adres" className="block text-sm font-medium text-gray-900 mb-2">
                Adres
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-500" />
                </div>
                <textarea
                  id="adres"
                  name="adres"
                  rows={3}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                  placeholder="Hastanın adresi"
                  value={formData.adres}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="modul_id" className="block text-sm font-medium text-gray-900 mb-2">
                Klinik Modülü
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-500" />
                </div>
                <select
                  id="modul_id"
                  name="modul_id"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  value={formData.modul_id}
                  onChange={handleChange}
                >
                  <option value="">Modül seçin</option>
                  {modules.map((module) => (
                    <option key={module.modul_id} value={module.modul_id}>
                      {module.modul_adi}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Ekleniyor...' : 'Hasta Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}