import api from './api'

export const getProductCategoriesSearch = async (filters: any) => {
  try {
    const response = await api.get('/product-categories/search/system-admin', { params: filters })

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener categorías de productos')
  }
}

export const createProductCategory = async (data: FormData) => {
  try {
    const response = await api.post('/product-categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al crear categoría de producto' }
    }

    throw { status: 500, message: 'Error al crear categoría de producto' }
  }
}

export const updateProductCategory = async (id: number, data: FormData) => {
  try {
    const response = await api.put(`/product-categories/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al actualizar categoría de producto' }
    }

    throw { status: 500, message: 'Error al actualizar categoría de producto' }
  }
}

export const deleteProductCategory = async (id: number) => {
  try {
    const response = await api.delete(`/product-categories/${id}`)

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al eliminar categoría de producto')
  }
}
