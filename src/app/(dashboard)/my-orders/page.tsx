import React from 'react'

import { Grid, Typography } from '@mui/material'

import MyOrdersTable from '@/views/orders/MyOrdersTable'

const MyOrdersPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h2' mb={2}>
          Pedidos
        </Typography>
        <MyOrdersTable />
      </Grid>
    </Grid>
  )
}

export default MyOrdersPage
