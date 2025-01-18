'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Form from '@components/Form'
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'

const ForgotPassword = ({}: { mode: Mode }) => {
  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>¿Olvidaste tu contraseña?</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>
              Ingresa tu número de teléfono y te enviaremos instrucciones para restablecer tu contraseña
            </Typography>
            <Form noValidate autoComplete='off' className='flex flex-col gap-5'>
              <TextField autoFocus fullWidth label='Número de teléfono' />
              <Button fullWidth variant='contained' type='submit'>
                Enviar enlace de restablecimiento
              </Button>
              <Typography className='flex justify-center items-center' color='primary'>
                <Link href='/login' className='flex items-center'>
                  <DirectionalIcon ltrIconClass='ri-arrow-left-s-line' rtlIconClass='ri-arrow-right-s-line' />
                  <span>Volver al inicio de sesión</span>
                </Link>
              </Typography>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPassword
