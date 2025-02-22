import React from 'react'

import Typography from '@mui/material/Typography'

import UsersTable from '@/views/users/UsersTable'

export default function UsersPage() {
  return (
    <div>
      <Typography variant='h2'>Usuarios</Typography>
      <UsersTable></UsersTable>
    </div>
  )
}
