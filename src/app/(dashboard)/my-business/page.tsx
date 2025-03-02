import React from 'react'

import Typography from '@mui/material/Typography'

import UpdateMyBusiness from '@/views/business/UpdateMyBusiness'

export default function UsersPage() {
  return (
    <div>
      <Typography variant='h2' className='mb-4'>
        Mi Negocio
      </Typography>
      <UpdateMyBusiness />
    </div>
  )
}
