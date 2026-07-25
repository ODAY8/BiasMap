import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Search, GitCompare, BookOpen,
  Trophy, BarChart2, Settings, X, Zap, Clock, LogIn, LogOut, User,
  MessageCircle, FileText, ShieldAlert, Microscope, Shield
} from 'lucide-react'
import clsx from 'clsx'
import { useApp } from '@/context/AppContext'
import { useUser } from '@/context/UserContext'

const navItems = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/analyze',      icon: Search,          label: 'Analyze'      },
  { to: '/deep-analyze', icon: Microscope,      label: 'Deep Analyze' },
  { to: '/compare',      icon: GitCompare,      label: 'Compare'      },
  { to: '/learn',        icon: BookOpen,        label: 'Learn'        },
  { to: '/challenge',    icon: Trophy,          label: 'Challenge'    },
  { to: '/coach',        icon: MessageCircle,   label: 'Coach'        },
  { to: '/progress',     icon: BarChart2,       label: 'Progress'     },
  { to: '/recent',       icon: Clock,           label: 'Recent'       },
  { to: '/reports',      icon: FileText,        label: 'Reports'      },
  { to: '/propaganda',   icon: ShieldAlert,     label: 'Techniques'   },
  { to: '/profile',      icon: User,            label: 'Profile'      },
]

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useApp()
  const { user, isGuest, logout } = useUser()
  const navigate = useNavigate()

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={clsx(
        'fixed top-0 left-0 h-full z-30 flex flex-col bg-surface border-r border-border transition-transform duration-300 w-56',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0 lg:static lg:z-auto'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <motion.div
              className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </motion.div>
            <span className="font-bold text-sm text-text-primary tracking-tight">BiasMap</span>
          </button>
          <button className="lg:hidden text-text-muted hover:text-text-primary transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} end={to === '/'}
              className={({ isActive }) => clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon className={clsx('w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'
                  )} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-border space-y-0.5">
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive ? 'bg-danger/10 text-danger' : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              )}
            >
              {({ isActive }) => (
                <>
                  <Shield className={clsx('w-4 h-4 shrink-0', isActive ? 'text-danger' : 'text-text-muted')} />
                  <span>Admin</span>
                </>
              )}
            </NavLink>
          )}

          <NavLink
            to="/settings"
            className={({ isActive }) => clsx(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
              isActive ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
            )}
          >
            {({ isActive }) => (
              <>
                <Settings className={clsx('w-4 h-4 shrink-0', isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary')} />
                <span>Settings</span>
              </>
            )}
          </NavLink>

          <div className="px-3 py-2 mt-1">
            {isGuest ? (
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center gap-2.5 text-sm text-text-muted hover:text-primary transition-colors group"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span>Sign in</span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{user?.name}</p>
                </div>
                <button onClick={logout} className="text-text-muted hover:text-danger transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
