/**
 * GAF (Global Assessment of Functioning) Scoring Service
 * 
 * The GAF scale is a numeric scale (0-100) used by mental health professionals
 * to rate the social, occupational, and psychological functioning of adults.
 * 
 * This implementation calculates GAF scores based on clinical scale data using
 * more sophisticated clinical algorithms.
 */

interface ClinicalScaleData {
  scaleName: string;
  score: number;
  maxScore?: number;
  date: Date;
}

interface GafCalculationResult {
  score: number;
  explanation: string;
  factors: {
    scale: string;
    contribution: number;
    description: string;
  }[];
  recommendations: string[];
}

/**
 * Calculate GAF score based on clinical scale data using enhanced algorithms
 * @param clinicalScales Array of clinical scale scores
 * @returns GAF score and explanation
 */
export function calculateGafScore(clinicalScales: ClinicalScaleData[]): GafCalculationResult {
  if (!clinicalScales || clinicalScales.length === 0) {
    return {
      score: 0,
      explanation: "Yetersiz klinik veri",
      factors: [],
      recommendations: ["Daha fazla klinik ölçüm verisi toplanmalı"]
    };
  }

  // Weight factors for different scales based on clinical research
  const scaleWeights: Record<string, number> = {
    'YMRS': 0.25,     // Young Mania Rating Scale
    'HAM-D': 0.30,    // Hamilton Depression Rating Scale
    'PANSS': 0.35,    // Positive and Negative Syndrome Scale
    'CGI': 0.10,      // Clinical Global Impression
    'GAF': 0.0       // Don't use GAF to calculate GAF
  };

  // Severity thresholds for different scales
  const severityThresholds: Record<string, { mild: number; moderate: number; severe: number }> = {
    'YMRS': { mild: 8, moderate: 16, severe: 24 },
    'HAM-D': { mild: 8, moderate: 16, severe: 24 },
    'PANSS': { mild: 70, moderate: 90, severe: 110 },
    'CGI': { mild: 2, moderate: 3, severe: 4 }
  };

  let totalWeightedScore = 0;
  let totalWeight = 0;
  const factors = [];
  const recommendations = [];

  // Process each clinical scale
  for (const scale of clinicalScales) {
    const scaleName = scale.scaleName.toUpperCase();
    const weight = scaleWeights[scaleName] || 0.1; // Default weight for unknown scales
    
    // Normalize score to 0-100 range based on clinical severity
    let normalizedScore = 0;
    if (scale.maxScore) {
      normalizedScore = (scale.score / scale.maxScore) * 100;
    } else if (severityThresholds[scaleName]) {
      // Use clinical thresholds for better normalization
      const thresholds = severityThresholds[scaleName];
      if (scale.score <= thresholds.mild) {
        normalizedScore = 90 + (10 * (thresholds.mild - scale.score) / thresholds.mild);
      } else if (scale.score <= thresholds.moderate) {
        normalizedScore = 70 + (20 * (thresholds.moderate - scale.score) / (thresholds.moderate - thresholds.mild));
      } else if (scale.score <= thresholds.severe) {
        normalizedScore = 40 + (30 * (thresholds.severe - scale.score) / (thresholds.severe - thresholds.moderate));
      } else {
        normalizedScore = Math.max(0, 40 - (scale.score - thresholds.severe));
      }
    } else {
      // For scales without max score or thresholds, use a heuristic
      normalizedScore = Math.min(100, scale.score * 2);
    }

    // Convert to GAF-like score (higher score = better functioning)
    // For symptom scales, higher scores indicate worse symptoms
    const gafLikeScore = 100 - normalizedScore;
    
    // Apply weight
    const weightedScore = gafLikeScore * weight;
    
    totalWeightedScore += weightedScore;
    totalWeight += weight;
    
    factors.push({
      scale: scaleName,
      contribution: weightedScore,
      description: `${scaleName} ölçeği katkı: ${weightedScore.toFixed(2)}`
    });
    
    // Generate recommendations based on severity
    if (severityThresholds[scaleName]) {
      const thresholds = severityThresholds[scaleName];
      if (scale.score > thresholds.severe) {
        recommendations.push(`${scaleName} ölçeğine göre ciddi semptom yükü. Acil müdahale önerilir.`);
      } else if (scale.score > thresholds.moderate) {
        recommendations.push(`${scaleName} ölçeğine göre orta-seviye semptom yükü. Tedavi gözden geçirilmeli.`);
      } else if (scale.score > thresholds.mild) {
        recommendations.push(`${scaleName} ölçeğine göre hafif semptom yükü. İzlemeye devam.`);
      }
    }
  }

  // Calculate final GAF score
  let finalScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  
  // Ensure score is within valid range
  finalScore = Math.max(0, Math.min(100, finalScore));
  
  // Generate explanation based on score with more detail
  const explanation = generateDetailedGafExplanation(finalScore);
  
  // Add general recommendations if none were generated
  if (recommendations.length === 0) {
    if (finalScore >= 80) {
      recommendations.push("İyi işlevsellik düzeyi. Mevcut tedavi protokolünü sürdürün.");
    } else if (finalScore >= 60) {
      recommendations.push("Orta düzey işlevsellik. Tedavi gözden geçirilmeli.");
    } else if (finalScore >= 40) {
      recommendations.push("Düşük işlevsellik düzeyi. Tedavi rejimi revize edilmeli.");
    } else {
      recommendations.push("Çok düşük işlevsellik düzeyi. Acil müdahale gerekebilir.");
    }
  }
  
  return {
    score: finalScore,
    explanation,
    factors,
    recommendations
  };
}

