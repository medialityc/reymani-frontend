'use client'

// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports
import { DataGrid, GridToolbar } from '@mui/x-data-grid'

import Award from '@views/dashboard/Award'
import Transactions from '@views/dashboard/Transactions'
import WeeklyOverview from '@views/dashboard/WeeklyOverview'
import TotalEarning from '@views/dashboard/TotalEarning'
import LineChart from '@views/dashboard/LineChart'
import DistributedColumnChart from '@views/dashboard/DistributedColumnChart'
import DepositWithdraw from '@views/dashboard/DepositWithdraw'
import SalesByCountries from '@views/dashboard/SalesByCountries'
import CardStatVertical from '@components/card-statistics/Vertical'
import Table from '@views/dashboard/Table'

const typesRows = [
  { id: 1, quantity: 10, pointsDeducted: 50, infractionsPaid: 5, infractionsNoPaid: 5 },
  { id: 2, quantity: 20, pointsDeducted: 100, infractionsPaid: 15, infractionsNoPaid: 5 },
  { id: 3, quantity: 30, pointsDeducted: 150, infractionsPaid: 25, infractionsNoPaid: 5 },
  { id: 4, quantity: 40, pointsDeducted: 200, infractionsPaid: 35, infractionsNoPaid: 5 },
  { id: 5, quantity: 50, pointsDeducted: 250, infractionsPaid: 45, infractionsNoPaid: 5 }
]

const typesColumns = [
  {
    field: 'id',
    headerName: 'Tipo',
    flex: 1
  },
  {
    field: 'quantity',
    headerName: 'Cantidad',
    flex: 1
  },
  {
    field: 'pointsDeducted',
    headerName: 'Puntos totales deducidos',
    flex: 1
  },
  {
    field: 'infractionsPaid',
    headerName: 'Multas pagadas',
    flex: 1
  },
  {
    field: 'infractionsNoPaid',
    headerName: 'Multas pendientes',
    flex: 1
  }
]

const DashboardAnalytics = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={4}>
        <Award />
      </Grid>
      <Grid item xs={12} md={8} lg={8}>
        <Transactions />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <WeeklyOverview />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <TotalEarning />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6}>
            <LineChart />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CardStatVertical
              title='Total Profit'
              stats='$25.6k'
              avatarIcon='ri-pie-chart-2-line'
              avatarColor='secondary'
              subtitle='Weekly Profit'
              trendNumber='42%'
              trend='positive'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CardStatVertical
              stats='862'
              trend='negative'
              trendNumber='18%'
              title='New Project'
              subtitle='Yearly Project'
              avatarColor='primary'
              avatarIcon='ri-file-word-2-line'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DistributedColumnChart />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <SalesByCountries />
      </Grid>
      <Grid item xs={12} lg={8}>
        <DepositWithdraw />
      </Grid>
      <Grid item xs={12}>
        <Table />
        <DataGrid
          sx={{ height: 400, width: '100%', marginTop: 5, backgroundColor: 'var(--mui-palette-background-paper)' }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 }
            }
          }}
          slots={{ toolbar: GridToolbar }}
          rows={typesRows}
          columns={typesColumns}
        />
      </Grid>
    </Grid>
  )
}

export default DashboardAnalytics
