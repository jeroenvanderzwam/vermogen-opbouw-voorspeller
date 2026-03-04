import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Settings,
  TrendingUp,
  Home,
  Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    group: null,
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/gegevens', label: 'Mijn Gegevens', icon: Settings },
    ],
  },
  {
    group: 'Berekeningen',
    items: [
      { to: '/projectie', label: 'Vermogen op 40', icon: TrendingUp },
      { to: '/woning', label: 'Verkoopstrategie Woning', icon: Home },
      { to: '/fire', label: 'FIRE Calculator', icon: Flame },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-200 flex flex-col z-10">
      {/* Logo */}
      <div className="p-5 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">
          <span className="mr-2">💰</span>
          Vermogen
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Voorspeller</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {navItems.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            {group.group && (
              <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                {group.group}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )
                    }
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          Vermogen Opbouw Voorspeller
        </p>
      </div>
    </aside>
  )
}
