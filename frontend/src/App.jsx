import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { UserProvider, useUser } from '@/context/UserContext'
import { ToastProvider } from '@/context/ToastContext'
import SplashScreen, { hasSeenOnboarding } from '@/components/ui/SplashScreen'
import AuthModal from '@/components/ui/AuthModal'
import AppLayout from '@/components/layout/AppLayout'
import DashboardPage    from '@/pages/DashboardPage'
import AnalyzePage      from '@/pages/AnalyzePage'
import DeepAnalyzePage  from '@/pages/DeepAnalyzePage'
import ComparePage      from '@/pages/ComparePage'
import LearnPage        from '@/pages/LearnPage'
import ChallengePage    from '@/pages/ChallengePage'
import ProgressPage     from '@/pages/ProgressPage'
import SettingsPage     from '@/pages/SettingsPage'
import RecentPage       from '@/pages/RecentPage'
import ProfilePage      from '@/pages/ProfilePage'
import CoachPage        from '@/pages/CoachPage'
import ReportsPage      from '@/pages/ReportsPage'
import PropagandaPage   from '@/pages/PropagandaPage'
import AdminPage        from '@/pages/AdminPage'
import NotFoundPage     from '@/pages/NotFoundPage'

function AppShell() {
  const { user, ready } = useUser()
  const [splashDone, setSplashDone] = useState(() => hasSeenOnboarding())

  if (!splashDone) return <SplashScreen onDone={() => setSplashDone(true)} />
  if (ready && !user) return <AuthModal />

  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/"            element={<DashboardPage />} />
            <Route path="/analyze"     element={<AnalyzePage />} />
            <Route path="/deep-analyze" element={<DeepAnalyzePage />} />
            <Route path="/compare"     element={<ComparePage />} />
            <Route path="/learn"       element={<LearnPage />} />
            <Route path="/challenge"   element={<ChallengePage />} />
            <Route path="/progress"    element={<ProgressPage />} />
            <Route path="/recent"      element={<RecentPage />} />
            <Route path="/profile"     element={<ProfilePage />} />
            <Route path="/coach"       element={<CoachPage />} />
            <Route path="/reports"     element={<ReportsPage />} />
            <Route path="/propaganda"  element={<PropagandaPage />} />
            <Route path="/admin"       element={<AdminPage />} />
            <Route path="/settings"    element={<SettingsPage />} />
            <Route path="*"            element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <UserProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </UserProvider>
  )
}
