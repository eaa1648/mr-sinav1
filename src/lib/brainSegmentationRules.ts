/**
 * Brain Segmentation Processing Rules
 * 
 * This file defines the rules and guidelines for processing MR images
 * using the Hugging Face brain segmentation model according to the 
 * project specification in mrv1ozet.txt
 */

// Processing rules based on the project specification
export const BRAIN_SEGMENTATION_RULES = {
  // Input requirements
  INPUT_REQUIREMENTS: {
    FILE_FORMATS: ['.nii', '.nii.gz'],
    MAX_FILE_SIZE_MB: 200,
    REQUIRED_SPACE: 'MNI305',
    ANATOMICAL_ORIENTATION: 'Standard MNI space',
    IMAGE_MODALITY: 'T1-weighted MRI'
  },

  // Preprocessing rules
  PREPROCESSING_RULES: {
    REGISTRATION_REQUIRED: true,
    REGISTRATION_TARGET: 'MNI305 template',
    NORMALIZATION_REQUIRED: true,
    INTENSITY_NORMALIZATION: 'Zero-mean, unit variance per channel',
    DIMENSION_REQUIREMENTS: {
      MIN_SIZE: [96, 96, 96],
      PREFERRED_SIZE: [96, 96, 96]
    }
  },

  // Model processing rules
  MODEL_RULES: {
    MODEL_NAME: 'wholeBrainSeg_Large_UNEST_segmentation',
    MODEL_SOURCE: 'Hugging Face (monai-test)',
    INPUT_CHANNELS: 1,
    OUTPUT_CLASSES: 133,
    PROCESSING_DEVICE: 'GPU preferred, CPU fallback',
    INFERENCE_WINDOW_SIZE: [96, 96, 96],
    OVERLAP_RATIO: 0.7
  },

  // Output processing rules
  OUTPUT_RULES: {
    STRUCTURE_COUNT: 133,
    VOLUME_CALCULATION: 'Voxel counting with approximate mm³ conversion',
    CLINICAL_INTERPRETATION: true,
    VISUALIZATION_GENERATION: true,
    REPORT_FORMAT: 'JSON with clinical interpretation',
    CONFIDENCE_SCORING: true
  },

  // Quality control rules
  QUALITY_RULES: {
    MIN_CONFIDENCE_THRESHOLD: 0.8,
    ARTIFACT_DETECTION: true,
    NOISE_LEVEL_THRESHOLD: 'Moderate',
    IMAGE_QUALITY_METRICS: [
      'Contrast',
      'Sharpness', 
      'Artifacts',
      'Registration quality'
    ]
  },

  // Clinical interpretation rules
  CLINICAL_RULES: {
    SIGNIFICANT_CHANGE_THRESHOLD: 2.0, // Percent change
    CRITICAL_CHANGE_THRESHOLD: 5.0,    // Percent change
    STRUCTURE_CATEGORIES: {
      VENTRICLES: [1, 2, 18, 19, 20, 21],
      HIPPOCAMPUS: [16, 17],
      AMYGDALA: [5, 6],
      BASAL_GANGLIA: [8, 9, 22, 23, 24, 25],
      THALAMUS: [26, 27],
      CEREBELLUM: [10, 11, 12, 13],
      WHITE_MATTER: [14, 15],
      BRAIN_STEM: [7]
    },
    RISK_CATEGORIES: {
      LOW: { max_score: 20, description: 'Düşük Risk' },
      MODERATE: { max_score: 50, description: 'Orta Risk' },
      HIGH: { max_score: 80, description: 'Yüksek Risk' },
      CRITICAL: { max_score: 100, description: 'Kritik Risk' }
    }
  },

  // Comparison rules
  COMPARISON_RULES: {
    BASELINE_REQUIRED: true,
    TIME_POINT_MINIMUM: 2,
    STRUCTURE_ALIGNMENT: 'MNI space registration',
    CHANGE_DETECTION_THRESHOLD: 1.0, // Percent change
    PROGRESSION_ANALYSIS: true,
    TREATMENT_RESPONSE_EVALUATION: true
  },

  // Reporting rules
  REPORTING_RULES: {
    STRUCTURE_VOLUME_REPORT: true,
    CHANGE_ANALYSIS: true,
    CLINICAL_INTERPRETATION: true,
    VISUALIZATION_REFERENCES: true,
    RECOMMENDATIONS: true,
    RISK_SCORE: true
  }
};

