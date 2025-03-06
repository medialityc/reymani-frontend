import React from 'react'

import Typography from '@mui/material/Typography'

import ProductCategoriesTable from '@/views/product-categories/ProductCategoriesTable'

export default function ProductCategoriesPage() {
  return (
    <div>
      <Typography variant='h2' className='mb-4'>
        Categorías de Producto
      </Typography>
      <ProductCategoriesTable />
    </div>
  )
}
