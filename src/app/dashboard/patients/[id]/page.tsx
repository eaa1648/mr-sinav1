'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  User, Calendar, Phone, MapPin, Activity, 
  Brain, FileText, Upload, Download, Plus, 
  Search, Edit, Trash2, Eye, TrendingUp,
  ChevronLeft, ChevronRight, Heart, Stethoscope, Pill, 
  BarChart3, AlertTriangle, CheckCircle, Microscope
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import ClinicalScalesForm from '@/components/ClinicalScalesForm'
import MRImageUpload from '@/components/MRImageUpload'
import ClinicalDataChart from '@/components/ClinicalDataChart'
import MedicationTimeline from '@/components/MedicationTimeline'
import MRComparison from '@/components/MRComparison'
import { clinicalDecisionSupport } from '@/lib/optimizationModel'
import FreeSurferAnalysisSection from '@/components/FreeSurferAnalysisSection'

interface Patient {
  hasta_id: string
  tc_kimlik_no: string
  ad: string
  soyad: string
  dogum_tarihi: string | null
  cinsiyet: string | null
  telefon: string | null
  adres: string | null
  created_at: string
  hasta_kayitlari: any[]
  mr_goruntuleri: any[]
  klinik_puanlar: any[]
  ilac_tedavileri: any[]
  raporlar: any[]
}

