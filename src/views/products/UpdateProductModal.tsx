'use client'

import React, { useState, useEffect } from 'react'

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
  MenuItem,
  Grid
} from '@mui/material'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import LoadingButton from '@mui/lab/LoadingButton'

import { updateMyProduct } from '../../services/ProductService'
import { getCategories } from '../../services/CategoryService'
import { capacityOptions } from '../../utils/capacityUtils'

// Expresión regular para validar nombres y descripciones
const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,!?:;()[\]{}'"+-]+$/

const schema = z.object({
  id: z.number(),
  name: z.string().nonempty('El nombre es requerido').regex(nameRegex, 'El nombre contiene caracteres no válidos'),
  description: z.string().regex(nameRegex, 'La descripción contiene caracteres no válidos').or(z.literal('')),
  price: z.preprocess(
    val => Number(val),
    z.number().positive('El precio debe ser mayor a 0').min(0.01, 'El precio mínimo es 0.01')
  ),
  discountPrice: z.preprocess(
    val => (val === '' ? null : Number(val)),
    z
      .number()
      .nullable()
      .refine(val => val === null || val >= 0, 'El precio de descuento debe ser mayor o igual a 0')
  ),
  categoryId: z.preprocess(
    val => Number(val),
    z.number().refine(val => val > 0, { message: 'La categoría es requerida' })
  ),
  capacity: z.preprocess(
    val => Number(val),
    z.number().int().min(1, { message: 'La capacidad es requerida' }).max(3, 'Valor de capacidad no válido')
  ),
  isAvailable: z.boolean(),
  isActive: z.boolean(),
  images: z.any().optional()
})

type FormValues = {
  id: number
  name: string
  description: string
  price: number
  discountPrice: number | null
  categoryId: number
  capacity: number
  isAvailable: boolean
  isActive: boolean
  images?: FileList
}

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  description: string
  businessId: number
  businessName: string
  isAvailable: boolean
  isActive: boolean
  images: string[]
  price: number
  discountPrice: number
  categoryId: number
  categoryName: string
  capacity: number
  numberOfRatings: number
  averageRating: number
}

interface UpdateProductModalProps {
  open: boolean
  handleClose: () => void
  product: Product
  onProductUpdated: () => void
}

