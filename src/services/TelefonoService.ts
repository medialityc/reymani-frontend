import type { UpdateTelefonoRequest } from './../types/requests/UpdateTelefonoRequest'
import api from './api'
import type { TelefonoDto } from '@/types/dtos/TelefonoDto'
import type { CreateTelefonoRequest } from '@/types/requests/CreateTelefonoRequest'
import type { GetAllTelefonosResponse } from '@/types/responses/GetAllTelefonosResponse'

export const fetchTelefonos = async (): Promise<TelefonoDto[]> => {
  try {
    const response = await api.get<GetAllTelefonosResponse>('/telefono')

    return response.data.telefonos
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    return []
  }
}

export const fetchTelefono = async (id: string): Promise<TelefonoDto> => {
  try {
    const response = await api.get<TelefonoDto>(`/telefono/${id}`)

    return response.data
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    if (error.response && error.response.status === 404) {
      throw new Error('Teléfono no encontrado')
    }

    throw new Error('Error obteniendo teléfono')
  }
}

export const createTelefono = async (telefonoData: CreateTelefonoRequest): Promise<void> => {
  try {
    await api.post('/telefono', telefonoData)
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    if (error.response && error.response.status === 400) {
      throw error
    }
  }
}

export const updateTelefono = async (id: string, UpdateTelefonoRequest: UpdateTelefonoRequest): Promise<void> => {
  try {
    await api.put(`/telefono/${id}`, UpdateTelefonoRequest)
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    if (error.response && error.response.status === 400) {
      throw error
    }
  }
}

export const deleteTelefono = async (id: string): Promise<void> => {
  try {
    await api.delete(`/telefono/${id}`)
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    if (error.response && error.response.status === 404) {
      throw new Error('Teléfono no encontrado')
    }

    throw new Error('Error eliminando teléfono')
  }
}
