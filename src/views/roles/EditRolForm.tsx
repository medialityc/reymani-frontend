'use client'

import React, { useEffect, useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { TextField, Typography } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import Grid from '@mui/material/Unstable_Grid2'
import { LoadingButton } from '@mui/lab'

import { fetchRol, getRolePermissions, updateRol } from '@/services/RolService'
import { fetchPermisos } from '@/services/PermisoService'
import type { PermisoDto } from '@/types/dtos/PermisoDto'
import type { RolDto } from '@/types/dtos/RolDto'

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

export default function EditRolForm() {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      permisos: []
    }
  })

  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [backendErrors, setBackendErrors] = useState<Record<string, string[]>>({})
  const [permisos, setPermisos] = useState<PermisoDto[]>([])
  const [rolePermissions, setRolePermissions] = useState<string[]>([])

  useEffect(() => {
    const getRolData = async () => {
      try {
        const rolData = await fetchRol(id)
        const fetchedRolePermissions = await getRolePermissions(id)
        const permisosData = await fetchPermisos()

        setValue('nombre', rolData.nombre)
        setValue('descripcion', rolData.descripcion || '')
        setValue(
          'permisos',
          fetchedRolePermissions.map(p => p.id)
        )
        setPermisos(permisosData)
        setRolePermissions(fetchedRolePermissions.map(p => p.id))
      } catch (error: any) {
        console.error('Error fetching role data:', error)
      }
    }

    getRolData()
  }, [id, setValue])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setBackendErrors({})

    try {
      const rolData: RolDto = { id, nombre: data.nombre, descripcion: data.descripcion || '' }

      await updateRol(id, rolData, data.permisos || [])
      router.push('/roles')
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        setBackendErrors(error.response.data.errors)
      } else {
        console.error('Error updating role:', error)
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
            name='nombre'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Nombre'
                error={!!errors.nombre || !!backendErrors.nombre}
                helperText={errors.nombre?.message || backendErrors.nombre?.join(', ')}
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

        <Typography variant='h5'>Permisos</Typography>
        <Grid container spacing={2}>
          {permisos.map(permiso => (
            <Grid xs={12} sm={6} md={4} key={permiso.id}>
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                <input
                  type='checkbox'
                  value={permiso.id}
                  {...register('permisos')}
                  defaultChecked={rolePermissions.includes(permiso.id)}
                  style={{ marginRight: '8px', transform: 'scale(1.2)' }}
                />
                <label style={{ fontSize: '1rem' }}>{permiso.descripcion}</label>
              </div>
            </Grid>
          ))}
        </Grid>

        <Grid xs={12} sm={4} md={3}>
          <LoadingButton loading={loading} type='submit' variant='contained' color='primary' fullWidth>
            Actualizar
          </LoadingButton>
        </Grid>
      </Grid>
    </form>
  )
}
