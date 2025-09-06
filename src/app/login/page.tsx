'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, Eye, EyeOff, Lock, User, Building } from 'lucide-react'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    tc_kimlik_no: '',
    hastane_id: '',
    sifre: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/dashboard')
      } else {
        setError(data.error || 'Giriş başarısız')
      }
    } catch (error) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center mb-6">
            <Brain className="h-12 w-12 text-indigo-600 mr-3" />
            <span className="text-3xl font-bold text-gray-900">Mr. Sina</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Doktor Girişi
          </h2>
          <p className="text-gray-600">
            Klinik panel erişimi için giriş yapın
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="tc_kimlik_no" className="block text-sm font-medium text-gray-900 mb-2">
                T.C. Kimlik Numarası
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="tc_kimlik_no"
                  name="tc_kimlik_no"
                  type="text"
                  required
                  maxLength={11}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                  placeholder="T.C. Kimlik Numaranız"
                  value={formData.tc_kimlik_no}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="hastane_id" className="block text-sm font-medium text-gray-900 mb-2">
                Hastane ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="hastane_id"
                  name="hastane_id"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                  placeholder="Hastane Kimliğiniz"
                  value={formData.hastane_id}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="sifre" className="block text-sm font-medium text-gray-900 mb-2">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="sifre"
                  name="sifre"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-10 pr-10 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                  placeholder="Şifreniz"
                  value={formData.sifre}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Giriş yapılıyor...
                  </div>
                ) : (
                  'Giriş Yap'
                )}
              </button>
            </div>

            <div className="text-center space-y-2">
              <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
                Şifremi unuttum
              </Link>
              <p className="text-sm text-gray-600">
                Hesabınız yok mu?{' '}
                <Link href="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
                  Kayıt olun
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Ana sayfaya dön
          </Link>
        </div>
      </div>
    </div>
  )
}