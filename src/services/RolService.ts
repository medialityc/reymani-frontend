import type { GetAllRolesResponse } from '@/types/responses/GetAllRolesResponse'
import api from './api'
import type { RolDto } from '@/types/dtos/RolDto'
import type { CreateRolRequest } from '@/types/requests/CreateRolRequest'
import type { PermisoDto } from '@/types/dtos/PermisoDto'
import type { UpdateRolRequest } from '@/types/requests/UpdateRolRequest'

export const fetchRoles = async (): Promise<RolDto[]> => {
  try {
    const response = await api.get<GetAllRolesResponse>('/rol')

    return response.data.roles
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    return []
  }
}

export const createRol = async (rolData: CreateRolRequest): Promise<void> => {
  try {
    console.log(rolData)
    await api.post('/rol', rolData)
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    if (error.response && error.response.status === 400) {
      throw error
    }
  }
}

export const fetchRol = async (id: string): Promise<RolDto> => {
  try {
    const response = await api.get<RolDto>(`/rol/${id}`)

    return response.data
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    if (error.response && error.response.status === 404) {
      throw new Error('Rol no encontrado')
    }

    throw new Error('Error obteniendo rol')
  }
}

export const updateRol = async (id: string, rolData: RolDto, permisos: string[]): Promise<void> => {
  try {
    const updateRolRequest: UpdateRolRequest = {
      RolId: id,
      Rol: rolData,
      Permisos: permisos
    }

    await api.put(`/rol/${id}`, updateRolRequest)
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    if (error.response && error.response.status === 400) {
      throw error
    }
  }
}

export const getRolePermissions = async (id: string): Promise<PermisoDto[]> => {
  try {
    const response = await api.get(`/rol/get-rol-permissions?rolId=${id}`)

    return response.data.permisos
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    if (error.response && error.response.status === 404) {
      throw new Error('Rol no encontrado')
    }

    return []
  }
}

export const deleteRol = async (id: string): Promise<void> => {
  try {
    await api.delete(`/rol/${id}`)
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    if (error.response && error.response.status === 404) {
      throw new Error('Rol no encontrado')
    }

    throw new Error('Error eliminando rol')
  }
}
