import type { GetAllRolesResponse } from '@/types/responses/GetAllRolesResponse'
import api from './api'
import type { RolDto } from '@/types/dtos/RolDto'

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
