/* eslint-disable react/jsx-key */
'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { GridColDef } from '@mui/x-data-grid'
import { DataGrid, GridActionsCellItem, GridToolbar } from '@mui/x-data-grid'
import { esES } from '@mui/x-data-grid/locales'

import { enqueueSnackbar, SnackbarProvider } from 'notistack'

import { fetchRoles, deleteRol } from '@/services/RolService'
import type { RolDto } from '@/types/dtos/RolDto'
import usePermissions from '@/hooks/usePermissions'
import ConfirmationDialog from '@/components/ConfirmationDialog'

export default function RolesTable() {
  const [rows, setRows] = useState<RolDto[]>([])
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
      await deleteRol(selectedId)
      setRows(rows.filter(row => row.id !== selectedId))
      enqueueSnackbar('Rol eliminado correctamente', { variant: 'success' })
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        enqueueSnackbar('Rol no encontrado', { variant: 'error' })
      } else if (error.response && error.response.status === 401) {
        router.push('/unauthorized')
      } else {
        enqueueSnackbar('Error eliminando rol', { variant: 'error' })
      }
    }
  }

  const columns: GridColDef[] = [
    //{ field: 'idRol', headerName: 'ID', flex: 1 },
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'descripcion', headerName: 'Descripción', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      flex: 0.5,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        if (hasPermission('Actualizar_Rol')) {
          const actions = [
            <GridActionsCellItem
              icon={<i className='ri-edit-2-line' />}
              label='Editar'
              className='textPrimary'
              onClick={() => router.push(`/roles/${id}/edit`)}
              color='inherit'
            />
          ]

          if (hasPermission('Eliminar_Rol')) {
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

  async function getRoles() {
    try {
      const data = await fetchRoles()

      setRows(data)
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        router.push('/unauthorized')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getRoles()
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
        title={'Eliminar Rol'}
        text={'¿Está seguro que desea eliminar este rol?'}
        open={dialogOpen}
        handleClose={handleDialogClose}
        handleAgree={handleDialogAgree}
      />
    </div>
  )
}
