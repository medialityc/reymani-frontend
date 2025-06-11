import React, { useState } from 'react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, InputLabel, Select, MenuItem, FormHelperText, Checkbox, FormControlLabel, Typography
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { toast } from 'react-toastify'

import { createOrder, PaymentMethod } from '@/services/OrderService'

import { useAllClientes} from '@/services/OrderGetAllClients'
import { useActiveConfirmedCouriers} from '@/services/OrderGetActiveCouriers'

const orderSchema = z.object({
  shoppingCartId: z.number().min(1, 'Carrito requerido'),
  customerId: z.number().min(1, 'Cliente requerido'),
  customerAddressId: z.number().min(1, 'Dirección requerida'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  requiresCourierService: z.boolean(),
  courierId: z.number().optional()
})

type OrderFormValues = z.infer<typeof orderSchema>

interface CreateOrdersModalProps {
  open: boolean
  handleClose: () => void
  onOrderCreated: () => void
}

export default function CreateOrdersModal({ open, handleClose, onOrderCreated }: CreateOrdersModalProps) {
  const [loading, setLoading] = useState(false)

  const { clientes, loading: loadingClientes } = useAllClientes()
  const { couriers, loading: loadingCouriers } = useActiveConfirmedCouriers()


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      shoppingCartId: 0,
      customerId: 0,
      customerAddressId: 0,
      paymentMethod: PaymentMethod.Cash,
      requiresCourierService: false,
      courierId: undefined
    }
  })

  const paymentMethodOptions = Object.values(PaymentMethod)
  .filter(value => typeof value === 'number') // Solo valores numéricos
  .map(value => ({
    value,
    label: value === PaymentMethod.Cash ? 'Efectivo' : 'Transferencia'
  }))

  //Todo Obtener Status a partir del Enum
  // const orderStatusOptions = Object.values(OrderStatus)
  // .filter(value => typeof value === 'number')
  // .map(value => ({
  //   value,
  //   label: getOrderStatusText(value as OrderStatus)
  // }))


  const courierId = watch('courierId')

  const shoppingCarts = [
  { id: 1 },
  { id: 2 },
  { id: 3 }
]

const addresses = [
  { id: 1, name: 'Calle Falsa 123' },
  { id: 2, name: 'Av. Principal 456' },
  { id: 3, name: 'Boulevard Secundario 789' }
]


  const courierSeleccionado = couriers.find(c => c.id === courierId)
  const customerId = watch('customerId')
  const requiresCourierService = watch('requiresCourierService')

  // Buscar cliente seleccionado para mostrar teléfono
  interface Cliente {
    id: number
  profilePicture: string
  firstName: string
  lastName: string
  email: string
  phone: string
  isActive: boolean
  role: number
  isConfirmed: boolean
  }

  const clienteSeleccionado: Cliente | undefined = (clientes as Cliente[]).find((c: Cliente) => c.id === customerId)



  const closeModal = () => {
    reset()
    handleClose()
  }

  const onSubmit = async (data: OrderFormValues) => {
    setLoading(true)

    try {
      await createOrder(data)
      toast.success('Pedido creado correctamente')
      onOrderCreated()
      closeModal()
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={closeModal} fullWidth>
      <DialogTitle>Crear Pedido</DialogTitle>
      <DialogContent>
        <form id="create-order-form" onSubmit={handleSubmit(onSubmit)}>
          {/* ...otros campos... */}

           {/* Carrito */}
          <FormControl fullWidth margin="normal" error={!!errors.shoppingCartId}>
            <InputLabel id="shoppingCartId-label">Carrito</InputLabel>
            <Select
              labelId="shoppingCartId-label"
              label="Carrito"
              {...register('shoppingCartId', { valueAsNumber: true })}
              defaultValue=""
            >
              {shoppingCarts.map(cart => (
                <MenuItem key={cart.id} value={cart.id}>Carrito #{cart.id}</MenuItem>
              ))}
            </Select>
            {errors.shoppingCartId && <FormHelperText>{errors.shoppingCartId.message}</FormHelperText>}
          </FormControl>

          {/* Cliente */}
          <FormControl fullWidth margin="normal" error={!!errors.customerId} disabled={loadingClientes}>
            <InputLabel id="customerId-label">Cliente</InputLabel>
            <Select
      labelId="customerId-label"
      label='Cliente'
      {...register('customerId', { valueAsNumber: true })}
      defaultValue=""
       disabled={loadingClientes}
    >
      {clientes.map(cliente => (
        <MenuItem key={cliente.id} value={cliente.id}>
          {cliente.firstName} {cliente.lastName}
        </MenuItem>
      ))}
            </Select>
            {errors.customerId && <FormHelperText>{errors.customerId.message}</FormHelperText>}
          </FormControl>

            {/* Dirección */}
          <FormControl fullWidth margin="normal" error={!!errors.customerAddressId}>
            <InputLabel id="customerAddressId-label">Dirección</InputLabel>
            <Select
              labelId="customerAddressId-label"
              label="Dirección"
              {...register('customerAddressId', { valueAsNumber: true })}
              defaultValue=""
            >
              {addresses.map(addr => (
                <MenuItem key={addr.id} value={addr.id}>{addr.name}</MenuItem>
              ))}
            </Select>
            {errors.customerAddressId && <FormHelperText>{errors.customerAddressId.message}</FormHelperText>}
          </FormControl>

      {/* Método de pago */}
          <FormControl fullWidth margin="normal" error={!!errors.paymentMethod}>
            <InputLabel id="paymentMethod-label">Método de pago</InputLabel>
            <Select
              labelId="paymentMethod-label"
              label="Método de pago"
              {...register('paymentMethod', { valueAsNumber: true })}
              defaultValue={PaymentMethod.Cash}
            >
              {paymentMethodOptions.map(option => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
            </Select>
            {errors.paymentMethod && <FormHelperText>{errors.paymentMethod.message}</FormHelperText>}
          </FormControl>



          {/* Mostrar teléfono solo si cliente seleccionado */}
          {clienteSeleccionado && (
            <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
              Teléfono: {clienteSeleccionado.phone}
            </Typography>
          )}

          {/* ...resto de tu formulario (dirección, pago, courier) */}


          {/* Checkbox mensajero */}
          <FormControlLabel
            control={<Checkbox {...register('requiresCourierService')} />}
            label="Requiere mensajero"
          />

          {/* Selector de mensajero */}
          {requiresCourierService && (
            <FormControl fullWidth margin="normal" error={!!errors.courierId } disabled={loadingCouriers}>
              <InputLabel id="courierId-label">Mensajero</InputLabel>
              <Select
                labelId="courierId-label"
                label='Mensajero'
                {...register('courierId', { valueAsNumber: true })}
                defaultValue=""
              >
              {couriers.map(courier => (
          <MenuItem key={courier.id} value={courier.id}>
            {courier.firstName} {courier.lastName}
          </MenuItem>
        ))}
                {/* Aquí van tus mensajeros */}
              </Select>
              {errors.courierId && <FormHelperText>{errors.courierId.message}</FormHelperText>}
            </FormControl>
          )}

            {/* Teléfono del mensajero */}
    {courierSeleccionado && (
      <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
        Teléfono del mensajero: {courierSeleccionado.phone}
      </Typography>
    )}

        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal}>Cancelar</Button>
        <LoadingButton type="submit" form="create-order-form" variant="contained" loading={loading}>
          Crear
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
