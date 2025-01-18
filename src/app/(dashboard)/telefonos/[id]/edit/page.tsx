import React from 'react'

import Typography from '@mui/material/Typography'

import EditTelefonoForm from '@/views/telefonos/EditTelefonoForm'

export default function EditTelefonoPage() {
  return (
    <div>
      <Typography variant='h2'>Editar Teléfono</Typography>
      <EditTelefonoForm />
    </div>
  )
}
