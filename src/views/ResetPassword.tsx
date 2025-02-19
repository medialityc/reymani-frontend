'use client'

// Next Imports
import React, { useState, useRef } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import Link from 'next/link'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

import { toast } from 'react-toastify'

import { resetPassword } from '@/services/AuthService'

// Component Imports
import Form from '@components/Form'
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'

// Toastify Import

// El esquema se mantiene para newPassword y confirmPassword
const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula.')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número.')
      .regex(/[\W]/, 'La contraseña debe contener al menos un carácter especial.'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña')
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  })

// Componente ResetPassword
const ResetPassword = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [responseMessage, setResponseMessage] = useState('')

  // Nuevo estado para los 4 dígitos
  const [digits, setDigits] = useState(['', '', '', ''])
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema)
  })

  // Controla cada dígito y pasa el focus al siguiente
  const handleDigitChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const value = e.target.value

    if (!/^\d?$/.test(value)) return
    const newDigits = [...digits]

    newDigits[index] = value
    setDigits(newDigits)

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const onSubmit = async (data: any) => {
    const email = searchParams.get('email')

    if (!email) {
      setResponseMessage('Falta el correo en la URL')

      return
    }

    const confirmationCode = digits.join('')

    if (confirmationCode.length < 4) {
      setResponseMessage('Ingresa un código de 4 dígitos')

      return
    }

    try {
      const result = await resetPassword({
        confirmationCode,
        password: data.newPassword,
        email
      })

      if (!result) {
        setResponseMessage('Correo o código de confirmación incorrectos')

        return
      }

      toast.success('Contraseña restablecida correctamente')
      router.push('/login')
    } catch (error: any) {
      setResponseMessage(error.message || 'Error al restablecer la contraseña')
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
            <Form noValidate autoComplete='off' className='flex flex-col gap-5' onSubmit={handleSubmit(onSubmit)}>
              {/* Agrupa 4 inputs para cada dígito */}
              <div className='flex gap-2 justify-center'>
                {digits.map((digit, idx) => (
                  <TextField
                    key={idx}
                    inputProps={{ maxLength: 1, style: { textAlign: 'center', width: '3rem' } }}
                    value={digit}
                    onChange={e => handleDigitChange(e, idx)}
                    inputRef={el => (inputsRef.current[idx] = el)}
                  />
                ))}
              </div>
              {/* Nueva contraseña */}
              <TextField
                fullWidth
                label='Nueva contraseña'
                type='password'
                {...register('newPassword')}
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message?.toString()}
              />
              {/* Confirmar contraseña */}
              <TextField
                fullWidth
                label='Confirmar contraseña'
                type='password'
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message?.toString()}
              />
              <Button fullWidth variant='contained' type='submit'>
                Restablecer contraseña
              </Button>
              {responseMessage && (
                <Typography className='text-center' color='error'>
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

export default ResetPassword
