'use client'

import { useState } from 'react'
import { 
  Brain, 
  BarChart3, 
  Activity, 
  FileText, 
  Download, 
  ChevronDown, 
  ChevronRight,
  Eye
} from 'lucide-react'

interface FreeSurferResultsProps {
  analysisData: any
  onClose: () => void
}

export default function FreeSurferResults({ analysisData, onClose }: FreeSurferResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    cortical: true,
    subcortical: true,
    volumes: true,
    thickness: true
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Mock data for demonstration
  const mockCorticalData = [
    { region: 'Frontal Pole', volume: 12.45, thickness: 2.34, change: -1.2 },
    { region: 'Precentral Gyrus', volume: 28.67, thickness: 2.67, change: -0.8 },
    { region: 'Postcentral Gyrus', volume: 25.34, thickness: 2.45, change: -1.5 },
    { region: 'Superior Temporal Gyrus', volume: 18.23, thickness: 2.21, change: -2.1 },
    { region: 'Middle Temporal Gyrus', volume: 15.67, thickness: 2.09, change: -1.8 },
  ]

  const mockSubcorticalData = [
    { structure: 'Hippocampus (Left)', volume: 3.45, change: -3.2 },
    { structure: 'Hippocampus (Right)', volume: 3.52, change: -2.8 },
    { structure: 'Amygdala (Left)', volume: 1.67, change: -1.5 },
    { structure: 'Amygdala (Right)', volume: 1.72, change: -1.2 },
    { structure: 'Caudate (Left)', volume: 3.21, change: 0.3 },
    { structure: 'Caudate (Right)', volume: 3.28, change: 0.5 },
  ]

  const mockVolumeData = [
    { region: 'Total Brain Volume', volume: 1230.5, unit: 'cm³' },
    { region: 'Gray Matter', volume: 780.2, unit: 'cm³' },
    { region: 'White Matter', volume: 450.3, unit: 'cm³' },
    { region: 'CSF', volume: 120.8, unit: 'cm³' },
    { region: 'Cortical Gray Matter', volume: 620.4, unit: 'cm³' },
    { region: 'Subcortical Gray Matter', volume: 159.8, unit: 'cm³' },
  ]

  const mockThicknessData = [
    { region: 'Mean Cortical Thickness', value: 2.45, unit: 'mm' },
    { region: 'Standard Deviation', value: 0.32, unit: 'mm' },
    { region: 'Minimum Thickness', value: 1.2, unit: 'mm' },
    { region: 'Maximum Thickness', value: 4.1, unit: 'mm' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <Brain className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">FreeSurfer Detaylı Analiz Sonuçları</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="text-sm text-indigo-800">İşlem Süresi</div>
              <div className="text-xl font-bold text-indigo-900">45 dk</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-800">Analiz Edilen Yapı</div>
              <div className="text-xl font-bold text-green-900">133</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-800">Güven Skoru</div>
              <div className="text-xl font-bold text-blue-900">%92</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-800">Kontrast Kalitesi</div>
              <div className="text-xl font-bold text-purple-900">İyi</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Cortical Analysis */}
          <div className="mb-6">
            <div 
              className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg"
              onClick={() => toggleSection('cortical')}
            >
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Kortikal Bölge Analizi</h3>
              </div>
              {expandedSections.cortical ? 
                <ChevronDown className="h-5 w-5 text-gray-500" /> : 
                <ChevronRight className="h-5 w-5 text-gray-500" />
              }
            </div>
            
            {expandedSections.cortical && (
              <div className="mt-3 bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bölge</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hacim (cm³)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kalınlık (mm)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Değişim (%)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockCorticalData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.region}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.volume}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.thickness}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={item.change < 0 ? 'text-red-600' : 'text-green-600'}>
                            {item.change > 0 ? '+' : ''}{item.change}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Subcortical Analysis */}
          <div className="mb-6">
            <div 
              className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg"
              onClick={() => toggleSection('subcortical')}
            >
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Subkortikal Yapı Analizi</h3>
              </div>
              {expandedSections.subcortical ? 
                <ChevronDown className="h-5 w-5 text-gray-500" /> : 
                <ChevronRight className="h-5 w-5 text-gray-500" />
              }
            </div>
            
            {expandedSections.subcortical && (
              <div className="mt-3 bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yapı</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hacim (cm³)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Değişim (%)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockSubcorticalData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.structure}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.volume}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={item.change < 0 ? 'text-red-600' : 'text-green-600'}>
                            {item.change > 0 ? '+' : ''}{item.change}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Volume Analysis */}
          <div className="mb-6">
            <div 
              className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg"
              onClick={() => toggleSection('volumes')}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Genel Hacim Analizi</h3>
              </div>
              {expandedSections.volumes ? 
                <ChevronDown className="h-5 w-5 text-gray-500" /> : 
                <ChevronRight className="h-5 w-5 text-gray-500" />
              }
            </div>
            
            {expandedSections.volumes && (
              <div className="mt-3 bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bölge</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hacim</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockVolumeData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.region}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.volume} {item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Thickness Analysis */}
          <div className="mb-6">
            <div 
              className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg"
              onClick={() => toggleSection('thickness')}
            >
              <div className="flex items-center">
                <Eye className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Kortikal Kalınlık Analizi</h3>
              </div>
              {expandedSections.thickness ? 
                <ChevronDown className="h-5 w-5 text-gray-500" /> : 
                <ChevronRight className="h-5 w-5 text-gray-500" />
              }
            </div>
            
            {expandedSections.thickness && (
              <div className="mt-3 bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ölçüm</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Değer</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockThicknessData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.region}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.value} {item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Kapat
          </button>
          <button
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF Olarak İndir
          </button>
        </div>
      </div>
    </div>
  )
}