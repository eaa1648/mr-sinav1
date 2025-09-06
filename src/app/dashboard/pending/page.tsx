'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Clock, Brain, FileText, AlertCircle, CheckCircle, 
  Eye, User, Calendar, RefreshCw
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'

interface User {
  kullanici_id: string
  ad: string
  soyad: string
  uzmanlik_alani: string
  hastane_id: string
  rol: string
}

interface PendingMR {
  mr_id: string
  hasta_id: string
  cekilis_tarihi: string
  isleme_durumu: string
  created_at: string
  hasta: {
    ad: string
    soyad: string
    tc_kimlik_no: string
  }
}

interface PendingReport {
  rapor_id: string
  hasta_id: string
  olusturma_tarihi: string
  durum: string
  hasta: {
    ad: string
    soyad: string
    tc_kimlik_no: string
  }
  olusturan_kullanici: {
    ad: string
    soyad: string
  }
}

export default function PendingRequestsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [pendingMRs, setPendingMRs] = useState<PendingMR[]>([])
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('mr-processing')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    fetchPendingRequests()
  }, [router])

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch pending MR processing
      const mrResponse = await fetch('/api/mr-images?status=pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (mrResponse.ok) {
        const mrData = await mrResponse.json()
        setPendingMRs(mrData.mrImages || [])
      }

      // Fetch pending reports
      const reportResponse = await fetch('/api/reports?status=pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (reportResponse.ok) {
        const reportData = await reportResponse.json()
        setPendingReports(reportData.reports || [])
      }
      
    } catch (error) {
      console.error('Fetch pending requests error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const getStatusBadge = (status: string, type: 'mr' | 'report') => {
    if (type === 'mr') {
      switch (status) {
        case 'BEKLEMEDE':
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            İşleme Bekliyor
          </span>
        case 'ISLENIYOR':
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            İşleniyor
          </span>
        case 'TAMAMLANDI':
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Tamamlandı
          </span>
        case 'HATA':
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Hata
          </span>
        default:
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Bilinmiyor
          </span>
      }
    } else {
      switch (status) {
        case 'TASLAK':
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FileText className="h-3 w-3 mr-1" />
            Taslak
          </span>
        case 'INCELEME':
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Eye className="h-3 w-3 mr-1" />
            İncelemede
          </span>
        case 'ONAYLANDI':
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Onaylandı
          </span>
        default:
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Bilinmiyor
          </span>
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Bekleyen Talepler</h1>
              <p className="mt-2 text-gray-600">
                İşleme bekleyen MR görüntüleri ve onay bekleyen raporlar
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Brain className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Bekleyen MR İşleme
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {pendingMRs.filter(mr => mr.isleme_durumu === 'BEKLEMEDE').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <RefreshCw className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          İşleniyor
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {pendingMRs.filter(mr => mr.isleme_durumu === 'ISLENIYOR').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Bekleyen Raporlar
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {pendingReports.filter(report => report.durum === 'INCELEME').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('mr-processing')}
                  className={`${
                    activeTab === 'mr-processing'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  MR İşleme Durumu
                </button>
                <button
                  onClick={() => setActiveTab('pending-reports')}
                  className={`${
                    activeTab === 'pending-reports'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Rapor Onayları
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'mr-processing' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    MR Görüntü İşleme Durumu
                  </h3>
                  
                  {pendingMRs.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Bekleyen MR işleme talebi bulunmuyor.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingMRs.map((mr) => (
                        <div key={mr.mr_id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <User className="h-8 w-8 text-gray-400" />
                              </div>
                              <div>
                                <h4 className="text-lg font-medium text-gray-900">
                                  {mr.hasta.ad} {mr.hasta.soyad}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  T.C.: {mr.hasta.tc_kimlik_no}
                                </p>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Çekim: {new Date(mr.cekilis_tarihi).toLocaleDateString('tr-TR')}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              {getStatusBadge(mr.isleme_durumu, 'mr')}
                              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                <Eye className="h-4 w-4 mr-1" />
                                Detay
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'pending-reports' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Onay Bekleyen Raporlar
                  </h3>
                  
                  {pendingReports.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Onay bekleyen rapor bulunmuyor.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingReports.map((report) => (
                        <div key={report.rapor_id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <FileText className="h-8 w-8 text-gray-400" />
                              </div>
                              <div>
                                <h4 className="text-lg font-medium text-gray-900">
                                  {report.hasta.ad} {report.hasta.soyad} - Rapor
                                </h4>
                                <p className="text-sm text-gray-600">
                                  T.C.: {report.hasta.tc_kimlik_no}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Hazırlayan: Dr. {report.olusturan_kullanici.ad} {report.olusturan_kullanici.soyad}
                                </p>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(report.olusturma_tarihi).toLocaleDateString('tr-TR')}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              {getStatusBadge(report.durum, 'report')}
                              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                <Eye className="h-4 w-4 mr-1" />
                                İncele
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Refresh Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={fetchPendingRequests}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}