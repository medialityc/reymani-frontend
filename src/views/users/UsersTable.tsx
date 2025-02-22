'use client'

import React, { useState, useEffect, useMemo } from 'react'

import type { MRT_ColumnDef, MRT_PaginationState, MRT_SortingState } from 'material-react-table'
import { MaterialReactTable } from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'

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
        }
      },
      {
        accessorKey: 'firstName',
        header: 'Nombre'
      },
      {
        accessorKey: 'lastName',
        header: 'Apellido'
      },
      {
        accessorKey: 'email',
        header: 'Email'
      },
      {
        accessorKey: 'phone',
        header: 'Teléfono'
      },
      {
        accessorKey: 'role',
        header: 'Rol',
        Cell: ({ cell }) => {
          const roleMap = ['Cliente', 'Repartidor', 'Administrador de Negocio', 'Super Admin']

          return roleMap[cell.getValue<number>()] || 'Desconocido'
        }
      },
      {
        accessorKey: 'isActive',
        header: 'Activo',
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Sí' : 'No')
      },
      {
        accessorKey: 'isConfirmed',
        header: 'Confirmado',
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Sí' : 'No')
      }
    ],
    []
  )

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

      // Ahora response ya es el payload de la API, por lo que:
      // response.data -> array de usuarios
      // response.totalCount -> total de registros
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
      onPaginationChange={setPagination}
      onSortingChange={setSorting}
      onGlobalFilterChange={setGlobalFilter}
      rowCount={totalCount}
      localization={MRT_Localization_ES}
    />
  )
}

export default UsersTable
