import React from 'react'

import Typography from '@mui/material/Typography'

import CreateTelefonoForm from '@/views/telefonos/CreateTelefonoForm'

export default function CreateTelefonoPage() {
  return (
    <div>
      <Typography variant='h2'>Crear Teléfono</Typography>
      <CreateTelefonoForm />
    </div>
  )
}