/**
 * Generate detailed explanation text based on GAF score
 * @param score GAF score (0-100)
 * @returns Detailed explanation text
 */
function generateDetailedGafExplanation(score: number): string {
  if (score >= 91) {
    return "Üst düzey işlevsellik. Belirgin psikiyatrik belirti yok. Sosyal ve mesleki alanlarda iyi işlevsellik.";
  }
  if (score >= 81) {
    return "Geçici hafif belirtiler. İşlevsellik iyi. Sosyal ve mesleki alanlarda küçük sorunlar olabilir.";
  }
  if (score >= 71) {
    return "Hafif belirtiler. Bazı işlevsellik azalmaları. Sosyal ve mesleki alanlarda hafif zorluklar.";
  }
  if (score >= 61) {
    return "Orta düzey belirtiler. İşlevsellikte belirgin azalma. Sosyal ve mesleki alanlarda belirgin zorluklar.";
  }
  if (score >= 51) {
    return "Orta düzey ciddi belirtiler. İşlevsellikte ciddi azalma. Sosyal ve mesleki alanlarda ciddi zorluklar.";
  }
  if (score >= 41) {
    return "Ciddi belirtiler. İşlevsellikte önemli bozulma. Sosyal ve mesleki alanlarda önemli sınırlamalar.";
  }
  if (score >= 31) {
    return "Ağır belirtiler. Gerçeklik testinden kaçma. Sosyal ve mesleki alanlarda ciddi bozulma.";
  }
  if (score >= 21) {
    return "Çok ciddi davranış bozuklukları. Kendine zarar verme riski. Sürekli gözetim gerekebilir.";
  }
  if (score >= 11) {
    return "Sürekli halüsinasyonlar/delüzyonlar. Kendine ve başkalarına zarar verme tehlikesi. Acil müdahale gerekir.";
  }
  return "Bilinç bulanıklığı. Kontrol edilemeyen heyecan. Kendine zarar verme girişimi. Acil psikiyatrik bakım gerekir.";
}

/**
 * Get GAF score ranges and descriptions
 * @returns Array of GAF score ranges with descriptions
 */
export function getGafScoreRanges() {
  return [
    { min: 91, max: 100, description: "Üst düzey işlevsellik. Belirgin psikiyatrik belirti yok." },
    { min: 81, max: 90, description: "Geçici hafif belirtiler. İşlevsellik iyi." },
    { min: 71, max: 80, description: "Hafif belirtiler. Bazı işlevsellik azalmaları." },
    { min: 61, max: 70, description: "Orta düzey belirtiler. İşlevsellikte belirgin azalma." },
    { min: 51, max: 60, description: "Orta düzey ciddi belirtiler. İşlevsellikte ciddi azalma." },
    { min: 41, max: 50, description: "Ciddi belirtiler. İşlevsellikte önemli bozulma." },
    { min: 31, max: 40, description: "Ağır belirtiler. Gerçeklik testinden kaçma." },
    { min: 21, max: 30, description: "Çok ciddi davranış bozuklukları. Kendine zarar verme riski." },
    { min: 11, max: 20, description: "Sürekli halüsinasyonlar/delüzyonlar. Kendine ve başkalarına zarar verme tehlikesi." },
    { min: 1, max: 10, description: "Bilinç bulanıklığı. Kontrol edilemeyen heyecan. Kendine zarar verme girişimi." },
    { min: 0, max: 0, description: "Yetersiz bilgi" }
  ];
}

/**
 * Calculate GAF trend over time
 * @param clinicalScalesHistory Array of clinical scales over time
 * @returns GAF trend analysis
 */
export function calculateGafTrend(clinicalScalesHistory: ClinicalScaleData[][]): {
  trend: 'improving' | 'deteriorating' | 'stable';
  change: number;
  description: string;
} {
  if (clinicalScalesHistory.length < 2) {
    return {
      trend: 'stable',
      change: 0,
      description: 'Yeterli veri yok'
    };
  }
  
  // Calculate GAF scores for each time point
  const gafScores = clinicalScalesHistory.map(scales => calculateGafScore(scales).score);
  
  // Calculate trend
  const firstScore = gafScores[0];
  const lastScore = gafScores[gafScores.length - 1];
  const change = lastScore - firstScore;
  
  let trend: 'improving' | 'deteriorating' | 'stable' = 'stable';
  let description = '';
  
  if (change > 10) {
    trend = 'improving';
    description = 'İşlevsellik düzeyinde önemli iyileşme';
  } else if (change > 5) {
    trend = 'improving';
    description = 'İşlevsellik düzeyinde hafif iyileşme';
  } else if (change < -10) {
    trend = 'deteriorating';
    description = 'İşlevsellik düzeyinde önemli bozulma';
  } else if (change < -5) {
    trend = 'deteriorating';
    description = 'İşlevsellik düzeyinde hafif bozulma';
  } else {
    trend = 'stable';
    description = 'İşlevsellik düzeyi stabil';
  }
  
  return {
    trend,
    change,
    description
  };
}