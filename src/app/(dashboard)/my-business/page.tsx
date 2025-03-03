import React from 'react'

import Typography from '@mui/material/Typography'

import UpdateMyBusiness from '@/views/business/UpdateMyBusiness'
import ProductsTable from '@/views/products/ProductsTable'

export default function UsersPage() {
  return (
    <div>
      <Typography variant='h2' className='mb-4'>
        Mi Negocio
      </Typography>
      <UpdateMyBusiness />
      <div className='mt-8'>
        <Typography variant='h4' className='mb-4'>
          Mis Productos
        </Typography>
        <ProductsTable />
      </div>
    </div>
  )
}
