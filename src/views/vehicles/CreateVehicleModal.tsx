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

import { createVehicle } from '../../services/VehicleService'
import { getVehicleTypesSearch } from '../../services/VehicleTypeService'

type FormValues = {
  name: string
  description: string
  isAvailable: boolean
  isActive: boolean
  vehicleTypeId: number
  picture?: FileList
}

interface CreateVehicleModalProps {
  open: boolean
  handleClose: () => void
  courierId: number
  onVehicleCreated: () => void
}

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
  picture: z.any().optional() // Make picture optional
})

export default function CreateVehicleModal({
  open,
  handleClose,
  courierId,
  onVehicleCreated
}: CreateVehicleModalProps) {
  const [loading, setLoading] = useState(false)
  const [vehicleTypes, setVehicleTypes] = useState<{ id: number; name: string }[]>([])

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    watch,
    formState: { errors },
    setValue,
    setError
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
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
  const profilePic = watch('picture')

  const imageSrc = profilePic && profilePic.length > 0 ? URL.createObjectURL(profilePic[0]) : '/images/avatars/1.png'

  // Función para cerrar el modal y resetear el formulario
  const closeModal = () => {
    reset()
    handleClose()
  }

  const onSubmit = async (data: FormValues & { picture?: FileList }) => {
    setLoading(true)
    const formData = new FormData()

    // Adjuntar archivo si existe
    if (data.picture && data.picture.length > 0) {
      formData.append('picture', data.picture[0])
    }

    formData.append('idCourier', courierId.toString())
    formData.append('name', data.name)
    formData.append('description', data.description || '')
    formData.append('isAvailable', String(data.isAvailable))
    formData.append('isActive', String(data.isActive))
    formData.append('vehicleTypeId', data.vehicleTypeId.toString())

    try {
      await createVehicle(formData)
      toast.success('Vehículo creado correctamente')
      reset()
      onVehicleCreated()
      closeModal()
    } catch (error: any) {
      console.error('Error al crear vehículo:', error)

      // Manejo específico para error 409 (Conflict) - Vehículo con nombre duplicado
      if (error.status === 409) {
        setError('name', {
          type: 'manual',
          message: 'El mensajero ya posee un vehículo con este nombre'
        })
      } else {
        toast.error(error.message || 'Error al crear vehículo')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={closeModal} fullWidth>
      <DialogTitle>Crear Vehículo</DialogTitle>
      <DialogContent>
        <form id='create-vehicle-form' onSubmit={handleSubmit(onSubmit)}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <Image src={imageSrc} alt='Imagen del vehículo' width={100} height={100} style={{ borderRadius: '8px' }} />
          </div>
          <Button variant='outlined' component='label' fullWidth sx={{ mb: 1 }}>
            Subir imagen del vehículo
            <input type='file' hidden {...register('picture')} />
          </Button>
          {errors.picture && <FormHelperText error>{errors.picture.message?.toString()}</FormHelperText>}
          <Button variant='outlined' onClick={() => resetField('picture')} fullWidth sx={{ mb: 2 }}>
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
            <InputLabel id='vehicle-type-label'>Tipo de Vehículo</InputLabel>
            <Select
              labelId='vehicle-type-label'
              label='Tipo de Vehículo'
              defaultValue=''
              {...register('vehicleTypeId', {
                valueAsNumber: true,
                onChange: e => setValue('vehicleTypeId', Number(e.target.value))
              })}
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
            {errors.vehicleTypeId && <FormHelperText>{errors.vehicleTypeId.message}</FormHelperText>}
          </FormControl>
          <FormControlLabel control={<Checkbox {...register('isAvailable')} defaultChecked />} label='Disponible' />
          <FormControlLabel control={<Checkbox {...register('isActive')} defaultChecked />} label='Activo' />
          <br />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>Cancelar</Button>
        <LoadingButton type='submit' form='create-vehicle-form' variant='contained' loading={loading}>
          Crear
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
