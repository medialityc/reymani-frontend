import React from 'react'

import Typography from '@mui/material/Typography'

import BusinessTable from '@/views/business/BusinessTable'

export default function BusinessPage() {
  return (
    <div>
      <Typography variant='h2' className='mb-4'>
        Negocios
      </Typography>
      <BusinessTable></BusinessTable>
    </div>
  )
}
