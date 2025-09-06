// Copyright (c) 2025 Efe Ataakan - All rights reserved
// Unauthorized copying or distribution of this code is strictly prohibited

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Brain,
  Home,
  Users,
  UserPlus,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  BarChart3,
  Shield
} from 'lucide-react'

import { LucideIcon } from 'lucide-react'

interface SidebarProps {
  user: {
    kullanici_id: string
    ad: string
    soyad: string
    uzmanlik_alani: string
    hastane_id: string
    rol: string
  }
  onLogout: () => void
}

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  roles?: string[]
  badge?: number
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const navigation: NavigationItem[] = [
    {
      name: 'Ana Sayfa',
      href: '/dashboard',
      icon: Home
    },
    {
      name: 'Hastalarım',
      href: '/dashboard/patients',
      icon: Users
    },
    {
      name: 'Yeni Hasta Ekle',
      href: '/dashboard/patients?tab=add',
      icon: UserPlus
    },
    {
      name: 'Raporlar',
      href: '/dashboard/reports',
      icon: FileText
    },
    {
      name: 'İstatistikler',
      href: '/dashboard/analytics',
      icon: BarChart3
    },
    {
      name: 'Bekleyen Talepler',
      href: '/dashboard/pending',
      icon: Bell,
      badge: 3
    },
    ...(user.rol === 'ADMIN' ? [
      {
        name: 'Doktor Başvuruları',
        href: '/dashboard/admin/registrations',
        icon: Shield,
        roles: ['ADMIN'] as string[],
        badge: 2
      }
    ] : []),
    {
      name: 'Ayarlar',
      href: '/dashboard/settings',
      icon: Settings
    }
  ]

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md bg-white shadow-lg text-gray-600 hover:text-gray-900"
        >
          {collapsed ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 bg-white shadow-xl transform ${
        collapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
      } transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
        collapsed ? 'md:w-16' : 'md:w-64'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-indigo-600" />
            {!collapsed && (
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">Mr. Sina</h1>
                <p className="text-xs text-gray-500">Klinik Panel</p>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block p-1.5 rounded-md text-gray-400 hover:text-gray-600"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-sm font-medium text-indigo-600">
                  {user.ad.charAt(0)}{user.soyad.charAt(0)}
                </span>
              </div>
            </div>
            {!collapsed && (
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Dr. {user.ad} {user.soyad}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.uzmanlik_alani}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user.hastane_id}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = isActiveLink(item.href)
            
            // Check role access
            if (item.roles && !item.roles.includes(user.rol)) {
              return null
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`flex-shrink-0 h-5 w-5 ${
                  isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {!collapsed && (
                  <>
                    <span className="ml-3 truncate">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge && (
                  <span className="absolute left-8 -top-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Quick Stats */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div className="ml-2">
                    <div className="text-sm font-medium text-blue-900">24</div>
                    <div className="text-xs text-blue-600">Aktif Hasta</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-green-600" />
                  <div className="ml-2">
                    <div className="text-sm font-medium text-green-900">8</div>
                    <div className="text-xs text-green-600">Bu Hafta</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className={`group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Çıkış Yap' : undefined}
          >
            <LogOut className="flex-shrink-0 h-5 w-5" />
            {!collapsed && <span className="ml-3">Çıkış Yap</span>}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-gray-600 bg-opacity-50"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  )
}