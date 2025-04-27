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
  FormControlLabel
} from '@mui/material'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import LoadingButton from '@mui/lab/LoadingButton'

import { createVehicleType } from '../../services/VehicleTypeService'

type FormValues = {
  name: string
  totalCapacity: number
  isActive: boolean
  logo?: FileList
}

interface CreateVehicleTypeModalProps {
  open: boolean
  handleClose: () => void
  onVehicleTypeCreated: () => void
}

// Esquema de validación
const schema = z.object({
  name: z.string().nonempty('El nombre es requerido').max(50, 'El nombre no puede tener más de 50 caracteres'),
  totalCapacity: z.preprocess(
    val => Number(val),
    z
      .number()
      .positive('La capacidad debe ser un número positivo')
      .int('La capacidad debe ser un número entero')
      .refine(val => val > 0, { message: 'La capacidad total es requerida' })
  ),
  isActive: z.boolean(),
  logo: z
    .any()
    .optional() // Make logo optional
    .refine(files => !files || files.length === 0 || files[0]?.size <= 5000000, 'El tamaño máximo del archivo es 5MB')
    .refine(
      files => !files || files.length === 0 || ['image/jpeg', 'image/png', 'image/gif'].includes(files[0]?.type),
      'Formato de archivo no soportado. Use JPEG, PNG o GIF'
    )
})

export default function CreateVehicleTypeModal({
  open,
  handleClose,
  onVehicleTypeCreated
}: CreateVehicleTypeModalProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    setError
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      isActive: true
    }
  })

  // Observar el campo de imagen para mostrar la preview
  const logo = watch('logo')

  // Función para cerrar el modal y resetear el formulario
  const closeModal = () => {
    reset()
    handleClose()
  }

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    const formData = new FormData()

    if (data.logo && data.logo.length > 0) {
      formData.append('Logo', data.logo[0])
    }

    formData.append('Name', data.name)
    formData.append('TotalCapacity', data.totalCapacity.toString())
    formData.append('IsActive', String(data.isActive))

    try {
      await createVehicleType(formData)
      toast.success('Tipo de vehículo creado correctamente')
      reset()
      onVehicleTypeCreated()
      closeModal()
    } catch (error: any) {
      if (error.response?.status === 409 || error.status === 409) {
        setError('name', { type: 'manual', message: 'Este nombre ya está en uso por otro tipo de vehículo' })
      } else {
        toast.error('Error al crear tipo de vehículo')
      }

      console.error('Error al crear tipo de vehículo:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={closeModal} fullWidth>
      <DialogTitle>Crear Tipo de Vehículo</DialogTitle>
      <DialogContent>
        <form id='create-vehicle-type-form' onSubmit={handleSubmit(onSubmit)}>
          {logo && logo.length > 0 && (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <Image src={URL.createObjectURL(logo[0])} alt='Logo del vehículo' width={100} height={100} />
            </div>
          )}
          <Button variant='outlined' component='label' fullWidth sx={{ mb: 1 }}>
            Subir logo
            <input type='file' hidden {...register('logo')} />
          </Button>
          {errors.logo && <p style={{ color: 'red', margin: '0 0 16px 0' }}>{errors.logo.message as string}</p>}

          <TextField
            fullWidth
            label='Nombre'
            margin='normal'
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            fullWidth
            label='Capacidad Total'
            margin='normal'
            type='number'
            inputProps={{ min: 1 }}
            {...register('totalCapacity', { valueAsNumber: true })}
            error={!!errors.totalCapacity}
            helperText={errors.totalCapacity?.message}
          />

          <FormControlLabel control={<Checkbox {...register('isActive')} defaultChecked />} label='Activo' />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>Cancelar</Button>
        <LoadingButton type='submit' form='create-vehicle-type-form' variant='contained' loading={loading}>
          Crear
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
