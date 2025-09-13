import { prisma } from '@/lib/prisma'
import { BildirimTipi, BildirimOncelik } from '@prisma/client'

interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type: BildirimTipi
  priority?: BildirimOncelik
  actionUrl?: string
}

/**
 * Creates a new notification for a user
 * @param params Notification parameters
 * @returns The created notification
 */
export async function createNotification(params: CreateNotificationParams) {
  const { userId, title, message, type, priority = BildirimOncelik.ORTA, actionUrl } = params

  try {
    const notification = await prisma.bildirimler.create({
      data: {
        kullanici_id: userId,
        baslik: title,
        mesaj: message,
        tip: type,
        oncelik: priority,
        action_url: actionUrl,
        olusturulma_tarihi: new Date(),
        guncelleme_tarihi: new Date()
      }
    })

    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

/**
 * Creates an MR upload notification
 * @param userId User ID to send notification to
 * @param patientName Name of the patient
 * @param actionUrl URL to navigate to when clicking the notification
 */
export async function createMRUploadNotification(userId: string, patientName: string, actionUrl?: string) {
  return createNotification({
    userId,
    title: 'Yeni MR Yüklendi',
    message: `${patientName} için yeni MR görüntüsü yüklendi ve işleme alındı.`,
    type: BildirimTipi.MR_YUKLEME,
    priority: BildirimOncelik.ORTA,
    actionUrl
  })
}

/**
 * Creates a report ready notification
 * @param userId User ID to send notification to
 * @param patientName Name of the patient
 * @param actionUrl URL to navigate to when clicking the notification
 */
export async function createReportReadyNotification(userId: string, patientName: string, actionUrl?: string) {
  return createNotification({
    userId,
    title: 'Rapor Hazır',
    message: `${patientName} için AI destekli analiz raporu hazırlandı.`,
    type: BildirimTipi.RAPOR_HAZIR,
    priority: BildirimOncelik.YUKSEK,
    actionUrl
  })
}

/**
 * Creates an appointment reminder notification
 * @param userId User ID to send notification to
 * @param patientName Name of the patient
 * @param appointmentTime Appointment time
 */
export async function createAppointmentNotification(userId: string, patientName: string, appointmentTime: string) {
  return createNotification({
    userId,
    title: 'Randevu Hatırlatması',
    message: `${patientName} - ${appointmentTime} kontrol randevusu`,
    type: BildirimTipi.RANDEVU,
    priority: BildirimOncelik.ORTA
  })
}

/**
 * Creates a patient update notification
 * @param userId User ID to send notification to
 * @param patientName Name of the patient
 * @param updateInfo Information about the update
 * @param actionUrl URL to navigate to when clicking the notification
 */
export async function createPatientUpdateNotification(userId: string, patientName: string, updateInfo: string, actionUrl?: string) {
  return createNotification({
    userId,
    title: 'Hasta Güncellemesi',
    message: `${patientName} için yeni ${updateInfo} eklendi`,
    type: BildirimTipi.HASTA_GUNCELLEME,
    priority: BildirimOncelik.DUSUK,
    actionUrl
  })
}

/**
 * Creates a system update notification
 * @param userId User ID to send notification to
 * @param updateInfo Information about the system update
 */
export async function createSystemUpdateNotification(userId: string, updateInfo: string) {
  return createNotification({
    userId,
    title: 'Sistem Güncellemesi',
    message: updateInfo,
    type: BildirimTipi.SISTEM,
    priority: BildirimOncelik.DUSUK
  })
}