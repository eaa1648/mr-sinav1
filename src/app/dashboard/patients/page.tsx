'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, Calendar, Phone, MapPin, Activity, 
  Brain, FileText, Upload, Download, Plus, 
  Search, Edit, Trash2, Eye, TrendingUp
} from 'lucide-react'
import AddPatientModal from '@/components/AddPatientModal'
import ClinicalScalesForm from '@/components/ClinicalScalesForm'
import MRImageUpload from '@/components/MRImageUpload'
import ClinicalDataChart from '@/components/ClinicalDataChart'
import MedicationTimeline from '@/components/MedicationTimeline'
import MRComparison from '@/components/MRComparison'
import Sidebar from '@/components/Sidebar'

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

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    fetchPatients()
  }, [router])

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/patients?search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients)
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      }
    } catch (error) {
      console.error('Fetch patients error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePatientSelect = async (patient: Patient) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/patients/${patient.hasta_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedPatient(data.patient)
        setActiveTab('profile')
      }
    } catch (error) {
      console.error('Fetch patient details error:', error)
    }
  }

  const tabs = [
    { id: 'list', name: 'Hasta Listesi', icon: User },
    { id: 'profile', name: 'Hasta Profili', icon: User, disabled: !selectedPatient },
    { id: 'mr-images', name: 'MR Görüntüleri', icon: Brain, disabled: !selectedPatient },
    { id: 'mr-comparison', name: 'MR Karşılaştırma', icon: Brain, disabled: !selectedPatient },
    { id: 'clinical-scores', name: 'Klinik Ölçekler', icon: Activity, disabled: !selectedPatient },
    { id: 'medications', name: 'Tedavi Geçmişi', icon: TrendingUp, disabled: !selectedPatient },
    { id: 'reports', name: 'Raporlar', icon: FileText, disabled: !selectedPatient }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const handleGenerateReport = (mrId1: string, mrId2: string) => {
    // Navigate to report generation page with MR IDs
    router.push(`/dashboard/reports/new?mr1=${mrId1}&mr2=${mrId2}&patient=${selectedPatient?.hasta_id}`)
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
          <h1 className="text-3xl font-bold text-gray-900">Hasta Yönetimi</h1>
          <p className="mt-2 text-gray-600">Hasta kayıtları, MR görüntüleri ve klinik değerlendirmeler</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : tab.disabled
                      ? 'border-transparent text-gray-400 cursor-not-allowed'
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
        {activeTab === 'list' && (
          <>
            <PatientList 
              patients={patients} 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onPatientSelect={handlePatientSelect}
              onRefresh={fetchPatients}
              showAddModal={showAddModal}
              setShowAddModal={setShowAddModal}
            />
                    
            <AddPatientModal 
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onPatientAdded={() => {
                setShowAddModal(false)
                fetchPatients()
              }}
            />
          </>
        )}

        {activeTab === 'profile' && selectedPatient && (
          <PatientProfile patient={selectedPatient} />
        )}

        {activeTab === 'mr-images' && selectedPatient && (
          <div className="space-y-6">
            <MRImageUpload 
              patientId={selectedPatient.hasta_id} 
              onImageUploaded={() => handlePatientSelect(selectedPatient)}
            />
            <MRImages patient={selectedPatient} />
          </div>
        )}

        {activeTab === 'mr-comparison' && selectedPatient && (
          <MRComparison
            patientId={selectedPatient.hasta_id}
            mrImages={selectedPatient.mr_goruntuleri || []}
            onGenerateReport={handleGenerateReport}
          />
        )}

        {activeTab === 'clinical-scores' && selectedPatient && (
          <div className="space-y-6">
            <ClinicalScalesForm 
              patientId={selectedPatient.hasta_id}
              onScoreAdded={() => handlePatientSelect(selectedPatient)}
            />
            <ClinicalDataChart 
              scores={selectedPatient.klinik_puanlar || []}
            />
            <ClinicalScores patient={selectedPatient} />
          </div>
        )}

        {activeTab === 'medications' && selectedPatient && (
          <div className="space-y-6">
            <MedicationTimeline medications={selectedPatient.ilac_tedavileri || []} />
            <Medications patient={selectedPatient} />
          </div>
        )}

        {activeTab === 'reports' && selectedPatient && (
          <Reports patient={selectedPatient} />
        )}
      </div>
        </main>
      </div>
    </div>
  )
}

// Patient List Component
function PatientList({ 
  patients, 
  searchTerm, 
  setSearchTerm, 
  onPatientSelect, 
  onRefresh,
  showAddModal,
  setShowAddModal 
}: any) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Hasta Listesi</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Hasta
          </button>
        </div>
        
        <div className="mt-4">
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
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hasta Bilgileri
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İletişim
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Son Aktivite
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.map((patient: Patient) => (
              <tr key={patient.hasta_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {patient.ad} {patient.soyad}
                    </div>
                    <div className="text-sm text-gray-500">
                      T.C. {patient.tc_kimlik_no}
                    </div>
                    {patient.dogum_tarihi && (
                      <div className="text-sm text-gray-500">
                        {new Date(patient.dogum_tarihi).toLocaleDateString('tr-TR')}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.telefon && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {patient.telefon}
                    </div>
                  )}
                  {patient.adres && (
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {patient.adres.substring(0, 30)}...
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(patient.created_at).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onPatientSelect(patient)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900 mr-3">
                    <Edit className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
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
          <TrendingUp className="h-12 w-12 mx-auto mb-4" />
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