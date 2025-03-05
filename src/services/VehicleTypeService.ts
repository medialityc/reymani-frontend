import api from './api'

export const getVehicleTypesSearch = async (filters: any) => {
  try {
    const response = await api.get('/vehiclesTypes/admin/search', { params: filters })

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener tipos de vehículos')
  }
}

export const createVehicleType = async (data: FormData) => {
  try {
    const response = await api.post('/vehiclesTypes', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al crear tipo de vehículo' }
    }

    throw { status: 500, message: 'Error al crear tipo de vehículo' }
  }
}

export const updateVehicleType = async (id: number, data: FormData) => {
  try {
    // Log the FormData contents for debugging (optional)
    // for (const pair of data.entries()) {
    //   console.log(`${pair[0]}: ${pair[1]}`);
    // }

    const response = await api.put(`/vehiclesTypes/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    // Log the full error for debugging
    console.error('API Error:', error.response || error)

    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al actualizar tipo de vehículo' }
    }

    throw { status: 500, message: 'Error al actualizar tipo de vehículo' }
  }
}

export const deleteVehicleType = async (id: number) => {
  try {
    const response = await api.delete(`/vehiclesTypes/${id}`)

    return response.data
  } catch (error: any) {
    // Pass back the full error info including status code
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al eliminar tipo de vehículo' }
    }

    throw new Error(error.message || 'Error al eliminar tipo de vehículo')
  }
}

export const getVehicleTypeById = async (id: number) => {
  try {
    const response = await api.get(`/vehiclesTypes/${id}`)

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener tipo de vehículo')
  }
}
