import Typography from '@mui/material/Typography'

import PermisosTable from '@/views/permisos/PermisosTable'

// React Imports

const PermissionsPage = () => {
  return (
    <div>
      <Typography variant='h2'>Permisos</Typography>
      <PermisosTable />
    </div>
  )
}

export default PermissionsPage
