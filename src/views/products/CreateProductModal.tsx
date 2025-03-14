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

import { createProduct } from '../../services/ProductService'
import { getCategories } from '../../services/CategoryService'
import { getBusiness } from '../../services/BusinessService'
import { capacityOptions } from '../../utils/capacityUtils'

// Expresión regular para validar nombres y descripciones
const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,!?:;()[\]{}'"+-]+$/

const schema = z.object({
  name: z.string().nonempty('El nombre es requerido').regex(nameRegex, 'El nombre contiene caracteres no válidos'),
  description: z.string().regex(nameRegex, 'La descripción contiene caracteres no válidos').or(z.literal('')),
  businessId: z.preprocess(
    val => Number(val),
    z.number().refine(val => val > 0, { message: 'El negocio es requerido' })
  ),
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
  name: string
  description: string
  businessId: number
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

interface Business {
  id: number
  name: string
}

interface CreateProductModalProps {
  open: boolean
  handleClose: () => void
  onProductCreated: () => void
}

export default function CreateProductModal({ open, handleClose, onProductCreated }: CreateProductModalProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [nameError, setNameError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    resetField,
    setError,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      businessId: 0,
      price: 0,
      discountPrice: null,
      categoryId: 0,
      capacity: 0,
      isAvailable: false,
      isActive: false
    }
  })

  const imagesFiles = watch('images')

  const imagesPreview =
    imagesFiles && imagesFiles.length > 0 ? Array.from(imagesFiles).map(file => URL.createObjectURL(file)) : []

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar categorías
        const categoriesData = await getCategories()

        setCategories(categoriesData || [])

        // Cargar negocios (necesitamos crear este servicio)
        const businessesData = await getBusiness()

        setBusinesses(businessesData || [])
      } catch (error: any) {
        console.error('Error al obtener datos:', error)
        toast.error('Error al cargar datos iniciales')
      }
    }

    if (open) {
      fetchData()
    }
  }, [open])

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setNameError(null)
    const formData = new FormData()

    formData.append('Name', data.name)
    formData.append('Description', data.description)
    formData.append('BusinessId', String(data.businessId))
    formData.append('Price', String(data.price))
    formData.append('DiscountPrice', String(data.discountPrice || 0))
    formData.append('CategoryId', String(data.categoryId))
    formData.append('Capacity', String(data.capacity))
    formData.append('IsAvailable', String(data.isAvailable))
    formData.append('IsActive', String(data.isActive))

    // Agregar imágenes al FormData
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append('Images', data.images[i])
      }
    }

    try {
      await createProduct(formData)
      toast.success('Producto creado correctamente')
      reset()
      onProductCreated()
      handleModalClose()
    } catch (error: any) {
      if (error.status === 409) {
        setError('name', {
          type: 'manual',
          message: 'El nombre del producto ya está en uso'
        })
        setNameError('El nombre del producto ya está en uso')
      } else {
        toast.error(error.message || 'Error al crear producto')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    reset()
    setNameError(null)
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleModalClose} fullWidth>
      <DialogTitle>Crear Producto</DialogTitle>
      <DialogContent>
        <form id='create-product-form' onSubmit={handleSubmit(onSubmit)}>
          {imagesPreview.length > 0 && (
            <Grid container spacing={1} sx={{ mb: 2, mt: 1 }}>
              {imagesPreview.map((src, index) => (
                <Grid item xs={4} key={index} sx={{ textAlign: 'center' }}>
                  <Image src={src} alt={`Vista previa ${index + 1}`} width={100} height={100} />
                </Grid>
              ))}
            </Grid>
          )}
          <Button variant='outlined' component='label' fullWidth sx={{ mb: 1 }}>
            Subir Imágenes
            <input type='file' hidden multiple {...register('images')} />
          </Button>
          {imagesPreview.length > 0 && (
            <Button variant='outlined' onClick={() => resetField('images')} fullWidth sx={{ mb: 2 }}>
              Eliminar Imágenes
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
            select
            label='Negocio'
            fullWidth
            margin='normal'
            {...register('businessId', { valueAsNumber: true })}
            error={!!errors.businessId}
            helperText={errors.businessId?.message || 'Seleccione un negocio'}
          >
            {businesses.map(business => (
              <MenuItem key={business.id} value={business.id}>
                {business.name}
              </MenuItem>
            ))}
          </TextField>
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
          >
            {capacityOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel control={<Checkbox {...register('isAvailable')} />} label='Disponible' sx={{ mt: 1 }} />
          <FormControlLabel control={<Checkbox {...register('isActive')} />} label='Activo' sx={{ mt: 1, ml: 2 }} />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleModalClose}>Cancelar</Button>
        <LoadingButton type='submit' form='create-product-form' variant='contained' loading={loading}>
          Crear
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
