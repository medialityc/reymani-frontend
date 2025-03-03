import api from './api'

/**
 * Obtiene todas las categorías disponibles
 * @returns Lista de categorías
 */
export const getCategories = async () => {
  try {
    const response = await api.get('/product-categories')

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener categorías')
  }
}
