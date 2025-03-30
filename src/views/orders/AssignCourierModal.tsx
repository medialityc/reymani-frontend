'use client'

import React, { useState, useEffect } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  TextField,
  FormHelperText,
  CircularProgress,
  Autocomplete,
  Alert
} from '@mui/material'
import { toast } from 'react-toastify'

import { getCouriersUsers } from '../../services/UserService'
import { assignCourierToOrder } from '../../services/OrderService'

interface User {
  id: number
  firstName: string
  lastName: string
  phone: string
}

interface AssignCourierModalProps {
  open: boolean
  handleClose: () => void
  orderId: number
  onCourierAssigned: () => void
}

export default function AssignCourierModal({ open, handleClose, orderId, onCourierAssigned }: AssignCourierModalProps) {
  const [couriers, setCouriers] = useState<User[]>([])
  const [selectedCourier, setSelectedCourier] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchCouriers = async () => {
      if (open) {
        setLoading(true)
        setError('')
        setErrorMessage('')

        try {
          const response = await getCouriersUsers()

          if (response && response.data) {
            setCouriers(response.data)
          }
        } catch (error) {
          console.error('Error al cargar mensajeros:', error)
          toast.error('Error al cargar mensajeros')
        } finally {
          setLoading(false)
        }
      }
    }

    fetchCouriers()
  }, [open])

  const handleChange = (_event: React.SyntheticEvent, newValue: User | null) => {
    setSelectedCourier(newValue)
    setError('')
    setErrorMessage('')
  }

  const handleSubmit = async () => {
    if (!selectedCourier) {
      setError('Debe seleccionar un mensajero')

      return
    }

    setSubmitting(true)
    setErrorMessage('')

    try {
      await assignCourierToOrder(orderId, selectedCourier.id)
      toast.success('Mensajero asignado correctamente')
      onCourierAssigned()
      handleClose()
    } catch (err: any) {
      console.error('Error al asignar mensajero:', err)

      // Verificar si es nuestro error 404 personalizado
      if (err.status === 404) {
        setErrorMessage('El mensajero no posee un vehículo adecuado para esta orden')
        toast.error('El mensajero no posee un vehículo adecuado para esta orden')
      } else {
        setErrorMessage('Error al asignar mensajero')
        toast.error('Error al asignar mensajero')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setSelectedCourier(null)
    setError('')
    setErrorMessage('')
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth='sm'>
      <DialogTitle>Asignar Mensajero</DialogTitle>
      <DialogContent>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress />
          </div>
        ) : (
          <>
            {errorMessage && (
              <Alert severity='error' sx={{ mb: 2, mt: 1 }}>
                {errorMessage}
              </Alert>
            )}
            <FormControl fullWidth error={!!error} sx={{ mt: 2 }}>
              <Autocomplete
                id='courier-autocomplete'
                options={couriers}
                getOptionLabel={option => `${option.firstName} ${option.lastName} - ${option.phone}`}
                renderInput={params => (
                  <TextField {...params} label='Mensajero' error={!!error} placeholder='Buscar mensajero...' />
                )}
                value={selectedCourier}
                onChange={handleChange}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                fullWidth
              />
              {error && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseModal} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={submitting || loading}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          {submitting ? 'Asignando...' : 'Asignar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
