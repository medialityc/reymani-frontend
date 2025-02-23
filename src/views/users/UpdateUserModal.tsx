'use client'

import React, { useEffect } from 'react'

import { useForm, Controller } from 'react-hook-form' // <-- Agregado Controller
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem
} from '@mui/material'
import { toast } from 'react-toastify'

import { z } from 'zod' // <-- Nuevo import
import { zodResolver } from '@hookform/resolvers/zod' // <-- Nuevo import

import { updateUser } from '../../services/UserService'

// Definir regex para email (se toma de UpdateMe)
const emailRegex = new RegExp(
  "^((([a-z]|\\d|[!#\\$%&'\\*\\+\\-/=\\?\\^_`{\\|}~])+(\\.([a-z]|\\d|[!#\\$%&'\\*\\+\\-/=\\?\\^_`{\\|}~])+)*)|((\\x22)(.+?)(\\x22)))@((([a-z]|\\d)+\\.)+([a-z]{2,}))$"
)

// Esquema de validación
const schema = z.object({
  firstName: z
    .string()
    .nonempty('El nombre es requerido')
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'El nombre solo debe contener letras y espacios'),
  lastName: z
    .string()
    .nonempty('El apellido es requerido')
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'El apellido solo debe contener letras y espacios'),
  password: z.string().nonempty('La contraseña es requerida'),
  email: z.string().nonempty('El correo es requerido').regex(emailRegex, 'El correo no es válido'),
  phone: z
    .string()
    .nonempty('El teléfono es requerido')
    .regex(/^[0-9]+$/, 'El teléfono solo debe contener números'),
  isActive: z.boolean(),
  role: z.number(),
  isConfirmed: z.boolean(),
  profilePicture: z.any().optional()
})

type FormValues = {
  firstName: string
  lastName: string
  password: string
  email: string
  phone: string
  isActive: boolean
  role: number
  isConfirmed: boolean
  profilePicture?: FileList
}

interface UpdateUserModalProps {
  open: boolean
  handleClose: () => void
  user: any
  onUserUpdated: () => void
}

export default function UpdateUserModal({ open, handleClose, user, onUserUpdated }: UpdateUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
    setError
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  })

  // Nuevo: función para mover el foco y cerrar el modal
  const closeModal = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    handleClose()
  }

  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName)
      setValue('lastName', user.lastName)
      setValue('email', user.email)
      setValue('phone', user.phone)

      // Convertir valores a booleano: si el valor es booleano se conserva,
      // si es string se considera "Sí" como true, de lo contrario false.
      const isActiveBoolean = typeof user.isActive === 'boolean' ? user.isActive : user.isActive === 'Sí'
      const isConfirmedBoolean = typeof user.isConfirmed === 'boolean' ? user.isConfirmed : user.isConfirmed === 'Sí'

      setValue('isActive', isActiveBoolean)
      setValue('isConfirmed', isConfirmedBoolean)
      setValue('role', user.role)
      setValue('password', '') // Dejar vacío o forzar el cambio de contraseña
    }
  }, [user, setValue])

  const onSubmit = async (data: FormValues & { profilePicture?: FileList }) => {
    const formData = new FormData()

    if (data.profilePicture && data.profilePicture.length > 0) {
      formData.append('ProfilePicture', data.profilePicture[0])
    }

    formData.append('firstName', data.firstName)
    formData.append('lastName', data.lastName)
    formData.append('password', data.password)
    formData.append('email', data.email)
    formData.append('phone', data.phone)
    formData.append('isActive', String(data.isActive))
    formData.append('role', String(data.role))
    formData.append('isConfirmed', String(data.isConfirmed))

    try {
      await updateUser(user.id, formData)
      toast.success('Usuario actualizado correctamente')
      reset()
      onUserUpdated()
      closeModal() // Se reemplaza handleClose() por closeModal()
    } catch (error: any) {
      if (error.response?.status === 409 || error.status === 409) {
        setError('email', { type: 'manual', message: 'El correo ya está en uso por otro usuario' })
      } else {
        toast.error('Error al actualizar usuario')
      }
    }
  }

  return (
    <Dialog open={open} onClose={closeModal} fullWidth>
      <DialogTitle>Actualizar Usuario</DialogTitle>
      <DialogContent>
        <form id='update-user-form' onSubmit={handleSubmit(onSubmit)}>
          {/* ...existing layout... */}
          <TextField
            fullWidth
            label='Nombre'
            margin='normal'
            {...register('firstName', { required: true })}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />
          <TextField
            fullWidth
            label='Apellido'
            margin='normal'
            {...register('lastName', { required: true })}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
          <TextField
            fullWidth
            label='Contraseña'
            type='password'
            margin='normal'
            {...register('password', { required: true })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            fullWidth
            label='Email'
            margin='normal'
            {...register('email', { required: true })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            fullWidth
            label='Teléfono'
            margin='normal'
            {...register('phone', { required: true })}
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />
          <Select fullWidth defaultValue={0} {...register('role', { required: true })} sx={{ mt: 2 }}>
            <MenuItem value={0}>Cliente</MenuItem>
            <MenuItem value={1}>Mensajero</MenuItem>
            <MenuItem value={2}>Administrador de Negocio</MenuItem>
            <MenuItem value={3}>Administrador de Sistema</MenuItem>
          </Select>
          {/* Se reemplaza Checkbox con Controller para cargar los valores */}
          <Controller
            name='isActive'
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormControlLabel control={<Checkbox checked={Boolean(value)} onChange={onChange} />} label='Activo' />
            )}
          />
          <Controller
            name='isConfirmed'
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormControlLabel
                control={<Checkbox checked={Boolean(value)} onChange={onChange} />}
                label='Confirmado'
              />
            )}
          />
          <br />
          <Button variant='outlined' component='label' sx={{ mt: 2 }}>
            Subir nueva foto
            <input type='file' hidden {...register('profilePicture')} />
          </Button>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>Cancelar</Button>
        <Button type='submit' form='update-user-form' variant='contained'>
          Actualizar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
