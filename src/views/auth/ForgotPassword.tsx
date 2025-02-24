'use client'

// Next Imports
import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import LoadingButton from '@mui/lab/LoadingButton'

// Type Imports
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import * as z from 'zod'

import type { Mode } from '@core/types'

// Component Imports
import Form from '@components/Form'
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'

import { forgotPassword } from '@/services/AuthService'

const schema = z.object({
  email: z.string().regex(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Formato de correo inválido')
})

const ForgotPassword = ({}: { mode: Mode }) => {
  const router = useRouter()
  const [responseMessage, setResponseMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: any) => {
    setLoading(true)

    try {
      await forgotPassword(data)
      router.push(`/reset-password?email=${data.email}`)
    } catch (error: any) {
      setResponseMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

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
              Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña
            </Typography>
            <Form noValidate autoComplete='off' className='flex flex-col gap-5' onSubmit={handleSubmit(onSubmit)}>
              <TextField
                autoFocus
                fullWidth
                label='Correo'
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message?.toString()}
              />
              <LoadingButton fullWidth variant='contained' type='submit' loading={loading}>
                Enviar código de restablecimiento
              </LoadingButton>
              {responseMessage && (
                <Typography className='text-center' color='primary'>
                  {responseMessage}
                </Typography>
              )}
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
