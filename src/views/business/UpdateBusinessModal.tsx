'use client'

import React, { useEffect, useState } from 'react'

import NextImage from 'next/image'

import { Controller, useForm } from 'react-hook-form'
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

import { updateBusiness } from '../../services/BusinessService'
import { getProvinces } from '../../services/ProvinceService'
import { getBusinessAdminUsers } from '../../services/UserService'

const alphaNumSpaceRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/
const addressRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s,\.¡!¿?'\-]+$/

const schema = z.object({
  name: z
    .string()
    .nonempty('El nombre es requerido')
    .regex(alphaNumSpaceRegex, 'Solo permite letras, números y espacios'),
  description: z.string().regex(alphaNumSpaceRegex, 'Solo permite letras, números y espacios'),
  address: z.string().nonempty('La dirección es requerida').regex(addressRegex, 'Dirección no válida'),
  municipalityId: z.number().refine(val => val > 0, { message: 'El municipio es requerido' }),
  adminId: z.number().refine(val => val > 0, { message: 'El administrador es requerido' }),
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
  adminId: number
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

interface UpdateBusinessModalProps {
  open: boolean
  handleClose: () => void
  business: any
  onBusinessUpdated: () => void
}

/**
 * Convierte una imagen (URL) en un objeto File utilizando canvas.
 */
const getFileFromImageUrl = (url: string, fileName: string, mimeType: string): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image()

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

export default function UpdateBusinessModal({
  open,
  handleClose,
  business,
  onBusinessUpdated
}: UpdateBusinessModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    resetField,
    control,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  })

  const [loading, setLoading] = useState(false)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [businessAdmins, setBusinessAdmins] = useState<BusinessAdmin[]>([])
  const [selectedProvince, setSelectedProvince] = useState<number>(0)
  const [logoDeleted, setLogoDeleted] = useState(false)
  const [bannerDeleted, setBannerDeleted] = useState(false)

  // Previsualización de imágenes
  const logoFile = watch('logo')
  const bannerFile = watch('banner')

  const logoPreview = logoDeleted
    ? null
    : logoFile && logoFile.length > 0
      ? URL.createObjectURL(logoFile[0])
      : business?.logo || null

  const bannerPreview = bannerDeleted
    ? null
    : bannerFile && bannerFile.length > 0
      ? URL.createObjectURL(bannerFile[0])
      : business?.banner || null

  // Al cargar o cambiar el negocio se establecen los valores iniciales
  useEffect(() => {
    if (business) {
      const isAvail =
        typeof business.isAvailable === 'boolean'
          ? business.isAvailable
          : business.isAvailable === 'true' || business.isAvailable == 1

      const isAct =
        typeof business.isActive === 'boolean'
          ? business.isActive
          : business.isActive === 'true' || business.isActive == 1

      reset({
        name: business.name,
        description: business.description,
        address: business.address,
        municipalityId: business.municipalityId,
        adminId: business.userId, // Se asume que business.userId es el id del administrador
        isAvailable: isAvail,
        isActive: isAct
      })

      setSelectedProvince(business.provinceId || 0)
      setLogoDeleted(false)
      setBannerDeleted(false)
    }
  }, [business, reset])

  // Cargar provincias y administradores cuando se abre el modal
  useEffect(() => {
    if (!open) return

    const fetchData = async () => {
      try {
        const provincesData = await getProvinces()

        setProvinces(provincesData)
      } catch (error) {
        console.error('Error al obtener provincias:', error)
      }

      try {
        const adminsData = await getBusinessAdminUsers()

        setBusinessAdmins(adminsData.data || [])
      } catch (error) {
        console.error('Error al obtener administradores:', error)
      }
    }

    fetchData()
  }, [open])

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    const formData = new FormData()

    formData.append('Name', data.name)
    formData.append('Description', data.description)
    formData.append('Address', data.address)
    formData.append('MunicipalityId', String(data.municipalityId))
    formData.append('UserId', String(data.adminId))
    formData.append('IsAvailable', String(data.isAvailable))
    formData.append('IsActive', String(data.isActive))

    // --- Manejo del Logo ---
    if (logoDeleted) {
      // Enviar un archivo vacío para indicar eliminación
      formData.append('Logo', new File([], ''))
    } else if (data.logo && data.logo.length > 0) {
      // Se subió un nuevo logo
      formData.append('Logo', data.logo[0])
    } else if (business?.logo) {
      // No se modificó el logo: usar el canvas para convertir la imagen actual en un File
      try {
        const logoFile = await getFileFromImageUrl(business.logo, 'logo.jpg', 'image/jpeg')

        formData.append('Logo', logoFile)
      } catch (error) {
        console.error('Error al convertir el logo existente:', error)
      }
    }

    // --- Manejo del Banner ---
    if (bannerDeleted) {
      formData.append('Banner', new File([], ''))
    } else if (data.banner && data.banner.length > 0) {
      formData.append('Banner', data.banner[0])
    } else if (business?.banner) {
      try {
        const bannerFile = await getFileFromImageUrl(business.banner, 'banner.jpg', 'image/jpeg')

        formData.append('Banner', bannerFile)
      } catch (error) {
        console.error('Error al convertir el banner existente:', error)
      }
    }

    try {
      await updateBusiness(business.id, formData)
      toast.success('Negocio actualizado correctamente')
      resetFormData()
      onBusinessUpdated()
      handleModalClose()
    } catch (error: any) {
      toast.error('Error al actualizar negocio')
    } finally {
      setLoading(false)
    }
  }

  // Reinicia el formulario con los valores originales del negocio
  const resetFormData = () => {
    if (business) {
      const isAvail =
        typeof business.isAvailable === 'boolean'
          ? business.isAvailable
          : business.isAvailable === 'true' || business.isAvailable == 1

      const isAct =
        typeof business.isActive === 'boolean'
          ? business.isActive
          : business.isActive === 'true' || business.isActive == 1

      reset({
        name: business.name,
        description: business.description,
        address: business.address,
        municipalityId: business.municipalityId,
        adminId: business.userId,
        isAvailable: isAvail,
        isActive: isAct
      })
      setSelectedProvince(business.provinceId || 0)
      setLogoDeleted(false)
      setBannerDeleted(false)
    }
  }

  const handleModalClose = () => {
    resetFormData()
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleModalClose} fullWidth>
      <DialogTitle>Actualizar Negocio</DialogTitle>
      <DialogContent>
        <form id='update-business-form' onSubmit={handleSubmit(onSubmit)}>
          {logoPreview && (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <NextImage src={logoPreview} alt='Logo' width={80} height={80} />
            </div>
          )}
          <Button variant='outlined' component='label' fullWidth sx={{ mb: 1 }}>
            Subir nuevo Logo
            <input
              type='file'
              hidden
              {...register('logo', {
                onChange: e => {
                  setLogoDeleted(false)

                  return e
                }
              })}
            />
          </Button>
          {logoPreview && (
            <Button
              variant='outlined'
              onClick={() => {
                resetField('logo')
                setLogoDeleted(true)
              }}
              fullWidth
              sx={{ mb: 2 }}
            >
              Eliminar Logo
            </Button>
          )}
          {bannerPreview && (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <NextImage
                src={bannerPreview}
                alt='Banner'
                width={800}
                height={150}
                style={{ objectFit: 'cover', width: '100%', maxHeight: '200' }}
                sizes='100vw'
              />
            </div>
          )}
          <Button variant='outlined' component='label' fullWidth sx={{ mb: 1 }}>
            Subir nuevo Banner
            <input
              type='file'
              hidden
              {...register('banner', {
                onChange: e => {
                  setBannerDeleted(false)

                  return e
                }
              })}
            />
          </Button>
          {bannerPreview && (
            <Button
              variant='outlined'
              onClick={() => {
                resetField('banner')
                setBannerDeleted(true)
              }}
              fullWidth
              sx={{ mb: 2 }}
            >
              Eliminar Banner
            </Button>
          )}
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
          <TextField
            select
            label='Provincia'
            margin='normal'
            fullWidth
            value={selectedProvince}
            onChange={e => {
              const value = Number(e.target.value)

              setSelectedProvince(value)
              resetField('municipalityId')
            }}
          >
            <MenuItem value={0}>Seleccione una provincia</MenuItem>
            {provinces.map(prov => (
              <MenuItem key={prov.id} value={prov.id}>
                {prov.name}
              </MenuItem>
            ))}
          </TextField>
          <Controller
            name='municipalityId'
            control={control}
            render={({ field }) => (
              <TextField
                select
                label='Municipio'
                margin='normal'
                fullWidth
                {...field}
                disabled={selectedProvince === 0}
                error={!!errors.municipalityId}
                helperText={errors.municipalityId?.message || 'Seleccione un municipio'}
              >
                <MenuItem value={0}>Seleccione un municipio</MenuItem>
                {(provinces.find(prov => prov.id === selectedProvince)?.municipalities || []).map(mun => (
                  <MenuItem key={mun.id} value={mun.id}>
                    {mun.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name='adminId'
            control={control}
            render={({ field }) => (
              <TextField
                select
                label='Administrador'
                margin='normal'
                fullWidth
                {...field}
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
            )}
          />
          <Controller
            name='isAvailable'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                label='Disponible'
              />
            )}
          />
          <Controller
            name='isActive'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                label='Activo'
              />
            )}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleModalClose}>Cancelar</Button>
        <LoadingButton type='submit' form='update-business-form' variant='contained' loading={loading}>
          Actualizar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
