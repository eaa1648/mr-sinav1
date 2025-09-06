'use client'

import { useState, useEffect } from 'react'
import { User, Building, GraduationCap, Calendar, Phone, Mail, Check, X, Eye } from 'lucide-react'

interface PendingRegistration {
  id: string
  tc_kimlik_no: string
  ad: string
  soyad: string
  uzmanlik_alani: string
  hastane_id: string
  hastane_adi?: string
  telefon?: string
  email?: string
  diploma_no?: string
  mezuniyet_tarihi?: string
  basvuru_tarihi: string
  durum: 'BEKLEMEDE' | 'ONAYLANDI' | 'REDDEDILDI'
  red_nedeni?: string
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([])
  const [selectedStatus, setSelectedStatus] = useState<'BEKLEMEDE' | 'ONAYLANDI' | 'REDDEDILDI'>('BEKLEMEDE')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<PendingRegistration | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRegistrations()
  }, [selectedStatus])

  const fetchRegistrations = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/registrations?status=${selectedStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRegistrations(data.registrations)
      } else {
        console.error('Failed to fetch registrations')
      }
    } catch (error) {
      console.error('Fetch registrations error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (registrationId: string) => {
    setProcessingId(registrationId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          registrationId,
          action: 'approve'
        })
      })

      if (response.ok) {
        await fetchRegistrations()
        alert('Kayıt başvurusu onaylandı!')
      } else {
        const data = await response.json()
        alert(`Hata: ${data.error}`)
      }
    } catch (error) {
      console.error('Approve registration error:', error)
      alert('Bir hata oluştu')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async () => {
    if (!selectedRegistration || !rejectionReason.trim()) {
      alert('Lütfen red nedeni belirtin')
      return
    }

    setProcessingId(selectedRegistration.id)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          registrationId: selectedRegistration.id,
          action: 'reject',
          rejectionReason
        })
      })

      if (response.ok) {
        await fetchRegistrations()
        setShowRejectionModal(false)
        setRejectionReason('')
        setSelectedRegistration(null)
        alert('Kayıt başvurusu reddedildi!')
      } else {
        const data = await response.json()
        alert(`Hata: ${data.error}`)
      }
    } catch (error) {
      console.error('Reject registration error:', error)
      alert('Bir hata oluştu')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'BEKLEMEDE':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Beklemede</span>
      case 'ONAYLANDI':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Onaylandı</span>
      case 'REDDEDILDI':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Reddedildi</span>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Doktor Kayıt Başvuruları
        </h1>
        <p className="text-gray-600">
          Doktor kayıt başvurularını inceleyin, onaylayın veya reddedin.
        </p>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'BEKLEMEDE', label: 'Beklemede', count: registrations.length },
              { key: 'ONAYLANDI', label: 'Onaylanan', count: 0 },
              { key: 'REDDEDILDI', label: 'Reddedilen', count: 0 }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key as any)}
                className={`${
                  selectedStatus === tab.key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Registrations List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Yükleniyor...</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Bu durumda kayıt başvurusu bulunmuyor.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {registrations.map((registration) => (
              <li key={registration.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Dr. {registration.ad} {registration.soyad}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {registration.uzmanlik_alani} • {registration.hastane_id}
                            {registration.hastane_adi && ` - ${registration.hastane_adi}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(registration.durum)}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(registration.basvuru_tarihi)}
                      </div>
                      {registration.telefon && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {registration.telefon}
                        </div>
                      )}
                      {registration.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {registration.email}
                        </div>
                      )}
                    </div>

                    {registration.red_nedeni && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700">
                          <strong>Red Nedeni:</strong> {registration.red_nedeni}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedStatus === 'BEKLEMEDE' && (
                    <div className="ml-6 flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedRegistration(registration)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detay
                      </button>
                      <button
                        onClick={() => handleApprove(registration.id)}
                        disabled={processingId === registration.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Onayla
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRegistration(registration)
                          setShowRejectionModal(true)
                        }}
                        disabled={processingId === registration.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reddet
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Registration Detail Modal */}
      {selectedRegistration && !showRejectionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Başvuru Detayları</h3>
              <button
                onClick={() => setSelectedRegistration(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.ad} {selectedRegistration.soyad}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">T.C. Kimlik No</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.tc_kimlik_no}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Uzmanlık Alanı</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.uzmanlik_alani}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hastane ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.hastane_id}</p>
                </div>
                {selectedRegistration.hastane_adi && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Hastane Adı</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRegistration.hastane_adi}</p>
                  </div>
                )}
                {selectedRegistration.telefon && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefon</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRegistration.telefon}</p>
                  </div>
                )}
                {selectedRegistration.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">E-posta</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRegistration.email}</p>
                  </div>
                )}
                {selectedRegistration.diploma_no && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Diploma No</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRegistration.diploma_no}</p>
                  </div>
                )}
                {selectedRegistration.mezuniyet_tarihi && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mezuniyet Tarihi</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedRegistration.mezuniyet_tarihi).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Başvuru Tarihi</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRegistration.basvuru_tarihi)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Durum</label>
                  <div className="mt-1">{getStatusBadge(selectedRegistration.durum)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedRegistration && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Başvuru Reddi</h3>
              <button
                onClick={() => {
                  setShowRejectionModal(false)
                  setRejectionReason('')
                  setSelectedRegistration(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                <strong>{selectedRegistration.ad} {selectedRegistration.soyad}</strong> adlı doktorun başvurusunu reddetmek istediğinizden emin misiniz?
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Red Nedeni *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={4}
                placeholder="Lütfen başvurunun red edilme nedenini açıklayın..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectionModal(false)
                  setRejectionReason('')
                  setSelectedRegistration(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processingId === selectedRegistration.id}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {processingId === selectedRegistration.id ? 'İşleniyor...' : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}