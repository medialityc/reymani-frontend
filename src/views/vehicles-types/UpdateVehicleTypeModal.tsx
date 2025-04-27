'use client'

import React, { useEffect, useState } from 'react'

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
  Typography
} from '@mui/material'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import LoadingButton from '@mui/lab/LoadingButton'

import { updateVehicleType } from '../../services/VehicleTypeService'

type FormValues = {
  name: string
  totalCapacity: number
  isActive: boolean
  logo?: FileList
}

interface UpdateVehicleTypeModalProps {
  open: boolean
  handleClose: () => void
  vehicleType: any
  onVehicleTypeUpdated: () => void
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
    .optional()
    .refine(files => !files || files.length === 0 || files[0]?.size <= 5000000, 'El tamaño máximo del archivo es 5MB')
    .refine(
      files => !files || files.length === 0 || ['image/jpeg', 'image/png', 'image/gif'].includes(files[0]?.type),
      'Formato de archivo no soportado. Use JPEG, PNG o GIF'
    )
})

export default function UpdateVehicleTypeModal({
  open,
  handleClose,
  vehicleType,
  onVehicleTypeUpdated
}: UpdateVehicleTypeModalProps) {
  const [deletedLogo, setDeletedLogo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    setValue,
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

    setDeletedLogo(false)
    setImageError(false)

    if (vehicleType) {
      reset({
        name: vehicleType.name,
        totalCapacity: vehicleType.totalCapacity,
        isActive: typeof vehicleType.isActive === 'boolean' ? vehicleType.isActive : vehicleType.isActive === 'Sí',
        logo: undefined
      })
    }

    handleClose()
  }

  useEffect(() => {
    if (vehicleType) {
      setValue('name', vehicleType.name)
      setValue('totalCapacity', vehicleType.totalCapacity)

      const isActiveBoolean =
        typeof vehicleType.isActive === 'boolean' ? vehicleType.isActive : vehicleType.isActive === 'Sí'

      setValue('isActive', isActiveBoolean)
      setDeletedLogo(false)
      setImageError(false)
    }
  }, [vehicleType, setValue])

  useEffect(() => {
    setImageError(false)
  }, [vehicleType, deletedLogo])

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    const formData = new FormData()

    // Match exactly how UpdateUserModal handles image deletion
    if (deletedLogo) {
      // Use the same empty file creation approach as in UpdateUserModal
      const emptyFile = new File([], '')

      formData.append('Logo', emptyFile)
    } else if (data.logo && data.logo.length > 0) {
      formData.append('Logo', data.logo[0])
    }

    // If neither deletedLogo nor new logo, don't send anything - keep existing logo

    // Append other form data
    formData.append('Name', data.name)
    formData.append('TotalCapacity', data.totalCapacity.toString())
    formData.append('IsActive', String(data.isActive))

    try {
      await updateVehicleType(vehicleType.id, formData)
      toast.success('Tipo de vehículo actualizado correctamente')
      onVehicleTypeUpdated()
      closeModal()
    } catch (error: any) {
      if (error.response?.status === 409 || error.status === 409) {
        setError('name', { type: 'manual', message: 'Este nombre ya está en uso por otro tipo de vehículo' })
      } else {
        toast.error('Error al actualizar tipo de vehículo')
      }

      console.error('Error al actualizar tipo de vehículo:', error)
    } finally {
      setLoading(false)
    }
  }

  // Observa el campo de imagen para determinar qué mostrar
  const logo = watch('logo')

  return (
    <Dialog open={open} onClose={closeModal} fullWidth>
      <DialogTitle>Actualizar Tipo de Vehículo</DialogTitle>
      <DialogContent>
        <form id='update-vehicle-type-form' onSubmit={handleSubmit(onSubmit)}>
          {logo && logo.length > 0 ? (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <Image
                src={URL.createObjectURL(logo[0])}
                alt='Logo del vehículo'
                width={100}
                height={100}
                onError={() => setImageError(true)}
                style={{ objectFit: 'contain' }}
              />
            </div>
          ) : !deletedLogo && vehicleType?.logo && !imageError ? (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <Image
                src={vehicleType.logo}
                alt='Logo del vehículo'
                width={100}
                height={100}
                onError={() => setImageError(true)}
                style={{ objectFit: 'contain' }}
              />
            </div>
          ) : null}

          {/* Display a message if image fails to load */}
          {imageError && !logo && !deletedLogo && (
            <Typography color='error' align='center' sx={{ mb: 2 }}>
              No se pudo cargar la imagen original
            </Typography>
          )}

          <Button variant='outlined' component='label' fullWidth sx={{ mb: 1 }}>
            Cambiar logo
            <input
              type='file'
              hidden
              {...register('logo', {
                onChange: e => {
                  setDeletedLogo(false)
                  setImageError(false)

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
              setImageError(false)
            }}
            fullWidth
            sx={{ mb: 2 }}
          >
            Eliminar logo
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

          <FormControlLabel
            control={<Checkbox {...register('isActive')} checked={watch('isActive')} />}
            label='Activo'
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>Cancelar</Button>
        <LoadingButton type='submit' form='update-vehicle-type-form' variant='contained' loading={loading}>
          Actualizar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
