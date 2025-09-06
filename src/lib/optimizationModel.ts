/**
 * Differential Equation Optimization Model for Clinical Decision Support
 * 
 * This service implements a mathematical optimization model based on differential equations
 * to provide clinical decision support for psychiatric patient treatment.
 */

interface ClinicalDataPoint {
  date: Date;
  scaleName: string;
  score: number;
  maxScore?: number;
}

interface TreatmentData {
  medication: string;
  dosage: string;
  startDate: Date;
  endDate?: Date;
}

interface PatientHistory {
  clinicalData: ClinicalDataPoint[];
  treatments: TreatmentData[];
  mrImages: {
    date: Date;
    path: string;
    analysis?: any;
  }[];
}

interface OptimizationParameters {
  timeHorizon: number; // in days
  objective: 'minimize_symptoms' | 'maximize_functioning' | 'stabilize_mood';
  constraints: {
    maxMedicationChanges?: number;
    minTreatmentDuration?: number; // in days
    maxDosage?: number;
  };
}

interface OptimizationResult {
  recommendations: {
    medication?: string;
    dosage?: string;
    timing: Date;
    confidence: number;
    rationale: string;
  }[];
  predictedTrajectory: {
    date: Date;
    predictedScore: number;
    confidenceInterval: [number, number];
  }[];
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high';
    riskFactors: string[];
    mitigationStrategies: string[];
  };
  treatmentSuggestions: string[];
  gafPrediction?: number;
}

/**
 * Enhanced differential equation model for symptom progression
 * Using a system of equations to model complex interactions
 */
class SymptomDynamicsModel {
  private recoveryRate: number;      // Natural recovery rate
  private treatmentEffect: number;   // Treatment effectiveness
  private baselineSymptoms: number;  // Baseline symptom level
  private environmentalImpact: number; // Environmental factors impact
  private medicationInteractions: Map<string, number>; // Medication interaction effects

  constructor(
    recoveryRate: number = 0.1,
    treatmentEffect: number = 0.3,
    baselineSymptoms: number = 50,
    environmentalImpact: number = 0.05
  ) {
    this.recoveryRate = recoveryRate;
    this.treatmentEffect = treatmentEffect;
    this.baselineSymptoms = baselineSymptoms;
    this.environmentalImpact = environmentalImpact;
    this.medicationInteractions = new Map([
      ['lithium', 0.7],
      ['risperidone', 0.6],
      ['olanzapine', 0.65],
      ['quetiapine', 0.55],
      ['sertraline', 0.4],
      ['fluoxetine', 0.35],
      ['venlafaxine', 0.4],
      ['aripiprazole', 0.5],
      ['clozapine', 0.6],
      ['haloperidol', 0.55]
    ]);
  }

  /**
   * Calculate the rate of change of symptoms using a more complex model
   * dy/dt = α * (target - y) - β * treatment_effect - γ * environmental_factors
   * 
   * @param currentSymptoms Current symptom severity (0-100)
   * @param treatmentEffect Effect of current treatments (-100 to 100)
   * @param environmentalFactors Environmental stress factors (0-100)
   * @returns Rate of change
   */
  dydt(currentSymptoms: number, treatmentEffect: number, environmentalFactors: number = 0): number {
    const naturalRecovery = this.recoveryRate * (this.baselineSymptoms - currentSymptoms);
    const treatmentImpact = this.treatmentEffect * treatmentEffect;
    const environmentalImpact = this.environmentalImpact * environmentalFactors;
    
    return naturalRecovery - treatmentImpact - environmentalImpact;
  }

  /**
   * Predict symptoms at next time step using Runge-Kutta method for better accuracy
   * @param currentSymptoms Current symptom severity
   * @param treatmentEffect Treatment effect
   * @param environmentalFactors Environmental factors
   * @param deltaTime Time step in days
   * @returns Predicted symptoms
   */
  predictSymptoms(
    currentSymptoms: number, 
    treatmentEffect: number, 
    environmentalFactors: number = 0,
    deltaTime: number = 1
  ): number {
    // 4th order Runge-Kutta method
    const k1 = deltaTime * this.dydt(currentSymptoms, treatmentEffect, environmentalFactors);
    const k2 = deltaTime * this.dydt(currentSymptoms + k1/2, treatmentEffect, environmentalFactors);
    const k3 = deltaTime * this.dydt(currentSymptoms + k2/2, treatmentEffect, environmentalFactors);
    const k4 = deltaTime * this.dydt(currentSymptoms + k3, treatmentEffect, environmentalFactors);
    
    const result = currentSymptoms + (k1 + 2*k2 + 2*k3 + k4) / 6;
    return Math.max(0, Math.min(100, result));
  }
}

