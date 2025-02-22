'use client'

import React, { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { toast } from 'react-toastify' // Agregar importación de toast

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

import { getCurrentUser, updateCurrentUser } from '@/services/UserService'
import Form from '@components/Form'
import { useAuth } from '@/contexts/AuthContext'
import ChangePassword from '../ChangePassword' // Se importa el componente

const UpdateUser = () => {
  const [user, setUser] = useState<any>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [emailError, setEmailError] = useState<string>('') // Nuevo estado para error de correo
  const router = useRouter()
  const { updateUser } = useAuth()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser()

        setUser(data)
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || ''
        })
      } catch (err) {
        console.error(err)
      }
    }

    fetchUser()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limpiar error si se cambia el correo
    if (e.target.name === 'email') setEmailError('')
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePictureFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const dataToSend = new FormData()

    dataToSend.append('firstName', formData.firstName)
    dataToSend.append('lastName', formData.lastName)
    dataToSend.append('email', formData.email)
    dataToSend.append('phone', formData.phone)

    if (profilePictureFile) {
      dataToSend.append('ProfilePicture', profilePictureFile, profilePictureFile.name)
    }

    try {
      const updatedUser = await updateCurrentUser(dataToSend)

      const updatedUserWithPreview = {
        ...updatedUser,
        profilePicture: profilePictureFile
          ? URL.createObjectURL(profilePictureFile)
          : updatedUser.profilePicture || user?.profilePicture, // Usar foto existente si no se modifica
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: updatedUser.role !== undefined ? updatedUser.role : user?.role
      }

      setUser(updatedUserWithPreview)
      updateUser(updatedUserWithPreview) // actualizar en AuthContext

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
            <Form onSubmit={handleSubmit}>
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
                {/* Campos editables */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name='firstName'
                    label='Nombre'
                    placeholder='Nombre'
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name='lastName'
                    label='Apellidos'
                    placeholder='Apellidos'
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type='email'
                    name='email'
                    label='Correo'
                    placeholder='correo@ejemplo.com'
                    value={formData.email}
                    onChange={handleChange}
                    error={!!emailError} // Mostrar error visual
                    helperText={emailError} // Mostrar mensaje debajo
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name='phone'
                    label='Teléfono'
                    placeholder='123-456-7890'
                    value={formData.phone}
                    onChange={handleChange}
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
                <TextField
                  fullWidth
                  name='firstName'
                  label='Nombre'
                  placeholder='Nombre'
                  value={formData.firstName}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name='lastName'
                  label='Apellido'
                  placeholder='Apellido'
                  value={formData.lastName}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type='email'
                  name='email'
                  label='Correo'
                  placeholder='correo@ejemplo.com'
                  value={formData.email}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name='phone'
                  label='Teléfono'
                  placeholder='123-456-7890'
                  value={formData.phone}
                  disabled
                />
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
