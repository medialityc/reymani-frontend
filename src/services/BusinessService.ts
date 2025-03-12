import api from './api'

// Crea un negocio
export const createBusiness = async (data: FormData) => {
  try {
    const response = await api.post('/business', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al crear negocio' }
    }

    throw { status: 500, message: 'Error al crear negocio' }
  }
}

/**
 * Obtiene todos los negocios para el administrador del sistema
 * @returns Lista de negocios
 */
export const getBusiness = async () => {
  try {
    const response = await api.get('/business')

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener negocios')
  }
}

// Actualiza un negocio por ID
export const updateBusiness = async (id: number, data: FormData) => {
  try {
    const response = await api.put(`/business/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al actualizar negocio' }
    }

    throw { status: 500, message: 'Error al actualizar negocio' }
  }
}

// Elimina un negocio por ID
export const deleteBusiness = async (id: number) => {
  try {
    const response = await api.delete(`/business/${id}`)

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al eliminar negocio')
  }
}

// Busca negocios (endpoint administrador de sistema)
export const getBusinessSystemAdminSearch = async (filters: any) => {
  try {
    const response = await api.get('/business/system-admin/search', { params: filters })

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al buscar negocios')
  }
}

export const getMyBusiness = async () => {
  try {
    const response = await api.get('/business/mine')

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener mi negocio')
  }
}

export const updateMyBusiness = async (data: FormData) => {
  try {
    const response = await api.put('/business/mine', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al actualizar mi negocio' }
    }

    throw { status: 500, message: 'Error al actualizar mi negocio' }
  }
}