/**
 * Clinical Decision Support System using Differential Equation Optimization
 */
export class ClinicalDecisionSupport {
  private model: SymptomDynamicsModel;
  
  constructor() {
    // Initialize with parameters based on clinical research
    this.model = new SymptomDynamicsModel(0.08, 0.35, 45, 0.07);
  }
  
  /**
   * Analyze patient history and generate optimization recommendations
   * @param patientHistory Patient's clinical history
   * @param parameters Optimization parameters
   * @returns Optimization result with recommendations
   */
  analyzePatient(
    patientHistory: PatientHistory,
    parameters: OptimizationParameters
  ): OptimizationResult {
    // Extract relevant clinical data
    const relevantData = this.extractRelevantData(patientHistory);
    
    // Calculate treatment effects
    const treatmentEffects = this.calculateTreatmentEffects(patientHistory.treatments);
    
    // Predict future trajectory
    const trajectory = this.predictTrajectory(
      relevantData,
      treatmentEffects,
      parameters.timeHorizon
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      patientHistory,
      trajectory,
      parameters
    );
    
    // Assess risk
    const riskAssessment = this.assessRisk(relevantData, trajectory);
    
    // Generate treatment suggestions
    const treatmentSuggestions = this.generateTreatmentSuggestions(patientHistory, trajectory);
    
    // Predict GAF score
    const gafPrediction = this.predictGAFScore(relevantData, trajectory);
    
    return {
      recommendations,
      predictedTrajectory: trajectory,
      riskAssessment,
      treatmentSuggestions,
      gafPrediction
    };
  }
  
