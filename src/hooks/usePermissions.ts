import { useState, useEffect } from 'react'

const usePermissions = () => {
  const [permissions, setPermissions] = useState<string[]>([])

  // Carga inicial de permisos desde localStorage (solo en el usuario)
  useEffect(() => {
    const storedPermissions = localStorage.getItem('permissions')

    if (storedPermissions) {
      setPermissions(JSON.parse(storedPermissions))
    }
  }, [])

  // Guardar permisos en localStorage y en el estado
  const savePermissions = (newPermissions: string[]) => {
    setPermissions(newPermissions)
    localStorage.setItem('permissions', JSON.stringify(newPermissions))
  }

  // Obtener los permisos actuales
  const getPermissions = (): string[] => {
    return permissions
  }

  // Eliminar permisos de localStorage y del estado
  const removePermissions = () => {
    setPermissions([])
    localStorage.removeItem('permissions')
  }

  // Verificar si un permiso existe
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission)
  }

  return { permissions, savePermissions, getPermissions, removePermissions, hasPermission }
}

export default usePermissions
