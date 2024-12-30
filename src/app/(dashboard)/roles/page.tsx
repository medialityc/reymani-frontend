import Typography from '@mui/material/Typography'

import RolesTable from '@/views/roles/RolesTable'

// React Imports

const RolesPage = () => {
  return (
    <div>
      <Typography variant='h2'>Roles</Typography>
      {<RolesTable />}
    </div>
  )
}

export default RolesPage
