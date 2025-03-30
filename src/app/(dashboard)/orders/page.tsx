import React from 'react'

import { Grid, Typography } from '@mui/material'

import OrdersTable from '@/views/orders/OrdersTable'

const OrdersPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h5' mb={2}>
          Pedidos
        </Typography>
        <OrdersTable />
      </Grid>
    </Grid>
  )
}

export default OrdersPage
