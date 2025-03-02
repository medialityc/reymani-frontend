'use client'

import React, { useState, useEffect } from 'react'

import Image from 'next/image'

import { toast } from 'react-toastify'

// MUI Components
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import LoadingButton from '@mui/lab/LoadingButton'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

// Form Handling
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Services
import { getMyBusiness, updateMyBusiness } from '@/services/BusinessService'
import { getProvinces } from '@/services/ProvinceService'
import Form from '@components/Form'

// Validation Schema
const alphaNumSpaceRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/
const addressRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s,\.¡!��?'\-]+$/

const schema = z.object({
  name: z
    .string()
    .nonempty('El nombre es requerido')
    .regex(alphaNumSpaceRegex, 'Solo permite letras, números y espacios'),
  description: z.string().regex(alphaNumSpaceRegex, 'Solo permite letras, números y espacios').nullable(),
  address: z.string().nonempty('La dirección es requerida').regex(addressRegex, 'Dirección no válida'),
  municipalityId: z.number().refine(val => val > 0, { message: 'El municipio es requerido' }),
  isAvailable: z.boolean()
})

type FormValues = z.infer<typeof schema>

interface Province {
  id: number
  name: string
  municipalities: { id: number; name: string }[]
}

const UpdateMyBusiness = () => {
  // States
  const [business, setBusiness] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [selectedProvince, setSelectedProvince] = useState<number>(0)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoDeleted, setLogoDeleted] = useState(false)
  const [bannerDeleted, setBannerDeleted] = useState(false)

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    resetField
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      municipalityId: 0,
      isAvailable: false
    }
  })

  // Añadir función para cargar datos
  const fetchBusinessAndProvinces = async () => {
    try {
      // Load business data
      const businessData = await getMyBusiness()

      setBusiness(businessData)

      // Set form values
      setValue('name', businessData.name || '')
      setValue('description', businessData.description || '')
      setValue('address', businessData.address || '')
      setValue('municipalityId', businessData.municipalityId || 0)
      setValue(
        'isAvailable',
        typeof businessData.isAvailable === 'boolean'
          ? businessData.isAvailable
          : businessData.isAvailable === 'true' || businessData.isAvailable == 1
      )

      // Set province ID
      setSelectedProvince(businessData.provinceId || 0)

      // Load provinces
      const provincesData = await getProvinces()

      setProvinces(provincesData)
    } catch (err) {
      console.error(err)
      toast.error('Error al cargar los datos del negocio')
    }
  }

  // Load business data and provinces
  useEffect(() => {
    fetchBusinessAndProvinces()
  }, [setValue])

  // Handle logo file change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLogoFile(e.target.files[0])
      setLogoDeleted(false)
    }
  }

  // Handle banner file change
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBannerFile(e.target.files[0])
      setBannerDeleted(false)
    }
  }

  // Form submission handler
  const onFormSubmit = async (data: FormValues) => {
    setLoading(true)
    const formData = new FormData()

    formData.append('Name', data.name)
    formData.append('Description', data.description || '')
    formData.append('Address', data.address)
    formData.append('MunicipalityId', String(data.municipalityId))
    formData.append('IsAvailable', String(data.isAvailable))

    // Handle logo
    if (logoDeleted) {
      formData.append('Logo', new File([], ''))
    } else if (logoFile) {
      formData.append('Logo', logoFile)
    }

    // Handle banner
    if (bannerDeleted) {
      formData.append('Banner', new File([], ''))
    } else if (bannerFile) {
      formData.append('Banner', bannerFile)
    }

    try {
      await updateMyBusiness(formData)

      // Después de actualizar, recargar los datos completos del negocio
      await fetchBusinessAndProvinces()

      toast.success('Negocio actualizado correctamente')
      setIsEditing(false)

      // Limpiar los archivos temporales
      setLogoFile(null)
      setBannerFile(null)
      setLogoDeleted(false)
      setBannerDeleted(false)
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar negocio')
    } finally {
      setLoading(false)
    }
  }

  // Preview URLs
  const logoPreview = logoDeleted ? null : logoFile ? URL.createObjectURL(logoFile) : business?.logo || null

  const bannerPreview = bannerDeleted ? null : bannerFile ? URL.createObjectURL(bannerFile) : business?.banner || null

  return (
    <Card>
      <CardHeader title='Información de mi Negocio' />
      <CardContent>
        {isEditing ? (
          <Form onSubmit={handleSubmit(onFormSubmit)}>
            <Grid container spacing={5}>
              {/* Logo */}
              <Grid
                item
                xs={12}
                sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}
              >
                {logoPreview && (
                  <Image
                    src={logoPreview}
                    alt='Logo del negocio'
                    width={120}
                    height={120}
                    style={{ objectFit: 'cover', marginBottom: '1rem' }}
                  />
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button variant='outlined' component='label'>
                    Subir nuevo logo
                    <input
                      type='file'
                      hidden
                      accept='image/jpeg,image/png,image/gif,image/bmp,image/webp'
                      onChange={handleLogoChange}
                    />
                  </Button>
                  {logoPreview && (
                    <Button
                      variant='outlined'
                      onClick={() => {
                        setLogoFile(null)
                        setLogoDeleted(true)
                      }}
                    >
                      Eliminar logo
                    </Button>
                  )}
                </div>
              </Grid>

              {/* Banner */}
              <Grid
                item
                xs={12}
                sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}
              >
                {bannerPreview && (
                  <Image
                    src={bannerPreview}
                    alt='Banner del negocio'
                    width={800}
                    height={200}
                    style={{ width: '100%', maxHeight: '250', objectFit: 'cover', marginBottom: '1rem' }}
                  />
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button variant='outlined' component='label'>
                    Subir nuevo banner
                    <input
                      type='file'
                      hidden
                      accept='image/jpeg,image/png,image/gif,image/bmp,image/webp'
                      onChange={handleBannerChange}
                    />
                  </Button>
                  {bannerPreview && (
                    <Button
                      variant='outlined'
                      onClick={() => {
                        setBannerFile(null)
                        setBannerDeleted(true)
                      }}
                    >
                      Eliminar banner
                    </Button>
                  )}
                </div>
              </Grid>

              {/* Business Information Fields */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Nombre del Negocio'
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Descripción'
                  multiline
                  rows={4}
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Dirección'
                  {...register('address')}
                  error={!!errors.address}
                  helperText={errors.address?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label='Provincia'
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
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name='municipalityId'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label='Municipio'
                      {...field}
                      disabled={selectedProvince === 0}
                      error={!!errors.municipalityId}
                      helperText={errors.municipalityId?.message}
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
              </Grid>

              {/* Status checkboxes */}
              <Grid item xs={12}>
                <Controller
                  name='isAvailable'
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                      label='Disponible'
                    />
                  )}
                />
              </Grid>

              {/* Submit button */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <LoadingButton variant='contained' type='submit' loading={loading} sx={{ mr: 2 }}>
                  Guardar Cambios
                </LoadingButton>
                <Button variant='outlined' onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
              </Grid>
            </Grid>
          </Form>
        ) : (
          <Grid container spacing={5}>
            {/* View mode - displaying business information */}

            {/* Logo */}
            {business?.logo && (
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Image
                  src={business.logo}
                  alt='Logo del negocio'
                  width={120}
                  height={120}
                  style={{ objectFit: 'cover' }}
                />
              </Grid>
            )}

            {/* Banner */}
            {business?.banner && (
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Image
                  src={business.banner}
                  alt='Banner del negocio'
                  width={800}
                  height={200}
                  style={{ width: '100%', maxHeight: '250', objectFit: 'cover', marginBottom: '1rem' }}
                />
              </Grid>
            )}

            {/* Business details */}
            <Grid item xs={12}>
              <TextField fullWidth label='Nombre del Negocio' value={business?.name || ''} disabled />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Descripción'
                multiline
                rows={4}
                value={business?.description || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label='Dirección' value={business?.address || ''} disabled />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Provincia'
                value={provinces.find(p => p.id === business?.provinceId)?.name || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Municipio'
                value={
                  provinces
                    .find(p => p.id === business?.provinceId)
                    ?.municipalities.find(m => m.id === business?.municipalityId)?.name || ''
                }
                disabled
              />
            </Grid>

            {/* Status information */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Estado de disponibilidad'
                value={business?.isAvailable ? 'Disponible' : 'No disponible'}
                disabled
              />
            </Grid>

            {/* Edit button */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button variant='contained' onClick={() => setIsEditing(true)}>
                Editar Negocio
              </Button>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  )
}

export default UpdateMyBusiness
