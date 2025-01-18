'use client'

import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import { Button } from '@mui/material'

import TelefonosTable from '@/views/telefonos/TelefonosTable'
import usePermissions from '@/hooks/usePermissions'

// React Imports

const TelefonosPage = () => {
  const { hasPermission } = usePermissions()
  const router = useRouter()

  const handleCreateRole = () => {
    router.push('/telefonos/create')
  }

  return (
    <div>
      <Typography variant='h2'>Teléfonos</Typography>
      {hasPermission('Crear_Rol') && (
        <Button variant='contained' color='primary' onClick={handleCreateRole}>
          Crear Teléfono
        </Button>
      )}
      {<TelefonosTable />}
    </div>
  )
}

export default TelefonosPage
