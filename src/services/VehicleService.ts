import api from './api'

export const getVehiclesSearch = async (filters: any) => {
  try {
    const response = await api.get('/vehicles/admin/search', { params: filters })

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener vehículos')
  }
}

export const getVehiclesByCourierId = async (userId: number) => {
  try {
    // El API espera que los parámetros se pasen con nombres en minúsculas
    // Y userIds debe pasarse como un parámetro separado para cada valor (formato de array en query)
    const response = await api.get('/vehicles/admin/search', {
      params: {
        userIds: userId // Esto será transformado a userIds=3 en la URL
      }
    })

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener vehículos del mensajero')
  }
}

export const createVehicle = async (data: FormData) => {
  try {
    const response = await api.post('/vehicles/admin', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al crear vehículo' }
    }

    throw { status: 500, message: 'Error al crear vehículo' }
  }
}

export const updateVehicle = async (id: number, data: FormData) => {
  try {
    const response = await api.put(`/vehicles/admin/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al actualizar vehículo' }
    }

    throw { status: 500, message: 'Error al actualizar vehículo' }
  }
}

export const deleteVehicle = async (id: number) => {
  try {
    const response = await api.delete(`/vehicles/${id}`)

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al eliminar vehículo')
  }
}
