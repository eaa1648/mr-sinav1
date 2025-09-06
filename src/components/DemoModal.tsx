'use client'

import { useState } from 'react'
import { X, Play, Brain, Activity, FileText, Users, CheckCircle, ArrowRight } from 'lucide-react'

interface DemoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)

  const demoSteps = [
    {
      id: 1,
      title: 'Doktor Girişi ve Dashboard',
      description: 'Doktorlar güvenli giriş yaparak kişiselleştirilmiş dashboard\'a erişir',
      features: ['JWT tabanlı güvenli giriş', 'Hasta özet bilgileri', 'Hızlı işlem menüleri', 'Bildirim sistemi'],
      icon: Users
    },
    {
      id: 2,
      title: 'Hasta Yönetimi ve MR Yükleme',
      description: 'Hasta kayıtları oluşturma ve MR görüntülerini sisteme yükleme',
      features: ['Hasta profil yönetimi', '3D MR görüntü yükleme', 'Klinik ölçek girişi', 'Tedavi geçmişi takibi'],
      icon: Brain
    },
    {
      id: 3,
      title: 'AI Destekli Analiz',
      description: 'PyTorch tabanlı yapay zeka modelleri ile görüntü analizi',
      features: ['Beyin hacim analizi', 'Otomatik değişim tespiti', 'Risk değerlendirmesi', 'Prognoz tahminleri'],
      icon: Activity
    },
    {
      id: 4,
      title: 'Rapor Oluşturma',
      description: 'Kapsamlı raporlar oluşturma ve PDF export',
      features: ['AI yorumları', 'Doktor notları', 'GAF skorlaması', 'PDF rapor çıktısı'],
      icon: FileText
    }
  ]

  const currentStepData = demoSteps.find(step => step.id === currentStep)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Mr. Sina Demo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Demo Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {demoSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep === step.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {step.id}
                  </button>
                  {index < demoSteps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Current Step Content */}
          {currentStepData && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Side - Description */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <currentStepData.icon className="h-8 w-8 text-indigo-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    {currentStepData.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 text-lg">
                  {currentStepData.description}
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Özellikler:</h4>
                  <ul className="space-y-2">
                    {currentStepData.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Side - Demo Video/Screenshot */}
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
                  {isPlaying ? (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Activity className="h-16 w-16 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-lg font-semibold mb-2">Demo Oynatılıyor</h3>
                        <p className="text-sm opacity-90">{currentStepData.title}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <button
                        onClick={() => setIsPlaying(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full mb-4 transition-colors"
                      >
                        <Play className="h-8 w-8" />
                      </button>
                      <p className="text-gray-600">Demo videoyu izlemek için tıklayın</p>
                    </div>
                  )}
                </div>

                {/* Demo Features for current step */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-medium text-indigo-900 mb-2">
                    Bu Adımda Görülenler:
                  </h4>
                  <div className="text-sm text-indigo-700 space-y-1">
                    {currentStep === 1 && (
                      <>
                        <p>• Güvenli doktor giriş sistemi</p>
                        <p>• Kişiselleştirilmiş dashboard</p>
                        <p>• Hasta sayısı ve aktivite özetleri</p>
                      </>
                    )}
                    {currentStep === 2 && (
                      <>
                        <p>• Hasta profil oluşturma</p>
                        <p>• MR görüntü yükleme interface</p>
                        <p>• Klinik ölçek form girişi</p>
                      </>
                    )}
                    {currentStep === 3 && (
                      <>
                        <p>• MR görüntü karşılaştırma</p>
                        <p>• AI analiz sonuçları</p>
                        <p>• Beyin hacim değişim grafikleri</p>
                      </>
                    )}
                    {currentStep === 4 && (
                      <>
                        <p>• Kapsamlı rapor oluşturma</p>
                        <p>• Doktor yorumları ekleme</p>
                        <p>• PDF rapor export</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Önceki
            </button>
            
            <div className="text-sm text-gray-500">
              {currentStep} / {demoSteps.length}
            </div>
            
            <button
              onClick={() => setCurrentStep(Math.min(demoSteps.length, currentStep + 1))}
              disabled={currentStep === demoSteps.length}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sonraki
            </button>
          </div>

          {/* Call to Action */}
          <div className="mt-6 text-center bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sistemi Denemeye Hazır mısınız?
            </h3>
            <p className="text-gray-600 mb-4">
              Demo hesap bilgilerini kullanarak sisteme giriş yapabilirsiniz.
            </p>
            <button
              onClick={() => {
                onClose()
                window.location.href = '/login'
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Sisteme Giriş Yap
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}