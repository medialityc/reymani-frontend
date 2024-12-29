import type { PermisoDto } from '@/types/dtos/PermisoDto'
import api from './api'
import type { GetAllPermisoResponse } from '@/types/responses/GetAllPermisosResponse'

export const fetchPermisos = async (): Promise<PermisoDto[]> => {
  try {
    const response = await api.get<GetAllPermisoResponse>('/permiso')

    if (Array.isArray(response.data.permisos)) {
      return response.data.permisos
    } else {
      console.error('API response permisos is not an array:', response.data.permisos)

      return []
    }
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    console.error('Error fetching permisos:', error)

    return []
  }
}
