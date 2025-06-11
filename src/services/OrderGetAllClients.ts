import { useEffect, useState } from 'react'

import { getUsersSearch } from '../services/UserService'

interface User {
  id: number
  firstName: string
  lastName: string
  phone: string
  role: number
}

export function useAllClientes() {
  const [clientes, setClientes] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAllClientes() {
      setLoading(true)
      setError(null)

      let page = 1
      const pageSize = 100
      let allClientes: User[] = []

      try {
        while (true) {
          const response = await getUsersSearch({
            Search: '',
            Page: page,
            PageSize: pageSize,
            SortBy: 'FirstName',
            IsDescending: false
          })

          if (!response || !Array.isArray(response.data)) {
            throw new Error('Respuesta inválida de la API')
          }

          const soloClientes = response.data.filter((u: User) => u.role === 0)
          
          allClientes = allClientes.concat(soloClientes)

          if (response.data.length < pageSize) {
            break
          }

          page++
        }

        setClientes(allClientes)
      } catch (e: any) {
        setError(e.message || 'Error al cargar clientes')
        setClientes([])
      } finally {
        setLoading(false)
      }
    }

    fetchAllClientes()
  }, [])

  return { clientes, loading, error }
}
