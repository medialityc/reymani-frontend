'use client'

import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import Grid from '@mui/material/Unstable_Grid2'

import { LoadingButton } from '@mui/lab'

import { createTelefono } from '@/services/TelefonoService'

const schema = z.object({
  numeroTelefono: z
    .string()
    .nonempty('El número de teléfono es requerido')
    .regex(/^[0-9]+$/, 'El número de teléfono solo puede contener números'),
  descripcion: z.string().max(100, 'La descripción no debe exceder los 100 caracteres').optional()
})

type FormData = z.infer<typeof schema>

export default function CreateTelefonoForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const [backendErrors, setBackendErrors] = useState<Record<string, string[]>>({})

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      setBackendErrors({})
      await createTelefono(data)
      router.push('/telefonos')
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.errors) {
        setBackendErrors(error.response.data.errors)
      } else {
        console.error('Error creating telefono:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid xs={12} sm={6}>
          <TextField
            label='Número de teléfono'
            {...register('numeroTelefono')}
            error={!!errors.numeroTelefono || !!backendErrors.numeroTelefono}
            helperText={errors.numeroTelefono?.message || backendErrors.numeroTelefono?.join(', ')}
            fullWidth
            margin='normal'
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField
            label='Descripción'
            {...register('descripcion')}
            error={!!errors.descripcion || !!backendErrors.descripcion}
            helperText={errors.descripcion?.message || backendErrors.descripcion?.join(', ')}
            fullWidth
            margin='normal'
          />
        </Grid>
        <Grid xs={12} sm={4} md={3}>
          <LoadingButton loading={loading} type='submit' variant='contained' color='primary' fullWidth>
            Crear
          </LoadingButton>
        </Grid>
      </Grid>
    </form>
  )
}
