import api from './api'

export const getProvinces = async () => {
  try {
    const response = await api.get('/provinces')

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener provincias')
  }
}
