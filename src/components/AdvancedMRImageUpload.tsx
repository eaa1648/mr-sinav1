'use client'

import { useState, useRef } from 'react'
import { Upload, Calendar, File, AlertCircle, CheckCircle, X, Brain, Settings } from 'lucide-react'
import { startBackgroundProcessing, isServiceAvailable, segmentBrainMR } from '@/lib/pythonService'

interface AdvancedMRImageUploadProps {
  patientId: string
  onImageUploaded: () => void
}

export default function AdvancedMRImageUpload({ patientId, onImageUploaded }: AdvancedMRImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [processingMode, setProcessingMode] = useState<'basic' | 'advanced'>('basic')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/tiff',
    'application/dicom',
    '.dcm',
    '.nii',
    '.nii.gz'
  ]

  const advancedAllowedTypes = [
    '.nii',
    '.nii.gz'
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type based on processing mode
    const isValidType = (processingMode === 'basic' ? allowedTypes : advancedAllowedTypes).some(type => 
      file.type === type || file.name.toLowerCase().endsWith(type)
    )

    if (!isValidType) {
      const errorMsg = processingMode === 'basic' 
        ? 'Geçersiz dosya türü. JPEG, PNG, TIFF, NIfTI (.nii) veya DICOM (.dcm) dosyaları desteklenmektedir.'
        : 'Gelişmiş işlem için sadece NIfTI (.nii, .nii.gz) dosyaları desteklenmektedir.';
      setError(errorMsg)
      return
    }

    // Check file size (max 200MB for advanced processing)
    const maxSize = processingMode === 'basic' ? 100 * 1024 * 1024 : 200 * 1024 * 1024
    if (file.size > maxSize) {
      setError(`Dosya boyutu ${maxSize / (1024 * 1024)}MB'dan büyük olamaz.`)
      return
    }

    setSelectedFile(file)
    setError('')
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Lütfen bir dosya seçiniz.')
      return
    }

    setIsUploading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('cekilis_tarihi', uploadDate)

      const token = localStorage.getItem('token')
      const response = await fetch(`/api/patients/${patientId}/mr-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        const mrId = data.mrImage.mr_id
        setSuccess('MR görüntüsü yüklendi, AI analizi başlatılıyor...')
        
        // Check if Python service is available and start AI processing
        try {
          const isServiceAvailableResult = await isServiceAvailable()
          
          if (isServiceAvailableResult) {
            if (processingMode === 'basic') {
              // Use basic processing
              const processingResult = await startBackgroundProcessing(
                mrId,
                data.mrImage.orijinal_dosya_yolu
              )
              
              if (processingResult.success) {
                setSuccess('MR görüntüsü yüklendi ve PyTorch tabanlı AI analizi başlatıldı!')
              } else {
                setSuccess('MR görüntüsü yüklendi ancak AI analizi başlatılamadı. Manuel işlem yapılacak.')
              }
            } else {
              // Use advanced Hugging Face brain segmentation
              const formData = new FormData()
              formData.append('file', selectedFile)
              
              const segmentationResult = await segmentBrainMR(formData, mrId)
              
              if (segmentationResult.status === 'TAMAMLANDI') {
                setSuccess('MR görüntüsü yüklendi ve detaylı beyin segmentasyonu tamamlandı! 133 farklı beyin yapısı analiz edildi.')
              } else if (segmentationResult.status === 'HATA') {
                setError(`Segmentasyon hatası: ${segmentationResult.error_message || 'Bilinmeyen hata'}. Öneriler: ${segmentationResult.recommendations?.join(', ') || 'Tekrar deneyin'}`)
              } else {
                setSuccess('MR görüntüsü yüklendi ancak detaylı segmentasyon sırasında hata oluştu.')
              }
            }
          } else {
            setSuccess('MR görüntüsü yüklendi. AI servisi şu anda kullanılamıyor.')
          }
        } catch (aiError: any) {
          // AI processing could not be started
          setError(`AI işleme hatası: ${aiError.message || 'Bilinmeyen hata'}`)
        }
        
        setSelectedFile(null)
        setUploadDate(new Date().toISOString().split('T')[0])
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        onImageUploaded()
      } else {
        setError(data.error || 'Dosya yüklenirken hata oluştu')
      }
    } catch (error: any) {
      setError(`Bağlantı hatası: ${error.message || 'Lütfen tekrar deneyin.'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setError('')
    setSuccess('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">MR Görüntüsü Yükle</h3>
        <div className="flex items-center space-x-2">
          <Upload className="h-5 w-5 text-indigo-600" />
          <Settings 
            className={`h-5 w-5 cursor-pointer ${processingMode === 'advanced' ? 'text-purple-600' : 'text-gray-400'}`} 
            onClick={() => setProcessingMode(processingMode === 'basic' ? 'advanced' : 'basic')}
          />
        </div>
      </div>

      {/* Processing Mode Toggle */}
      <div className="mb-4 bg-gray-50 rounded-md p-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-900">
              {processingMode === 'basic' ? 'Temel İşleme' : 'Gelişmiş Beyin Segmentasyonu'}
            </span>
            <p className="text-xs text-gray-500">
              {processingMode === 'basic' 
                ? 'PyTorch ResNet modeli ile temel analiz' 
                : 'Hugging Face UNesT modeli ile detaylı 133 yapı segmentasyonu'}
            </p>
          </div>
          <button
            onClick={() => setProcessingMode(processingMode === 'basic' ? 'advanced' : 'basic')}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600"
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              processingMode === 'advanced' ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" />
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            MR Görüntü Dosyası *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Dosya seçin</span>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept={processingMode === 'basic' 
                      ? ".jpg,.jpeg,.png,.tiff,.dcm,.nii,.nii.gz,application/dicom" 
                      : ".nii,.nii.gz"}
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="pl-1">veya sürükleyip bırakın</p>
              </div>
              <p className="text-xs text-gray-500">
                {processingMode === 'basic'
                  ? 'JPEG, PNG, TIFF, NIfTI (.nii), DICOM (.dcm) formatları desteklenmektedir (Max: 100MB)'
                  : 'Sadece NIfTI (.nii, .nii.gz) formatı desteklenmektedir (Max: 200MB)'}
              </p>
            </div>
          </div>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <File className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type || 'DICOM/NIfTI'}
                  </p>
                </div>
              </div>
              <button
                onClick={clearSelection}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Upload Date */}
        <div>
          <label htmlFor="upload-date" className="block text-sm font-medium text-gray-900 mb-2">
            MR Çekim Tarihi *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="date"
              id="upload-date"
              value={uploadDate}
              onChange={(e) => setUploadDate(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-50igo-500 text-gray-900"
              required
            />
          </div>
        </div>

        {/* Upload Button */}
        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Yükleniyor...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                MR Görüntüsünü Yükle
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            {processingMode === 'basic' 
              ? 'Temel İşleme Özellikleri:' 
              : 'Gelişmiş Beyin Segmentasyonu Özellikleri:'}
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {processingMode === 'basic' ? (
              <>
                <li>• <strong>DICOM (.dcm)</strong> - Tıbbi görüntüleme standart formatı</li>
                <li>• <strong>NIfTI (.nii, .nii.gz)</strong> - Nörogörüntüleme formatı</li>
                <li>• <strong>TIFF</strong> - Yüksek kaliteli görüntüler için</li>
                <li>• <strong>JPEG/PNG</strong> - Genel görüntü formatları</li>
                <li>• <strong>PyTorch ResNet</strong> - Beyin hacim değişiklik analizi</li>
              </>
            ) : (
              <>
                <li>• <strong>Hugging Face UNesT</strong> - 133 beyin yapısı segmentasyonu</li>
                <li>• <strong>MNI305 uzayına kayıtlı</strong> - Standart anatomik uzay</li>
                <li>• <strong>NIfTI (.nii, .nii.gz)</strong> - Gelişmiş nörogörüntüleme formatı</li>
                <li>• <strong>Hacim analizi</strong> - Her yapı için detaylı hacim ölçümü</li>
                <li>• <strong>Klinik yorum</strong> - Otomatik klinik değerlendirme</li>
              </>
            )}
          </ul>
          <div className="mt-3 flex items-center text-xs text-blue-600">
            <Brain className="h-4 w-4 mr-2" />
            <span>
              {processingMode === 'basic'
                ? 'PyTorch tabanlı ResNet modeli ile otomatik AI analizi yapılacaktır'
                : 'Hugging Face UNesT modeli ile detaylı beyin segmentasyonu yapılacaktır'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}