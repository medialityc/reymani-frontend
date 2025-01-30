/* eslint-disable react/jsx-key */
'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { GridColDef } from '@mui/x-data-grid'
import { DataGrid, GridActionsCellItem, GridToolbar } from '@mui/x-data-grid'
import { esES } from '@mui/x-data-grid/locales'

import { enqueueSnackbar, SnackbarProvider } from 'notistack'

import { fetchUsuarios, deleteUsuario, changeUsuarioStatus } from '@/services/UsuarioService'
import ConfirmationDialog from '@/components/ConfirmationDialog'
import type { UsuarioDto } from '@/types/dtos/UsuarioDto'
import usePermissions from '@/hooks/usePermissions'

export default function UsuariosTable() {
  const [rows, setRows] = useState<UsuarioDto[]>([])
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
      await deleteUsuario(selectedId)
      setRows(rows.filter(row => row.id !== selectedId))
      enqueueSnackbar('Usuario eliminado correctamente', { variant: 'success' })
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        enqueueSnackbar('Usuario no encontrado', { variant: 'error' })
      } else if (error.response && error.response.status === 401) {
        router.push('/unauthorized')
      } else {
        enqueueSnackbar('Error eliminando usuario', { variant: 'error' })
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
      await changeUsuarioStatus({ id: selectedStatusId, activo: !selectedStatus })
      setRows(rows.map(row => (row.id === selectedStatusId ? { ...row, activo: !selectedStatus } : row)))
      enqueueSnackbar('Estado del usuario cambiado correctamente', { variant: 'success' })
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        enqueueSnackbar('Usuario no encontrado', { variant: 'error' })
      } else if (error.response && error.response.status === 401) {
        router.push('/unauthorized')
      } else {
        enqueueSnackbar('Error cambiando el estado del usuario', { variant: 'error' })
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
      renderCell: (params: { row: UsuarioDto }) => {
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

        if (hasPermission('Eliminar_Usuario')) {
          actions.push(
            <GridActionsCellItem
              icon={<i className='ri-delete-bin-7-line' />}
              onClick={handleDeleteClick(id)}
              label='Eliminar'
              color='inherit'
            />
          )
        }

        if (hasPermission('Cambiar_Estado_Usuario')) {
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
    const getUsuarios = async () => {
      try {
        const data = await fetchUsuarios()

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

    getUsuarios()
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
        title={'Eliminar Usuario'}
        text={'¿Está seguro que desea eliminar este usuario?'}
        open={dialogOpen}
        handleClose={handleDialogClose}
        handleAgree={handleDialogAgree}
      />
      <ConfirmationDialog
        title={'Cambiar Estado del Usuario'}
        text={`¿Está seguro que desea cambiar el estado de este usuario a ${selectedStatus ? 'No Activo' : 'Activo'}?`}
        open={statusDialogOpen}
        handleClose={handleStatusDialogClose}
        handleAgree={handleStatusDialogAgree}
      />
    </div>
  )
}
