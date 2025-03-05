import React from 'react'

import { Typography } from '@mui/material'

import VehiclesTypesTable from '@/views/vehicles-types/VehiclesTypesTable'

export default function VehiclesTypesPage() {
  return (
    <div>
      <Typography variant='h2' className='mb-4'>
        Tipos de Vehículos
      </Typography>
      <VehiclesTypesTable />
    </div>
  )
}
