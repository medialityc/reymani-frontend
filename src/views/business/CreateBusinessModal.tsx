'use client'

import React, { useState, useEffect } from 'react'

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
  MenuItem
} from '@mui/material'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import LoadingButton from '@mui/lab/LoadingButton'

import { createBusiness } from '../../services/BusinessService'
import { getProvinces } from '../../services/ProvinceService'
import { getBusinessAdminUsers } from '../../services/UserService' // <-- nuevo import
import BusinessHeaderImages from '@/components/business/BusinessHeaderImages'

// Nueva expresión regular que admite letras acentuadas y la ��/Ñ
const alphaNumSpaceRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/

// Nueva expresión regular para permitir letras, números, espacios y signos de puntuación comunes en dirección
const addressRegex = /^[A-Za-zÁÉÍÓÚáé��óúÑñ0-9\s,\.¡!¿?'\-]+$/

const schema = z.object({
  name: z
    .string()
    .nonempty('El nombre es requerido')
    .regex(alphaNumSpaceRegex, 'El nombre solo debe contener letras, números y espacios'),
  description: z
    .string()
    .nonempty('La descripción es requerida')
    .regex(alphaNumSpaceRegex, 'La descripción solo debe contener letras, números y espacios'),
  address: z
    .string()
    .nonempty('La dirección es requerida')
    .regex(addressRegex, 'La dirección solo debe contener letras, números, espacios y signos de puntuación permitidos'),
  municipalityId: z.preprocess(
    val => Number(val),
    z.number().refine(val => val > 0, { message: 'El municipio es requerido' })
  ),
  adminId: z.preprocess(
    val => Number(val),
    z.number().refine(val => val > 0, { message: 'El administrador es requerido' })
  ),
  isAvailable: z.boolean(),
  isActive: z.boolean(),
  logo: z.any().optional(),
  banner: z.any().optional()
})

type FormValues = {
  name: string
  description: string
  address: string
  municipalityId: number
  adminId: number // <-- nuevo campo
  isAvailable: boolean
  isActive: boolean
  logo?: FileList
  banner?: FileList
}

interface Province {
  id: number
  name: string
  municipalities: { id: number; name: string }[]
}

interface BusinessAdmin {
  id: number
  firstName: string
  lastName: string
}

interface CreateBusinessModalProps {
  open: boolean
  handleClose: () => void
  onBusinessCreated: () => void
}

export default function CreateBusinessModal({ open, handleClose, onBusinessCreated }: CreateBusinessModalProps) {
  const [loading, setLoading] = useState(false)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(0)
  const [businessAdmins, setBusinessAdmins] = useState<BusinessAdmin[]>([]) // <-- nuevo estado
  // Estado para error de provincia, no forma parte de useForm
  const [provinceError, setProvinceError] = useState<string>('')

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
      address: '',
      municipalityId: 0,
      adminId: 0,
      isAvailable: false,
      isActive: false

      // logo y banner se dejan sin valor inicial
    }
  })

  const logoFile = watch('logo')
  const bannerFile = watch('banner')
  const logoPreview = logoFile && logoFile.length > 0 ? URL.createObjectURL(logoFile[0]) : null
  const bannerPreview = bannerFile && bannerFile.length > 0 ? URL.createObjectURL(bannerFile[0]) : null

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await getProvinces()

        setProvinces(data)
      } catch (error: any) {
        console.error('Error al obtener provincias:', error)
      }
    }

    const fetchAdmins = async () => {
      try {
        const data = await getBusinessAdminUsers()

        setBusinessAdmins(data.data || []) // se asume que 'data.data' contiene el listado
      } catch (error: any) {
        console.error('Error al obtener administradores:', error)
      }
    }

    fetchAdmins()
    fetchProvinces()
  }, [])

  const onSubmit = async (data: FormValues) => {
    // Validar que se seleccione una provincia
    if (selectedProvinceId === 0) {
      setProvinceError('La provincia es requerida')
      setLoading(false)

      return
    } else {
      setProvinceError('')
    }

    setLoading(true)
    const formData = new FormData()

    formData.append('Name', data.name)
    formData.append('Description', data.description)
    formData.append('Address', data.address)
    formData.append('MunicipalityId', String(data.municipalityId))
    formData.append('UserId', String(data.adminId)) // se usa adminId como UserId
    formData.append('IsAvailable', String(data.isAvailable))
    formData.append('IsActive', String(data.isActive))
    if (data.logo && data.logo.length > 0) formData.append('Logo', data.logo[0])
    if (data.banner && data.banner.length > 0) formData.append('Banner', data.banner[0])

    try {
      await createBusiness(formData)
      toast.success('Negocio creado correctamente')
      reset()
      onBusinessCreated()
      handleModalClose()
    } catch (error: any) {
      if (error.status === 409 || error.response?.status === 409) {
        setError('name', {
          type: 'manual',
          message: 'Ya existe un negocio con ese nombre'
        })
      } else {
        toast.error(error.message || 'Error al crear negocio')
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
      <DialogTitle>Crear Negocio</DialogTitle>
      <DialogContent>
        <form id='create-business-form' onSubmit={handleSubmit(onSubmit)}>
          {/* Fix the image handlers to properly update React Hook Form state */}
          <BusinessHeaderImages
            logoUrl={logoPreview}
            bannerUrl={bannerPreview}
            isEditing={true}
            onLogoChange={e => {
              if (e.target.files && e.target.files.length > 0) {
                const filesArray = e.target.files

                // Use this format to ensure React Hook Form registers the change properly
                register('logo').onChange({
                  target: { name: 'logo', value: filesArray }
                })
              }
            }}
            onBannerChange={e => {
              if (e.target.files && e.target.files.length > 0) {
                const filesArray = e.target.files

                // Use this format to ensure React Hook Form registers the change properly
                register('banner').onChange({
                  target: { name: 'banner', value: filesArray }
                })
              }
            }}
            onLogoDelete={() => resetField('logo')}
            onBannerDelete={() => resetField('banner')}
          />
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
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <TextField
            fullWidth
            label='Dirección'
            margin='normal'
            {...register('address')}
            error={!!errors.address}
            helperText={errors.address?.message}
          />
          {/* Select para Provincia */}
          <TextField
            select
            label='Provincia'
            fullWidth
            margin='normal'
            value={selectedProvinceId}
            onChange={e => {
              const value = Number(e.target.value)

              setSelectedProvinceId(value)
              resetField('municipalityId')

              // Reiniciar mensaje de error al seleccionar una provincia
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
          {/* Select para Municipio */}
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
          {/* Select para Administrador del Negocio */}
          <TextField
            select
            label='Administrador del Negocio'
            fullWidth
            margin='normal'
            {...register('adminId', { valueAsNumber: true })}
            error={!!errors.adminId}
            helperText={errors.adminId?.message || 'Seleccione un administrador'}
          >
            <MenuItem value={0}>Seleccione un administrador</MenuItem>
            {businessAdmins.map(admin => (
              <MenuItem key={admin.id} value={admin.id}>
                {admin.firstName} {admin.lastName}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel control={<Checkbox {...register('isAvailable')} />} label='Disponible' />
          <FormControlLabel control={<Checkbox {...register('isActive')} />} label='Activo' />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleModalClose}>Cancelar</Button>
        <LoadingButton type='submit' form='create-business-form' variant='contained' loading={loading}>
          Crear
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
