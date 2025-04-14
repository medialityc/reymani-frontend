'use client'

import React, { useState } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material'
import { toast } from 'react-toastify'

import type { Order } from '../../services/OrderService'
import { ProductStatus, getProductStatusText, confirmElaboratedOrderItem } from '../../services/OrderService'

interface MyOrderItemsModalProps {
  open: boolean
  handleClose: () => void
  order: Order | null
  onOrderUpdated: () => void
}

export default function MyOrderItemsModal({ open, handleClose, order, onOrderUpdated }: MyOrderItemsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null)

  // Early return after all hooks
  if (!order) {
    return null
  }

  // Función para manejar la actualización del estado del producto
  const handleconfirmElaboratedOrderItem = async (itemId: number) => {
    if (!order) return

    setIsUpdating(true)
    setUpdatingItemId(itemId)

    try {
      // Usar el servicio para actualizar el estado del ítem
      await confirmElaboratedOrderItem(order.id, itemId)

      toast.success('Estado del producto actualizado correctamente')
      onOrderUpdated() // Refrescar los datos de la orden
    } catch (error) {
      console.error('Error al actualizar el estado del producto:', error)
      toast.error('Error al actualizar el estado del producto')
    } finally {
      setIsUpdating(false)
      setUpdatingItemId(null)
    }
  }

  // Función para obtener el color para componentes UI según el estado
  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.InPreparation:
        return 'primary'
      case ProductStatus.InPickup:
        return 'secondary'
      case ProductStatus.OnTheWay:
        return 'success'
      default:
        return 'default'
    }
  }

  // Función para obtener el texto del botón de acción según el estado
  const getActionButtonText = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.InPreparation:
        return 'Avanzar a Recogida'
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='md'>
      <DialogTitle>Detalles del Pedido en Elaboración</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle1' gutterBottom>
            Cliente: {order.customer.firstName} {order.customer.lastName} - {order.customer.phone}
          </Typography>
          <Typography variant='subtitle1' gutterBottom>
            Dirección: {order.customerAddress.address}, {order.customerAddress.municipalityName},{' '}
            {order.customerAddress.provinceName}
          </Typography>
          <Typography variant='subtitle1' gutterBottom>
            Mensajero:{' '}
            {order.courier
              ? `${order.courier.firstName} ${order.courier.lastName} - ${order.courier.phone}`
              : 'No Asignado'}
          </Typography>
        </Box>

        {order.items && order.items.length > 0 ? (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell align='right'>Precio Unitario</TableCell>
                    <TableCell align='right'>Subtotal</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map(item => {
                    const productStatus = (item.productStatus as ProductStatus) ?? ProductStatus.InPreparation
                    const buttonText = getActionButtonText(productStatus)
                    const showActionButton = productStatus === ProductStatus.InPreparation
                    const statusColor = getStatusColor(productStatus)

                    return (
                      <TableRow key={item.id}>
                        <TableCell component='th' scope='row'>
                          {item.product.name}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell align='right'>${item.product.price.toFixed(2)}</TableCell>
                        <TableCell align='right'>${(item.product.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell>{getProductStatusText(productStatus)}</TableCell>
                        <TableCell>
                          {showActionButton && (
                            <Button
                              variant='contained'
                              color={statusColor as any}
                              size='small'
                              onClick={() => handleconfirmElaboratedOrderItem(item.id)}
                              disabled={isUpdating && updatingItemId === item.id}
                            >
                              {buttonText}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Typography variant='subtitle1'>Subtotal: ${order.totalProductsCost.toFixed(2)}</Typography>
              <Typography variant='subtitle1'>Costo de envío: ${order.shippingCost.toFixed(2)}</Typography>
              <Typography variant='h6'>Total: ${(order.totalProductsCost + order.shippingCost).toFixed(2)}</Typography>
            </Box>
          </>
        ) : (
          <Typography variant='body1' align='center' sx={{ mt: 2, mb: 2 }}>
            No hay productos en esta orden.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
