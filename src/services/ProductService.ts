import api from './api'

/**
 * Obtiene los productos del administrador del negocio autenticado
 * @returns Lista de productos del negocio del administrador
 */
export const getMyProducts = async () => {
  try {
    const response = await api.get('/products/my')

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener productos')
  }
}

/**
 * Obtiene los productos del administrador del negocio autenticado con filtros
 * @param filters Filtros para la búsqueda
 * @returns Lista de productos del negocio del administrador con paginación
 */
export const getMyProductsSearch = async (filters: any) => {
  try {
    const response = await api.get('/products/my/search', { params: filters })

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener productos')
  }
}

/**
 * Crea un nuevo producto para el negocio del administrador autenticado
 * @param data FormData con la información del producto
 * @returns Información del producto creado
 */
export const createMyProduct = async (data: FormData) => {
  try {
    const response = await api.post('/products/my', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al crear producto' }
    }

    throw { status: 500, message: 'Error al crear producto' }
  }
}

/**
 * Actualiza un producto existente del negocio del administrador autenticado
 * @param id ID del producto a actualizar
 * @param data FormData con la información actualizada del producto
 * @returns Información del producto actualizado
 */
export const updateMyProduct = async (id: number, data: FormData) => {
  try {
    const response = await api.put(`/products/my/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al actualizar producto' }
    }

    throw { status: 500, message: 'Error al actualizar producto' }
  }
}

/**
 * Elimina un producto del negocio del administrador autenticado
 * @param id ID del producto a eliminar
 * @returns Resultado de la operación
 */
export const deleteMyProduct = async (id: number) => {
  try {
    const response = await api.delete(`/products/my/${id}`)

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      if (status === 409) {
        throw {
          status,
          message:
            data?.message || 'No es posible eliminar el producto porque se encuentra en uno o más carritos de compra'
        }
      }

      throw { status, message: data?.message || 'Error al eliminar producto' }
    }

    throw { status: 500, message: 'Error al eliminar producto' }
  }
}

/**
 * Obtiene los productos con filtros (para administrador del sistema)
 * @param filters Filtros para la búsqueda
 * @returns Lista de productos con paginación
 */
export const getProductsSystemAdminSearch = async (filters: any) => {
  try {
    const response = await api.get('/products/system-admin/search', { params: filters })

    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener productos')
  }
}

/**
 * Crea un nuevo producto (para administrador del sistema)
 * @param data FormData con la información del producto
 * @returns Información del producto creado
 */
export const createProduct = async (data: FormData) => {
  try {
    const response = await api.post('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al crear producto' }
    }

    throw { status: 500, message: 'Error al crear producto' }
  }
}

/**
 * Actualiza un producto existente (para administrador del sistema)
 * @param id ID del producto a actualizar
 * @param data FormData con la información actualizada del producto
 * @returns Información del producto actualizado
 */
export const updateProduct = async (id: number, data: FormData) => {
  try {
    const response = await api.put(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      throw { status, message: data?.message || 'Error al actualizar producto' }
    }

    throw { status: 500, message: 'Error al actualizar producto' }
  }
}

/**
 * Elimina un producto (para administrador del sistema)
 * @param id ID del producto a eliminar
 * @returns Resultado de la operación
 */
export const deleteProduct = async (id: number) => {
  try {
    const response = await api.delete(`/products/${id}`)

    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response

      if (status === 409) {
        throw {
          status,
          message:
            data?.message || 'No es posible eliminar el producto porque se encuentra en uno o más carritos de compra'
        }
      }

      throw { status, message: data?.message || 'Error al eliminar producto' }
    }

    throw { status: 500, message: 'Error al eliminar producto' }
  }
}
