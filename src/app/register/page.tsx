'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Brain, User, Building, Phone, Mail, GraduationCap, Calendar, Shield } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    tc_kimlik_no: '',
    ad: '',
    soyad: '',
    uzmanlik_alani: '',
    hastane_id: '',
    hastane_adi: '',
    sifre: '',
    sifre_tekrar: '',
    telefon: '',
    email: '',
    diploma_no: '',
    mezuniyet_tarihi: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validate password match
    if (formData.sifre !== formData.sifre_tekrar) {
      setError('Şifreler eşleşmiyor')
      setIsLoading(false)
      return
    }

    // Validate required fields
    if (!formData.tc_kimlik_no || !formData.ad || !formData.soyad || 
        !formData.uzmanlik_alani || !formData.hastane_id || !formData.sifre) {
      setError('Lütfen tüm zorunlu alanları doldurun')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tc_kimlik_no: formData.tc_kimlik_no,
          ad: formData.ad,
          soyad: formData.soyad,
          uzmanlik_alani: formData.uzmanlik_alani,
          hastane_id: formData.hastane_id,
          hastane_adi: formData.hastane_adi,
          sifre: formData.sifre,
          telefon: formData.telefon,
          email: formData.email,
          diploma_no: formData.diploma_no,
          mezuniyet_tarihi: formData.mezuniyet_tarihi || null
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        // Reset form
        setFormData({
          tc_kimlik_no: '',
          ad: '',
          soyad: '',
          uzmanlik_alani: '',
          hastane_id: '',
          hastane_adi: '',
          sifre: '',
          sifre_tekrar: '',
          telefon: '',
          email: '',
          diploma_no: '',
          mezuniyet_tarihi: ''
        })
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.error || 'Kayıt sırasında bir hata oluştu')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Bağlantı hatası oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const uzmanlikAlanlari = [
    'Psikiyatri',
    'Çocuk ve Ergen Psikiyatrisi',
    'Nöroloji',
    'Psikoloji',
    'Hemşirelik',
    'Diğer'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center mb-6">
            <Brain className="h-12 w-12 text-indigo-600 mr-3" />
            <span className="text-3xl font-bold text-gray-900">Mr. Sina</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Doktor Kayıt
          </h2>
          <p className="text-gray-600">
            Sisteme erişim için başvuru yapın
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {success}
                <p className="text-sm mt-1">3 saniye içinde giriş sayfasına yönlendirileceksiniz...</p>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Kişisel Bilgiler
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tc_kimlik_no" className="block text-sm font-medium text-gray-900">
                    T.C. Kimlik Numarası *
                  </label>
                  <input
                    id="tc_kimlik_no"
                    name="tc_kimlik_no"
                    type="text"
                    value={formData.tc_kimlik_no}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                    placeholder="12345678901"
                    maxLength={11}
                  />
                </div>

                <div>
                  <label htmlFor="telefon" className="block text-sm font-medium text-gray-900">
                    Telefon
                  </label>
                  <input
                    id="telefon"
                    name="telefon"
                    type="tel"
                    value={formData.telefon}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>

                <div>
                  <label htmlFor="ad" className="block text-sm font-medium text-gray-900">
                    Ad *
                  </label>
                  <input
                    id="ad"
                    name="ad"
                    type="text"
                    value={formData.ad}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                    placeholder="Adınız"
                  />
                </div>

                <div>
                  <label htmlFor="soyad" className="block text-sm font-medium text-gray-900">
                    Soyad *
                  </label>
                  <input
                    id="soyad"
                    name="soyad"
                    type="text"
                    value={formData.soyad}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                    placeholder="Soyadınız"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                    E-posta
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                    placeholder="ornek@hastane.com"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Mesleki Bilgiler
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="uzmanlik_alani" className="block text-sm font-medium text-gray-900">
                    Uzmanlık Alanı *
                  </label>
                  <select
                    id="uzmanlik_alani"
                    name="uzmanlik_alani"
                    value={formData.uzmanlik_alani}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  >
                    <option value="">Uzmanlık alanı seçin</option>
                    {uzmanlikAlanlari.map((alan) => (
                      <option key={alan} value={alan}>
                        {alan}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="diploma_no" className="block text-sm font-medium text-gray-900">
                    Diplomanın Numarası
                  </label>
                  <input
                    id="diploma_no"
                    name="diploma_no"
                    type="text"
                    value={formData.diploma_no}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                    placeholder="Diploma numarası"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="mezuniyet_tarihi" className="block text-sm font-medium text-gray-900">
                    Mezuniyet Tarihi
                  </label>
                  <input
                    id="mezuniyet_tarihi"
                    name="mezuniyet_tarihi"
                    type="date"
                    value={formData.mezuniyet_tarihi}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Hospital Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Hastane Bilgileri
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hastane_id" className="block text-sm font-medium text-gray-900">
                    Hastane ID *
                  </label>
                  <input
                    id="hastane_id"
                    name="hastane_id"
                    type="text"
                    value={formData.hastane_id}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                    placeholder="HST001"
                  />
                </div>

                <div>
                  <label htmlFor="hastane_adi" className="block text-sm font-medium text-gray-900">
                    Hastane Adı
                  </label>
                  <input
                    id="hastane_adi"
                    name="hastane_adi"
                    type="text"
                    value={formData.hastane_adi}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                    placeholder="Ankara Üniversitesi Tıp Fakültesi"
                  />
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Güvenlik Bilgileri
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sifre" className="block text-sm font-medium text-gray-900">
                    Şifre *
                  </label>
                  <input
                    id="sifre"
                    name="sifre"
                    type="password"
                    value={formData.sifre}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                    placeholder="En az 6 karakter"
                  />
                </div>

                <div>
                  <label htmlFor="sifre_tekrar" className="block text-sm font-medium text-gray-900">
                    Şifre Tekrar *
                  </label>
                  <input
                    id="sifre_tekrar"
                    name="sifre_tekrar"
                    type="password"
                    value={formData.sifre_tekrar}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                    placeholder="Şifreyi tekrar girin"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Başvuru gönderiliyor...
                  </div>
                ) : (
                  'Kayıt Başvurusu Gönder'
                )}
              </button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Zaten hesabınız var mı?{' '}
                <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                  Giriş yapın
                </Link>
              </p>
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                ← Ana sayfaya dön
              </Link>
            </div>
          </form>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Önemli Bilgiler:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Başvurunuz sistem yöneticisi tarafından incelenecektir</li>
            <li>• Onay süreci 1-3 iş günü sürebilir</li>
            <li>• Başvuru durumunuz e-posta ile bildirilecektir</li>
            <li>• Geçerli mesleki bilgiler ve hastane ID'si gereklidir</li>
          </ul>
        </div>
      </div>
    </div>
  )
}