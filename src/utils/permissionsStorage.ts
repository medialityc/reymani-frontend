export const savePermissions = (permissions: string[]) => {
  localStorage.setItem('permissions', JSON.stringify(permissions))
}

export const getPermissions = (): string[] => {
  const permissions = localStorage.getItem('permissions')

  return permissions ? JSON.parse(permissions) : []
}

export const removePermissions = () => {
  localStorage.removeItem('permissions')
}

export const hasPermission = (permission: string): boolean => {
  const permissions = getPermissions()

  return permissions.includes(permission)
}
