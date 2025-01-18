/* eslint-disable react/jsx-key */
'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { GridColDef } from '@mui/x-data-grid'
import { DataGrid, GridActionsCellItem, GridToolbar } from '@mui/x-data-grid'
import { esES } from '@mui/x-data-grid/locales'

import { enqueueSnackbar, SnackbarProvider } from 'notistack'

import { fetchTelefonos, deleteTelefono } from '@/services/TelefonoService'
import { fetchCliente } from '@/services/ClienteService'
import type { TelefonoDto } from '@/types/dtos/TelefonoDto'
import usePermissions from '@/hooks/usePermissions'
import ConfirmationDialog from '@/components/ConfirmationDialog'

export default function TelefonosTable() {
  const [rows, setRows] = useState<TelefonoDto[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { hasPermission } = usePermissions()

  const [dialogOpen, setDialogOpen] = useState(false)
  const handleDialogClose = () => setDialogOpen(false)
  const [selectedId, setSelectedId] = React.useState('')

  const handleDeleteClick = (id: any) => () => {
    setDialogOpen(true)
    setSelectedId(id)
  }

  const handleDialogAgree = async () => {
    setDialogOpen(false)

    try {
      await deleteTelefono(selectedId)
      setRows(rows.filter(row => row.idTelefono !== selectedId))
      enqueueSnackbar('Teléfono eliminado correctamente', { variant: 'success' })
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        enqueueSnackbar('Teléfono no encontrado', { variant: 'error' })
      } else if (error.response && error.response.status === 401) {
        router.push('/unauthorized')
      } else {
        enqueueSnackbar('Error eliminando teléfono', { variant: 'error' })
      }
    }
  }

  const columns: GridColDef[] = [
    { field: 'numeroTelefono', headerName: 'Número Teléfono', flex: 1 },
    { field: 'descripcion', headerName: 'Descripción', flex: 1 },
    { field: 'tipoEntidad', headerName: 'Tipo de Entidad', flex: 1 },
    { field: 'nombreEntidad', headerName: 'Nombre de Entidad', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      flex: 0.5,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        if (hasPermission('Actualizar_Telefono')) {
          const actions = [
            <GridActionsCellItem
              icon={<i className='ri-edit-2-line' />}
              label='Editar'
              className='textPrimary'
              onClick={() => router.push(`/telefonos/${id}/edit`)}
              color='inherit'
            />
          ]

          if (hasPermission('Eliminar_Telefono')) {
            actions.push(
              <GridActionsCellItem
                icon={<i className='ri-delete-bin-7-line' />}
                onClick={handleDeleteClick(id)}
                label='Eliminar'
                color='inherit'
              />
            )
          }

          return actions
        }

        return []
      }
    }
  ]

  async function getTelefonos() {
    try {
      const data = await fetchTelefonos()

      const mappedData = await Promise.all(
        data.map(async telefono => {
          if (telefono.tipoEntidad === 'Cliente') {
            const cliente = await fetchCliente(telefono.idEntidad)

            return { ...telefono, id: telefono.idTelefono, nombreEntidad: cliente.nombre }
          }

          return { ...telefono, id: telefono.idTelefono, nombreEntidad: telefono.idEntidad }
        })
      )

      setRows(mappedData)
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        router.push('/unauthorized')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getTelefonos()
  }, [])

  return (
    <div style={{ height: 650, width: '100%' }}>
      <SnackbarProvider maxSnack={3} />
      <DataGrid
        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        sx={{ height: 650, width: '100%', marginTop: 5, backgroundColor: 'var(--mui-palette-background-paper)' }}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25, page: 0 }
          }
        }}
        loading={loading}
        slots={{ toolbar: GridToolbar }}
        rows={rows}
        columns={columns}
      />
      <ConfirmationDialog
        title={'Eliminar Teléfono'}
        text={'¿Está seguro que desea eliminar este teléfono?'}
        open={dialogOpen}
        handleClose={handleDialogClose}
        handleAgree={handleDialogAgree}
      />
    </div>
  )
}
