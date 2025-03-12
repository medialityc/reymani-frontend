import React from 'react'

import { Typography } from '@mui/material'

import ProductsTable from '@/views/products/ProductsTable'

export default function ProductsPage() {
  return (
    <div>
      <Typography variant='h2' className='mb-4'>
        Productos
      </Typography>
      <ProductsTable></ProductsTable>
    </div>
  )
}
