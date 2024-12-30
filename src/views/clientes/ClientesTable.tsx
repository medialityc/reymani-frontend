'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { GridColDef } from '@mui/x-data-grid'
import { DataGrid, GridActionsCellItem, GridToolbar } from '@mui/x-data-grid'
import { esES } from '@mui/x-data-grid/locales'

import { fetchClientes } from '@/services/ClienteService'
import type { ClienteDto } from '@/types/dtos/ClienteDto'
import usePermissions from '@/hooks/usePermissions'

export default function ClientesTable() {
  const [rows, setRows] = useState<ClienteDto[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { hasPermission } = usePermissions()

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
        if (hasPermission('EditarCliente')) {
          return [
            <GridActionsCellItem
              icon={<i className='ri-edit-2-fill' />}
              label='Editar'
              className='textPrimary'
              onClick={() => router.push(`/clientes/${id}/edit`)}
              color='inherit'
            />
          ]
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
    </div>
  )
}
