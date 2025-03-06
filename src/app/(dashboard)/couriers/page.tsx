import React from 'react'

import Typography from '@mui/material/Typography'

import CouriersTable from '@/views/couriers/CouriersTable'

export default function page() {
  return (
    <div>
      <Typography variant='h2' className='mb-4'>
        Mensajeros
      </Typography>
      <CouriersTable></CouriersTable>
    </div>
  )
}
