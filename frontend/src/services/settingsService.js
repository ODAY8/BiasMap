import settingsData from '@/mock/settings.json'

const delay = (ms = 800) => new Promise((res) => setTimeout(res, ms))

let localSettings = { ...settingsData }

export async function getSettings() {
  await delay(400)
  // Replace with: return axios.get('/api/settings').then(r => r.data)
  return localSettings
}

export async function updateSettings(patch) {
  await delay(600)
  // Replace with: return axios.put('/api/settings', patch).then(r => r.data)
  localSettings = { ...localSettings, ...patch }
  return localSettings
}
