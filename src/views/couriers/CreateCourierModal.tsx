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
  InputLabel,
  FormControl
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

interface CreateCourierModalProps {
  open: boolean
  handleClose: () => void
  onCourierCreated: () => void
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
  role: z.number().default(1), // Siempre será 1 (mensajero)
  isConfirmed: z.boolean(),
  profilePicture: z.any().optional()
})

export default function CreateCourierModal({ open, handleClose, onCourierCreated }: CreateCourierModalProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    watch,
    formState: { errors },
    setError
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 1, // Por defecto, rol de mensajero
      isActive: true,
      isConfirmed: true
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

    // Asegurarse de que el rol sea 1 (mensajero)
    data.role = 1

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
      toast.success('Mensajero creado correctamente')
      reset()
      onCourierCreated()
      closeModal()
    } catch (error: any) {
      if (error.response?.status === 409 || error.status === 409) {
        setError('email', { type: 'manual', message: 'El correo ya está en uso por otro usuario' })
      } else {
        toast.error('Error al crear mensajero')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={closeModal} fullWidth>
      <DialogTitle>Crear Mensajero</DialogTitle>
      <DialogContent>
        <form id='create-courier-form' onSubmit={handleSubmit(onSubmit)}>
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
          <FormControl fullWidth margin='normal'>
            <InputLabel id='role-label'>Rol</InputLabel>
            <Select labelId='role-label' value={1} label='Rol' disabled {...register('role')}>
              <MenuItem value={1}>Mensajero</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel control={<Checkbox {...register('isActive')} defaultChecked />} label='Activo' />
          <FormControlLabel control={<Checkbox {...register('isConfirmed')} defaultChecked />} label='Confirmado' />
          <br />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>Cancelar</Button>
        <LoadingButton type='submit' form='create-courier-form' variant='contained' loading={loading}>
          Crear
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
