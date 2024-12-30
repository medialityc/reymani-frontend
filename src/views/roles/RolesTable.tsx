'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { GridColDef } from '@mui/x-data-grid'
import { DataGrid, GridActionsCellItem, GridToolbar } from '@mui/x-data-grid'
import { esES } from '@mui/x-data-grid/locales'

import { fetchRoles } from '@/services/RolService'
import type { RolDto } from '@/types/dtos/RolDto'

export default function RolesTable() {
  const [rows, setRows] = useState<RolDto[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
        return [
          // eslint-disable-next-line react/jsx-key
          <GridActionsCellItem
            icon={<i className='ri-edit-2-fill' />}
            label='Editar'
            className='textPrimary'
            onClick={() => router.push(`/roles/${id}/edit`)}
            color='inherit'
          />
        ]
      }
    }
  ]

  useEffect(() => {
    const getRoles = async () => {
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

    getRoles()
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
