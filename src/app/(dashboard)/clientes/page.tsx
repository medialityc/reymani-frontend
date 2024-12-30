import Typography from '@mui/material/Typography'

import ClientesTable from '@/views/clientes/ClientesTable'

const ClientesPage = () => {
  return (
    <div>
      <Typography variant='h2'>Clientes</Typography>
      <ClientesTable />
    </div>
  )
}

export default ClientesPage
