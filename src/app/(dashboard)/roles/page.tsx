'use client'

import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import { Button } from '@mui/material'

import RolesTable from '@/views/roles/RolesTable'
import usePermissions from '@/hooks/usePermissions'

// React Imports

const RolesPage = () => {
  const { hasPermission } = usePermissions()
  const router = useRouter()

  const handleCreateRole = () => {
    router.push('/roles/create')
  }

  return (
    <div>
      <Typography variant='h2'>Roles</Typography>
      {hasPermission('Crear_Rol') && (
        <Button variant='contained' color='primary' onClick={handleCreateRole}>
          Crear Rol
        </Button>
      )}
      {<RolesTable />}
    </div>
  )
}

export default RolesPage