export default function UpdateProductModal({ open, handleClose, product, onProductUpdated }: UpdateProductModalProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [nameError, setNameError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    resetField,
    setValue,
    setError,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: 0,
      name: '',
      description: '',
      price: 0,
      discountPrice: null,
      categoryId: 0,
      capacity: 0, // Cambiado a 0 para forzar la selección
      isAvailable: false,
      isActive: false
    }
  })

  const imagesFiles = watch('images')
  const capacityValue = watch('capacity')
  const categoryIdValue = watch('categoryId')
  const isAvailableValue = watch('isAvailable')
  const isActiveValue = watch('isActive')

  const imagesPreview =
    imagesFiles && imagesFiles.length > 0 ? Array.from(imagesFiles).map(file => URL.createObjectURL(file)) : []

  // Carga inicial de categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()

        setCategories(data || [])
      } catch (error: any) {
        console.error('Error al obtener categorías:', error)
        toast.error('Error al cargar categorías')
      }
    }

    if (open) {
      fetchCategories()
    }
  }, [open])

  // Actualizar el formulario cuando el producto cambia o se abre el modal
  useEffect(() => {
    if (open && product) {
      // Reiniciar el formulario primero para limpiar valores anteriores
      reset({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice || null,
        categoryId: product.categoryId,
        capacity: product.capacity,
        isAvailable: product.isAvailable,
        isActive: product.isActive
      })

      setExistingImages(product.images || [])
      setNameError(null)

      // Asegurar que los valores se actualicen inmediatamente
      setValue('id', product.id)
      setValue('name', product.name)
      setValue('description', product.description)
      setValue('price', product.price)
      setValue('discountPrice', product.discountPrice || null)
      setValue('categoryId', product.categoryId)
      setValue('capacity', product.capacity)
      setValue('isAvailable', product.isAvailable)
      setValue('isActive', product.isActive)

      console.log('Producto cargado:', {
        id: product.id,
        name: product.name,
        categoryId: product.categoryId,
        capacity: product.capacity,
        isAvailable: product.isAvailable,
        isActive: product.isActive
      })
    }
  }, [open, product, reset, setValue])

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setNameError(null)
    const formData = new FormData()

    formData.append('Id', String(data.id))
    formData.append('Name', data.name)
    formData.append('Description', data.description)
    formData.append('Price', String(data.price))
    formData.append('DiscountPrice', String(data.discountPrice || 0))
    formData.append('CategoryId', String(data.categoryId))
    formData.append('Capacity', String(data.capacity))
    formData.append('IsAvailable', String(data.isAvailable))
    formData.append('IsActive', String(data.isActive))

    // Agregar imágenes nuevas al FormData
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append('Images', data.images[i])
      }
    }

    try {
      await updateMyProduct(data.id, formData)
      toast.success('Producto actualizado correctamente')
      onProductUpdated()
      handleModalClose()
    } catch (error: any) {
      if (error.status === 409) {
        setError('name', {
          type: 'manual',
          message: 'El nombre del producto ya está en uso por otro producto'
        })
        setNameError('El nombre del producto ya está en uso por otro producto')
      } else {
        toast.error(error.message || 'Error al actualizar producto')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    reset()
    setExistingImages([])
    setNameError(null)
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleModalClose} fullWidth>
      <DialogTitle>Actualizar Producto</DialogTitle>
      <DialogContent>
        <form id='update-product-form' onSubmit={handleSubmit(onSubmit)}>
          {/* Mostrar imágenes existentes */}
          {existingImages.length > 0 && (
            <>
              <p>Imágenes actuales:</p>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {existingImages.map((src, index) => (
                  <Grid item xs={4} key={index} sx={{ textAlign: 'center' }}>
                    <Image src={src} alt={`Imagen ${index + 1}`} width={100} height={100} unoptimized />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {/* Vista previa de nuevas imágenes */}
          {imagesPreview.length > 0 && (
            <>
              <p>Nuevas imágenes:</p>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {imagesPreview.map((src, index) => (
                  <Grid item xs={4} key={index} sx={{ textAlign: 'center' }}>
                    <Image src={src} alt={`Vista previa ${index + 1}`} width={100} height={100} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          <Button variant='outlined' component='label' fullWidth sx={{ mb: 1 }}>
            Subir Nuevas Imágenes (múltiples)
            <input type='file' hidden multiple {...register('images')} />
          </Button>
          {imagesPreview.length > 0 && (
            <Button variant='outlined' onClick={() => resetField('images')} fullWidth sx={{ mb: 2 }}>
              Eliminar Nuevas Imágenes
            </Button>
          )}

          <TextField
            fullWidth
            label='Nombre'
            margin='normal'
            {...register('name')}
            error={!!errors.name || !!nameError}
            helperText={errors.name?.message || nameError}
          />
          <TextField
            fullWidth
            label='Descripción'
            margin='normal'
            multiline
            rows={3}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <TextField
            fullWidth
            label='Precio'
            margin='normal'
            type='number'
            inputProps={{ step: '0.01' }}
            {...register('price')}
            error={!!errors.price}
            helperText={errors.price?.message}
          />
          <TextField
            fullWidth
            label='Descuento (opcional)'
            margin='normal'
            type='number'
            inputProps={{ step: '0.01' }}
            {...register('discountPrice')}
            error={!!errors.discountPrice}
            helperText={errors.discountPrice?.message}
          />
          <TextField
            select
            label='Categoría'
            fullWidth
            margin='normal'
            {...register('categoryId', { valueAsNumber: true })}
            error={!!errors.categoryId}
            helperText={errors.categoryId?.message || 'Seleccione una categoría'}
            value={categoryIdValue || 0}
          >
            {categories.map(category => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label='Capacidad'
            fullWidth
            margin='normal'
            {...register('capacity', { valueAsNumber: true })}
            error={!!errors.capacity}
            helperText={errors.capacity?.message || 'Seleccione una capacidad'}
            InputLabelProps={{ shrink: true }}
            value={capacityValue || 0}
          >
            {capacityOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={<Checkbox {...register('isAvailable')} checked={isAvailableValue || false} />}
            label='Disponible'
            sx={{ mt: 1 }}
          />
          <FormControlLabel
            control={<Checkbox {...register('isActive')} checked={isActiveValue || false} />}
            label='Activo'
            sx={{ mt: 1, ml: 2 }}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleModalClose}>Cancelar</Button>
        <LoadingButton type='submit' form='update-product-form' variant='contained' loading={loading}>
          Actualizar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
