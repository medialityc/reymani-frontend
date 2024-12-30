import type { PermisoDto } from '@/types/dtos/PermisoDto'
import api from './api'
import type { GetAllPermisoResponse } from '@/types/responses/GetAllPermisosResponse'

export const fetchPermisos = async (): Promise<PermisoDto[]> => {
  try {
    const response = await api.get<GetAllPermisoResponse>('/permiso')

    return response.data.permisos
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw error
    }

    return []
  }
}
