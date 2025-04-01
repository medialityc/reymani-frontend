'use client'

import React, { useState, useEffect } from 'react'

import type { SelectChangeEvent } from '@mui/material'
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
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { toast } from 'react-toastify'

import type { Order } from '../../services/OrderService'
import { ProductStatus, getProductStatusText } from '../../services/OrderService'

interface MyOrderItemsModalProps {
  open: boolean
  handleClose: () => void
  order: Order | null
  onOrderUpdated: () => void
}

export default function MyOrderItemsModal({ open, handleClose, order, onOrderUpdated }: MyOrderItemsModalProps) {
  // State to track the status changes
  const [itemStatuses, setItemStatuses] = useState<Record<number, ProductStatus>>({})
  const [isUpdating, setIsUpdating] = useState(false)

  // Initialize itemStatuses with the current status from order items if not already set
  useEffect(() => {
    if (order && order.items) {
      const initialStatuses: Record<number, ProductStatus> = {}

      order.items.forEach(item => {
        // Use productStatus if it exists in the item, otherwise default to Pending
        initialStatuses[item.id] = (item.productStatus as ProductStatus) ?? ProductStatus.Pending
      })
      setItemStatuses(initialStatuses)
    }
  }, [order])

  const handleStatusChange = (itemId: number, event: SelectChangeEvent<number>) => {
    const newStatus = event.target.value as number

    setItemStatuses(prev => ({
      ...prev,
      [itemId]: newStatus as ProductStatus
    }))
  }

  const handleUpdateStatus = async (itemId: number) => {
    if (!order) return

    setIsUpdating(true)

    try {
      // Make API call to update the status
      const response = await fetch(`/api/orders/update-product-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: order.id,
          itemId: itemId,
          status: itemStatuses[itemId]
        })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el estado del producto')
      }

      toast.success('Estado del producto actualizado correctamente')
      onOrderUpdated() // Refresh the order data
    } catch (error) {
      console.error('Error updating product status:', error)
      toast.error('Error al actualizar el estado del producto')
    } finally {
      setIsUpdating(false)
    }
  }

  // Early return after all hooks
  if (!order) {
    return null
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
                  {order.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell component='th' scope='row'>
                        {item.product.name}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell align='right'>${item.product.price.toFixed(2)}</TableCell>
                      <TableCell align='right'>${(item.product.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <FormControl fullWidth size='small'>
                          <InputLabel id={`status-select-label-${item.id}`}>Estado</InputLabel>
                          <Select
                            labelId={`status-select-label-${item.id}`}
                            id={`status-select-${item.id}`}
                            value={itemStatuses[item.id] || 0}
                            label='Estado'
                            onChange={e => handleStatusChange(item.id, e as SelectChangeEvent<number>)}
                          >
                            <MenuItem value={ProductStatus.Pending}>
                              {getProductStatusText(ProductStatus.Pending)}
                            </MenuItem>
                            <MenuItem value={ProductStatus.Preparing}>
                              {getProductStatusText(ProductStatus.Preparing)}
                            </MenuItem>
                            <MenuItem value={ProductStatus.Ready}>{getProductStatusText(ProductStatus.Ready)}</MenuItem>
                            <MenuItem value={ProductStatus.Delivered}>
                              {getProductStatusText(ProductStatus.Delivered)}
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='contained'
                          size='small'
                          onClick={() => handleUpdateStatus(item.id)}
                          disabled={isUpdating}
                        >
                          Actualizar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
