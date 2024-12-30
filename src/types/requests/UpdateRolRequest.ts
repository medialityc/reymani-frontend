import type { RolDto } from '@/types/dtos/RolDto'

export interface UpdateRolRequest {
  RolId: string
  Rol: RolDto
  Permisos: string[]
}
