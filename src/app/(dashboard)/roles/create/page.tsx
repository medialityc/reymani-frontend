import React from 'react'

import Typography from '@mui/material/Typography'

import CreateRolForm from '@/views/roles/CreateRolForm'

export default function CreateRolPage() {
  return (
    <div>
      <Typography variant='h2'>Crear Rol</Typography>
      <CreateRolForm />
    </div>
  )
}
