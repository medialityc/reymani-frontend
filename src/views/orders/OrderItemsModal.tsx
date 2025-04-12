'use client'

import React from 'react'

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

import type { Order } from '../../services/OrderService'
import { ProductStatus, getProductStatusText } from '../../services/OrderService'

interface OrderItemsModalProps {
  open: boolean
  handleClose: () => void
  order: Order | null
}

export default function OrderItemsModal({ open, handleClose, order }: OrderItemsModalProps) {
  if (!order) {
    return null
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='md'>
      <DialogTitle>Detalles del Pedido</DialogTitle>
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
                        {getProductStatusText((item.productStatus as ProductStatus) ?? ProductStatus.InPreparation)}
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
