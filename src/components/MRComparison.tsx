'use client'

import { useState, useEffect } from 'react'
import { Brain, Calendar, Zap, FileText, Download, ArrowRight, RotateCcw } from 'lucide-react'

interface MRImage {
  mr_id: string
  cekilis_tarihi: string
  orijinal_dosya_yolu: string
  islenmis_veri_yolu: string | null
  dosya_boyutu: number | null
  isleme_durumu: 'BEKLEMEDE' | 'ISLENIYOR' | 'TAMAMLANDI' | 'HATA'
}

interface MRComparisonProps {
  patientId: string
  mrImages: MRImage[]
  onGenerateReport: (mrId1: string, mrId2: string) => void
}

export default function MRComparison({ patientId, mrImages, onGenerateReport }: MRComparisonProps) {
  const [selectedMR1, setSelectedMR1] = useState<string>('')
  const [selectedMR2, setSelectedMR2] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Filter processed MR images
  const processedMRs = mrImages.filter(mr => mr.isleme_durumu === 'TAMAMLANDI')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Bilinmiyor'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TAMAMLANDI': return 'bg-green-100 text-green-800'
      case 'ISLENIYOR': return 'bg-yellow-100 text-yellow-800'
      case 'BEKLEMEDE': return 'bg-gray-100 text-gray-800'
      case 'HATA': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'TAMAMLANDI': return 'Tamamlandı'
      case 'ISLENIYOR': return 'İşleniyor'
      case 'BEKLEMEDE': return 'Beklemede'
      case 'HATA': return 'Hata'
      default: return 'Bilinmiyor'
    }
  }

  const handleAnalyze = async () => {
    if (!selectedMR1 || !selectedMR2) {
      setError('Lütfen iki MR görüntüsü seçin')
      return
    }
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      // Call the API endpoint for MR comparison
      const response = await fetch('/api/mr-images/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mrId1: selectedMR1,
          mrId2: selectedMR2
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Karşılaştırma hatası')
      }
      
      setAnalysisResult(result.comparisonResult)
      
      // Call the parent callback to generate report
      onGenerateReport(selectedMR1, selectedMR2)
    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err.message || 'Analiz sırasında bir hata oluştu')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetComparison = () => {
    setSelectedMR1('')
    setSelectedMR2('')
    setAnalysisResult(null)
    setError(null)
  }

  if (processedMRs.length < 2) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">MR Karşılaştırması İçin Yetersiz Veri</h3>
        <p className="text-gray-600">
          Karşılaştırma yapabilmek için en az 2 işlenmiş MR görüntüsü gereklidir.
          <br />
          Mevcut işlenmiş MR sayısı: {processedMRs.length}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">MR Karşılaştırma ve Analiz</h3>
            <p className="text-sm text-gray-600">
              Karşılaştırmak için iki MR görüntüsü seçin ve AI destekli analiz başlatın
            </p>
          </div>
          <button
            onClick={resetComparison}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Sıfırla
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {/* MR Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* First MR Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Birinci MR Görüntüsü
            </label>
            <div className="space-y-3">
              {processedMRs.map((mr) => (
                <div
                  key={mr.mr_id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedMR1 === mr.mr_id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMR1(mr.mr_id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatDate(mr.cekilis_tarihi)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatFileSize(mr.dosya_boyutu)}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(mr.isleme_durumu)}`}>
                      {getStatusText(mr.isleme_durumu)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Second MR Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              İkinci MR Görüntüsü
            </label>
            <div className="space-y-3">
              {processedMRs.map((mr) => (
                <div
                  key={mr.mr_id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedMR2 === mr.mr_id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    selectedMR1 === mr.mr_id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => selectedMR1 !== mr.mr_id && setSelectedMR2(mr.mr_id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatDate(mr.cekilis_tarihi)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatFileSize(mr.dosya_boyutu)}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(mr.isleme_durumu)}`}>
                      {getStatusText(mr.isleme_durumu)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !selectedMR1 || !selectedMR2}
            className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
              isAnalyzing || !selectedMR1 || !selectedMR2
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Zap className="h-5 w-5 mr-2 animate-pulse" />
                Analiz Ediliyor...
              </>
            ) : (
              <>
                <Brain className="h-5 w-5 mr-2" />
                AI Analizi Başlat
              </>
            )}
          </button>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Analiz Sonuçları</h4>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Volume Changes */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Hacim Değişimleri</h5>
                <div className="space-y-2">
                  {Object.entries(analysisResult.volumeChanges || {}).map(([region, changes]: [string, any]) => (
                    <div key={region} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{region}</span>
                      <div className="flex space-x-2">
                        {typeof changes === 'object' ? (
                          Object.entries(changes).map(([side, change]: [string, any]) => (
                            <span 
                              key={side} 
                              className={change < 0 ? 'text-red-600' : 'text-green-600'}
                            >
                              {side}: {change > 0 ? '+' : ''}{change}%
                            </span>
                          ))
                        ) : (
                          <span className={changes < 0 ? 'text-red-600' : 'text-green-600'}>
                            {changes > 0 ? '+' : ''}{changes}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* AI Interpretation */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Yapay Zeka Yorumu</h5>
                <p className="text-gray-700 text-sm">
                  {analysisResult.aiInterpretation}
                </p>
                
                {analysisResult.gafScore && (
                  <div className="mt-4 p-3 bg-white rounded-md border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">GAF Uyum Skoru:</span>
                      <span className="font-bold text-blue-600">%{analysisResult.gafScore}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Recommendation */}
              <div className="md:col-span-2 bg-green-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Klinik Öneri</h5>
                <p className="text-gray-700 text-sm">
                  {analysisResult.recommendation}
                </p>
                
                <div className="mt-3 flex items-center text-sm text-gray-600">
                  <Zap className="h-4 w-4 mr-1" />
                  <span>Güven Seviyesi: %{(analysisResult.confidence * 100).toFixed(0)}</span>
                </div>
              </div>
            </div>
            
            {/* Generate Report Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => onGenerateReport(selectedMR1, selectedMR2)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                Rapor Oluştur
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}