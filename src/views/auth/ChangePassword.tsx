'use client'

import React, { useState } from 'react'

import LoadingButton from '@mui/lab/LoadingButton'

import { z } from 'zod' // Importar zod
import { toast } from 'react-toastify'
import { TextField, Card, CardContent, CardHeader, Grid } from '@mui/material'

import { changePassword } from '@/services/AuthService'

// Definir esquema de validación con mensajes en español
const changePasswordSchema = z
  .object({
    currentPassword: z.string().nonempty({ message: 'La contraseña actual es obligatoria' }),
    newPassword: z
      .string()
      .nonempty({ message: 'La nueva contraseña es obligatoria' })
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
      .regex(/[A-Z]/, { message: 'La contraseña debe contener al menos una letra mayúscula.' })
      .regex(/[0-9]/, { message: 'La contraseña debe contener al menos un número.' })
      .regex(/[\W]/, { message: 'La contraseña debe contener al menos un caracter especial.' })
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: 'La nueva contraseña debe ser diferente a la actual.',
    path: ['newPassword']
  })

const ChangePassword = () => {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '' })
  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string }>({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })

    // Limpiar error para el campo modificado
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar con zod
    const validation = changePasswordSchema.safeParse(formData)

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors

      setErrors({
        currentPassword: fieldErrors.currentPassword?.[0] || '',
        newPassword: fieldErrors.newPassword?.[0] || ''
      })

      return
    }

    // Limpiar errores
    setErrors({})
    setLoading(true)

    try {
      await changePassword(formData)

      toast.success('Contraseña cambiada correctamente')

      // Opcional: se puede limpiar el formulario si se desea
      setFormData({ currentPassword: '', newPassword: '' })
    } catch (err: any) {
      if (err.status === 400) {
        setErrors(prev => ({ ...prev, currentPassword: 'La contraseña actual no es correcta' }))
      } else {
        toast.error('Ha ocurrido un error al cambiar la contraseña.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Cambiar Contraseña' />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type='password'
                label='Contraseña Actual'
                name='currentPassword'
                value={formData.currentPassword}
                onChange={handleChange}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type='password'
                label='Nueva Contraseña'
                name='newPassword'
                value={formData.newPassword}
                onChange={handleChange}
                error={!!errors.newPassword}
                helperText={errors.newPassword}
              />
            </Grid>
            <Grid item xs={12}>
              <LoadingButton variant='contained' type='submit' loading={loading}>
                Cambiar Contraseña
              </LoadingButton>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ChangePassword
