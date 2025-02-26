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

// Obtiene un negocio por ID
export const getBusiness = async (id: number) => {
  try {
    const response = await api.get(`/business/${id}`)

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener negocio')
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
