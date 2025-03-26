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
  FormControl,
  FormHelperText
} from '@mui/material'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import LoadingButton from '@mui/lab/LoadingButton'

import { updateVehicle } from '../../services/VehicleService'
import { getVehicleTypesSearch } from '../../services/VehicleTypeService'

// Esquema de validación
const schema = z.object({
  name: z.string().nonempty('El nombre es requerido').max(100, 'El nombre no puede tener más de 100 caracteres'),
  description: z.string().max(500, 'La descripción no puede tener más de 500 caracteres').optional().or(z.literal('')),
  isAvailable: z.boolean(),
  isActive: z.boolean(),
  vehicleTypeId: z
    .number({
      required_error: 'El tipo de vehículo es requerido',
      invalid_type_error: 'Seleccione un tipo de vehículo válido'
    })
    .min(1, 'Seleccione un tipo de vehículo válido'),
  picture: z.any().optional()
})

type FormValues = {
  name: string
  description: string
  isAvailable: boolean
  isActive: boolean
  vehicleTypeId: number
  picture?: FileList
}

interface UpdateVehicleModalProps {
  open: boolean
  handleClose: () => void
  vehicle: any
  onVehicleUpdated: () => void
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

export default function UpdateVehicleModal({ open, handleClose, vehicle, onVehicleUpdated }: UpdateVehicleModalProps) {
  const [loading, setLoading] = useState(false)
  const [vehicleTypes, setVehicleTypes] = useState<{ id: number; name: string }[]>([])
  const [deletedImage, setDeletedImage] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    watch,
    control,
    setValue,
    formState: { errors },
    setError
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      isAvailable: true,
      isActive: true,
      vehicleTypeId: 0
    }
  })

  // Cargar tipos de vehículos
  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const response = await getVehicleTypesSearch({
          names: [],
          descriptions: [],
          isActive: true
        })

        setVehicleTypes(response.data || [])
      } catch (error) {
        console.error('Error al cargar tipos de vehículos:', error)
        toast.error('No se pudieron cargar los tipos de vehículos')
      }
    }

    if (open) {
      fetchVehicleTypes()
    }
  }, [open])

  // Observar el campo de imagen para mostrar la preview
  const vehiclePic = watch('picture')

  const imageSrc =
    vehiclePic && vehiclePic.length > 0
      ? URL.createObjectURL(vehiclePic[0])
      : deletedImage
        ? '/images/avatars/1.png'
        : vehicle?.picture || '/images/avatars/1.png'

  // Inicializar formulario con datos del vehículo
  useEffect(() => {
    if (vehicle && open) {
      console.log('Inicializando formulario con vehículo:', vehicle);
      
      // Reinicia el formulario antes de establecer nuevos valores
      reset({
        name: '',
        description: '',
        isAvailable: true,
        isActive: true,
        vehicleTypeId: 0
      });
      
      setValue('name', vehicle.name)
      setValue('description', vehicle.description || '')
      setValue('vehicleTypeId', vehicle.vehicleTypeId)

      // Manejar booleanos que podrían venir en diferentes formatos
      const isAvailableBoolean = (() => {
        if (typeof vehicle.isAvailable === 'boolean') return vehicle.isAvailable;

        if (typeof vehicle.isAvailable === 'string') {
          return vehicle.isAvailable.toLowerCase() === 'true' || 
                 vehicle.isAvailable === 'Sí' || 
                 vehicle.isAvailable === '1';
        }

        
return Boolean(vehicle.isAvailable);
      })();

      const isActiveBoolean = (() => {
        if (typeof vehicle.isActive === 'boolean') return vehicle.isActive;

        if (typeof vehicle.isActive === 'string') {
          return vehicle.isActive.toLowerCase() === 'true' || 
                 vehicle.isActive === 'Sí' || 
                 vehicle.isActive === '1';
        }

        
return Boolean(vehicle.isActive);
      })();

      console.log('Valores parseados:', { isAvailableBoolean, isActiveBoolean });
      
      setValue('isAvailable', isAvailableBoolean)
      setValue('isActive', isActiveBoolean)
      setDeletedImage(false)
    }
  }, [vehicle, open, setValue, reset])

  // Función para cerrar el modal y resetear el formulario
  const closeModal = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    reset()
    setDeletedImage(false)
    handleClose()
  }

  const onSubmit = async (data: FormValues) => {
    if (!vehicle) return

    setLoading(true)
    const formData = new FormData()

    // Manejo de la imagen
    if (deletedImage) {
      // Crear y enviar un archivo vacío para indicar la eliminación de la imagen
      const emptyFile = new File([], '')

      formData.append('Picture', emptyFile)
    } else if (data.picture && data.picture.length > 0) {
      // Se ha seleccionado una nueva imagen
      formData.append('Picture', data.picture[0])
    } else if (vehicle?.picture) {
      // No se modificó la imagen: usar el canvas para convertir la imagen actual en un File
      try {
        const vehiclePicFile = await getFileFromImageUrl(vehicle.picture, 'vehicle-picture.jpg', 'image/jpeg')

        formData.append('Picture', vehiclePicFile)
      } catch (error) {
        console.error('Error al convertir la imagen del vehículo existente:', error)
      }
    }

    formData.append('UserId', vehicle.userId.toString())
    formData.append('Name', data.name)
    formData.append('Description', data.description || '')
    formData.append('IsAvailable', String(data.isAvailable))
    formData.append('IsActive', String(data.isActive))
    formData.append('VehicleTypeId', data.vehicleTypeId.toString())

    try {
      await updateVehicle(vehicle.id, formData)
      toast.success('Vehículo actualizado correctamente')
      onVehicleUpdated()
      closeModal()
    } catch (error: any) {
      console.error('Error al actualizar vehículo:', error)
      
      // Manejo específico para error 409 (Conflict) - Vehículo con nombre duplicado
      if (error.status === 409) {
        setError('name', {
          type: 'manual',
          message: 'El mensajero ya posee un vehículo con este nombre'
        })
      } else {
        toast.error(error.message || 'Error al actualizar vehículo')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={closeModal} fullWidth>
      <DialogTitle>Actualizar Vehículo</DialogTitle>
      <DialogContent>
        <form id='update-vehicle-form' onSubmit={handleSubmit(onSubmit)}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <Image src={imageSrc} alt='Imagen del vehículo' width={100} height={100} style={{ borderRadius: '8px' }} />
          </div>
          <Button variant='outlined' component='label' fullWidth sx={{ mb: 1 }}>
            Subir nueva imagen
            <input
              type='file'
              hidden
              {...register('picture', {
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
              resetField('picture')
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
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
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
          <FormControl fullWidth margin='normal' error={!!errors.vehicleTypeId}>
            <InputLabel id='vehicle-type-update-label'>Tipo de Vehículo</InputLabel>
            <Controller
              name='vehicleTypeId'
              control={control}
              render={({ field }) => (
                <Select
                  labelId='vehicle-type-update-label'
                  label='Tipo de Vehículo'
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                >
                  <MenuItem value='' disabled>
                    Seleccione un tipo de vehículo
                  </MenuItem>
                  {vehicleTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.vehicleTypeId && <FormHelperText>{errors.vehicleTypeId.message}</FormHelperText>}
          </FormControl>
          <Controller
            name='isAvailable'
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormControlLabel
                control={<Checkbox checked={Boolean(value)} onChange={onChange} />}
                label='Disponible'
              />
            )}
          />
          <Controller
            name='isActive'
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormControlLabel control={<Checkbox checked={Boolean(value)} onChange={onChange} />} label='Activo' />
            )}
          />
          <br />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>Cancelar</Button>
        <LoadingButton type='submit' form='update-vehicle-form' variant='contained' loading={loading}>
          Actualizar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
