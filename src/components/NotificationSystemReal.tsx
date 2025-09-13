'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, AlertCircle, FileText, Brain, Calendar, User } from 'lucide-react'

interface Notification {
  id: string
  type: 'mr_upload' | 'report_ready' | 'appointment' | 'system' | 'patient_update'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  priority: 'low' | 'medium' | 'high'
}

interface NotificationSystemProps {
  userId: string
}

export default function NotificationSystem({ userId }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
    // Set up polling for new notifications
    const interval = setInterval(fetchNotifications, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [userId])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications?limit=10&includeRead=false', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Map the API response to the component's notification format
        const mappedNotifications: Notification[] = data.notifications.map((notif: any) => ({
          id: notif.bildirim_id,
          type: mapNotificationType(notif.tur),
          title: notif.baslik,
          message: notif.mesaj,
          timestamp: notif.olusturulma_tarihi,
          read: notif.okundu,
          actionUrl: notif.action_url || undefined,
          priority: mapPriority(notif.oncelik)
        }))
        
        setNotifications(mappedNotifications)
      } else {
        console.error('Failed to fetch notifications')
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const mapNotificationType = (type: string): Notification['type'] => {
    switch (type) {
      case 'MR_YUKLEME': return 'mr_upload'
      case 'RAPOR_HAZIR': return 'report_ready'
      case 'RANDEVU': return 'appointment'
      case 'SISTEM': return 'system'
      case 'HASTA_GUNCELLEME': return 'patient_update'
      default: return 'system'
    }
  }

  const mapPriority = (priority: string): Notification['priority'] => {
    switch (priority) {
      case 'DUSUK': return 'low'
      case 'YUKSEK': return 'high'
      default: return 'medium'
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notificationId, read: true })
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        )
      } else {
        console.error('Failed to mark notification as read')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // Mark each notification as read individually
      const promises = notifications
        .filter(n => !n.read)
        .map(n => markAsRead(n.id))
      
      await Promise.all(promises)
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notif => notif.id !== notificationId)
        )
      } else {
        console.error('Failed to delete notification')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'mr_upload': return Brain
      case 'report_ready': return FileText
      case 'appointment': return Calendar
      case 'patient_update': return User
      case 'system': return AlertCircle
      default: return Bell
    }
  }

  const getIconColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600'
    if (priority === 'medium') return 'text-yellow-600'
    
    switch (type) {
      case 'mr_upload': return 'text-blue-600'
      case 'report_ready': return 'text-green-600'
      case 'appointment': return 'text-purple-600'
      case 'patient_update': return 'text-indigo-600'
      case 'system': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) {
      return 'Az önce'
    } else if (diffHours < 24) {
      return `${diffHours} saat önce`
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`
    } else {
      return date.toLocaleDateString('tr-TR')
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Bildirimler</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Tümünü okundu işaretle
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Yükleniyor...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Yeni bildirim bulunmuyor</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => {
                    const Icon = getIcon(notification.type)
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 ${getIconColor(notification.type, notification.priority)}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${
                                  !notification.read ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {formatTime(notification.timestamp)}
                                </p>
                              </div>
                              
                              <div className="ml-2 flex-shrink-0 flex items-center space-x-1">
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-indigo-600 hover:text-indigo-500"
                                    title="Okundu işaretle"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-gray-400 hover:text-gray-500"
                                  title="Sil"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            
                            {notification.actionUrl && (
                              <div className="mt-2">
                                <a
                                  href={notification.actionUrl}
                                  className="text-xs text-indigo-600 hover:text-indigo-500 font-medium"
                                  onClick={() => {
                                    markAsRead(notification.id)
                                    setIsOpen(false)
                                  }}
                                >
                                  Görüntüle →
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <a
                  href="/dashboard/notifications"
                  className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Tüm bildirimleri görüntüle
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}