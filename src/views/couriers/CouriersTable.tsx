'use client'

import React, { useState, useEffect, useMemo } from 'react'

import type { MRT_ColumnDef, MRT_PaginationState, MRT_SortingState, MRT_Row } from 'material-react-table'
import { MaterialReactTable } from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'
import { Box, Button, IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { toast } from 'react-toastify'

import { getCouriersUsers, deleteUser } from '../../services/UserService'
import ConfirmationDialog from '../../components/ConfirmationDialog'
import CreateCourierModal from './CreateCourierModal'
import UpdateCourierModal from './UpdateCourierModal'
import ImagesCell from '../../components/ImagesCell'

interface Courier {
  id: number
  profilePicture: string
  firstName: string
  lastName: string
  email: string
  phone: string
  isActive: boolean
  role: number
  isConfirmed: boolean
}

const CouriersTable: React.FC = () => {
  const [data, setData] = useState<Courier[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')

  // Estados para confirmación de eliminación
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [courierToDelete, setCourierToDelete] = useState<Courier | null>(null)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [courierToUpdate, setCourierToUpdate] = useState<Courier | null>(null)

  const columns = useMemo<MRT_ColumnDef<Courier>[]>(
    () => [
      {
        accessorKey: 'profilePicture',
        header: 'Foto',
        size: 80,
        Cell: ({ row }) => {
          const images = row.original.profilePicture ? [row.original.profilePicture] : []

          return <ImagesCell images={images} alt={`${row.original.firstName} ${row.original.lastName}`} />
        },
        enableEditing: false
      },
      {
        accessorKey: 'firstName',
        header: 'Nombre',
        muiEditTextFieldProps: { required: true }
      },
      {
        accessorKey: 'lastName',
        header: 'Apellido',
        muiEditTextFieldProps: { required: true }
      },
      {
        accessorKey: 'email',
        header: 'Email',
        muiEditTextFieldProps: { type: 'email', required: true }
      },
      {
        accessorKey: 'phone',
        header: 'Teléfono'
      },
      {
        accessorKey: 'isActive',
        header: 'Activo',
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Sí' : 'No'),
        enableEditing: false
      },
      {
        accessorKey: 'isConfirmed',
        header: 'Confirmado',
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Sí' : 'No'),
        enableEditing: false
      },

      // Nueva columna de Acciones al final
      {
        header: 'Acciones',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip title='Editar'>
              <IconButton onClick={() => handleOpenUpdate(row)}>
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
    []
  )

  // Función para obtener datos de la API
  const fetchData = async () => {
    setIsLoading(true)

    try {
      const response = await getCouriersUsers()

      if (!response || !Array.isArray(response.data)) {
        throw new Error('La API no devolvió datos válidos')
      }

      setData(response.data)
      setTotalCount(response.totalCount ?? 0)
    } catch (error) {
      console.error('Error al obtener mensajeros:', error)
      setData([])
      setTotalCount(0)
      toast.error('Error al cargar la lista de mensajeros')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Nueva función para abrir confirmación al eliminar
  const handleOpenDelete = (row: MRT_Row<Courier>) => {
    setCourierToDelete(row.original)
    setConfirmOpen(true)
  }

  // Función para abrir ventana de edición
  const handleOpenUpdate = (row: MRT_Row<Courier>) => {
    setCourierToUpdate(row.original)
    setUpdateModalOpen(true)
  }

  // Función para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (courierToDelete) {
      try {
        await deleteUser(courierToDelete.id)
        toast.success('Mensajero eliminado correctamente')
        setConfirmOpen(false)
        setCourierToDelete(null)
        fetchData()
      } catch (error) {
        console.error('Error al eliminar mensajero:', error)
        toast.error('Error al eliminar mensajero')
      }
    }
  }

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={data}
        state={{
          isLoading,
          pagination,
          sorting,
          globalFilter
        }}
        enableGlobalFilter
        enableDensityToggle={false}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onGlobalFilterChange={setGlobalFilter}
        rowCount={totalCount}
        renderTopToolbarCustomActions={() => (
          <Button variant='contained' onClick={() => setCreateModalOpen(true)}>
            Nuevo Mensajero
          </Button>
        )}
        localization={MRT_Localization_ES}
      />
      {/* Modales para crear y actualizar mensajero */}
      <CreateCourierModal
        open={createModalOpen}
        handleClose={() => setCreateModalOpen(false)}
        onCourierCreated={fetchData}
      />
      {courierToUpdate && (
        <UpdateCourierModal
          open={updateModalOpen}
          handleClose={() => setUpdateModalOpen(false)}
          courier={courierToUpdate}
          onCourierUpdated={fetchData}
        />
      )}
      {/* Confirmación para eliminar mensajero */}
      <ConfirmationDialog
        title='Eliminar mensajero'
        text='¿Está seguro que desea eliminar este mensajero?'
        open={confirmOpen}
        handleClose={() => setConfirmOpen(false)}
        handleAgree={handleConfirmDelete}
      />
    </>
  )
}

export default CouriersTable
