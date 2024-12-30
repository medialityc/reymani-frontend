'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { TextField, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import Grid from '@mui/material/Unstable_Grid2'

import { LoadingButton } from '@mui/lab'

import { createRol } from '@/services/RolService'
import { fetchPermisos } from '@/services/PermisoService'
import type { PermisoDto } from '@/types/dtos/PermisoDto'

const schema = z.object({
  nombre: z
    .string()
    .nonempty('El nombre es requerido')
    .max(50, 'El nombre no debe exceder los 50 caracteres')
    .regex(/^[a-zA-Z0-9 ]*$/, 'El nombre solo puede contener letras y números'),
  descripcion: z
    .string()
    .max(100, 'La descripción no debe exceder los 100 caracteres')
    .regex(/^[a-zA-Z0-9 ]*$/, 'La descripción solo puede contener letras y números')
    .optional(),
  permisos: z.array(z.string()).optional()
})

type FormData = z.infer<typeof schema>

export default function CreateRolForm() {
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
  const [permisos, setPermisos] = useState<PermisoDto[]>([])

  useEffect(() => {
    const getPermisos = async () => {
      try {
        const data = await fetchPermisos()

        setPermisos(data)
      } catch (error: any) {
        console.error('Error fetching permissions:', error)
      }
    }

    getPermisos()
  }, [])

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      setBackendErrors({})
      await createRol(data)
      router.push('/roles')
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.errors) {
        setBackendErrors(error.response.data.errors)
      } else {
        console.error('Error creating role:', error)
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
            label='Nombre'
            {...register('nombre')}
            error={!!errors.nombre || !!backendErrors.nombre}
            helperText={errors.nombre?.message || backendErrors.nombre?.join(', ')}
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

        <Typography variant='h5'>Permisos</Typography>
        <Grid container spacing={2}>
          {permisos.map(permiso => (
            <Grid xs={12} sm={6} md={4} key={permiso.id}>
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                <input
                  type='checkbox'
                  value={permiso.id}
                  {...register('permisos')}
                  style={{ marginRight: '8px', transform: 'scale(1.2)' }}
                />
                <label style={{ fontSize: '1rem' }}>{permiso.descripcion}</label>
              </div>
            </Grid>
          ))}
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
