'use client'

import React, { useEffect, useState } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import LoadingButton from '@mui/lab/LoadingButton'

import { updateShippingCost } from '../../services/ShippingCostService'
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

interface ShippingCost {
  id: number
  vehicleTypeId: number
  vehicleName: string
  municipalityId: number
  municipalityName: string
  cost: number
}

interface UpdateShippingCostModalProps {
  open: boolean
  handleClose: () => void
  shippingCost: ShippingCost
  onShippingCostUpdated: () => void
}

export default function UpdateShippingCostModal({
  open,
  handleClose,
  shippingCost,
  onShippingCostUpdated
}: UpdateShippingCostModalProps) {
  const [loading, setLoading] = useState(false)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(0)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      municipalityId: 0,
      vehicleTypeId: 0,
      cost: 0
    }
  })

  // Cargar provincias y tipos de vehículo cuando se abre el modal
  useEffect(() => {
    if (!open) return

    const fetchData = async () => {
      try {
        // Cargar provincias en paralelo con los tipos de vehículos
        const [provincesData, vehicleTypesResponse] = await Promise.all([
          getProvinces(),
          getVehicleTypesSearch({ IsActive: true, PageSize: 100 })
        ])

        setProvinces(provincesData)
        setVehicleTypes(vehicleTypesResponse.data || [])

        // Si tenemos datos del costo de envío
        if (shippingCost) {
          // Buscar a qué provincia pertenece el municipio
          for (const province of provincesData) {
            const municipality = province.municipalities.find(
              (mun: { id: number }) => mun.id === shippingCost.municipalityId
            )

            if (municipality) {
              setSelectedProvinceId(province.id)
              break
            }
          }

          // Establecer los valores en el formulario de manera explícita
          setValue('municipalityId', shippingCost.municipalityId)
          setValue('vehicleTypeId', shippingCost.vehicleTypeId)
          setValue('cost', shippingCost.cost)
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error)
      }
    }

    fetchData()
  }, [open, shippingCost, setValue])

  const onSubmit = async (data: FormValues) => {
    setLoading(true)

    try {
      // Solo enviar el campo "cost" a la API
      await updateShippingCost(shippingCost.id, {
        cost: data.cost
      })
      toast.success('Costo de envío actualizado correctamente')
      onShippingCostUpdated()
      handleModalClose()
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar costo de envío')
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleModalClose} fullWidth>
      <DialogTitle>Actualizar Costo de Envío</DialogTitle>
      <DialogContent>
        <form id='update-shippingcost-form' onSubmit={handleSubmit(onSubmit)}>
          <TextField
            select
            label='Provincia'
            fullWidth
            margin='normal'
            value={selectedProvinceId}
            disabled={true} // Deshabilitar el campo de provincia
            InputProps={{
              readOnly: true
            }}
          >
            <MenuItem value={0}>Seleccione una provincia</MenuItem>
            {provinces.map(prov => (
              <MenuItem key={prov.id} value={prov.id}>
                {prov.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Usar Controller para municipio */}
          <Controller
            name='municipalityId'
            control={control}
            render={({ field }) => (
              <TextField
                select
                label='Municipio'
                fullWidth
                margin='normal'
                {...field}
                disabled={true} // Deshabilitar el campo de municipio
                InputProps={{
                  readOnly: true
                }}
                error={!!errors.municipalityId}
                helperText={errors.municipalityId?.message}
              >
                <MenuItem value={0}>Seleccione un municipio</MenuItem>
                {provinces
                  .find(prov => prov.id === selectedProvinceId)
                  ?.municipalities.map(mun => (
                    <MenuItem key={mun.id} value={mun.id}>
                      {mun.name}
                    </MenuItem>
                  ))}
              </TextField>
            )}
          />

          {/* Usar Controller para tipo de vehículo */}
          <Controller
            name='vehicleTypeId'
            control={control}
            render={({ field }) => (
              <TextField
                select
                label='Tipo de Vehículo'
                fullWidth
                margin='normal'
                {...field}
                disabled={true} // Deshabilitar el campo de tipo de vehículo
                InputProps={{
                  readOnly: true
                }}
                error={!!errors.vehicleTypeId}
                helperText={errors.vehicleTypeId?.message}
              >
                <MenuItem value={0}>Seleccione un tipo de vehículo</MenuItem>
                {vehicleTypes.map(type => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField
            label='Costo'
            fullWidth
            margin='normal'
            type='number'
            inputProps={{ step: '0.01', min: '0' }}
            {...register('cost', { valueAsNumber: true })}
            error={!!errors.cost}
            helperText={errors.cost?.message}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleModalClose} color='primary'>
          Cancelar
        </Button>
        <LoadingButton
          form='update-shippingcost-form'
          type='submit'
          loading={loading}
          variant='contained'
          color='primary'
        >
          Actualizar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
