'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Brain,
  Users,
  UserPlus,
  FileText,
  Bell,
  LogOut,
  Activity,
  Calendar,
  TrendingUp,
  AlertCircle,
  ChevronRight
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

interface DashboardStats {
  totalPatients: number
  recentMRCount: number
  pendingReportsCount: number
  todayActivitiesCount: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    const user = JSON.parse(userData)
    setUser(user)
    
    // Fetch dashboard statistics
    fetchDashboardStats(token)
  }, [router])

  const fetchDashboardStats = async (token: string) => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Hoş Geldiniz, Dr. {user.ad} {user.soyad}
          </h2>
          <p className="text-gray-600">
            Bugünkü hasta takiplerini ve sistem aktivitelerini buradan takip edebilirsiniz.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Toplam Hastalar
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.totalPatients || 0}
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
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Son 24 Saatte MR
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.recentMRCount || 0}
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
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Onay Bekleyen Raporlar
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.pendingReportsCount || 0}
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
                    <TrendingUp className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Bugünkü Aktiviteler
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.todayActivitiesCount || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Hızlı İşlemler
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/dashboard/patients"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <UserPlus className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Yeni Hasta Ekle</span>
                    <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                  </Link>
                  
                  <Link
                    href="/dashboard/patients"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Users className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Hastalarım</span>
                    <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                  </Link>
                  
                  <Link
                    href="/dashboard/reports"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Raporlar</span>
                    <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                  </Link>
                  
                  {user.rol === 'ADMIN' && (
                    <Link
                      href="/dashboard/admin/registrations"
                      className="flex items-center p-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <UserPlus className="h-5 w-5 text-red-600 mr-3" />
                      <span className="text-sm font-medium text-red-900">Doktor Başvuruları</span>
                      <ChevronRight className="h-4 w-4 text-red-400 ml-auto" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Son Aktiviteler
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-900">Hasta Ahmet Yılmaz için yeni MR yüklendi</p>
                      <p className="text-xs text-gray-500">2 saat önce</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-900">Hasta Fatma Kaya için rapor hazır</p>
                      <p className="text-xs text-gray-500">4 saat önce</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-900">Hasta Mehmet Demir için YMRS puanı eklendi</p>
                      <p className="text-xs text-gray-500">1 gün önce</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Bekleyen İşlemler
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  3 işlem
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Ahmet Yılmaz - MR Analizi</p>
                      <p className="text-xs text-gray-500">MR görüntüsü işleme tamamlandı, incelemeye hazır</p>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    İncele
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Fatma Kaya - Rapor Onayı</p>
                      <p className="text-xs text-gray-500">AI destekli rapor hazır, doktor onayı bekleniyor</p>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Onayla
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Mehmet Demir - Kontrol Randevusu</p>
                      <p className="text-xs text-gray-500">3 aylık kontrol randevusu yaklaşıyor</p>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Planla
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}