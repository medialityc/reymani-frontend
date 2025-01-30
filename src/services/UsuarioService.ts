import type { UsuarioDto } from '@/types/dtos/UsuarioDto'
import api from './api'
import type { GetAllUsuarioResponse } from '@/types/responses/GetAllUsuarioResponse'
import type { ChangeUsuarioStatusRequest } from '@/types/requests/ChangeUsuarioStatusRequest'

export const fetchUsuarios = async (): Promise<UsuarioDto[]> => {
  try {
    const response = await api.get<GetAllUsuarioResponse>('/usuario')

    console.log('API response:', response.data) // Debugging line

    return response.data.usuarios.map(usuario => ({
      id: usuario.id,
      numeroCarnet: usuario.numeroCarnet,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      username: usuario.username,
      activo: usuario.activo // Ensure this field is correctly mapped
    }))
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    return []
  }
}

export const deleteUsuario = async (id: string): Promise<void> => {
  try {
    await api.delete(`/usuario/${id}`)
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    if (error.response && error.response.status === 404) {
      throw new Error('Usuario no encontrado')
    }

    throw new Error('Error eliminando usuario')
  }
}

export const changeUsuarioStatus = async (request: ChangeUsuarioStatusRequest): Promise<void> => {
  try {
    await api.put(`/usuario/${request.id}/status`, request)
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    if (error.response && error.response.status === 404) {
      throw new Error('Usuario no encontrado')
    }

    throw new Error('Error cambiando el estado del usuario')
  }
}

export const fetchUsuario = async (id: string): Promise<UsuarioDto> => {
  try {
    const response = await api.get<UsuarioDto>(`/usuario/${id}`)

    return response.data
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    if (error.response && error.response.status === 404) {
      throw new Error('Usuario no encontrado')
    }

    throw new Error('Error obteniendo usuario')
  }
}
