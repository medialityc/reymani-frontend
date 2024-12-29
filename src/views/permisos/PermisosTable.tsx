'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { GridColDef } from '@mui/x-data-grid'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'

import { esES } from '@mui/x-data-grid/locales'

import { fetchPermisos } from '@/services/PermisoService'
import type { PermisoDto } from '@/types/dtos/PermisoDto'

const columns: GridColDef[] = [
  //{ field: 'id', headerName: 'ID', flex: 1 },
  { field: 'codigo', headerName: 'Código', flex: 1 },
  { field: 'descripcion', headerName: 'Descripción', flex: 1 }
]

export default function PermisosTable() {
  const [rows, setRows] = useState<PermisoDto[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getPermisos = async () => {
      try {
        const data = await fetchPermisos()

        setRows(data)
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          router.push('/unauthorized')
        }
      } finally {
        setLoading(false)
      }
    }

    getPermisos()
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
    </div>
  )
}
