/* eslint-disable react/jsx-key */
'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { GridColDef } from '@mui/x-data-grid'
import { DataGrid, GridActionsCellItem, GridToolbar } from '@mui/x-data-grid'
import { esES } from '@mui/x-data-grid/locales'

import { enqueueSnackbar, SnackbarProvider } from 'notistack'

import { fetchClientes, deleteCliente } from '@/services/ClienteService'
import ConfirmationDialog from '@/components/ConfirmationDialog'
import type { ClienteDto } from '@/types/dtos/ClienteDto'
import usePermissions from '@/hooks/usePermissions'

export default function ClientesTable() {
  const [rows, setRows] = useState<ClienteDto[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const handleDialogClose = () => setDialogOpen(false)
  const [selectedId, setSelectedId] = useState('')
  const router = useRouter()
  const { hasPermission } = usePermissions()

  const handleDeleteClick = (id: any) => () => {
    setDialogOpen(true)
    setSelectedId(id)
  }

  const handleDialogAgree = async () => {
    setDialogOpen(false)

    try {
      await deleteCliente(selectedId)
      setRows(rows.filter(row => row.id !== selectedId))
      enqueueSnackbar('Cliente eliminado correctamente', { variant: 'success' })
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        enqueueSnackbar('Cliente no encontrado', { variant: 'error' })
      } else if (error.response && error.response.status === 401) {
        router.push('/unauthorized')
      } else {
        enqueueSnackbar('Error eliminando cliente', { variant: 'error' })
      }
    }
  }

  const columns: GridColDef[] = [
    { field: 'numeroCarnet', headerName: 'Número de Carnet', flex: 1 },
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'apellidos', headerName: 'Apellidos', flex: 1 },
    { field: 'username', headerName: 'Username', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      flex: 0.5,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        if (hasPermission('Actualizar_Cliente')) {
          const actions = [
            <GridActionsCellItem
              icon={<i className='ri-edit-2-fill' />}
              label='Editar'
              className='textPrimary'
              onClick={() => router.push(`/clientes/${id}/edit`)}
              color='inherit'
            />
          ]

          if (hasPermission('Eliminar_Cliente')) {
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

  useEffect(() => {
    const getClientes = async () => {
      try {
        const data = await fetchClientes()

        setRows(data)
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          router.push('/unauthorized')
        }
      } finally {
        setLoading(false)
      }
    }

    getClientes()
  }, [])

  return (
    <div style={{ height: 650, width: '100%' }}>
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
      <SnackbarProvider maxSnack={3} />
      <ConfirmationDialog
        title={'Eliminar Cliente'}
        text={'¿Está seguro que desea eliminar este cliente?'}
        open={dialogOpen}
        handleClose={handleDialogClose}
        handleAgree={handleDialogAgree}
      />
    </div>
  )
}
