'use client'

import React, { useState, useEffect, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import Image from 'next/image'

import { MaterialReactTable } from 'material-react-table'
import type { MRT_ColumnDef, MRT_PaginationState, MRT_SortingState, MRT_Row } from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'
import { Box, Button, IconButton, Tooltip } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit' // <-- Nuevo import
import VisibilityIcon from '@mui/icons-material/Visibility'
import { toast } from 'react-toastify'

import { getBusinessSystemAdminSearch, deleteBusiness } from '../../services/BusinessService'
import CreateBusinessModal from './CreateBusinessModal'
import UpdateBusinessModal from './UpdateBusinessModal' // <-- Nuevo import
import ConfirmationDialog from '../../components/ConfirmationDialog' // ...nuevo import

interface Business {
  id: number
  name: string
  description: string
  userId: number
  userFullName: string
  address: string
  municipalityId: number
  municipalityName: string
  provinceId: number
  provinceName: string
  isAvailable: boolean
  isActive: boolean
  logo: string
  banner: string
}

const BusinessTable: React.FC = () => {
  // ...existing state...
  const [data, setData] = useState<Business[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [createModalOpen, setCreateModalOpen] = useState(false)

  // Estados para confirmación de eliminación
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null)

  // Nuevos estados para editar negocio
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [businessToUpdate, setBusinessToUpdate] = useState<Business | null>(null)

  const router = useRouter()

  // Mapeo para la API
  const columnMapping: { [key: string]: string } = {
    id: 'Id',
    name: 'Name',
    description: 'Description',
    address: 'Address',
    municipalityName: 'MunicipalityName',
    isAvailable: 'IsAvailable',
    isActive: 'IsActive'
  }

  const columns = useMemo<MRT_ColumnDef<Business>[]>(
    () => [
      {
        accessorKey: 'logo',
        header: 'Logo',
        size: 80,
        Cell: ({ cell }) => {
          const url = cell.getValue<string>()

          return url ? <Image src={url} alt='Logo' width={40} height={40} /> : 'N/A'
        },
        enableColumnFilter: false
      },
      {
        accessorKey: 'banner',
        header: 'Banner',
        size: 80,
        Cell: ({ cell }) => {
          const url = cell.getValue<string>()

          return url ? <Image src={url} alt='Banner' width={40} height={40} /> : 'N/A'
        },
        enableColumnFilter: false
      },
      { accessorKey: 'name', header: 'Nombre' },
      { accessorKey: 'description', header: 'Descripción' },
      { accessorKey: 'address', header: 'Dirección' },
      {
        accessorKey: 'userFullName',
        header: 'Administrador',
        enableColumnFilter: true
      },
      { accessorKey: 'municipalityName', header: 'Municipio' },
      { accessorKey: 'provinceName', header: 'Provincia' },
      {
        accessorKey: 'isAvailable',
        header: 'Disponible',
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Sí' : 'No')
      },
      {
        accessorKey: 'isActive',
        header: 'Activo',
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Sí' : 'No')
      },
      {
        header: 'Acciones',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }: { row: MRT_Row<Business> }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip title='Ver Detalles'>
              <IconButton onClick={() => router.push(`/business/${row.original.id}`)}>
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Editar'>
              <IconButton
                onClick={() => {
                  setBusinessToUpdate(row.original)
                  setUpdateModalOpen(true)
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Eliminar'>
              <IconButton color='error' onClick={() => handleOpenDelete(row)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    ],
    [router]
  )

  const fetchData = async () => {
    setIsLoading(true)

    try {
      const filters = {
        Search: globalFilter || '',
        SortBy: sorting.length > 0 ? columnMapping[sorting[0].id] || 'Name' : 'Name',
        IsDescending: sorting.length > 0 ? sorting[0].desc : false,
        Page: pagination.pageIndex + 1,
        PageSize: pagination.pageSize
      }

      const response = await getBusinessSystemAdminSearch(filters)

      if (!response || !Array.isArray(response.data)) throw new Error('La API no devolvió datos válidos')
      setData(response.data)
      setTotalCount(response.totalCount || 0)
    } catch (error) {
      console.error('Error al obtener negocios:', error)
      setData([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination, sorting, globalFilter])

  // Función para abrir confirmación al eliminar
  const handleOpenDelete = (row: MRT_Row<Business>) => {
    setBusinessToDelete(row.original)
    setConfirmOpen(true)
  }

  // Función para confirmar eliminación con manejo de error status 409
  const handleConfirmDelete = async () => {
    if (businessToDelete) {
      try {
        await deleteBusiness(businessToDelete.id)
        toast.success('Negocio eliminado correctamente')
        setConfirmOpen(false)
        setBusinessToDelete(null)
        fetchData()
      } catch (error: any) {
        if (error.status === 409 || error.response?.status === 409) {
          toast.error('No es posible eliminar ya que el negocio tiene productos asociados')
        } else {
          toast.error('Error al eliminar negocio')
        }
      }
    }
  }

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={data}
        state={{ isLoading, pagination, sorting, globalFilter }}
        manualPagination
        manualSorting
        enableGlobalFilter
        enableDensityToggle={false}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onGlobalFilterChange={setGlobalFilter}
        rowCount={totalCount}
        localization={MRT_Localization_ES}
        renderTopToolbarCustomActions={() => (
          <Button variant='contained' onClick={() => setCreateModalOpen(true)}>
            Nuevo Negocio
          </Button>
        )}
      />
      <CreateBusinessModal
        open={createModalOpen}
        handleClose={() => setCreateModalOpen(false)}
        onBusinessCreated={fetchData}
      />
      {businessToUpdate && (
        <UpdateBusinessModal
          open={updateModalOpen}
          handleClose={() => setUpdateModalOpen(false)}
          business={businessToUpdate}
          onBusinessUpdated={fetchData}
        />
      )}
      <ConfirmationDialog
        title='Eliminar negocio'
        text='¿Está seguro que desea eliminar este negocio?'
        open={confirmOpen}
        handleClose={() => setConfirmOpen(false)}
        handleAgree={handleConfirmDelete}
      />
    </>
  )
}

export default BusinessTable
