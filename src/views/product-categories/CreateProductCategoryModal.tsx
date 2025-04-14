'use client'

import React, { useState } from 'react'

import Image from 'next/image'

import { useForm } from 'react-hook-form'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import LoadingButton from '@mui/lab/LoadingButton'

import { createProductCategory } from '../../services/ProductCategoryService'

type FormValues = {
  name: string
  logo?: FileList
}

interface CreateProductCategoryModalProps {
  open: boolean
  handleClose: () => void
  onCategoryCreated: () => void
}

// Esquema de validación con zod
const schema = z.object({
  name: z
    .string()
    .nonempty('El nombre es requerido')
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'El nombre solo debe contener letras y espacios'),
  logo: z.any().optional()
})

export default function CreateProductCategoryModal({
  open,
  handleClose,
  onCategoryCreated
}: CreateProductCategoryModalProps) {
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
    resolver: zodResolver(schema)
  })

  // Observar el campo de imagen para mostrar la preview
  const logoFile = watch('logo')
  const hasLogo = logoFile && logoFile.length > 0
  const imageSrc = hasLogo ? URL.createObjectURL(logoFile[0]) : null

  // Función para cerrar el modal y resetear el formulario
  const closeModal = () => {
    reset()
    handleClose()
  }

  const onSubmit = async (data: FormValues & { logo?: FileList }) => {
    setLoading(true)
    const formData = new FormData()

    // Adjuntar archivo solo si existe
    if (data.logo && data.logo.length > 0) {
      formData.append('Logo', data.logo[0])
    }

    formData.append('Name', data.name)

    try {
      await createProductCategory(formData)
      toast.success('Categoría de producto creada correctamente')
      reset()
      onCategoryCreated()
      closeModal()
    } catch (error: any) {
      if (error.status === 409) {
        setError('name', {
          type: 'manual',
          message: 'Ya existe una categoría con este nombre'
        })
      } else {
        toast.error('Error al crear la categoría de producto')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={closeModal} fullWidth>
      <DialogTitle>Crear Categoría de Producto</DialogTitle>
      <DialogContent>
        <form id='create-category-form' onSubmit={handleSubmit(onSubmit)}>
          {hasLogo && (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <Image src={imageSrc as string} alt='Logo' width={100} height={100} style={{ borderRadius: '8px' }} />
            </div>
          )}
          <Button variant='outlined' component='label' fullWidth sx={{ mb: 1, mt: 2 }}>
            Subir logo
            <input type='file' hidden {...register('logo')} />
          </Button>
          {errors.logo && <p style={{ color: 'red', fontSize: '0.75rem' }}>{errors.logo.message as string}</p>}
          <Button variant='outlined' onClick={() => resetField('logo')} fullWidth sx={{ mb: 2 }}>
            Eliminar imagen
          </Button>
          <TextField
            fullWidth
            label='Nombre'
            margin='normal'
            {...register('name', { required: true })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>Cancelar</Button>
        <LoadingButton type='submit' form='create-category-form' variant='contained' loading={loading}>
          Crear
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
