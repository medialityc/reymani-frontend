'use client'

import React, { useEffect, useState } from 'react'

import Image from 'next/image'

import { useForm, Controller } from 'react-hook-form'
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

import { updateUser } from '../../services/UserService'

// Regex para validar email
const emailRegex = new RegExp(
  "^((([a-z]|\\d|[!#\\$%&'\\*\\+\\-/=\\?\\^_`{\\|}~])+(\\.([a-z]|\\d|[!#\\$%&'\\*\\+\\-/=\\?\\^_`{\\|}~])+)*)|((\\x22)(.+?)(\\x22)))@((([a-z]|\\d)+\\.)+([a-z]{2,}))$"
)

// Esquema de validación con zod
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

interface UpdateCourierModalProps {
  open: boolean
  handleClose: () => void
  courier: any
  onCourierUpdated: () => void
}

/**
 * Convierte una imagen (URL) en un objeto File utilizando canvas.
 */
const getFileFromImageUrl = (url: string, fileName: string, mimeType: string): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image()

    // Necesario para cargar imágenes de otros dominios (si el servidor lo permite)
    img.crossOrigin = 'anonymous'
    img.src = url

    img.onload = () => {
      const canvas = document.createElement('canvas')

      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        return reject(new Error('No se pudo obtener el contexto del canvas'))
      }

      ctx.drawImage(img, 0, 0)
      canvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], fileName, { type: mimeType })

          resolve(file)
        } else {
          reject(new Error('No se pudo obtener el blob de la imagen'))
        }
      }, mimeType)
    }

    img.onerror = error => {
      reject(error)
    }
  })
}

export default function UpdateCourierModal({ open, handleClose, courier, onCourierUpdated }: UpdateCourierModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    resetField,
    setValue,
    control,
    watch,
    formState: { errors },
    setError
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 1 // Por defecto, rol de mensajero
    }
  })

  // Estado para saber si se eliminó la imagen
  const [deletedImage, setDeletedImage] = useState(false)
  const [loading, setLoading] = useState(false)

  // Función para cerrar el modal y resetear los valores
  const closeModal = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    if (courier) {
      reset({
        firstName: courier.firstName,
        lastName: courier.lastName,
        email: courier.email,
        phone: courier.phone,
        isActive: typeof courier.isActive === 'boolean' ? courier.isActive : courier.isActive === 'Sí',
        isConfirmed: typeof courier.isConfirmed === 'boolean' ? courier.isConfirmed : courier.isConfirmed === 'Sí',
        role: 1, // Siempre rol de mensajero
        password: '',
        profilePicture: undefined
      })
      setDeletedImage(false)
    }

    handleClose()
  }

  useEffect(() => {
    if (courier) {
      setValue('firstName', courier.firstName)
      setValue('lastName', courier.lastName)
      setValue('email', courier.email)
      setValue('phone', courier.phone)

      const isActiveBoolean = typeof courier.isActive === 'boolean' ? courier.isActive : courier.isActive === 'Sí'

      const isConfirmedBoolean =
        typeof courier.isConfirmed === 'boolean' ? courier.isConfirmed : courier.isConfirmed === 'Sí'

      setValue('isActive', isActiveBoolean)
      setValue('isConfirmed', isConfirmedBoolean)
      setValue('role', 1) // Siempre rol de mensajero
      setValue('password', '')
      setDeletedImage(false)
    }
  }, [courier, setValue])

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    const formData = new FormData()

    // Asegurarse de que el rol sea 1 (mensajero)
    data.role = 1

    // Manejo de la imagen de perfil
    if (deletedImage) {
      // Crear y enviar un archivo vacío para indicar la eliminación de la imagen
      const emptyFile = new File([], '')

      formData.append('ProfilePicture', emptyFile)
    } else if (data.profilePicture && data.profilePicture.length > 0) {
      // Se ha seleccionado una nueva imagen
      formData.append('ProfilePicture', data.profilePicture[0])
    } else if (courier?.profilePicture) {
      // No se modificó la imagen: usar el canvas para convertir la imagen actual en un File
      try {
        const profilePicFile = await getFileFromImageUrl(courier.profilePicture, 'profile-picture.jpg', 'image/jpeg')

        formData.append('ProfilePicture', profilePicFile)
      } catch (error) {
        console.error('Error al convertir la imagen de perfil existente:', error)
      }
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
      await updateUser(courier.id, formData)
      toast.success('Mensajero actualizado correctamente')
      reset()
      onCourierUpdated()
      closeModal()
    } catch (error: any) {
      if (error.response?.status === 409 || error.status === 409) {
        setError('email', { type: 'manual', message: 'El correo ya está en uso por otro usuario' })
      } else {
        toast.error('Error al actualizar mensajero')
      }
    } finally {
      setLoading(false)
    }
  }

  // Observa el campo de imagen para determinar qué mostrar
  const profilePic = watch('profilePicture')

  const imageSrc =
    profilePic && profilePic.length > 0
      ? URL.createObjectURL(profilePic[0])
      : deletedImage
        ? '/images/avatars/1.png'
        : courier?.profilePicture || '/images/avatars/1.png'

  return (
    <Dialog open={open} onClose={closeModal} fullWidth>
      <DialogTitle>Actualizar Mensajero</DialogTitle>
      <DialogContent>
        <form id='update-courier-form' onSubmit={handleSubmit(onSubmit)}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <Image src={imageSrc} alt='Foto de perfil' width={100} height={100} style={{ borderRadius: '50%' }} />
          </div>
          <Button variant='outlined' component='label' fullWidth sx={{ mb: 1 }}>
            Subir nueva foto
            <input
              type='file'
              hidden
              {...register('profilePicture', {
                onChange: e => {
                  setDeletedImage(false)

                  return e
                }
              })}
            />
          </Button>
          <Button
            variant='outlined'
            onClick={() => {
              resetField('profilePicture')
              setDeletedImage(true)
            }}
            fullWidth
            sx={{ mb: 2 }}
          >
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
            <InputLabel id='role-update-label'>Rol</InputLabel>
            <Select labelId='role-update-label' value={1} label='Rol' disabled {...register('role')}>
              <MenuItem value={1}>Mensajero</MenuItem>
            </Select>
          </FormControl>
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
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>Cancelar</Button>
        <LoadingButton type='submit' form='update-courier-form' variant='contained' loading={loading}>
          Actualizar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
