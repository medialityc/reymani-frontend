'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { TextField } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import Grid from '@mui/material/Unstable_Grid2'
import { LoadingButton } from '@mui/lab'

import { fetchTelefono, updateTelefono } from '@/services/TelefonoService'
import type { TelefonoDto } from '@/types/dtos/TelefonoDto'

const schema = z.object({
  numeroTelefono: z
    .string()
    .nonempty('El número de teléfono es requerido')
    .regex(/^[0-9]+$/, 'El número de teléfono solo puede contener números'),
  descripcion: z.string().max(100, 'La descripción no debe exceder los 100 caracteres').optional()
})

type FormData = z.infer<typeof schema>

type Params = {
  id: string
}

export default function EditTelefonoForm() {
  const { id } = useParams<Params>()

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      numeroTelefono: '',
      descripcion: ''
    }
  })

  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [backendErrors, setBackendErrors] = useState<Record<string, string[]>>({})
  const [telefonoData, setTelefonoData] = useState<TelefonoDto | null>(null)

  useEffect(() => {
    const loadTelefono = async () => {
      try {
        const telefono = await fetchTelefono(id)

        setTelefonoData(telefono)
        setValue('numeroTelefono', telefono.numeroTelefono)
        setValue('descripcion', telefono.descripcion)
      } catch (error) {
        console.error('Error fetching telefono:', error)
      }
    }

    loadTelefono()
  }, [id, setValue])

  const onSubmit = async (data: FormData) => {
    if (!telefonoData) return

    setLoading(true)

    try {
      setBackendErrors({})
      await updateTelefono(id, {
        telefono: {
          ...telefonoData,
          numeroTelefono: data.numeroTelefono,
          descripcion: data.descripcion || ''
        }
      })
      router.push('/telefonos')
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.errors) {
        setBackendErrors(error.response.data.errors)
      } else {
        console.error('Error updating telefono:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid xs={12} sm={6}>
          <Controller
            name='numeroTelefono'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <TextField
                {...field}
                label='Número de teléfono'
                error={!!errors.numeroTelefono || !!backendErrors.numeroTelefono}
                helperText={errors.numeroTelefono?.message || backendErrors.numeroTelefono?.join(', ')}
                fullWidth
                margin='normal'
              />
            )}
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <Controller
            name='descripcion'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <TextField
                {...field}
                label='Descripción'
                error={!!errors.descripcion || !!backendErrors.descripcion}
                helperText={errors.descripcion?.message || backendErrors.descripcion?.join(', ')}
                fullWidth
                margin='normal'
              />
            )}
          />
        </Grid>
        <Grid xs={12} sm={4} md={3}>
          <LoadingButton loading={loading} type='submit' variant='contained' color='primary' fullWidth>
            Guardar
          </LoadingButton>
        </Grid>
      </Grid>
    </form>
  )
}
