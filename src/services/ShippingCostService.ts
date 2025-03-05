import api from './api'

// Crea un costo de envío
export const createShippingCost = async (data: { municipalityId: number; vehicleTypeId: number; cost: number }) => {
  try {
    const response = await api.post('/shippingcost', data)

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al crear costo de envío' }
    }

    throw { status: 500, message: 'Error al crear costo de envío' }
  }
}

// Obtiene un costo de envío por ID
export const getShippingCost = async (id: number) => {
  try {
    const response = await api.get(`/shippingcost/${id}`)

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener costo de envío')
  }
}

// Actualiza un costo de envío por ID
export const updateShippingCost = async (
  id: number,
  data: {
    cost: number
  }
) => {
  try {
    const response = await api.put(`/shippingcost/${id}`, data)

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al actualizar costo de envío' }
    }

    throw { status: 500, message: 'Error al actualizar costo de envío' }
  }
}

// Elimina un costo de envío por ID
export const deleteShippingCost = async (id: number) => {
  try {
    const response = await api.delete(`/shippingcost/${id}`)

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al eliminar costo de envío')
  }
}

// Busca costos de envío
export const getShippingCostsSearch = async (filters: any) => {
  try {
    const response = await api.get('/shippingcost/search', { params: filters })

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al buscar costos de envío')
  }
}
