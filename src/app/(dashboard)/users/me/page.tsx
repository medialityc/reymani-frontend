import React from 'react'

import Typography from '@mui/material/Typography'

import UpdateUser from '@/views/users/UpdateUser'

export default function CreateRolPage() {
  return (
    <div>
      <Typography variant='h2'>Mi Perfil</Typography>
      <UpdateUser />
    </div>
  )
}
