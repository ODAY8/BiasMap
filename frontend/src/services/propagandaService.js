import { api } from './api'

export async function getPropagandaTechniques() {
  return api.get('/propaganda-techniques')
}

export async function getPropagandaTechniqueById(id) {
  return api.get(`/propaganda-techniques/${id}`)
}