// Brain structure categories for clinical interpretation
export const BRAIN_STRUCTURE_CATEGORIES = {
  'VENTRICLES': {
    ids: [1, 2, 18, 19, 20, 21],
    names: ['3rd-Ventricle', '4th-Ventricle', 'Right-Inf-Lat-Vent', 'Left-Inf-Lat-Vent', 'Right-Lateral-Ventricle', 'Left-Lateral-Ventricle'],
    clinical_significance: 'Beyin ventrikülleri genişlemesi nörodejeneratif hastalıklar, hidrosefali ve yaşla ilişkili atrofi göstergesi olabilir.'
  },
  'HIPPOCAMPUS': {
    ids: [16, 17],
    names: ['Right-Hippocampus', 'Left-Hippocampus'],
    clinical_significance: 'Hipokampus hacmindeki azalma Alzheimer hastalığı ve diğer nörodejeneratif hastalıkların erken göstergesi olabilir.'
  },
  'AMYGDALA': {
    ids: [5, 6],
    names: ['Right-Amygdala', 'Left-Amygdala'],
    clinical_significance: 'Amygdala hacmindeki değişiklikler duygusal düzenleme bozuklukları ve bazı psikiyatrik hastalıklarla ilişkilidir.'
  },
  'BASAL_GANGLIA': {
    ids: [8, 9, 22, 23, 24, 25],
    names: ['Right-Caudate', 'Left-Caudate', 'Right-Pallidum', 'Left-Pallidum', 'Right-Putamen', 'Left-Putamen'],
    clinical_significance: 'Bazal gangliyonlarda hacim değişiklikleri Parkinson hastalığı, Huntington hastalığı ve diğer hareket bozukluklarıyla ilişkilidir.'
  },
  'THALAMUS': {
    ids: [26, 27],
    names: ['Right-Thalamus-Proper', 'Left-Thalamus-Proper'],
    clinical_significance: 'Talamus hacmindeki değişiklikler sensorimotor fonksiyonlar, kognitif süreçler ve bilinç durumlarıyla ilişkilidir.'
  },
  'CEREBELLUM': {
    ids: [10, 11, 12, 13],
    names: ['Right-Cerebellum-Exterior', 'Left-Cerebellum-Exterior', 'Right-Cerebellum-White-Matter', 'Left-Cerebellum-White-Matter'],
    clinical_significance: 'Serebellum değişiklikleri koordinasyon, denge ve bazı bilişsel fonksiyonlarla ilişkilidir.'
  },
  'WHITE_MATTER': {
    ids: [14, 15],
    names: ['Right-Cerebral-White-Matter', 'Left-Cerebral-White-Matter'],
    clinical_significance: 'Beyaz cevher hacmindeki azalma yaşla ilişkili bilişsel bozulma ve nörodejeneratif hastalıklarla ilişkilidir.'
  },
  'BRAIN_STEM': {
    ids: [7],
    names: ['Brain-Stem'],
    clinical_significance: 'Beyin sapı değişiklikleri yaşam fonksiyonlarını (nefes alma, kalp atımı) etkileyebilir ve nörolojik hastalıklarla ilişkilidir.'
  }
};

// Clinical interpretation guidelines
export const CLINICAL_INTERPRETATION_GUIDELINES = {
  VOLUME_CHANGE_INTERPRETATION: {
    MINIMAL: { 
      range: [-2, 2], 
      description: 'Minimal değişim',
      clinical_significance: 'Klinik olarak anlamlı değişiklik görülmemiştir.'
    },
    MILD_ATROPHY: { 
      range: [-5, -2], 
      description: 'Hafif atrofi',
      clinical_significance: 'Hafif yapısal değişiklik saptanmıştır. Klinik takip önerilir.'
    },
    SIGNIFICANT_ATROPHY: { 
      range: [-Infinity, -5], 
      description: 'Belirgin atrofi',
      clinical_significance: 'Belirgin yapısal değişiklik saptanmıştır. Detaylı klinik değerlendirme gereklidir.'
    },
    MILD_ENLARGEMENT: { 
      range: [2, 5], 
      description: 'Hafif hacim artışı',
      clinical_significance: 'Hafif hacim artışı saptanmıştır. İzlem önerilir.'
    },
    SIGNIFICANT_ENLARGEMENT: { 
      range: [5, Infinity], 
      description: 'Belirgin hacim artışı',
      clinical_significance: 'Belirgin hacim artışı saptanmıştır. Nedeninin araştırılması önerilir.'
    }
  },
  
  RISK_ASSESSMENT: {
    LOW_RISK: {
      score_range: [0, 20],
      description: 'Düşük Risk',
      recommendations: [
        'Mevcut tedavi protokolünü sürdürün',
        '6 aylık kontrol MR önerilir',
        'Klinik takibi devam edin'
      ]
    },
    MODERATE_RISK: {
      score_range: [20, 50],
      description: 'Orta Risk',
      recommendations: [
        'Tedavi dozajının gözden geçirilmesi önerilir',
        '3 aylık kontrol MR planlanmalıdır',
        'Nöropsikolojik değerlendirme yapılabilir'
      ]
    },
    HIGH_RISK: {
      score_range: [50, 80],
      description: 'Yüksek Risk',
      recommendations: [
        'Tedavi protokolünün revize edilmesi önerilir',
        'Aylık MR takibi önerilir',
        'Multidisipliner konsül değerlendirmesi yapılmalıdır'
      ]
    },
    CRITICAL_RISK: {
      score_range: [80, 100],
      description: 'Kritik Risk',
      recommendations: [
        'Tedavi protokolünün acilen revize edilmesi gerekir',
        'Aylık MR takibi önerilir',
        'Multidisipliner konsül değerlendirmesi yapılmalıdır',
        'Hastalık progresyonu açısından yakın takip gerekir'
      ]
    }
  }
};

// Export all rules as a single object
export const BrainSegmentationRules = {
  ...BRAIN_SEGMENTATION_RULES,
  structureCategories: BRAIN_STRUCTURE_CATEGORIES,
  clinicalGuidelines: CLINICAL_INTERPRETATION_GUIDELINES
};

export default BrainSegmentationRules;