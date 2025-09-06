'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Brain, Activity, FileText, Users, MapPin, Shield, Zap, BarChart3, Mail, Phone, MapPin as LocationIcon, Linkedin, Twitter, Youtube, Github } from 'lucide-react'
import InteractiveTurkeyMap from '@/components/InteractiveTurkeyMap'
import DemoModal from '@/components/DemoModal'

export default function Home() {
  const [showDemo, setShowDemo] = useState(false)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-indigo-600 mr-3" />
              <span className="text-2xl font-bold text-gray-900">Mr. Sina</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-500 hover:text-gray-900">Özellikler</a>
              <a href="#hospitals" className="text-gray-500 hover:text-gray-900">Hastaneler</a>
              <a href="#about" className="text-gray-500 hover:text-gray-900">Hakkımızda</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link 
                href="/register" 
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Doktor Kayıt
              </Link>
              <Link 
                href="/login" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Doktor Girişi
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Psikiyatrik Hastalıklarda 
            <span className="text-indigo-600">Yapay Zekâ Destekli</span>
            <br />Klinik İzlem ve Karar Destek Sistemi
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            MR görüntüleme teknolojisi ile desteklenen, yapay zeka tabanlı 
            psikiyatrik hasta takip ve prognoz değerlendirme platformu
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Sistemi Kullanmaya Başla
            </Link>
            <button 
              onClick={() => setShowDemo(true)}
              className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Demo İzle
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sistem Özellikleri</h2>
            <p className="text-lg text-gray-600">Modern teknoloji ile desteklenen kapsamlı klinik çözümler</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Yapay Zeka Destekli Prognoz</h3>
              <p className="text-gray-600">MR görüntüleri ve klinik verilerle desteklenen gelişmiş prognoz analizi</p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Longitudinal İzlem</h3>
              <p className="text-gray-600">Hastaların zaman içindeki değişimlerinin detaylı takibi ve analizi</p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Otomatik Raporlama</h3>
              <p className="text-gray-600">AI destekli kapsamlı raporlar ve klinik karar destek öneriler</p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Çok Modüllü Yapı</h3>
              <p className="text-gray-600">Bipolar, Şizofreni ve diğer psikiyatrik hastalıklar için özel modüller</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">500+</div>
              <div className="text-gray-600">Takip Edilen Hasta</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">15+</div>
              <div className="text-gray-600">İşbirlikçi Hastane</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">95%</div>
              <div className="text-gray-600">Doktor Memnuniyeti</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">24/7</div>
              <div className="text-gray-600">Sistem Erişimi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Map Section */}
      <section id="hospitals" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">İşbirliği Yaptığımız Hastaneler</h2>
            <p className="text-lg text-gray-600">Türkiye genelinde psikiyatri kliniklerinde kullanılmaktadır</p>
          </div>
          
          <InteractiveTurkeyMap />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hakkımızda</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Mr. Sina, psikiyatrik hastalıkların tanı ve tedavi süreçlerinde 
              yapay zeka teknolojilerini kullanarak doktorlara karar destek sağlayan 
              yenilikçi bir platformdur. MR görüntüleme teknolojisi ile desteklenen 
              sistemimiz, hastaların longitudinal takibini optimize eder.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Güvenli</h3>
              <p className="text-gray-600">KVKK ve GDPR uyumlu güvenli veri saklama</p>
            </div>
            <div className="text-center">
              <Zap className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Hızlı</h3>
              <p className="text-gray-600">Gerçek zamanlı analiz ve raporlama</p>
            </div>
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analitik</h3>
              <p className="text-gray-600">Detaylı istatistik ve trend analizi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center mb-4">
                <Brain className="h-8 w-8 text-indigo-400 mr-3" />
                <span className="text-2xl font-bold">Mr. Sina</span>
              </div>
              <p className="text-gray-400 mb-6">
                Psikiyatrik hastalıklarda yapay zeka destekli klinik izlem ve görüntüleme temelli karar destek sistemi
              </p>
              
              {/* Social Media Links */}
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-lg">Ürün</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Özellikler</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Güvenlik</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Dokümantasyonu</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sistem Gereksinimleri</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Güncellemeler</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-lg">Destek</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Yardım Merkezi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kullanım Kılavuzu</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Teknik Destek</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Eğitim Videoları</a></li>
                <li><a href="#" className="hover:text-white transition-colors">SSS</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-lg">İletişim</h3>
              <div className="space-y-4 text-gray-400">
                <div className="flex items-start">
                  <LocationIcon className="h-5 w-5 mt-1 mr-3 text-indigo-400" />
                  <div>
                    <p className="font-medium text-white">Adres</p>
                    <p className="text-sm">İTÜ Teknokent<br />Maslak, İstanbul 34485<br />Türkiye</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 mt-1 mr-3 text-indigo-400" />
                  <div>
                    <p className="font-medium text-white">Telefon</p>
                    <p className="text-sm">+90 (212) 285 00 00</p>
                    <p className="text-sm">+90 (212) 285 00 01 (Destek)</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mt-1 mr-3 text-indigo-400" />
                  <div>
                    <p className="font-medium text-white">E-posta</p>
                    <p className="text-sm">info@mrsina.com</p>
                    <p className="text-sm">destek@mrsina.com</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h4 className="font-medium text-white mb-2">Çalışma Saatleri</h4>
                  <p className="text-sm">Pazartesi - Cuma: 09:00 - 18:00</p>
                  <p className="text-sm">Cumartesi: 09:00 - 14:00</p>
                  <p className="text-sm text-yellow-400">7/24 Teknik Destek Mevcut</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Footer */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                <p className="text-gray-400 text-sm">
                  © 2025 Efe Ataakan. Tüm hakları saklıdır.
                </p>
                <div className="flex space-x-6 text-sm">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Gizlilik Politikası</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Kullanım Şartları</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">KVKK</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Çerez Politikası</a>
                </div>
              </div>
              
              <div className="flex items-center mt-4 md:mt-0">
                <p className="text-gray-400 text-sm mr-4">Sertifikalar:</p>
                <div className="flex space-x-3">
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">ISO 27001</span>
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">GDPR</span>
                  <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">HL7 FHIR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Demo Modal */}
      <DemoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
    </div>
  )
}
