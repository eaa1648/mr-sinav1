'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [tcKimlik, setTcKimlik] = useState('')
  const [hastaneId, setHastaneId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tc_kimlik_no: tcKimlik,
          hastane_id: hastaneId,
          email: email || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setMessage(data.message || 'Şifre sıfırlama talimatları sistem yöneticisine iletildi.')
      } else {
        setError(data.error || 'İşlem başarısız')
      }
    } catch (error) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
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
            Şifre Sıfırlama
          </h2>
          <p className="text-gray-600">
            Şifrenizi sıfırlamak için bilgilerinizi girin
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <h3 className="text-lg font-medium text-gray-900">İstek Gönderildi</h3>
              <p className="text-gray-600">{message}</p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Giriş Sayfasına Dön
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
                <p className="text-sm">
                  Şifre sıfırlama isteği sistem yöneticisine iletilecek ve 
                  en kısa sürede size yeni şifre bilgisi verilecektir.
                </p>
              </div>

              <div>
                <label htmlFor="tc_kimlik" className="block text-sm font-medium text-gray-900 mb-2">
                  T.C. Kimlik Numarası *
                </label>
                <input
                  id="tc_kimlik"
                  name="tc_kimlik"
                  type="text"
                  required
                  maxLength={11}
                  className="block w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                  placeholder="12345678901"
                  value={tcKimlik}
                  onChange={(e) => setTcKimlik(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="hastane_id" className="block text-sm font-medium text-gray-900 mb-2">
                  Hastane ID *
                </label>
                <input
                  id="hastane_id"
                  name="hastane_id"
                  type="text"
                  required
                  className="block w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                  placeholder="HST001"
                  value={hastaneId}
                  onChange={(e) => setHastaneId(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  E-posta Adresi (Opsiyonel)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-600"
                    placeholder="doktor@hastane.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  E-posta adresiniz kayıtlı ise bilgilendirme gönderilecektir.
                </p>
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
                      Gönderiliyor...
                    </div>
                  ) : (
                    'Şifre Sıfırlama İsteği Gönder'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link href="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  )
}