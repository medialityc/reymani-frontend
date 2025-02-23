'use client'

import React, { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { toast } from 'react-toastify'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { z } from 'zod'

import { getCurrentUser, updateCurrentUser } from '@/services/UserService'
import Form from '@components/Form'
import { useAuth } from '@/contexts/AuthContext'
import ChangePassword from '../ChangePassword'

const emailRegex = new RegExp(
  "^((([a-z]|\\d|[!#\\$%&'\\*\\+\\-/=\\?\\^_`{\\|}~]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])+(\\.([a-z]|\\d|[!#\\$%&'\\*\\+\\-/=\\?\\^_`{\\|}~]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])+)*)|((\\x22)((((\\x20|\\x09)*(\\x0d\\x0a))?(\\x20|\\x09)+)?(([\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x7f]|\\x21|[\\x23-\\x5b]|[\\x5d-\\x7e]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])|(\\\\([\\x01-\\x09\\x0b\\x0c\\x0d-\\x7f]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]))))*(((\\x20|\\x09)*(\\x0d\\x0a))?(\\x20|\\x09)+)?(\\x22)))@((([a-z]|\\d|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])|(([a-z]|\\d|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])([a-z]|\\d|-||_|~|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])*([a-z]|\\d|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])))\\.)+(([a-z]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])+|(([a-z]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])+([a-z]+|\\d|-|\\.{0,1}|_|~|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])?([a-z]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])))$"
)

// Esquema de validación con zod (validaciones en español)
const schema = z.object({
  firstName: z
    .string()
    .nonempty('El nombre es requerido')
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'El nombre solo debe contener letras y espacios'),
  lastName: z
    .string()
    .nonempty('El apellido es requerido')
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'El apellido solo debe contener letras y espacios'),
  email: z.string().nonempty('El correo es requerido').regex(emailRegex, 'El correo no es válido'),
  phone: z
    .string()
    .nonempty('El teléfono es requerido')
    .regex(/^[0-9]+$/, 'El teléfono solo debe contener números')
})

type FormValues = z.infer<typeof schema>

const UpdateUser = () => {
  const [user, setUser] = useState<any>(null)
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [emailError, setEmailError] = useState<string>('') // Estado para error de correo
  const router = useRouter()
  const { updateUser } = useAuth()

  // Uso de react-hook-form con zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    }
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser()

        setUser(data)

        // Asigna los valores recuperados al formulario
        setValue('firstName', data.firstName || '')
        setValue('lastName', data.lastName || '')
        setValue('email', data.email || '')
        setValue('phone', data.phone || '')
      } catch (err) {
        console.error(err)
      }
    }

    fetchUser()
  }, [setValue])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePictureFile(e.target.files[0])
    }
  }

  // Función modificada para el submit usando react-hook-form
  const onFormSubmit = async (data: FormValues) => {
    const dataToSend = new FormData()

    dataToSend.append('firstName', data.firstName)
    dataToSend.append('lastName', data.lastName)
    dataToSend.append('email', data.email)
    dataToSend.append('phone', data.phone)

    if (profilePictureFile) {
      dataToSend.append('ProfilePicture', profilePictureFile, profilePictureFile.name)
    }

    try {
      const updatedUser = await updateCurrentUser(dataToSend)

      const updatedUserWithPreview = {
        ...updatedUser,
        profilePicture: profilePictureFile
          ? URL.createObjectURL(profilePictureFile)
          : updatedUser.profilePicture || user?.profilePicture,
        firstName: data.firstName,
        lastName: data.lastName,
        role: updatedUser.role !== undefined ? updatedUser.role : user?.role
      }

      setUser(updatedUserWithPreview)
      updateUser(updatedUserWithPreview) // Actualizar en AuthContext
      toast.success('Usuario actualizado correctamente')
      router.refresh()
      router.push('/')
    } catch (err: any) {
      if (err.status === 409) {
        setEmailError('El correo ya está en uso por otro usuario')
      } else {
        toast.error('Error al actualizar usuario')
      }
    }
  }

  const previewSrc = profilePictureFile
    ? URL.createObjectURL(profilePictureFile)
    : user?.profilePicture || '/images/avatars/1.png'

  return (
    <Card>
      <CardHeader title='Editar mis datos' />
      <CardContent>
        {isEditing ? (
          <>
            <Form onSubmit={handleSubmit(onFormSubmit)}>
              <Grid container spacing={5}>
                {/* Foto y botón para cambiar imagen */}
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={previewSrc}
                    alt='Foto de perfil'
                    style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }}
                  />
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button variant='outlined' component='label'>
                    Subir nueva foto
                    <input type='file' hidden accept='image/*' onChange={handleFileChange} />
                  </Button>
                </Grid>
                {/* Campos editables con react-hook-form */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Nombre'
                    placeholder='Nombre'
                    {...register('firstName')}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Apellidos'
                    placeholder='Apellidos'
                    {...register('lastName')}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type='email'
                    label='Correo'
                    placeholder='correo@ejemplo.com'
                    {...register('email')}
                    error={!!errors.email || !!emailError}
                    helperText={errors.email?.message || emailError}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Teléfono'
                    placeholder='1234567890'
                    {...register('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant='contained' type='submit'>
                    Actualizar
                  </Button>
                </Grid>
              </Grid>
            </Form>
            <div style={{ marginTop: '20px' }}>
              <ChangePassword />
            </div>
          </>
        ) : (
          <>
            <Grid container spacing={5}>
              {/* Foto y sin botón de cambiar imagen */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <img
                  src={previewSrc}
                  alt='Foto de perfil'
                  style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }}
                />
              </Grid>
              {/* Campos en modo solo lectura */}
              <Grid item xs={12}>
                <TextField fullWidth label='Nombre' placeholder='Nombre' value={user?.firstName || ''} disabled />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label='Apellido' placeholder='Apellido' value={user?.lastName || ''} disabled />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type='email'
                  label='Correo'
                  placeholder='correo@ejemplo.com'
                  value={user?.email || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label='Teléfono' placeholder='1234567890' value={user?.phone || ''} disabled />
              </Grid>
              <Grid item xs={12}>
                <Button variant='contained' type='button' onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default UpdateUser
