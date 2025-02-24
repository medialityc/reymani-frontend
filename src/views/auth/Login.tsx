'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

// Form Imports
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import LoadingButton from '@mui/lab/LoadingButton'

import { useAuth } from '@/contexts/AuthContext'

import { login as authLogin } from '@/services/AuthService'

import type { Mode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Form Imports

import { getRoleFromToken } from '@/utils/tokenStorage'

const schema = z.object({
  email: z.string().regex(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Formato de correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
})

const Login = ({}: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Hooks
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema)
  })

  // Redirige usuarios autenticados desde useEffect
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return null
  }

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit = async (data: any) => {
    try {
      setLoading(true)
      const response = await authLogin(data)

      // Verificar rol permitido
      const allowedRoles = ['SystemAdmin', 'BusinessAdmin']
      const role = getRoleFromToken(response.token)

      if (!allowedRoles.includes(role || '')) {
        setErrorMessage('Acceso restringido para este usuario')
        setLoading(false)

        return
      }

      login(response)
      router.push('/')
    } catch (error: any) {
      setErrorMessage(error.message)
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
          <div className='flex flex-col gap-5'>
            <div>
              <Typography variant='h4'>{`¡Bienvenido a ${themeConfig.templateName}!`}</Typography>
              <Typography className='mbs-1'>Por favor, inicia sesión en tu cuenta y comienza la aventura</Typography>
            </div>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
              <TextField
                autoFocus
                fullWidth
                label='Correo'
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message?.toString()}
              />
              <TextField
                fullWidth
                label='Contraseña'
                id='outlined-adornment-password'
                type={isPasswordShown ? 'text' : 'password'}
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message?.toString()}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <div className='flex justify-center items-center gap-x-3 gap-y-1 flex-wrap'>
                <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
                  ¿Olvidaste tu contraseña?
                </Typography>
              </div>
              {errorMessage && (
                <Typography color='error' className='text-center'>
                  {errorMessage}
                </Typography>
              )}
              <LoadingButton loading={loading} fullWidth variant='contained' type='submit'>
                Iniciar Sesión
              </LoadingButton>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
