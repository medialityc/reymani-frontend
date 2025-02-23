'use client'

import React, { useState, useEffect, useMemo } from 'react'

import type {
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_SortingState,
  MRT_TableOptions,
  MRT_Row
} from 'material-react-table'
import { MaterialReactTable } from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'
import { Box, Button, IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import { getUsersSearch } from '../../services/UserService' // Asegúrate de importar correctamente el servicio

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

  // Funciones simuladas para CRUD. Reemplázalas por tus llamadas a la API.
  const createUser = async (user: Partial<User>) => {
    console.log('Creando usuario', user)

    // Simula un retardo
    return new Promise(resolve => setTimeout(resolve, 1000))
  }

  const updateUser = async (user: User) => {
    console.log('Actualizando usuario', user)

    return new Promise(resolve => setTimeout(resolve, 1000))
  }

  const deleteUser = async (id: number) => {
    console.log('Eliminando usuario con id', id)

    return new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Acción para crear un nuevo usuario
  const handleCreateUser: MRT_TableOptions<User>['onCreatingRowSave'] = async ({ values, table }) => {
    try {
      await createUser(values)
      table.setCreatingRow(null) // Salir del modo creación
      fetchData() // Recargar datos
    } catch (error) {
      console.error('Error al crear usuario:', error)
    }
  }

  // Acción para editar un usuario
  const handleEditingRowSave: MRT_TableOptions<User>['onEditingRowSave'] = async ({ values, table }) => {
    try {
      await updateUser(values)
      table.setEditingRow(null) // Salir del modo edición
      fetchData()
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
    }
  }

  // Acción para eliminar un usuario
  const handleDeleteUser = async (row: MRT_Row<User>) => {
    if (window.confirm('¿Está seguro que desea eliminar este usuario?')) {
      try {
        await deleteUser(row.original.id)
        fetchData()
      } catch (error) {
        console.error('Error al eliminar usuario:', error)
      }
    }
  }

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
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
      enableEditing
      onPaginationChange={setPagination}
      onSortingChange={setSorting}
      onGlobalFilterChange={setGlobalFilter}
      onEditingRowSave={handleEditingRowSave}
      onCreatingRowSave={handleCreateUser}
      rowCount={totalCount}
      renderRowActions={({ row, table }) => (
        <Box sx={{ display: 'flex', gap: '1rem' }}>
          <Tooltip title='Editar'>
            <IconButton onClick={() => table.setEditingRow(row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Eliminar'>
            <IconButton color='error' onClick={() => handleDeleteUser(row)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      renderTopToolbarCustomActions={({ table }) => (
        <Button variant='contained' onClick={() => table.setCreatingRow(true)}>
          Nuevo Usuario
        </Button>
      )}
      localization={MRT_Localization_ES}
    />
  )
}

export default UsersTable
