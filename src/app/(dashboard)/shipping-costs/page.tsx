import React from 'react'

import Typography from '@mui/material/Typography'

import ShippingCostsTable from '@/views/shipping-costs/ShippingCostsTable'

export default function ShippingCostsPage() {
  return (
    <div>
      <Typography variant='h2' className='mb-4'>
        Costos de Envío
      </Typography>
      <ShippingCostsTable />
    </div>
  )
}
