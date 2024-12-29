import axios from 'axios'

import { getToken } from '../utils/tokenStorage'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL
})

api.interceptors.request.use(config => {
  if (config.url !== '/auth/login') {
    const token = getToken()

    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
