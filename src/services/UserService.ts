import api from './api'

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me')

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener datos del usuario')
  }
}

export const updateCurrentUser = async (data: FormData) => {
  try {
    const response = await api.put('/users/me', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al actualizar el usuario' }
    }

    throw { status: 500, message: 'Error al actualizar el usuario' }
  }
}

export const getUsersSearch = async (filters: any) => {
  try {
    const response = await api.get('/users/search', { params: filters })

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener usuarios')
  }
}

export const createUser = async (data: FormData) => {
  try {
    const response = await api.post('/users', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al crear usuario' }
    }

    throw { status: 500, message: 'Error al crear usuario' }
  }
}

export const updateUser = async (id: number, data: FormData) => {
  try {
    const response = await api.put(`/users/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al actualizar usuario' }
    }

    throw { status: 500, message: 'Error al actualizar usuario' }
  }
}

export const deleteUser = async (id: number) => {
  try {
    const response = await api.delete(`/users/${id}`)

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al eliminar usuario')
  }
}

export const getBusinessAdminUsers = async () => {
  try {
    const response = await api.get('/users/search', { params: { roles: 2 } })

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener administradores de negocio')
  }
}

export const getCouriersUsers = async () => {
  try {
    const response = await api.get('/users/search', { params: { roles: 1 } })

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener mensajeros')
  }
}