  /**
   * Extract relevant clinical data for analysis
   * @param patientHistory Patient history
   * @returns Processed clinical data
   */
  private extractRelevantData(patientHistory: PatientHistory): ClinicalDataPoint[] {
    // Filter and sort clinical data by date
    return patientHistory.clinicalData
      .filter(data => 
        data.scaleName === 'YMRS' || 
        data.scaleName === 'HAM-D' || 
        data.scaleName === 'PANSS' ||
        data.scaleName === 'CGI' ||
        data.scaleName === 'GAF'
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  /**
   * Calculate treatment effects based on medication history
   * @param treatments Treatment history
   * @returns Treatment effects over time
   */
  private calculateTreatmentEffects(treatments: TreatmentData[]): { [key: string]: number } {
    const effects: { [key: string]: number } = {};
    
    for (const treatment of treatments) {
      // Get effectiveness from the model's medication interactions
      const baseEffectiveness = this.model['medicationInteractions'].get(treatment.medication.toLowerCase()) || 0.3;
      
      // Adjust effectiveness based on dosage (simplified model)
      let dosageMultiplier = 1.0;
      if (treatment.dosage) {
        const dosageValue = parseFloat(treatment.dosage.replace(/[^\d.]/g, ''));
        if (!isNaN(dosageValue)) {
          // Simple dosage scaling (this would be more complex in reality)
          dosageMultiplier = Math.min(1.5, Math.max(0.5, dosageValue / 100));
        }
      }
      
      effects[treatment.medication] = baseEffectiveness * dosageMultiplier;
    }
    
    return effects;
  }
  
  /**
   * Predict symptom trajectory using the differential equation model
   * @param clinicalData Clinical data points
   * @param treatmentEffects Treatment effects
   * @param timeHorizon Prediction time horizon in days
   * @returns Predicted trajectory
   */
  private predictTrajectory(
    clinicalData: ClinicalDataPoint[],
    treatmentEffects: { [key: string]: number },
    timeHorizon: number
  ): {
    date: Date;
    predictedScore: number;
    confidenceInterval: [number, number];
  }[] {
    if (clinicalData.length === 0) {
      return [];
    }
    
    const trajectory = [];
    let currentDate = new Date(clinicalData[clinicalData.length - 1].date);
    let currentScore = clinicalData[clinicalData.length - 1].score;
    
    // Calculate average treatment effect
    const treatmentEffectValues = Object.values(treatmentEffects);
    const avgTreatmentEffect = treatmentEffectValues.length > 0 
      ? treatmentEffectValues.reduce((sum, val) => sum + val, 0) / treatmentEffectValues.length
      : 0;
    
    // Simulate trajectory for the time horizon
    for (let day = 1; day <= timeHorizon; day += 7) { // Weekly predictions
      // Move to next time point
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 7);
      
      // Predict next score using the model
      currentScore = this.model.predictSymptoms(currentScore, avgTreatmentEffect * 100, 20, 7);
      
      // Calculate confidence interval (simplified)
      const confidenceRadius = Math.min(15, 5 + day * 0.1);
      const lowerBound = Math.max(0, currentScore - confidenceRadius);
      const upperBound = Math.min(100, currentScore + confidenceRadius);
      
      trajectory.push({
        date: new Date(currentDate),
        predictedScore: currentScore,
        confidenceInterval: [lowerBound, upperBound] as [number, number]
      });
    }
    
    return trajectory;
  }
  
  /**
   * Generate treatment recommendations based on predicted trajectory
   * @param patientHistory Patient history
   * @param trajectory Predicted trajectory
   * @param parameters Optimization parameters
   * @returns Treatment recommendations
   */
  private generateRecommendations(
    patientHistory: PatientHistory,
    trajectory: {
      date: Date;
      predictedScore: number;
      confidenceInterval: [number, number];
    }[],
    parameters: OptimizationParameters
  ): OptimizationResult['recommendations'] {
    if (trajectory.length === 0) {
      return [];
    }
    
    const recommendations = [];
    const lastScore = patientHistory.clinicalData.length > 0 ? 
      patientHistory.clinicalData[patientHistory.clinicalData.length - 1].score : 50;
    const predictedWorstScore = Math.max(...trajectory.map(t => t.predictedScore));
    const predictedBestScore = Math.min(...trajectory.map(t => t.predictedScore));
    
    // Recommendation 1: If symptoms are predicted to worsen significantly
    if (predictedWorstScore > lastScore + 15) {
      recommendations.push({
        timing: new Date(),
        confidence: 0.85,
        rationale: "Belirtiler yakın gelecekte önemli ölçüde kötüleşeceği öngörülüyor. Tedavinin acilen optimize edilmesi öneriliyor.",
        medication: "Lithium",
        dosage: "900mg"
      });
    }
    
    // Recommendation 2: If symptoms are stable but not optimal
    if (predictedBestScore > 30 && predictedBestScore <= 50) {
      recommendations.push({
        timing: new Date(),
        confidence: 0.75,
        rationale: "Belirtiler stabil ancak optimal seviyede değil. Tedavi protokolü gözden geçirilmeli.",
        medication: "Aripiprazole",
        dosage: "10-30mg"
      });
    }
    
    // Recommendation 3: If symptoms are predicted to improve significantly
    if (predictedBestScore < lastScore - 20) {
      recommendations.push({
        timing: new Date(),
        confidence: 0.8,
        rationale: "Belirtilerde önemli iyileşme öngörülüyor. Mevcut tedavi protokolünü sürdürün.",
        medication: undefined,
        dosage: undefined
      });
    }
    
    return recommendations;
  }
  
  /**
   * Assess risk based on clinical data and predicted trajectory
   * @param clinicalData Clinical data points
   * @param trajectory Predicted trajectory
   * @returns Risk assessment
   */
  private assessRisk(
    clinicalData: ClinicalDataPoint[],
    trajectory: {
      date: Date;
      predictedScore: number;
      confidenceInterval: [number, number];
    }[]
  ): OptimizationResult['riskAssessment'] {
    if (clinicalData.length === 0 || trajectory.length === 0) {
      return {
        riskLevel: 'medium',
        riskFactors: ['Yetersiz klinik veri'],
        mitigationStrategies: ['Daha fazla klinik veri toplanmalı']
      };
    }
    
    const currentScore = clinicalData[clinicalData.length - 1].score;
    const predictedMaxScore = Math.max(...trajectory.map(t => t.predictedScore));
    const riskFactors = [];
    const mitigationStrategies = [];
    
    // High risk factors
    if (currentScore > 75) {
      riskFactors.push('Yüksek semptom yükü');
      mitigationStrategies.push('Acil müdahale gerekebilir');
    }
    
    if (predictedMaxScore > 85) {
      riskFactors.push('Öngörülen semptom artışı');
      mitigationStrategies.push('Tedavi rejimi revize edilmeli');
    }
    
    // Medium risk factors
    if (currentScore > 50 && currentScore <= 75) {
      riskFactors.push('Orta düzey semptom yükü');
      mitigationStrategies.push('Tedavi gözden geçirilmeli');
    }
    
    if (predictedMaxScore > 70 && predictedMaxScore <= 85) {
      riskFactors.push('Öngörülen semptom artışı');
      mitigationStrategies.push('Yakın takip önerilir');
    }
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (riskFactors.length >= 2 || currentScore > 75) {
      riskLevel = 'high';
    } else if (riskFactors.length >= 1 || currentScore > 50) {
      riskLevel = 'medium';
    }
    
    return {
      riskLevel,
      riskFactors,
      mitigationStrategies
    };
  }
  
  /**
   * Generate treatment suggestions based on patient history and predictions
   * @param patientHistory Patient history
   * @param trajectory Predicted trajectory
   * @returns Treatment suggestions
   */
  private generateTreatmentSuggestions(
    patientHistory: PatientHistory,
    trajectory: {
      date: Date;
      predictedScore: number;
      confidenceInterval: [number, number];
    }[]
  ): string[] {
    const suggestions = [];
    
    // Analyze current medications
    const currentMedications = patientHistory.treatments
      .filter(t => !t.endDate || t.endDate > new Date())
      .map(t => t.medication);
    
    // Suggest based on predicted trajectory
    if (trajectory.length > 0) {
      const predictedImprovement = patientHistory.clinicalData.length > 0 ?
        patientHistory.clinicalData[patientHistory.clinicalData.length - 1].score - 
        trajectory[trajectory.length - 1].predictedScore : 0;
      
      if (predictedImprovement > 20) {
        suggestions.push("Mevcut tedavi protokolünü sürdürün");
        suggestions.push("6 aylık kontrol MR önerilir");
      } else if (predictedImprovement > 0) {
        suggestions.push("Tedavi dozajının gözden geçirilmesi önerilir");
        suggestions.push("3 aylık kontrol MR planlanmalıdır");
      } else {
        suggestions.push("Tedavi protokolünün acilen revize edilmesi gerekir");
        suggestions.push("Aylık MR takibi önerilir");
        suggestions.push("Multidisipliner konsül değerlendirmesi yapılmalıdır");
      }
    }
    
    // General suggestions
    suggestions.push("Nöropsikolojik değerlendirme planlanması");
    suggestions.push("Tedavi protokolünün gözden geçirilmesi");
    suggestions.push("Kontrol MR görüntülemenin 6 ay sonra tekrarlanması");
    
    return suggestions;
  }
  
  /**
   * Predict GAF score based on clinical data and trajectory
   * @param clinicalData Clinical data points
   * @param trajectory Predicted trajectory
   * @returns Predicted GAF score
   */
  private predictGAFScore(
    clinicalData: ClinicalDataPoint[],
    trajectory: {
      date: Date;
      predictedScore: number;
      confidenceInterval: [number, number];
    }[]
  ): number | undefined {
    if (clinicalData.length === 0) {
      return undefined;
    }
    
    // Get the latest clinical score
    const latestScore = clinicalData[clinicalData.length - 1].score;
    
    // Convert symptom score to GAF-like score (inverted scale)
    // Higher symptom scores = lower functioning = lower GAF
    let predictedGAF = 100 - latestScore;
    
    // Adjust based on trajectory if available
    if (trajectory.length > 0) {
      const predictedScore = trajectory[trajectory.length - 1].predictedScore;
      const predictedGAFAdjustment = (latestScore - predictedScore) * 0.5;
      predictedGAF = Math.max(0, Math.min(100, predictedGAF + predictedGAFAdjustment));
    }
    
    return Math.round(predictedGAF);
  }
}

// Export a singleton instance for use throughout the application
export const clinicalDecisionSupport = new ClinicalDecisionSupport();