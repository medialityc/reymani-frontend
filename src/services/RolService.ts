import type { GetAllRolesResponse } from '@/types/responses/GetAllRolesResponse'
import api from './api'
import type { RolDto } from '@/types/dtos/RolDto'
import type { CreateRolRequest } from '@/types/requests/CreateRolRequest'

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