interface User {
  kullanici_id: string
  ad: string
  soyad: string
  uzmanlik_alani: string
  hastane_id: string
  rol: string
}

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    fetchPatient(params.id)
  }, [params.id, router])

  const fetchPatient = async (patientId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/patients/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPatient(data.patient)
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      }
    } catch (error) {
      console.error('Fetch patient error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const handleGenerateReport = (mrId1: string, mrId2: string) => {
    // Navigate to report generation page with MR IDs
    router.push(`/dashboard/reports/new?mr1=${mrId1}&mr2=${mrId2}&patient=${patient?.hasta_id}`)
  }

  const tabs = [
    { id: 'profile', name: 'Hasta Profili', icon: User },
    { id: 'mr-images', name: 'MR Görüntüleri', icon: Brain },
    { id: 'mr-comparison', name: 'MR Karşılaştırma', icon: Brain },
    { id: 'clinical-scores', name: 'Klinik Ölçekler', icon: Activity },
    { id: 'medications', name: 'Tedavi Geçmişi', icon: Pill },
    { id: 'reports', name: 'Raporlar', icon: FileText },
    { id: 'freesurfer', name: 'FreeSurfer Analizi', icon: Microscope },
    { id: 'analytics', name: 'Analitik', icon: BarChart3 },
    { id: 'recommendations', name: 'Öneriler', icon: Stethoscope }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Hasta bilgileri yükleniyor...</p>
        </div>
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
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="text-sm font-medium">Geri</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.ad} {patient.soyad}
                </h1>
              </div>
              <p className="text-gray-600">
                T.C. {patient.tc_kimlik_no} • Hasta ID: {patient.hasta_id}
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' && (
              <PatientProfile patient={patient} />
            )}

            {activeTab === 'mr-images' && (
              <div className="space-y-6">
                <MRImageUpload 
                  patientId={patient.hasta_id} 
                  onImageUploaded={() => fetchPatient(patient.hasta_id)}
                />
                <MRImages patient={patient} />
              </div>
            )}

            {activeTab === 'mr-comparison' && (
              <MRComparison
                patientId={patient.hasta_id}
                mrImages={patient.mr_goruntuleri || []}
                onGenerateReport={handleGenerateReport}
              />
            )}

            {activeTab === 'clinical-scores' && (
              <div className="space-y-6">
                <ClinicalScalesForm 
                  patientId={patient.hasta_id}
                  onScoreAdded={() => fetchPatient(patient.hasta_id)}
                />
                <ClinicalDataChart 
                  scores={patient.klinik_puanlar || []}
                />
                <ClinicalScores patient={patient} />
              </div>
            )}

            {activeTab === 'medications' && (
              <div className="space-y-6">
                <MedicationTimeline medications={patient.ilac_tedavileri || []} />
                <Medications patient={patient} />
              </div>
            )}

            {activeTab === 'reports' && (
              <Reports patient={patient} />
            )}

            {activeTab === 'freesurfer' && (
              <FreeSurferAnalysisSection patient={patient} />
            )}

            {activeTab === 'analytics' && (
              <Analytics patient={patient} />
            )}

            {activeTab === 'recommendations' && (
              <Recommendations patient={patient} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

// Patient Profile Component
function PatientProfile({ patient }: { patient: Patient }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Hasta Profili</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Kişisel Bilgiler</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Ad Soyad</dt>
              <dd className="text-sm font-medium text-gray-900">{patient.ad} {patient.soyad}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">T.C. Kimlik No</dt>
              <dd className="text-sm font-medium text-gray-900">{patient.tc_kimlik_no}</dd>
            </div>
            {patient.dogum_tarihi && (
              <div>
                <dt className="text-sm text-gray-500">Doğum Tarihi</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {new Date(patient.dogum_tarihi).toLocaleDateString('tr-TR')}
                </dd>
              </div>
            )}
            {patient.cinsiyet && (
              <div>
                <dt className="text-sm text-gray-500">Cinsiyet</dt>
                <dd className="text-sm font-medium text-gray-900">{patient.cinsiyet}</dd>
              </div>
            )}
          </dl>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">İletişim Bilgileri</h3>
          <dl className="space-y-3">
            {patient.telefon && (
              <div>
                <dt className="text-sm text-gray-500">Telefon</dt>
                <dd className="text-sm font-medium text-gray-900">{patient.telefon}</dd>
              </div>
            )}
            {patient.adres && (
              <div>
                <dt className="text-sm text-gray-500">Adres</dt>
                <dd className="text-sm font-medium text-gray-900">{patient.adres}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Aktivite Özeti</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{patient.mr_goruntuleri?.length || 0}</div>
            <div className="text-sm text-gray-600">MR Görüntüsü</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{patient.klinik_puanlar?.length || 0}</div>
            <div className="text-sm text-gray-600">Klinik Ölçek</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{patient.raporlar?.length || 0}</div>
            <div className="text-sm text-gray-600">Rapor</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Pill className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{patient.ilac_tedavileri?.length || 0}</div>
            <div className="text-sm text-gray-600">Tedavi</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// MR Images Component
function MRImages({ patient }: { patient: Patient }) {
  const [mrImages, setMrImages] = useState(patient.mr_goruntuleri || [])
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])

  useEffect(() => {
    setMrImages(patient.mr_goruntuleri || [])
  }, [patient])

  const handleSelectForComparison = (mrId: string) => {
    if (selectedForComparison.includes(mrId)) {
      setSelectedForComparison(selectedForComparison.filter(id => id !== mrId))
    } else if (selectedForComparison.length < 2) {
      setSelectedForComparison([...selectedForComparison, mrId])
    } else {
      // Replace the first selected with the new one if already 2 selected
      setSelectedForComparison([selectedForComparison[1], mrId])
    }
  }

  const handleViewDetails = (mrImage: any) => {
    // TODO: Open detailed view modal
    // View details for MR image
  }

  if (mrImages.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">MR Görüntü Galerisi</h2>
        
        <div className="text-center py-12 text-gray-500">
          <Brain className="h-12 w-12 mx-auto mb-4" />
          <p>MR görüntüsü bulunmuyor</p>
          <p className="text-sm">Yukarıdaki form ile yeni görüntü yükleyebilirsiniz</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          MR Görüntü Galerisi ({mrImages.length} görüntü)
        </h2>
        {selectedForComparison.length === 2 && (
          <button
            onClick={() => {
              // Navigate to comparison page
              window.location.href = `/dashboard/reports/new?mr1=${selectedForComparison[0]}&mr2=${selectedForComparison[1]}&patient=${patient.hasta_id}`
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <Brain className="h-4 w-4 mr-2" />
            Karşılaştırma Yap ({selectedForComparison.length})
          </button>
        )}
      </div>
      
      {/* Gallery Grid - Thumbnail previews as specified */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mrImages.map((mrImage: any) => {
          const isSelected = selectedForComparison.includes(mrImage.mr_id)
          
          return (
            <div 
              key={mrImage.mr_id} 
              className={`border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Thumbnail Preview Area */}
              <div className="relative aspect-square bg-gray-100">
                {/* Mock thumbnail - in real implementation, display actual MR slice */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className={`h-16 w-16 ${
                    mrImage.isleme_durumu === 'TAMAMLANDI' ? 'text-green-600' :
                    mrImage.isleme_durumu === 'ISLENIYOR' ? 'text-yellow-600' :
                    'text-gray-400'
                  }`} />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    mrImage.isleme_durumu === 'TAMAMLANDI' ? 'bg-green-100 text-green-800' :
                    mrImage.isleme_durumu === 'ISLENIYOR' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {mrImage.isleme_durumu}
                  </span>
                </div>
                
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 left-2">
                    <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {selectedForComparison.indexOf(mrImage.mr_id) + 1}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Image Information */}
              <div className="p-4">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      MR #{mrImage.mr_id.slice(-6)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(mrImage.dosya_boyutu / 1024 / 1024)} MB
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Çekim: {new Date(mrImage.cekilis_tarihi).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
                
                {/* Specific Buttons as mentioned in specification */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleViewDetails(mrImage)}
                    className="w-full px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Detayları Gör
                  </button>
                  
                  <button
                    onClick={() => handleSelectForComparison(mrImage.mr_id)}
                    disabled={!isSelected && selectedForComparison.length >= 2}
                    className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                      isSelected 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : selectedForComparison.length >= 2
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {isSelected ? 'Seçildi' : 'Karşılaştırmak İçin Seç'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Comparison Instructions */}
      {selectedForComparison.length > 0 && (
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center">
            <Brain className="h-5 w-5 text-indigo-600 mr-3" />
            <div className="text-sm">
              <p className="font-medium text-indigo-900">
                {selectedForComparison.length === 1 ? (
                  '1 MR seçildi. Karşılaştırma için ikinci MR\'u seçin.'
                ) : (
                  '2 MR seçildi. Karşılaştırma analizi için üst kısımdaki butona tıklayın.'
                )}
              </p>
              <p className="text-indigo-700 mt-1">
                Seçilen MR'lar PyTorch tabanlı AI modeli ile karşılaştırılacaktır.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Clinical Scores Component
function ClinicalScores({ patient }: { patient: Patient }) {
  const [scores, setScores] = useState(patient.klinik_puanlar || [])

  useEffect(() => {
    setScores(patient.klinik_puanlar || [])
  }, [patient])

  if (scores.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Kaydedilen Klinik Ölçek Puanları</h2>
        
        <div className="text-center py-12 text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-4" />
          <p>Klinik ölçek puanı bulunmuyor</p>
          <p className="text-sm">Yukarıdaki form ile yeni değerlendirme ekleyebilirsiniz</p>
        </div>
      </div>
    )
  }

  // Group scores by scale type
  const groupedScores = scores.reduce((acc: any, score: any) => {
    if (!acc[score.olcek_adi]) {
      acc[score.olcek_adi] = []
    }
    acc[score.olcek_adi].push(score)
    return acc
  }, {})

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Klinik Ölçek Puanları ({scores.length} kayıt)</h2>
      
      <div className="space-y-6">
        {Object.entries(groupedScores).map(([scaleName, scaleScores]: [string, any]) => (
          <div key={scaleName} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{scaleName}</h3>
              <span className="bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded">
                {scaleScores.length} kayıt
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puan
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Değerlendiren
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notlar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scaleScores
                    .sort((a: any, b: any) => new Date(b.degerlendirme_tarihi).getTime() - new Date(a.degerlendirme_tarihi).getTime())
                    .map((score: any) => (
                    <tr key={score.sonuc_id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {new Date(score.degerlendirme_tarihi).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{score.puan}</span>
                        {score.max_puan && (
                          <span className="text-xs text-gray-500 ml-1">/ {score.max_puan}</span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {score.giren_kullanici ? 
                          `${score.giren_kullanici.ad} ${score.giren_kullanici.soyad}` : 
                          'Bilinmiyor'
                        }
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {score.notlar ? (
                          <span className="truncate max-w-xs" title={score.notlar}>
                            {score.notlar.length > 50 ? score.notlar.substring(0, 50) + '...' : score.notlar}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Medications Component
function Medications({ patient }: { patient: Patient }) {
  const [medications, setMedications] = useState(patient.ilac_tedavileri || [])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    ilac_adi: '',
    dozaj: '',
    baslangic_tarihi: new Date().toISOString().split('T')[0],
    bitis_tarihi: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMedications(patient.ilac_tedavileri || [])
  }, [patient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/patients/${patient.hasta_id}/medications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setMedications([data.medication, ...medications])
        setFormData({
          ilac_adi: '',
          dozaj: '',
          baslangic_tarihi: new Date().toISOString().split('T')[0],
          bitis_tarihi: ''
        })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Add medication error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Tedavi Geçmişi</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni İlaç Ekle
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İlaç Adı *
              </label>
              <input
                type="text"
                name="ilac_adi"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Örn: Lithium"
                value={formData.ilac_adi}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dozaj *
              </label>
              <input
                type="text"
                name="dozaj"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Örn: 300mg günde 2 kez"
                value={formData.dozaj}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlangıç Tarihi *
              </label>
              <input
                type="date"
                name="baslangic_tarihi"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.baslangic_tarihi}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                name="bitis_tarihi"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.bitis_tarihi}
                onChange={handleChange}
              />
            </div>
            
            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </div>
          </form>
        </div>
      )}

      {medications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Pill className="h-12 w-12 mx-auto mb-4" />
          <p>Tedavi geçmişi bulunmuyor</p>
          <p className="text-sm">Yeni ilaç tedavisi eklemek için yukarıdaki butonu kullanın</p>
        </div>
      ) : (
        <div className="space-y-4">
          {medications.map((medication: any) => (
            <div key={medication.tedavi_id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{medication.ilac_adi}</h3>
                  <p className="text-sm text-gray-600">{medication.dozaj}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {new Date(medication.baslangic_tarihi).toLocaleDateString('tr-TR')}
                      {medication.bitis_tarihi && (
                        <> - {new Date(medication.bitis_tarihi).toLocaleDateString('tr-TR')}</>
                      )}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  medication.aktif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {medication.aktif ? 'Aktif' : 'Tamamlandı'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Reports Component  
function Reports({ patient }: { patient: Patient }) {
  const [reports, setReports] = useState(patient.raporlar || [])

  useEffect(() => {
    setReports(patient.raporlar || [])
  }, [patient])

  if (reports.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Hasta Raporları</h2>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Yeni Rapor Oluştur
          </button>
        </div>
        
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4" />
          <p>Rapor bulunmuyor</p>
          <p className="text-sm">AI destekli rapor oluşturmak için yukarıdaki butonu kullanın</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Hasta Raporları ({reports.length})</h2>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Yeni Rapor Oluştur
        </button>
      </div>
      
      <div className="space-y-4">
        {reports.map((report: any) => (
          <div key={report.rapor_id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-gray-900">Rapor #{report.rapor_id.slice(-6)}</h3>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(report.olusturma_tarihi).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                  <Eye className="h-4 w-4" />
                </button>
                {report.rapor_dosya_yolu && (
                  <button className="text-green-600 hover:text-green-900 text-sm">
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Oluşturan:</span>
                <p className="font-medium">
                  {report.olusturan_kullanici ? 
                    `Dr. ${report.olusturan_kullanici.ad} ${report.olusturan_kullanici.soyad}` : 
                    'Bilinmiyor'
                  }
                </p>
              </div>
              <div>
                <span className="text-gray-500">GAF Skoru:</span>
                <p className="font-medium">
                  {report.gaf_uyum_skoru ? `${report.gaf_uyum_skoru}%` : '-'}
                </p>
              </div>
            </div>
            
            {report.yapay_zeka_yorumu && (
              <div className="mt-3 p-3 bg-blue-50 rounded">
                <h4 className="text-sm font-medium text-blue-900 mb-1">AI Yorumu:</h4>
                <p className="text-sm text-blue-700">
                  {report.yapay_zeka_yorumu.length > 150 ? 
                    report.yapay_zeka_yorumu.substring(0, 150) + '...' : 
                    report.yapay_zeka_yorumu
                  }
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Analytics Component
function Analytics({ patient }: { patient: Patient }) {
  const [optimizationResult, setOptimizationResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock analytics data - in a real implementation, this would come from the backend
  const analyticsData = {
    totalMRImages: patient.mr_goruntuleri?.length || 0,
    totalClinicalScores: patient.klinik_puanlar?.length || 0,
    totalMedications: patient.ilac_tedavileri?.length || 0,
    totalReports: patient.raporlar?.length || 0,
    recentActivity: [
      { date: '2023-06-15', activity: 'Yeni MR görüntüsü yüklendi', type: 'mr' },
      { date: '2023-06-10', activity: 'YMRS puanı eklendi', type: 'score' },
      { date: '2023-06-05', activity: 'Yeni ilaç tedavisi başlatıldı', type: 'medication' },
      { date: '2023-06-01', activity: 'Rapor oluşturuldu', type: 'report' }
    ]
  }

  const runOptimizationAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api/patients/${patient.hasta_id}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          timeHorizon: 90,
          objective: 'minimize_symptoms'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setOptimizationResult(data.optimizationResult)
      } else {
        throw new Error('Optimizasyon analizi başarısız oldu')
      }
    } catch (err) {
      console.error('Error running optimization:', err)
      setError('Optimizasyon analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Optimization Analysis Button */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Klinik Optimizasyon Analizi</h3>
            <p className="text-sm text-gray-500 mt-1">
              Hastanın semptom gelişimini tahmin edin ve tedavi önerileri alın
            </p>
          </div>
          <button
            onClick={runOptimizationAnalysis}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analiz Ediliyor...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Analiz Et
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Optimization Results */}
      {optimizationResult && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Optimizasyon Sonuçları</h3>
          
          {/* Risk Assessment */}
          <div className={`p-4 rounded-lg mb-6 ${
            optimizationResult.riskAssessment.riskLevel === 'high' ? 'bg-red-50 border border-red-200' :
            optimizationResult.riskAssessment.riskLevel === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-center mb-3">
              {optimizationResult.riskAssessment.riskLevel === 'high' ? (
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              ) : optimizationResult.riskAssessment.riskLevel === 'medium' ? (
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              )}
              <span className={`font-medium ${
                optimizationResult.riskAssessment.riskLevel === 'high' ? 'text-red-800' :
                optimizationResult.riskAssessment.riskLevel === 'medium' ? 'text-yellow-800' :
                'text-green-800'
              }`}>
                {optimizationResult.riskAssessment.riskLevel === 'high' ? 'Yüksek Risk' :
                 optimizationResult.riskAssessment.riskLevel === 'medium' ? 'Orta Risk' : 'Düşük Risk'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Faktörleri:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {optimizationResult.riskAssessment.riskFactors.map((factor: string, idx: number) => (
                    <li key={idx}>{factor}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Önerilen Müdahaleler:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {optimizationResult.riskAssessment.mitigationStrategies.map((strategy: string, idx: number) => (
                    <li key={idx}>{strategy}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Treatment Suggestions */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Tedavi Önerileri</h4>
            <div className="space-y-3">
              {optimizationResult.treatmentSuggestions.map((suggestion: string, idx: number) => (
                <div key={idx} className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <Heart className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* GAF Prediction */}
          {optimizationResult.gafPrediction && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Tahmini GAF Skoru</h4>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-8 border-indigo-200 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-indigo-600">{optimizationResult.gafPrediction}</span>
                      <p className="text-xs text-gray-600 mt-1">Tahmini GAF</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {optimizationResult.gafPrediction >= 70 ? 'İyi' : 
                     optimizationResult.gafPrediction >= 50 ? 'Orta' : 'Düşük'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Predicted Trajectory Chart */}
          {optimizationResult.predictedTrajectory && optimizationResult.predictedTrajectory.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tahmini Semptom Gelişimi</h4>
              <div className="h-64">
                <ClinicalDataChart 
                  scores={optimizationResult.predictedTrajectory.map((point: any) => ({
                    degerlendirme_tarihi: point.date,
                    olcek_adi: 'Tahmini Semptomlar',
                    puan: point.predictedScore,
                    max_puan: 100
                  }))} 
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">MR Görüntüleri</p>
              <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalMRImages}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Klinik Ölçekler</p>
              <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalClinicalScores}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Pill className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tedaviler</p>
              <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalMedications}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Raporlar</p>
              <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalReports}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Activity Timeline */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Son Aktiviteler</h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {analyticsData.recentActivity.map((activity, activityIdx) => (
              <li key={activity.date}>
                <div className="relative pb-8">
                  {activityIdx !== analyticsData.recentActivity.length - 1 ? (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                        activity.type === 'mr' ? 'bg-blue-500' :
                        activity.type === 'score' ? 'bg-green-500' :
                        activity.type === 'medication' ? 'bg-purple-500' : 'bg-indigo-500'
                      }`}>
                        {activity.type === 'mr' ? <Brain className="h-4 w-4 text-white" /> :
                         activity.type === 'score' ? <Activity className="h-4 w-4 text-white" /> :
                         activity.type === 'medication' ? <Pill className="h-4 w-4 text-white" /> : 
                         <FileText className="h-4 w-4 text-white" />}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-700">{activity.activity}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Clinical Scores Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Klinik Ölçek Gelişimi</h3>
        <ClinicalDataChart scores={patient.klinik_puanlar || []} />
      </div>
    </div>
  )
}

// Recommendations Component
function Recommendations({ patient }: { patient: Patient }) {
  const [recommendations, setRecommendations] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    generateRecommendations()
  }, [patient])

  const generateRecommendations = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      
      // Prepare patient history data for the clinical decision support system
      const patientHistory = {
        clinicalData: (patient.klinik_puanlar || []).map(score => ({
          date: new Date(score.degerlendirme_tarihi),
          scaleName: score.olcek_adi,
          score: score.puan,
          maxScore: score.max_puan
        })),
        treatments: (patient.ilac_tedavileri || []).map(treatment => ({
          medication: treatment.ilac_adi,
          dosage: treatment.dozaj,
          startDate: new Date(treatment.baslangic_tarihi),
          endDate: treatment.bitis_tarihi ? new Date(treatment.bitis_tarihi) : undefined
        })),
        mrImages: (patient.mr_goruntuleri || []).map(mr => ({
          date: new Date(mr.cekilis_tarihi),
          path: mr.orijinal_dosya_yolu,
          analysis: mr.islenmis_veri_yolu ? { processed: true } : undefined
        }))
      }

      // Define optimization parameters
      const parameters = {
        timeHorizon: 90, // 3 months
        objective: 'minimize_symptoms' as const,
        constraints: {
          maxMedicationChanges: 2,
          minTreatmentDuration: 30,
          maxDosage: 100
        }
      }

      // Call the clinical decision support system
      const result = clinicalDecisionSupport.analyzePatient(patientHistory, parameters)
      
      setRecommendations(result)
    } catch (err) {
      console.error('Error generating recommendations:', err)
      setError('Öneriler oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={generateRecommendations}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  if (!recommendations) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Öneriler oluşturuluyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Risk Assessment */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Risk Değerlendirmesi</h3>
          <button
            onClick={generateRecommendations}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Yenile
          </button>
        </div>
        <div className={`p-4 rounded-lg ${
          recommendations.riskAssessment.riskLevel === 'high' ? 'bg-red-50 border border-red-200' :
          recommendations.riskAssessment.riskLevel === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
          'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center">
            {recommendations.riskAssessment.riskLevel === 'high' ? (
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            ) : recommendations.riskAssessment.riskLevel === 'medium' ? (
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            )}
            <span className={`font-medium ${
              recommendations.riskAssessment.riskLevel === 'high' ? 'text-red-800' :
              recommendations.riskAssessment.riskLevel === 'medium' ? 'text-yellow-800' :
              'text-green-800'
            }`}>
              {recommendations.riskAssessment.riskLevel === 'high' ? 'Yüksek Risk' :
               recommendations.riskAssessment.riskLevel === 'medium' ? 'Orta Risk' : 'Düşük Risk'}
            </span>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Faktörleri:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {recommendations.riskAssessment.riskFactors.map((factor: string, idx: number) => (
                <li key={idx}>{factor}</li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Önerilen Müdahaleler:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {recommendations.riskAssessment.mitigationStrategies.map((strategy: string, idx: number) => (
                <li key={idx}>{strategy}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Treatment Suggestions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tedavi Önerileri</h3>
        <div className="space-y-3">
          {recommendations.treatmentSuggestions.map((suggestion: string, idx: number) => (
            <div key={idx} className="flex items-start p-3 bg-blue-50 rounded-lg">
              <Heart className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-gray-700">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* GAF Prediction */}
      {recommendations.gafPrediction && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tahmini GAF Skoru</h3>
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-48 h-48 rounded-full border-8 border-indigo-200 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl font-bold text-indigo-600">{recommendations.gafPrediction}</span>
                  <p className="text-sm text-gray-600 mt-1">Tahmini GAF</p>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                {recommendations.gafPrediction >= 70 ? 'İyi' : 
                 recommendations.gafPrediction >= 50 ? 'Orta' : 'Düşük'}
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              GAF (Global Assessment of Functioning) skoru, bireyin psikolojik, sosyal ve mesleki işlevselliğini değerlendiren bir ölçektir.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
