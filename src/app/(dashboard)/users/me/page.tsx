import React from 'react'

import Typography from '@mui/material/Typography'

import UpdateMe from '@/views/users/UpdateMe'

export default function UpdateMePage() {
  return (
    <div>
      <Typography variant='h2'>Mi Perfil</Typography>
      <UpdateMe />
    </div>
  )
}
