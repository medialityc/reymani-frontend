import Typography from '@mui/material/Typography'

import UsuariosTable from '@/views/usuarios/UsuariosTable'

const UsuariosPage = () => {
  return (
    <div>
      <Typography variant='h2'>Usuarios</Typography>
      <UsuariosTable />
    </div>
  )
}

export default UsuariosPage
