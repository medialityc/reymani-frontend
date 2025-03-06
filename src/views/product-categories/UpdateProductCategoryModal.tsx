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
  FormControlLabel,
  Checkbox
} from '@mui/material'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import LoadingButton from '@mui/lab/LoadingButton'

import { updateProductCategory } from '../../services/ProductCategoryService'

type FormValues = {
  name: string
  isActive: boolean
  logo?: FileList
}

interface UpdateProductCategoryModalProps {
  open: boolean
  handleClose: () => void
  category: {
    id: number
    name: string
    logo: string
    isActive: boolean
  }
  onCategoryUpdated: () => void
}

// Esquema de validación con zod
const schema = z.object({
  name: z
    .string()
    .nonempty('El nombre es requerido')
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'El nombre solo debe contener letras y espacios'),
  isActive: z.boolean(),
  logo: z.any().optional()
})

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

    img.onerror = (error: any) => {
      reject(error)
    }
  })
}

export default function UpdateProductCategoryModal({
  open,
  handleClose,
  category,
  onCategoryUpdated
}: UpdateProductCategoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [deletedLogo, setDeletedLogo] = useState(false)

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
    resolver: zodResolver(schema)
  })

  // Función para cerrar el modal y resetear los valores
  const closeModal = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    resetFormData()
    handleClose()
  }

  // Reinicia el formulario con los valores originales de la categoría
  const resetFormData = () => {
    if (category) {
      reset({
        name: category.name,
        isActive: category.isActive,
        logo: undefined
      })
      setDeletedLogo(false)
    }
  }

  useEffect(() => {
    if (category) {
      setValue('name', category.name)
      setValue('isActive', category.isActive)
      setDeletedLogo(false)
    }
  }, [category, setValue])

  // Observa el campo de imagen para determinar qué mostrar
  const logoFile = watch('logo')

  // Previsualización del logo
  const logoPreview = deletedLogo
    ? null
    : logoFile && logoFile.length > 0
      ? URL.createObjectURL(logoFile[0])
      : category?.logo || null

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    const formData = new FormData()

    // Manejo del Logo
    if (deletedLogo) {
      // Enviar un archivo vacío para indicar eliminación
      formData.append('Logo', new File([], ''))
    } else if (data.logo && data.logo.length > 0) {
      // Se subió un nuevo logo
      formData.append('Logo', data.logo[0])
    } else if (category?.logo) {
      // No se modificó el logo: usar el canvas para convertir la imagen actual en un File
      try {
        const logoFile = await getFileFromImageUrl(category.logo, 'logo.jpg', 'image/jpeg')

        formData.append('Logo', logoFile)
      } catch (error) {
        console.error('Error al convertir el logo existente:', error)
        toast.error('Error al procesar la imagen. Intente subir una nueva imagen.')
        setLoading(false)

        return
      }
    }

    formData.append('Name', data.name)
    formData.append('IsActive', String(data.isActive))

    try {
      await updateProductCategory(category.id, formData)
      toast.success('Categoría actualizada correctamente')
      onCategoryUpdated()
      closeModal()
    } catch (error: any) {
      if (error.status === 409) {
        setError('name', {
          type: 'manual',
          message: 'Ya existe una categoría con este nombre'
        })
      } else {
        toast.error('Error al actualizar la categoría')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={closeModal} fullWidth>
      <DialogTitle>Actualizar Categoría de Producto</DialogTitle>
      <DialogContent>
        <form id='update-category-form' onSubmit={handleSubmit(onSubmit)}>
          {logoPreview && (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <Image
                src={logoPreview}
                alt='Logo de categoría'
                width={100}
                height={100}
                style={{ borderRadius: '8px' }}
                unoptimized
              />
            </div>
          )}
          <Button variant='outlined' component='label' fullWidth sx={{ mb: 1, mt: 2 }}>
            Cambiar logo
            <input
              type='file'
              accept='image/*'
              hidden
              {...register('logo', {
                onChange: e => {
                  setDeletedLogo(false)

                  return e
                }
              })}
            />
          </Button>
          <Button
            variant='outlined'
            onClick={() => {
              resetField('logo')
              setDeletedLogo(true)
            }}
            fullWidth
            sx={{ mb: 2 }}
          >
            Eliminar logo
          </Button>
          <TextField
            fullWidth
            label='Nombre'
            margin='normal'
            {...register('name', { required: true })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <Controller
            name='isActive'
            control={control}
            defaultValue={category?.isActive ?? true}
            render={({ field: { value, onChange } }) => (
              <FormControlLabel control={<Checkbox checked={Boolean(value)} onChange={onChange} />} label='Activo' />
            )}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>Cancelar</Button>
        <LoadingButton type='submit' form='update-category-form' variant='contained' loading={loading}>
          Actualizar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
