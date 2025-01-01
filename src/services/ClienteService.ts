import type { ClienteDto } from '@/types/dtos/ClienteDto'
import api from './api'
import type { GetAllClienteResponse } from '@/types/responses/GetAllClienteResponse'

export const fetchClientes = async (): Promise<ClienteDto[]> => {
  try {
    const response = await api.get<GetAllClienteResponse>('/cliente')

    return response.data.clientes
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
