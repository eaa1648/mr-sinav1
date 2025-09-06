'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FileText, Download, Eye, Calendar, User, Brain, 
  TrendingUp, AlertCircle, CheckCircle, Clock,
  Plus, Filter, Search
} from 'lucide-react'

interface Report {
  rapor_id: string
  hasta_id: string
  olusturan_kullanici_id: string
  olusturma_tarihi: string
  yapay_zeka_yorumu: string | null
  optimizasyon_sonucu: string | null
  doktor_gorusleri: string | null
  gaf_uyum_skoru: number | null
  rapor_dosya_yolu: string | null
  hasta: {
    ad: string
    soyad: string
    tc_kimlik_no: string
  }
  olusturan_kullanici: {
    ad: string
    soyad: string
    uzmanlik_alani: string
  }
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchReports()
  }, [router])

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      }
    } catch (error) {
      console.error('Fetch reports error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getReportStatus = (report: Report) => {
    if (report.rapor_dosya_yolu) return 'completed'
    if (report.yapay_zeka_yorumu && report.doktor_gorusleri) return 'pending_approval'
    if (report.yapay_zeka_yorumu) return 'ai_completed'
    return 'processing'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Tamamlandı
        </span>
      case 'pending_approval':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Onay Bekliyor
        </span>
      case 'ai_completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Brain className="h-3 w-3 mr-1" />
          AI Analizi Tamamlandı
        </span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          İşleniyor
        </span>
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.hasta.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.hasta.soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.hasta.tc_kimlik_no.includes(searchTerm)
    
    const matchesFilter = 
      filterStatus === 'all' || getReportStatus(report) === filterStatus
    
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hasta Raporları</h1>
          <p className="mt-2 text-gray-600">AI destekli hasta raporları ve analiz sonuçları</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Hasta ara (Ad, Soyad, T.C. Kimlik No)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Tüm Raporlar</option>
                <option value="completed">Tamamlananlar</option>
                <option value="pending_approval">Onay Bekleyenler</option>
                <option value="ai_completed">AI Analizi Tamamlananlar</option>
                <option value="processing">İşlenenler</option>
              </select>
              
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Rapor
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Toplam Rapor
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{reports.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tamamlanan
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {reports.filter(r => getReportStatus(r) === 'completed').length}
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
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Onay Bekleyen
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {reports.filter(r => getReportStatus(r) === 'pending_approval').length}
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
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      AI Analizi
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {reports.filter(r => r.yapay_zeka_yorumu).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Rapor Listesi</h2>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' ? 
                  'Arama kriterlerinize uygun rapor bulunamadı' : 
                  'Henüz rapor bulunmuyor'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hasta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oluşturma Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oluşturan Doktor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GAF Skoru
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report.rapor_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {report.hasta.ad} {report.hasta.soyad}
                          </div>
                          <div className="text-sm text-gray-500">
                            T.C. {report.hasta.tc_kimlik_no}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(report.olusturma_tarihi).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Dr. {report.olusturan_kullanici.ad} {report.olusturan_kullanici.soyad}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.olusturan_kullanici.uzmanlik_alani}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(getReportStatus(report))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.gaf_uyum_skoru ? (
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                            {report.gaf_uyum_skoru}%
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          {report.rapor_dosya_yolu && (
                            <button className="text-green-600 hover:text-green-900">
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}