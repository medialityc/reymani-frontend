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
  Typography
} from '@mui/material'

interface ShippingCost {
  id: number
  municipalityId: number
  municipalityName: string
  cost: number
}

interface ShippingCostsDetailModalProps {
  open: boolean
  handleClose: () => void
  vehicleTypeName: string
  shippingCosts: ShippingCost[]
}

export default function ShippingCostsDetailModal({
  open,
  handleClose,
  vehicleTypeName,
  shippingCosts
}: ShippingCostsDetailModalProps) {
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='md'>
      <DialogTitle>Costos de envío para {vehicleTypeName}</DialogTitle>
      <DialogContent>
        {shippingCosts && shippingCosts.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Municipio</TableCell>
                  <TableCell align='right'>Costo de envío</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shippingCosts.map(cost => (
                  <TableRow key={cost.id}>
                    <TableCell component='th' scope='row'>
                      {cost.municipalityName}
                    </TableCell>
                    <TableCell align='right'>${cost.cost.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant='body1' align='center' sx={{ mt: 2, mb: 2 }}>
            No hay costos de envío registrados para este tipo de vehículo.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
