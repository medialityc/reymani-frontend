'use client'

import React, { useState, useEffect } from 'react'

import { useForm } from 'react-hook-form'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import LoadingButton from '@mui/lab/LoadingButton'

import { createShippingCost } from '../../services/ShippingCostService'
import { getProvinces } from '../../services/ProvinceService'
import { getVehicleTypesSearch } from '../../services/VehicleTypeService'

const schema = z.object({
  municipalityId: z.preprocess(
    val => Number(val),
    z.number().refine(val => val > 0, { message: 'El municipio es requerido' })
  ),
  vehicleTypeId: z.preprocess(
    val => Number(val),
    z.number().refine(val => val > 0, { message: 'El tipo de vehículo es requerido' })
  ),
  cost: z.preprocess(val => Number(val), z.number().positive({ message: 'El costo debe ser mayor a 0' }))
})

type FormValues = {
  municipalityId: number
  vehicleTypeId: number
  cost: number
}

interface Province {
  id: number
  name: string
  municipalities: { id: number; name: string }[]
}

interface VehicleType {
  id: number
  name: string
}

interface CreateShippingCostModalProps {
  open: boolean
  handleClose: () => void
  onShippingCostCreated: () => void
}

export default function CreateShippingCostModal({
  open,
  handleClose,
  onShippingCostCreated
}: CreateShippingCostModalProps) {
  const [loading, setLoading] = useState(false)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(0)
  const [provinceError, setProvinceError] = useState<string>('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      municipalityId: 0,
      vehicleTypeId: 0,
      cost: 0
    }
  })

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await getProvinces()

        setProvinces(data)
      } catch (error: any) {
        console.error('Error al obtener provincias:', error)
      }
    }

    const fetchVehicleTypes = async () => {
      try {
        const filters = {
          IsActive: true,
          PageSize: 100
        }

        const response = await getVehicleTypesSearch(filters)

        setVehicleTypes(response.data || [])
      } catch (error: any) {
        console.error('Error al obtener tipos de vehículos:', error)
      }
    }

    fetchProvinces()
    fetchVehicleTypes()
  }, [])

  const onSubmit = async (data: FormValues) => {
    // Validar que se seleccione una provincia
    if (selectedProvinceId === 0) {
      setProvinceError('La provincia es requerida')

      return
    } else {
      setProvinceError('')
    }

    setLoading(true)

    try {
      await createShippingCost({
        municipalityId: data.municipalityId,
        vehicleTypeId: data.vehicleTypeId,
        cost: data.cost
      })
      toast.success('Costo de envío creado correctamente')
      reset()
      onShippingCostCreated()
      handleModalClose()
    } catch (error: any) {
      console.error('Error details:', error)

      // Mantener solo el toast para errores, no mostrar en el formulario
      if (
        error.status === 409 ||
        error.response?.status === 409 ||
        (error.message &&
          (error.message.includes('Ya existe') ||
            error.message.includes('409') ||
            error.message.toLowerCase().includes('conflict')))
      ) {
        toast.error('Ya existe un costo de envío para este municipio y tipo de vehículo')
      } else {
        toast.error(error.message || 'Error al crear costo de envío')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    reset()
    setSelectedProvinceId(0)
    setProvinceError('')
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleModalClose} fullWidth>
      <DialogTitle>Crear Costo de Envío</DialogTitle>
      <DialogContent>
        <form id='create-shippingcost-form' onSubmit={handleSubmit(onSubmit)}>
          <TextField
            select
            label='Provincia'
            fullWidth
            margin='normal'
            value={selectedProvinceId}
            onChange={e => {
              const value = Number(e.target.value)

              setSelectedProvinceId(value)
              reset(formValues => ({
                ...formValues,
                municipalityId: 0
              }))
              setProvinceError('')
            }}
            error={provinceError !== ''}
            helperText={provinceError || 'Seleccione una provincia'}
          >
            <MenuItem value={0}>Seleccione una provincia</MenuItem>
            {provinces.map(prov => (
              <MenuItem key={prov.id} value={prov.id}>
                {prov.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label='Municipio'
            fullWidth
            margin='normal'
            {...register('municipalityId', { valueAsNumber: true })}
            disabled={!selectedProvinceId}
            error={!!errors.municipalityId}
            helperText={errors.municipalityId?.message || 'Seleccione un municipio'}
          >
            <MenuItem value={0}>Seleccione un municipio</MenuItem>
            {(provinces.find(prov => prov.id === selectedProvinceId)?.municipalities || []).map(mun => (
              <MenuItem key={mun.id} value={mun.id}>
                {mun.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label='Tipo de Vehículo'
            fullWidth
            margin='normal'
            {...register('vehicleTypeId', { valueAsNumber: true })}
            error={!!errors.vehicleTypeId}
            helperText={errors.vehicleTypeId?.message || 'Seleccione un tipo de vehículo'}
          >
            <MenuItem value={0}>Seleccione un tipo de vehículo</MenuItem>
            {vehicleTypes.map(vt => (
              <MenuItem key={vt.id} value={vt.id}>
                {vt.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label='Costo'
            type='number'
            margin='normal'
            inputProps={{ step: '0.01', min: '0' }}
            {...register('cost', { valueAsNumber: true })}
            error={!!errors.cost}
            helperText={errors.cost?.message}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleModalClose}>Cancelar</Button>
        <LoadingButton type='submit' form='create-shippingcost-form' variant='contained' loading={loading}>
          Crear
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
