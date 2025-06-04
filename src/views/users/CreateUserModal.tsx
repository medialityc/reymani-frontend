'use client'

import React, { useState } from 'react'

import Image from 'next/image'

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
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import LoadingButton from '@mui/lab/LoadingButton'

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

// Regex para email
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
  password: z
    .string()
    .nonempty('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula.')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número.')
    .regex(/[\W]/, 'La contraseña debe contener al menos un carácter especial.'),
  email: z.string().nonempty('El correo es requerido').regex(emailRegex, 'El correo no es válido'),
  phone: z
    .string()
    .nonempty('El teléfono es requerido')
    .regex(/^[0-9]+$/, 'El teléfono solo debe contener números'),
  isActive: z.boolean(),
  role: z.number().min(0, 'El rol es requerido').max(3, 'Rol no válido'),
  isConfirmed: z.boolean(),
  profilePicture: z.any().optional()
})

export default function CreateUserModal({ open, handleClose, onUserCreated }: CreateUserModalProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    watch,
    formState: { errors },
    setError,

  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      email: '',
      phone: '',
      isActive: true,
      role: 0, // Valor por defecto para el rol
      isConfirmed: true,
      profilePicture: undefined
    }
  })

  // Observar el campo de imagen para mostrar la preview
  const profilePic = watch('profilePicture')
  const imageSrc = profilePic && profilePic.length > 0 ? URL.createObjectURL(profilePic[0]) : '/images/avatars/1.png'

  // Función para cerrar el modal y resetear el formulario
  const closeModal = () => {
    reset()
    handleClose()
  }

  const onSubmit = async (data: FormValues & { profilePicture?: FileList }) => {
    setLoading(true)
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
      closeModal()
    } catch (error: any) {
      if (error.response?.status === 409 || error.status === 409) {
        setError('email', { type: 'manual', message: 'El correo ya está en uso por otro usuario' })
      } else {
        toast.error('Error al crear usuario')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={closeModal} fullWidth>
      <DialogTitle>Crear Usuario</DialogTitle>
      <DialogContent>
        <form id='create-user-form' onSubmit={handleSubmit(onSubmit)}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <Image src={imageSrc} alt='Foto de perfil' width={100} height={100} style={{ borderRadius: '50%' }} />
          </div>
          <Button variant='outlined' component='label' fullWidth sx={{ mb: 1 }}>
            Subir foto de perfil
            <input type='file' hidden {...register('profilePicture')} />
          </Button>
          <Button variant='outlined' onClick={() => resetField('profilePicture')} fullWidth sx={{ mb: 2 }}>
            Eliminar imagen
          </Button>
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

          <FormControl fullWidth margin='normal' error={!!errors.role}>
            <InputLabel id='role-label'>Rol</InputLabel>
            <Select
              labelId='role-label'
              label='Rol'
              defaultValue={0}
              {...register('role', { required: true, valueAsNumber: true })}
              error={!!errors.role}
            >
              <MenuItem value={0}>Cliente</MenuItem>
              <MenuItem value={1}>Mensajero</MenuItem>
              <MenuItem value={2}>Administrador de Negocio</MenuItem>
              <MenuItem value={3}>Administrador de Sistema</MenuItem>
            </Select>
            {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
          </FormControl>

          <FormControlLabel control={<Checkbox {...register('isActive')} defaultChecked />} label='Activo' />
          <FormControlLabel control={<Checkbox {...register('isConfirmed')} defaultChecked />} label='Confirmado' />
          <br />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>Cancelar</Button>
        <LoadingButton type='submit' form='create-user-form' variant='contained' loading={loading}>
          Crear
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
