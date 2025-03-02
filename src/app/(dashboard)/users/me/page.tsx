import React from 'react'

import Typography from '@mui/material/Typography'

import UpdateMe from '@/views/users/UpdateMe'
import ChangePassword from '@/views/auth/ChangePassword'

export default function UpdateMePage() {
  return (
    <div>
      <Typography variant='h2'>Mi Perfil</Typography>
      <UpdateMe />
      <div style={{ marginTop: '20px' }}>
        <ChangePassword />
      </div>
    </div>
  )
}
