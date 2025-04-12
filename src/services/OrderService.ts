import api from './api'

export enum OrderStatus {
  InProcess = 0,
  InPreparation = 1,
  InPickup = 2,
  OnTheWay = 3,
  Delivered = 4,
  Completed = 5,
  Cancelled = 6
}

export enum PaymentMethod {
  Transfer = 0,
  Cash = 1
}

// Product status enum for order items
export enum ProductStatus {
  InPreparation = 0,
  InPickup = 1,
  OnTheWay = 2
}

interface User {
  id: number
  profilePicture: string
  firstName: string
  lastName: string
  email: string
  phone: string
  isActive: boolean
  role: number
  isConfirmed: boolean
}

interface Product {
  id: number
  name: string
  description: string
  businessId: number
  businessName: string
  isAvailable: boolean
  isActive: boolean
  images: string[]
  price: number
  discountPrice: number
  categoryId: number
  categoryName: string
  capacity: number
  numberOfRatings: number
  averageRating: number
}

interface CustomerAddress {
  id: number
  name: string
  address: string
  municipalityId: number
  municipalityName: string
  provinceId: number
  provinceName: string
}

interface OrderItem {
  id: number
  orderId: number
  product: Product
  productStatus: ProductStatus
  quantity: number
}

export interface Order {
  id: number
  paymentMethod: PaymentMethod
  customerId: number
  customer: User
  courierId?: number
  courier?: User
  items: OrderItem[]
  status: OrderStatus
  shippingCost: number
  totalProductsCost: number
  customerAddressId: number
  customerAddress: CustomerAddress
}

export interface OrderSearchResponse {
  data: Order[]
  totalCount: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface OrderSearchFilter {
  Ids?: number[]
  Status?: OrderStatus[]
  CourierIds?: number[]
  CustomerIds?: number[]
  SortBy?: string
  IsDescending?: boolean
  Page?: number
  PageSize?: number
  Search?: string
}

// Function to get orders with filters
export const getOrdersSearch = async (filters: OrderSearchFilter): Promise<OrderSearchResponse> => {
  try {
    const response = await api.get('/orders/search', { params: filters })

    return response.data
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

// Get order by id (uses the same search endpoint with an id filter)
export const getOrderById = async (id: number): Promise<Order | null> => {
  try {
    const response = await api.get('/orders/search', { params: { Ids: [id] } })

    return response.data.data[0] || null
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error)
    throw error
  }
}

// Get order status text representation
export const getOrderStatusText = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    [OrderStatus.InProcess]: 'En proceso',
    [OrderStatus.InPreparation]: 'En preparación',
    [OrderStatus.InPickup]: 'En recogida',
    [OrderStatus.OnTheWay]: 'En camino',
    [OrderStatus.Delivered]: 'Entregado',
    [OrderStatus.Completed]: 'Completado',
    [OrderStatus.Cancelled]: 'Cancelado'
  }

  return statusMap[status] || 'Desconocido'
}

// Get payment method text representation
export const getPaymentMethodText = (method: PaymentMethod): string => {
  const methodMap: Record<PaymentMethod, string> = {
    [PaymentMethod.Transfer]: 'Transferencia',
    [PaymentMethod.Cash]: 'Efectivo'
  }

  return methodMap[method] || 'Desconocido'
}

// Function to get text representation of product status
export const getProductStatusText = (status: ProductStatus): string => {
  const statusMap: Record<ProductStatus, string> = {
    [ProductStatus.InPreparation]: 'En preparación',
    [ProductStatus.InPickup]: 'En recogida',
    [ProductStatus.OnTheWay]: 'En camino'
  }

  return statusMap[status] || 'Desconocido'
}

// Assign courier to order
export const assignCourierToOrder = async (orderId: number, courierId: number): Promise<any> => {
  try {
    const response = await api.put(`/orders/${orderId}`, {
      orderId,
      courierId
    })

    // Si recibimos data: null, significa que es un 404 que ha sido interceptado
    if (response.data === null) {
      // Creamos un error personalizado para el 404
      const error = new Error('El mensajero no posee un vehículo adecuado para esta orden')

      ;(error as any).status = 404
      throw error
    }

    return response.data
  } catch (error: any) {
    console.error(`Error assigning courier ${courierId} to order ${orderId}:`, error)

    // Asegurarse de que el error se propague correctamente
    throw error
  }
}

// Mark order as completed
export const completeOrder = async (orderId: number): Promise<any> => {
  try {
    const response = await api.put(`/orders/completed/${orderId}`)

    // Si recibimos data: null, significa que es un 404 que ha sido interceptado
    if (response.data === null) {
      const error = new Error('No se pudo completar la orden')

      ;(error as any).status = 404
      throw error
    }

    return response.data
  } catch (error: any) {
    console.error(`Error completing order ${orderId}:`, error)
    throw error
  }
}

// Cancel order
export const cancelOrder = async (orderId: number): Promise<any> => {
  try {
    const response = await api.delete(`/orders/cancel/${orderId}`)

    // Si recibimos data: null, significa que es un 404 que ha sido interceptado
    if (response.data === null) {
      const error = new Error('No se pudo cancelar la orden')

      ;(error as any).status = 404
      throw error
    }

    return response.data
  } catch (error: any) {
    console.error(`Error cancelling order ${orderId}:`, error)
    throw error
  }
}

// Function to update order item status to next status
export const confirmElaboratedOrderItem = async (orderId: number, orderItemId: number): Promise<any> => {
  try {
    // Log completo de los parámetros para depuración
    console.log('confirmElaboratedOrderItem - Parámetros:', {
      orderId: orderId,
      orderItemId: orderItemId,
      endpoint: `/orders/orderitems/${orderItemId}`
    })

    const requestBody = {
      orderId: orderId,
      orderItemId: orderItemId
    }

    // Log del cuerpo de la solicitud
    console.log('confirmElaboratedOrderItem - Request Body:', JSON.stringify(requestBody))

    const response = await api.put(`/orders/orderitems/${orderItemId}`, requestBody)

    // Log de la respuesta
    console.log('confirmElaboratedOrderItem - Respuesta:', response.data)

    if (response.data === null) {
      const error = new Error('No se pudo actualizar el estado del producto')

      ;(error as any).status = 404
      throw error
    }

    return response.data
  } catch (error: any) {
    console.error(`Error updating order item ${orderItemId} for order ${orderId}:`, error)
    throw error
  }
}

// Function to get orders in elaboration
export const getOrdersInElaboration = async (filters: OrderSearchFilter): Promise<OrderSearchResponse> => {
  try {
    const response = await api.get('/orders/search-in-elaboration', { params: filters })

    return response.data
  } catch (error) {
    console.error('Error fetching orders in elaboration:', error)
    throw error
  }
}

// Function to get order details for elaboration
export const getOrderElaborateById = async (orderId: number): Promise<Order> => {
  try {
    const response = await api.get(`/orders/elaborate/${orderId}`)

    return response.data
  } catch (error) {
    console.error(`Error fetching elaborate order ${orderId}:`, error)
    throw error
  }
}
