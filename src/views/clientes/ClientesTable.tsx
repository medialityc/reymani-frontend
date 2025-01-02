/* eslint-disable react/jsx-key */
'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { GridColDef } from '@mui/x-data-grid'
import { DataGrid, GridActionsCellItem, GridToolbar } from '@mui/x-data-grid'
import { esES } from '@mui/x-data-grid/locales'

import { enqueueSnackbar, SnackbarProvider } from 'notistack'

import { fetchClientes, deleteCliente, changeClienteStatus } from '@/services/ClienteService'
import ConfirmationDialog from '@/components/ConfirmationDialog'
import type { ClienteDto } from '@/types/dtos/ClienteDto'
import usePermissions from '@/hooks/usePermissions'

export default function ClientesTable() {
  const [rows, setRows] = useState<ClienteDto[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const handleDialogClose = () => setDialogOpen(false)
  const [selectedId, setSelectedId] = useState('')
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedStatusId, setSelectedStatusId] = useState('')
  const [selectedStatus, setSelectedStatus] = useState(false)
  const handleStatusDialogClose = () => setStatusDialogOpen(false)
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

  const handleChangeStatusClick = (id: any, currentStatus: boolean) => () => {
    setStatusDialogOpen(true)
    setSelectedStatusId(id)
    setSelectedStatus(currentStatus)
  }

  const handleStatusDialogAgree = async () => {
    setStatusDialogOpen(false)

    try {
      await changeClienteStatus({ id: selectedStatusId, activo: !selectedStatus })
      setRows(rows.map(row => (row.id === selectedStatusId ? { ...row, activo: !selectedStatus } : row)))
      enqueueSnackbar('Estado del cliente cambiado correctamente', { variant: 'success' })
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        enqueueSnackbar('Cliente no encontrado', { variant: 'error' })
      } else if (error.response && error.response.status === 401) {
        router.push('/unauthorized')
      } else {
        enqueueSnackbar('Error cambiando el estado del cliente', { variant: 'error' })
      }
    }
  }

  const columns: GridColDef[] = [
    { field: 'numeroCarnet', headerName: 'Número de Carnet', flex: 1 },
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'apellidos', headerName: 'Apellidos', flex: 1 },
    { field: 'username', headerName: 'Username', flex: 1 },
    {
      field: 'activo',
      headerName: 'Estado',
      flex: 1,
      renderCell: (params: { row: ClienteDto }) => {
        console.log('Activo value:', params.row?.activo) // Debugging line

        return params.row?.activo ? 'Activo' : 'No Activo'
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      flex: 0.5,
      cellClassName: 'actions',
      getActions: ({ id, row }) => {
        const actions = []

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

        if (hasPermission('Cambiar_Estado_Cliente')) {
          actions.push(
            <GridActionsCellItem
              icon={<i className={row.activo ? 'ri-close-circle-line' : 'ri-checkbox-circle-line'} />}
              onClick={handleChangeStatusClick(id, row.activo)}
              label='Cambiar Estado'
              color='inherit'
            />
          )
        }

        return actions
      }
    }
  ]

  useEffect(() => {
    const getClientes = async () => {
      try {
        const data = await fetchClientes()

        console.log('Fetched data:', data) // Debugging line
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
  }, [router])

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
      <ConfirmationDialog
        title={'Cambiar Estado del Cliente'}
        text={`¿Está seguro que desea cambiar el estado de este cliente a ${selectedStatus ? 'No Activo' : 'Activo'}?`}
        open={statusDialogOpen}
        handleClose={handleStatusDialogClose}
        handleAgree={handleStatusDialogAgree}
      />
    </div>
  )
}
