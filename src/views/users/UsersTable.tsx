'use client'

import React, { useState, useEffect, useMemo } from 'react'

import type { MRT_ColumnDef, MRT_PaginationState, MRT_SortingState, MRT_Row } from 'material-react-table'
import { MaterialReactTable } from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'
import { Box, Button, IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { toast } from 'react-toastify' // <-- Nuevo import

import { getUsersSearch, deleteUser } from '../../services/UserService'
import ConfirmationDialog from '../../components/ConfirmationDialog' // <-- Nuevo import
import CreateUserModal from './CreateUserModal' // <-- Nuevo import
import UpdateUserModal from './UpdateUserModal' // <-- Nuevo import

interface User {
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

const UsersTable: React.FC = () => {
  const [data, setData] = useState<User[]>([])
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
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [userToUpdate, setUserToUpdate] = useState<User | null>(null)

  // Mapeo para la API: convierte el accessorKey de la tabla al nombre de propiedad esperado
  const columnMapping: { [key: string]: string } = {
    id: 'Id',
    profilePicture: 'ProfilePicture',
    firstName: 'FirstName',
    lastName: 'LastName',
    email: 'Email',
    phone: 'Phone',
    role: 'Role',
    isActive: 'IsActive',
    isConfirmed: 'IsConfirmed'
  }

  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'profilePicture',
        header: 'Foto',
        size: 80,
        Cell: ({ cell }) => {
          const imageUrl = cell.getValue<string>()

          return imageUrl ? (
            <img src={imageUrl} alt='Perfil' style={{ width: 40, height: 40, borderRadius: '50%' }} />
          ) : (
            'N/A'
          )
        },
        enableEditing: false // No se edita la foto en este ejemplo
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
        accessorKey: 'role',
        header: 'Rol',
        Cell: ({ cell }) => {
          const roleMap = ['Cliente', 'Mensajero', 'Administrador de Negocio', 'Administrador de Sistema']

          return roleMap[cell.getValue<number>()] || 'Desconocido'
        },

        // Supongamos que el rol se selecciona de una lista:
        editVariant: 'select',
        muiEditTextFieldProps: {
          select: true
        }
      },
      {
        accessorKey: 'isActive',
        header: 'Activo',
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Sí' : 'No'),

        // No editable en este ejemplo
        enableEditing: false
      },
      {
        accessorKey: 'isConfirmed',
        header: 'Confirmado',
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Sí' : 'No'),
        enableEditing: false
      }
    ],
    []
  )

  // Función para obtener datos de la API
  const fetchData = async () => {
    setIsLoading(true)

    try {
      const filters = {
        Search: globalFilter || '',
        SortBy: sorting.length > 0 ? columnMapping[sorting[0].id] || 'FirstName' : 'FirstName',
        IsDescending: sorting.length > 0 ? sorting[0].desc : false,
        Page: pagination.pageIndex + 1,
        PageSize: pagination.pageSize
      }

      const response = await getUsersSearch(filters)

      // Se espera que response tenga { data: User[], totalCount: number, ... }
      if (!response || !Array.isArray(response.data)) {
        throw new Error('La API no devolvió datos válidos')
      }

      setData(response.data)
      setTotalCount(response.totalCount ?? 0)
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      setData([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination, sorting, globalFilter])

  // Nueva función para abrir confirmación al eliminar
  const handleOpenDelete = (row: MRT_Row<User>) => {
    setUserToDelete(row.original)
    setConfirmOpen(true)
  }

  // Función para abrir ventana de edición
  const handleOpenUpdate = (row: MRT_Row<User>) => {
    setUserToUpdate(row.original)
    setUpdateModalOpen(true)
  }

  // Función para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id)
        toast.success('Usuario eliminado correctamente') // <-- Toast de éxito
        setConfirmOpen(false)
        setUserToDelete(null)
        fetchData()
      } catch (error) {
        console.error('Error al eliminar usuario:', error)
        toast.error('Error al eliminar usuario')
      }
    }
  }

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={data}
        enableRowActions // <-- Añade esta propiedad
        state={{
          isLoading,
          pagination,
          sorting,
          globalFilter
        }}
        manualPagination
        manualSorting
        manualFiltering
        enableGlobalFilter
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onGlobalFilterChange={setGlobalFilter}
        rowCount={totalCount}
        renderRowActions={({ row }) => (
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
        )}
        renderTopToolbarCustomActions={() => (
          <Button variant='contained' onClick={() => setCreateModalOpen(true)}>
            Nuevo Usuario
          </Button>
        )}
        localization={MRT_Localization_ES}
      />
      {/* Modales para crear y actualizar usuario */}
      <CreateUserModal open={createModalOpen} handleClose={() => setCreateModalOpen(false)} onUserCreated={fetchData} />
      {userToUpdate && (
        <UpdateUserModal
          open={updateModalOpen}
          handleClose={() => setUpdateModalOpen(false)}
          user={userToUpdate}
          onUserUpdated={fetchData}
        />
      )}
      {/* Confirmación para eliminar usuario */}
      <ConfirmationDialog
        title='Eliminar usuario'
        text='¿Está seguro que desea eliminar este usuario?'
        open={confirmOpen}
        handleClose={() => setConfirmOpen(false)}
        handleAgree={handleConfirmDelete}
      />
    </>
  )
}

export default UsersTable
