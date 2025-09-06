/**
 * PDF Generation Service using jsPDF
 * 
 * This service generates PDF reports for the Mr. Sina application.
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Extend jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

interface ReportData {
  reportInfo: {
    id: string;
    date: Date;
    title: string;
  };
  patient: {
    name: string;
    tcNo: string;
    birthDate?: Date | null;
    gender?: string | null;
  };
  doctor: {
    name: string;
    specialty: string | null;
    hospitalId: string;
  };
  analysis: {
    aiCommentary?: string | null;
    optimizationResult?: any;
    doctorNotes?: string | null;
    gafScore?: number | null;
  };
  metadata: {
    generatedAt: string;
    version: string;
    system: string;
  };
}

/**
 * Generate a PDF report from report data
 * @param data Report data
 * @returns PDF as ArrayBuffer
 */
export async function generatePdfReport(data: ReportData): Promise<ArrayBuffer> {
  // Create a new jsPDF instance
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set font properties
  doc.setFont('helvetica');
  
  // Add header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text('Mr. Sina', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(80, 80, 80);
  doc.text('Psikiyatrik Hastalıklarda Yapay Zekâ Destekli Klinik İzlem', 105, 30, { align: 'center' });
  doc.text('ve Görüntüleme Temelli Karar Destek Sistemi', 105, 37, { align: 'center' });
  
  // Add horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 45, 190, 45);
  
  // Report info
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(data.reportInfo.title, 20, 55);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Rapor ID: ${data.reportInfo.id}`, 20, 62);
  doc.text(`Oluşturma Tarihi: ${formatDate(data.reportInfo.date)}`, 20, 69);
  
  // Add patient information
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Hasta Bilgileri', 20, 85);
  
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Ad Soyad: ${data.patient.name}`, 20, 92);
  doc.text(`T.C. Kimlik No: ${data.patient.tcNo}`, 20, 99);
  
  if (data.patient.birthDate) {
    doc.text(`Doğum Tarihi: ${formatDate(data.patient.birthDate)}`, 20, 106);
  }
  
  if (data.patient.gender) {
    doc.text(`Cinsiyet: ${data.patient.gender}`, 20, 113);
  }
  
  // Add doctor information
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Doktor Bilgileri', 20, 129);
  
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`${data.doctor.name}`, 20, 136);
  
  if (data.doctor.specialty) {
    doc.text(`Uzmanlık Alanı: ${data.doctor.specialty}`, 20, 143);
  }
  
  doc.text(`Hastane ID: ${data.doctor.hospitalId}`, 20, 150);
  
  // Add analysis section
  let yPos = 165;
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Analiz Sonuçları', 20, yPos);
  yPos += 8;
  
  // GAF Score
  if (data.analysis.gafScore !== null && data.analysis.gafScore !== undefined) {
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`GAF Uyum Skoru: %${data.analysis.gafScore}`, 20, yPos);
    yPos += 7;
  }
  
  // AI Commentary
  if (data.analysis.aiCommentary) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Yapay Zeka Yorumu:', 20, yPos);
    yPos += 7;
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    const aiCommentLines = doc.splitTextToSize(data.analysis.aiCommentary, 170);
    doc.text(aiCommentLines, 20, yPos);
    yPos += aiCommentLines.length * 6;
  }
  
  // Optimization Result
  if (data.analysis.optimizationResult) {
    yPos += 5; // Add some space
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Optimizasyon Sonucu:', 20, yPos);
    yPos += 7;
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    
    // Handle different types of optimization results
    let optimizationText = '';
    if (typeof data.analysis.optimizationResult === 'string') {
      optimizationText = data.analysis.optimizationResult;
    } else if (typeof data.analysis.optimizationResult === 'object') {
      optimizationText = JSON.stringify(data.analysis.optimizationResult, null, 2);
    } else {
      optimizationText = String(data.analysis.optimizationResult);
    }
    
    const optimizationLines = doc.splitTextToSize(optimizationText, 170);
    doc.text(optimizationLines, 20, yPos);
    yPos += optimizationLines.length * 6;
  }
  
  // Doctor Notes
  if (data.analysis.doctorNotes) {
    yPos += 5; // Add some space
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Doktor Görüşleri:', 20, yPos);
    yPos += 7;
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    const doctorNotesLines = doc.splitTextToSize(data.analysis.doctorNotes, 170);
    doc.text(doctorNotesLines, 20, yPos);
    yPos += doctorNotesLines.length * 6;
  }
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 280, 190, 280);
    
    // Footer text
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Sayfa ${i} / ${pageCount}`, 105, 287, { align: 'center' });
    doc.text(`${data.metadata.system} v${data.metadata.version}`, 20, 287);
    doc.text(`Oluşturulma: ${formatDate(new Date(data.metadata.generatedAt))}`, 190, 287, { align: 'right' });
  }
  
  // Return PDF as ArrayBuffer
  return doc.output('arraybuffer');
}

/**
 * Format date for display
 * @param date Date to format
 * @returns Formatted date string
 */
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Bilinmiyor';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Geçersiz tarih';
  
  return d.toLocaleDateString('tr-TR');
}