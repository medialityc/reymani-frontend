'use client'

// Next Imports
import React, { useRef } from 'react'

import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

// Component Imports
import Form from '@components/Form'
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'

// Componente ResetPassword
const ResetPassword = () => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    if (e.target.value.length === 1 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Restablecer Contraseña</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>
              Ingresa el código de 4 dígitos enviado a tu correo y tu nueva contraseña.
            </Typography>
            <Form noValidate autoComplete='off' className='flex flex-col gap-5'>
              <div className='flex gap-2 justify-center'>
                {[0, 1, 2, 3].map(idx => (
                  <TextField
                    key={idx}
                    inputRef={el => (inputRefs.current[idx] = el)}
                    autoFocus={idx === 0}
                    inputProps={{ maxLength: 1, style: { textAlign: 'center' } }}
                    variant='outlined'
                    size='small'
                    onChange={e => handleInputChange(e, idx)}
                  />
                ))}
              </div>
              <TextField fullWidth label='Nueva contraseña' type='password' />
              <TextField fullWidth label='Confirmar contraseña' type='password' />
              <Button fullWidth variant='contained' type='submit'>
                Restablecer contraseña
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

export default ResetPassword
