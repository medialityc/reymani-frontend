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

// Assign courier to order
export const assignCourierToOrder = async (orderId: number, courierId: number): Promise<any> => {
  try {
    const response = await api.put(`/orders/${orderId}`, {
      orderId,
      courierId
    })

    console.log(orderId, courierId)
    console.log(response)

    return response.data
  } catch (error) {
    console.error(`Error assigning courier ${courierId} to order ${orderId}:`, error)
    throw error
  }
}
