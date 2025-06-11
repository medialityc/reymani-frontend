// services/useActiveConfirmedCouriers.ts
import { useEffect, useState } from 'react'

import { getCouriersUsers } from './UserService'

export interface Courier {
  id: number
  firstName: string
  lastName: string
  phone: string
  isActive: boolean
  isConfirmed: boolean
}

export function useActiveConfirmedCouriers() {
  const [couriers, setCouriers] = useState<Courier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCouriers = async () => {
      try {
        const response = await getCouriersUsers()

        if (!response || !Array.isArray(response.data)) {
          throw new Error('La API no devolvió datos válidos')
        }

        const activosYConfirmados = response.data.filter(
          (c: Courier) => c.isActive && c.isConfirmed
        )

        setCouriers(activosYConfirmados)
      } catch (err) {
        console.error('Error al cargar mensajeros:', err)
        setCouriers([])
      } finally {
        setLoading(false)
      }
    }

    fetchCouriers()
  }, [])

  return { couriers, loading }
}
