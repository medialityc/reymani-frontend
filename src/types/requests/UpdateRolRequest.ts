import type { RolDto } from './../dtos/RolDto'

export type UpdateRolRequest = {
  rol: RolDto
  permisos: string[]
}
