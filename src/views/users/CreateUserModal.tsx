'use client'

import React from 'react'

import { useForm } from 'react-hook-form'
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

import { createUser } from '../../services/UserService'

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

interface CreateUserModalProps {
  open: boolean
  handleClose: () => void
  onUserCreated: () => void
}

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

export default function CreateUserModal({ open, handleClose, onUserCreated }: CreateUserModalProps) {
  // Inicializar useForm con resolutor zod
  const {
    register,
    handleSubmit,
    reset,
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

  const onSubmit = async (data: FormValues & { profilePicture?: FileList }) => {
    const formData = new FormData()

    // Adjuntar archivo si existe
    if (data.profilePicture && data.profilePicture.length > 0) {
      formData.append('ProfilePicture', data.profilePicture[0])
    }

    formData.append('FirstName', data.firstName)
    formData.append('LastName', data.lastName)
    formData.append('Password', data.password)
    formData.append('Email', data.email)
    formData.append('Phone', data.phone)
    formData.append('IsActive', String(data.isActive))
    formData.append('Role', String(data.role))
    formData.append('IsConfirmed', String(data.isConfirmed))

    try {
      await createUser(formData)
      toast.success('Usuario creado correctamente')
      reset()
      onUserCreated()
      closeModal() // Se reemplaza handleClose() por closeModal()
    } catch (error: any) {
      if (error.response?.status === 409 || error.status === 409) {
        setError('email', { type: 'manual', message: 'El correo ya está en uso por otro usuario' })
      } else {
        toast.error('Error al crear usuario')
      }
    }
  }

  return (
    <Dialog open={open} onClose={closeModal} fullWidth>
      <DialogTitle>Crear Usuario</DialogTitle>
      <DialogContent>
        <form id='create-user-form' onSubmit={handleSubmit(onSubmit)}>
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
          <Select defaultValue={0} fullWidth {...register('role', { required: true })} sx={{ mt: 2 }}>
            <MenuItem value={0}>Cliente</MenuItem>
            <MenuItem value={1}>Mensajero</MenuItem>
            <MenuItem value={2}>Administrador de Negocio</MenuItem>
            <MenuItem value={3}>Administrador de Sistema</MenuItem>
          </Select>
          <FormControlLabel control={<Checkbox {...register('isActive')} defaultChecked />} label='Activo' />
          <FormControlLabel control={<Checkbox {...register('isConfirmed')} defaultChecked />} label='Confirmado' />
          <br />
          <Button variant='outlined' component='label' sx={{ mt: 2 }}>
            Subir foto de perfil
            <input type='file' hidden {...register('profilePicture')} />
          </Button>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>Cancelar</Button>
        <Button type='submit' form='create-user-form' variant='contained'>
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  )
}
