import { Menu, Bell, User, LogOut } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useUser } from '@/context/UserContext'
import { useToast } from '@/context/ToastContext'
import { useLocation } from 'react-router-dom'
import Tooltip from '@/components/ui/Tooltip'

const pageTitles = {
  '/':             'Dashboard',
  '/analyze':      'Analyze',
  '/deep-analyze': 'Deep Analyze',
  '/compare':      'Compare',
  '/learn':        'Learn',
  '/challenge':    'Challenge',
  '/coach':        'Coach',
  '/progress':     'Progress',
  '/recent':       'Recent',
  '/reports':      'Reports',
  '/propaganda':   'Techniques',
  '/profile':      'Profile',
  '/settings':     'Settings',
  '/admin':        'Admin',
}

export default function Header() {
  const { setSidebarOpen } = useApp()
  const { user, isGuest, logout } = useUser()
  const toast = useToast()
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'BiasMap'

  const handleLogout = async () => {
    await logout()
    toast.info('Signed out')
  }

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-sm flex items-center justify-between px-5 shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden text-text-muted hover:text-text-primary transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-semibold text-text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        <Tooltip content="Notifications">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors relative">
            <Bell className="w-4 h-4" />
            {!isGuest && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            )}
          </button>
        </Tooltip>

        {isGuest ? (
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-1 rounded-md text-xs font-medium text-warning bg-warning/10 border border-warning/20">
              Guest
            </span>
            <Tooltip content="Sign out">
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Tooltip content={user?.name || 'Profile'}>
              <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center cursor-default">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
            </Tooltip>
            <Tooltip content="Sign out">
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </header>
  )
}
