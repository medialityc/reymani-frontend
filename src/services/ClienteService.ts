import type { ClienteDto } from '@/types/dtos/ClienteDto'
import api from './api'
import type { GetAllClienteResponse } from '@/types/responses/GetAllClienteResponse'
import type { ChangeClienteStatusRequest } from '@/types/requests/ChangeClienteStatusRequest'

export const fetchClientes = async (): Promise<ClienteDto[]> => {
  try {
    const response = await api.get<GetAllClienteResponse>('/cliente')

    console.log('API response:', response.data) // Debugging line

    return response.data.clientes.map(cliente => ({
      id: cliente.id,
      numeroCarnet: cliente.numeroCarnet,
      nombre: cliente.nombre,
      apellidos: cliente.apellidos,
      username: cliente.username,
      activo: cliente.activo // Ensure this field is correctly mapped
    }))
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    return []
  }
}

export const deleteCliente = async (id: string): Promise<void> => {
  try {
    await api.delete(`/cliente/${id}`)
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    if (error.response && error.response.status === 404) {
      throw new Error('Cliente no encontrado')
    }

    throw new Error('Error eliminando cliente')
  }
}

export const changeClienteStatus = async (request: ChangeClienteStatusRequest): Promise<void> => {
  try {
    await api.put(`/cliente/${request.id}/status`, request)
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    if (error.response && error.response.status === 404) {
      throw new Error('Cliente no encontrado')
    }

    throw new Error('Error cambiando el estado del cliente')
  }
}

export const fetchCliente = async (id: string): Promise<ClienteDto> => {
  try {
    const response = await api.get<ClienteDto>(`/cliente/${id}`)

    return response.data
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    if (error.response && error.response.status === 404) {
      throw new Error('Cliente no encontrado')
    }

    throw new Error('Error obteniendo cliente')
  }
}
