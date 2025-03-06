'use client'

import React, { useState, useEffect, useMemo } from 'react'

import type { MRT_ColumnDef, MRT_PaginationState, MRT_SortingState, MRT_Row } from 'material-react-table'
import { MaterialReactTable } from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'
import { Box, Button, IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { toast } from 'react-toastify'

import { getProductCategoriesSearch, deleteProductCategory } from '../../services/ProductCategoryService'
import ConfirmationDialog from '../../components/ConfirmationDialog'
import CreateProductCategoryModal from './CreateProductCategoryModal'
import UpdateProductCategoryModal from './UpdateProductCategoryModal'
import ImagesCell from '../../components/ImagesCell'

interface ProductCategory {
  id: number
  logo: string
  name: string
  isActive: boolean
}

const ProductCategoriesTable: React.FC = () => {
  const [data, setData] = useState<ProductCategory[]>([])
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
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [categoryToUpdate, setCategoryToUpdate] = useState<ProductCategory | null>(null)

  // Mapeo para la API: convierte el accessorKey de la tabla al nombre de propiedad esperado
  const columnMapping: { [key: string]: string } = {
    id: 'Ids',
    name: 'Names',
    logo: 'Logo',
    isActive: 'IsActive'
  }

  const columns = useMemo<MRT_ColumnDef<ProductCategory>[]>(
    () => [
      {
        accessorKey: 'logo',
        header: 'Logo',
        size: 80,
        Cell: ({ row }) => {
          const images = row.original.logo ? [row.original.logo] : []

          return <ImagesCell images={images} alt={row.original.name} />
        },
        enableEditing: false,
        enableSorting: false
      },
      {
        accessorKey: 'name',
        header: 'Nombre',
        muiEditTextFieldProps: { required: true }
      },
      {
        accessorKey: 'isActive',
        header: 'Activo',
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
      const filters = {
        Search: globalFilter || '',
        SortBy: sorting.length > 0 ? columnMapping[sorting[0].id] || 'Name' : 'Name',
        IsDescending: sorting.length > 0 ? sorting[0].desc : false,
        Page: pagination.pageIndex + 1,
        PageSize: pagination.pageSize
      }

      const response = await getProductCategoriesSearch(filters)

      // Se espera que response tenga { data: ProductCategory[], totalCount: number, ... }
      if (!response || !Array.isArray(response.data)) {
        throw new Error('La API no devolvió datos válidos')
      }

      setData(response.data)
      setTotalCount(response.totalCount ?? 0)
    } catch (error) {
      console.error('Error al obtener categorías de productos:', error)
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
  const handleOpenDelete = (row: MRT_Row<ProductCategory>) => {
    setCategoryToDelete(row.original)
    setConfirmOpen(true)
  }

  // Función para abrir ventana de edición
  const handleOpenUpdate = (row: MRT_Row<ProductCategory>) => {
    setCategoryToUpdate(row.original)
    setUpdateModalOpen(true)
  }

  // Función para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteProductCategory(categoryToDelete.id)
        toast.success('Categoría de producto eliminada correctamente')
        setConfirmOpen(false)
        setCategoryToDelete(null)
        fetchData()
      } catch (error: any) {
        console.error('Error al eliminar categoría de producto:', error)

        if (error.status === 409) {
          toast.error('No se puede eliminar la categoría porque está siendo utilizada por uno o más productos')
        } else {
          toast.error('Error al eliminar la categoría de producto')
        }

        setConfirmOpen(false)
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
        manualPagination
        manualSorting
        manualFiltering
        enableGlobalFilter
        enableDensityToggle={false}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onGlobalFilterChange={setGlobalFilter}
        rowCount={totalCount}
        renderTopToolbarCustomActions={() => (
          <Button variant='contained' onClick={() => setCreateModalOpen(true)}>
            Nueva Categoría
          </Button>
        )}
        localization={MRT_Localization_ES}
      />
      {/* Modales para crear y actualizar categoría */}
      <CreateProductCategoryModal
        open={createModalOpen}
        handleClose={() => setCreateModalOpen(false)}
        onCategoryCreated={fetchData}
      />
      {categoryToUpdate && (
        <UpdateProductCategoryModal
          open={updateModalOpen}
          handleClose={() => setUpdateModalOpen(false)}
          category={categoryToUpdate}
          onCategoryUpdated={fetchData}
        />
      )}
      {/* Confirmación para eliminar categoría */}
      <ConfirmationDialog
        title='Eliminar categoría'
        text='¿Está seguro que desea eliminar esta categoría de producto?'
        open={confirmOpen}
        handleClose={() => setConfirmOpen(false)}
        handleAgree={handleConfirmDelete}
      />
    </>
  )
}

export default ProductCategoriesTable
