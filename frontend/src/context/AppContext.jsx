import { createContext, useContext, useState, useEffect } from 'react'
import { getSettings, updateSettings } from '@/services/settingsService'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  const saveSettings = async (patch) => {
    const updated = await updateSettings(patch)
    setSettings(updated)
  }

  return (
    <AppContext.Provider value={{ settings, saveSettings, sidebarOpen, setSidebarOpen }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
