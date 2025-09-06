'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useState } from 'react'
import { TrendingUp, BarChart3 } from 'lucide-react'

interface ClinicalScore {
  sonuc_id: string
  olcek_adi: string
  puan: number
  max_puan: number | null
  degerlendirme_tarihi: string
  giren_kullanici: {
    ad: string
    soyad: string
  }
}

interface ClinicalDataChartProps {
  scores: ClinicalScore[]
  selectedScale?: string
}

export default function ClinicalDataChart({ scores, selectedScale }: ClinicalDataChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  
  // Group scores by scale
  const scaleGroups = scores.reduce((groups, score) => {
    const scale = score.olcek_adi
    if (!groups[scale]) {
      groups[scale] = []
    }
    groups[scale].push(score)
    return groups
  }, {} as Record<string, ClinicalScore[]>)

  // Prepare data for the selected scale or all scales
  const prepareChartData = () => {
    if (selectedScale && scaleGroups[selectedScale]) {
      return scaleGroups[selectedScale]
        .sort((a, b) => new Date(a.degerlendirme_tarihi).getTime() - new Date(b.degerlendirme_tarihi).getTime())
        .map((score, index) => ({
          date: new Date(score.degerlendirme_tarihi).toLocaleDateString('tr-TR'),
          score: score.puan,
          maxScore: score.max_puan || 100,
          percentage: score.max_puan ? Math.round((score.puan / score.max_puan) * 100) : score.puan,
          evaluator: `${score.giren_kullanici.ad} ${score.giren_kullanici.soyad}`,
          index: index + 1
        }))
    }

    // If no specific scale selected, show comparison of latest scores for each scale
    return Object.entries(scaleGroups).map(([scaleName, scaleScores]) => {
      const latestScore = scaleScores.sort((a, b) => 
        new Date(b.degerlendirme_tarihi).getTime() - new Date(a.degerlendirme_tarihi).getTime()
      )[0]
      
      return {
        scale: scaleName,
        score: latestScore.puan,
        maxScore: latestScore.max_puan || 100,
        percentage: latestScore.max_puan ? Math.round((latestScore.puan / latestScore.max_puan) * 100) : latestScore.puan,
        date: new Date(latestScore.degerlendirme_tarihi).toLocaleDateString('tr-TR'),
        count: scaleScores.length
      }
    })
  }

  const chartData = prepareChartData()

  if (scores.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Klinik Veri Bulunamadı</h3>
        <p className="text-gray-600">Görselleştirmek için klinik ölçek puanları gereklidir.</p>
      </div>
    )
  }

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={selectedScale ? "date" : "scale"} 
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis />
        <Tooltip 
          formatter={(value: any, name: string) => [
            typeof value === 'number' ? value.toFixed(1) : value,
            name === 'score' ? 'Puan' : 
            name === 'percentage' ? 'Yüzde (%)' : name
          ]}
          labelFormatter={(label) => selectedScale ? `Tarih: ${label}` : `Ölçek: ${label}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="score" 
          stroke="#3B82F6" 
          strokeWidth={3}
          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
          name="Puan"
        />
        {selectedScale && (
          <Line 
            type="monotone" 
            dataKey="percentage" 
            stroke="#10B981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            name="Yüzde (%)"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={selectedScale ? "date" : "scale"} 
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis />
        <Tooltip 
          formatter={(value: any, name: string) => [
            typeof value === 'number' ? value.toFixed(1) : value,
            name === 'score' ? 'Puan' : 
            name === 'percentage' ? 'Yüzde (%)' : name
          ]}
        />
        <Legend />
        <Bar dataKey="score" fill="#3B82F6" name="Puan" />
        {selectedScale && (
          <Bar dataKey="percentage" fill="#10B981" name="Yüzde (%)" />
        )}
      </BarChart>
    </ResponsiveContainer>
  )

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {selectedScale ? `${selectedScale} Ölçek Trendi` : 'Klinik Ölçek Karşılaştırması'}
            </h3>
            <p className="text-sm text-gray-600">
              {selectedScale 
                ? `Zaman içindeki ${selectedScale} puanları` 
                : 'Tüm ölçeklerin en son puanları'
              }
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-md ${
                chartType === 'line' 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Çizgi Grafik"
            >
              <TrendingUp className="h-5 w-5" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-md ${
                chartType === 'bar' 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Sütun Grafik"
            >
              <BarChart3 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {chartType === 'line' ? renderLineChart() : renderBarChart()}
        
        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {selectedScale ? chartData.length : Object.keys(scaleGroups).length}
            </div>
            <div className="text-sm text-gray-600">
              {selectedScale ? 'Toplam Ölçüm' : 'Ölçek Türü'}
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {chartData.length > 0 
                ? Math.max(...chartData.map(d => d.score)).toFixed(1)
                : '0'
              }
            </div>
            <div className="text-sm text-gray-600">En Yüksek Puan</div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {chartData.length > 0 
                ? Math.min(...chartData.map(d => d.score)).toFixed(1)
                : '0'
              }
            </div>
            <div className="text-sm text-gray-600">En Düşük Puan</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {chartData.length > 0 
                ? (chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length).toFixed(1)
                : '0'
              }
            </div>
            <div className="text-sm text-gray-600">Ortalama Puan</div>
          </div>
        </div>
        
        {selectedScale && chartData.length > 1 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Trend Analizi</h4>
            <div className="flex items-center space-x-6">
              {(() => {
                const firstScore = chartData[0]?.score || 0
                const lastScore = chartData[chartData.length - 1]?.score || 0
                const trend = lastScore - firstScore
                const trendPercentage = firstScore !== 0 ? ((trend / firstScore) * 100) : 0
                
                return (
                  <>
                    <div className="flex items-center">
                      <TrendingUp className={`h-4 w-4 mr-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend >= 0 ? '+' : ''}{trend.toFixed(1)} puan
                      </span>
                    </div>
                    <div className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({trendPercentage >= 0 ? '+' : ''}{trendPercentage.toFixed(1)}% değişim)
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}