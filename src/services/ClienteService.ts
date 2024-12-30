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
