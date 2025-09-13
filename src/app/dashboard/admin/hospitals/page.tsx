'use client'

import { useState, useEffect } from 'react'
import { Building, MapPin, Phone, Mail, Globe, Plus, Edit, Trash2, Save, X } from 'lucide-react'

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
  created_at: string
  updated_at: string
}

export default function HospitalManagementPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null)
  const [formData, setFormData] = useState({
    hastane_adi: '',
    sehir: '',
    adres: '',
    telefon: '',
    email: '',
    website: '',
    koordinat_x: '',
    koordinat_y: ''
  })

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/hospitals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setHospitals(data.hospitals)
      } else {
        console.error('Failed to fetch hospitals')
      }
    } catch (error) {
      console.error('Fetch hospitals error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/hospitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          koordinat_x: formData.koordinat_x ? parseFloat(formData.koordinat_x) : null,
          koordinat_y: formData.koordinat_y ? parseFloat(formData.koordinat_y) : null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setHospitals(prev => [...prev, data.hospital])
        resetForm()
        setShowAddForm(false)
        alert('Hastane başarıyla eklendi!')
      } else {
        const errorData = await response.json()
        alert(`Hata: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Create hospital error:', error)
      alert('Bir hata oluştu')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingHospital) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/hospitals/${editingHospital.hastane_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          koordinat_x: formData.koordinat_x ? parseFloat(formData.koordinat_x) : null,
          koordinat_y: formData.koordinat_y ? parseFloat(formData.koordinat_y) : null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setHospitals(prev => 
          prev.map(h => h.hastane_id === editingHospital.hastane_id ? data.hospital : h)
        )
        resetForm()
        setEditingHospital(null)
        alert('Hastane başarıyla güncellendi!')
      } else {
        const errorData = await response.json()
        alert(`Hata: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Update hospital error:', error)
      alert('Bir hata oluştu')
    }
  }

  const handleDelete = async (hastane_id: string) => {
    if (!confirm('Bu hastaneyi silmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/hospitals/${hastane_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setHospitals(prev => prev.filter(h => h.hastane_id !== hastane_id))
        alert('Hastane başarıyla silindi!')
      } else {
        const errorData = await response.json()
        alert(`Hata: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Delete hospital error:', error)
      alert('Bir hata oluştu')
    }
  }

  const resetForm = () => {
    setFormData({
      hastane_adi: '',
      sehir: '',
      adres: '',
      telefon: '',
      email: '',
      website: '',
      koordinat_x: '',
      koordinat_y: ''
    })
  }

  const startEditing = (hospital: Hospital) => {
    setEditingHospital(hospital)
    setFormData({
      hastane_adi: hospital.hastane_adi,
      sehir: hospital.sehir,
      adres: hospital.adres || '',
      telefon: hospital.telefon || '',
      email: hospital.email || '',
      website: hospital.website || '',
      koordinat_x: hospital.koordinat_x?.toString() || '',
      koordinat_y: hospital.koordinat_y?.toString() || ''
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Hastane Yönetimi
        </h1>
        <p className="text-gray-600">
          Hastaneleri yönetin, yeni hastaneler ekleyin veya mevcut hastaneleri düzenleyin.
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => {
            resetForm()
            setShowAddForm(true)
            setEditingHospital(null)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Hastane Ekle
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingHospital) && (
        <div className="mb-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {editingHospital ? 'Hastane Düzenle' : 'Yeni Hastane Ekle'}
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <form onSubmit={editingHospital ? handleUpdate : handleSubmit} className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="hastane_adi" className="block text-sm font-medium text-gray-700">
                    Hastane Adı *
                  </label>
                  <input
                    type="text"
                    name="hastane_adi"
                    id="hastane_adi"
                    value={formData.hastane_adi}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="sehir" className="block text-sm font-medium text-gray-700">
                    Şehir *
                  </label>
                  <input
                    type="text"
                    name="sehir"
                    id="sehir"
                    value={formData.sehir}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="adres" className="block text-sm font-medium text-gray-700">
                    Adres
                  </label>
                  <textarea
                    name="adres"
                    id="adres"
                    rows={3}
                    value={formData.adres}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="telefon" className="block text-sm font-medium text-gray-700">
                    Telefon
                  </label>
                  <input
                    type="text"
                    name="telefon"
                    id="telefon"
                    value={formData.telefon}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    E-posta
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Web Sitesi
                  </label>
                  <input
                    type="url"
                    name="website"
                    id="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="koordinat_x" className="block text-sm font-medium text-gray-700">
                    Koordinat X
                  </label>
                  <input
                    type="number"
                    name="koordinat_x"
                    id="koordinat_x"
                    step="0.0001"
                    value={formData.koordinat_x}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="koordinat_y" className="block text-sm font-medium text-gray-700">
                    Koordinat Y
                  </label>
                  <input
                    type="number"
                    name="koordinat_y"
                    id="koordinat_y"
                    step="0.0001"
                    value={formData.koordinat_y}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingHospital(null)
                    resetForm()
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  İptal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingHospital ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hospitals List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Hastaneler ({hospitals.length})
          </h3>
        </div>
        <div className="border-t border-gray-200">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Yükleniyor...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="text-gray-600 mt-2">Henüz hastane eklenmemiş.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {hospitals.map((hospital) => (
                <li key={hospital.hastane_id}>
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Building className="h-6 w-6 text-indigo-600 mr-3" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{hospital.hastane_adi}</h3>
                          <p className="text-sm text-gray-500">{hospital.sehir}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(hospital)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(hospital.hastane_id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Sil
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      {hospital.adres && (
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{hospital.adres}</span>
                        </div>
                      )}
                      {hospital.telefon && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{hospital.telefon}</span>
                        </div>
                      )}
                      {hospital.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{hospital.email}</span>
                        </div>
                      )}
                      {hospital.website && (
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          <span className="truncate">{hospital.website}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <span className="mr-4">
                        Aktif Doktor: {hospital.aktif_doktor_sayisi}
                      </span>
                      <span>
                        Aktif Hasta: {hospital.aktif_hasta_sayisi}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}