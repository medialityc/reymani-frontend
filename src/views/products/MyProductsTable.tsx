'use client'

import React, { useState, useEffect, useMemo } from 'react'

import { MaterialReactTable } from 'material-react-table'
import type { MRT_ColumnDef, MRT_PaginationState, MRT_SortingState, MRT_Row } from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'
import { Box, Button, IconButton, Tooltip } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { toast } from 'react-toastify'

import { getMyProductsSearch, deleteMyProduct } from '../../services/ProductService'
import ConfirmationDialog from '../../components/ConfirmationDialog'
import CreateProductModal from './CreateMyProductModal'
import UpdateProductModal from './UpdateMyProductModal'
import ImagesCell from '../../components/ImagesCell'
import { getCapacityLabel } from '../../utils/capacityUtils'

interface Product {
  id: number
  name: string
  description: string
  businessId: number
  businessName: string
  isAvailable: boolean
  isActive: boolean
  images: string[]
  price: number
  discountPrice: number
  categoryId: number
  categoryName: string
  capacity: number
  numberOfRatings: number
  averageRating: number
}

const MyProductsTable: React.FC = () => {
  const [data, setData] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [productToUpdate, setProductToUpdate] = useState<Product | null>(null)

  // Mapeo para la API
  const columnMapping: { [key: string]: string } = {
    id: 'Id',
    name: 'Name',
    description: 'Description',
    price: 'Price',
    discountPrice: 'DiscountPrice',
    categoryName: 'CategoryName',
    isAvailable: 'IsAvailable',
    isActive: 'IsActive',
    averageRating: 'AverageRating',
    numberOfRatings: 'NumberOfRatings',
    capacity: 'Capacity'
  }

  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'images',
        header: 'Imagen',
        size: 80,
        Cell: ({ row }) => <ImagesCell images={row.original.images} alt={row.original.name} />,
        enableColumnFilter: false
      },
      { accessorKey: 'name', header: 'Nombre' },
      { accessorKey: 'description', header: 'Descripción' },
      { accessorKey: 'categoryName', header: 'Categoría' },
      {
        accessorKey: 'price',
        header: 'Precio',
        filterVariant: 'range',
        Cell: ({ cell }) => `$${cell.getValue<number>().toFixed(2)}`
      },
      {
        accessorKey: 'discountPrice',
        header: 'Descuento',
        Cell: ({ cell }) => {
          const value = cell.getValue<number>()

          return value > 0 ? `$${value.toFixed(2)}` : 'N/A'
        }
      },
      {
        accessorKey: 'capacity',
        header: 'Capacidad',
        Cell: ({ cell }) => {
          const value = cell.getValue<number>()

          return getCapacityLabel(value)
        },
        filterVariant: 'select',
        filterSelectOptions: [
          { value: '1', text: 'Alta' },
          { value: '2', text: 'Media' },
          { value: '3', text: 'Baja' }
        ]
      },
      {
        accessorKey: 'numberOfRatings',
        header: 'Cantidad de calificaciones',
        Cell: ({ cell }) => cell.getValue<number>() || 0
      },
      {
        accessorKey: 'averageRating',
        header: 'Calificación promedio',
        Cell: ({ cell }) => {
          const value = cell.getValue<number>()

          return value > 0 ? `${value.toFixed(1)}` : 'Sin calificaciones'
        }
      },
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
        Cell: ({ row }: { row: MRT_Row<Product> }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip title='Editar'>
              <IconButton onClick={() => handleOpenUpdate(row.original)}>
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

      const response = await getMyProductsSearch(filters)

      if (!response || !Array.isArray(response.data)) throw new Error('La API no devolvió datos válidos')

      setData(response.data)
      setTotalCount(response.totalCount || 0)
    } catch (error) {
      console.error('Error al obtener productos:', error)
      toast.error('Error al cargar los productos')
      setData([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination, sorting, globalFilter])

  const handleOpenUpdate = (product: Product) => {
    setProductToUpdate(product)
    setUpdateModalOpen(true)
  }

  const handleOpenDelete = (row: MRT_Row<Product>) => {
    setProductToDelete(row.original)
    setConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteMyProduct(productToDelete.id)
        toast.success('Producto eliminado correctamente')
        setConfirmOpen(false)
        setProductToDelete(null)
        fetchData()
      } catch (error: any) {
        if (error.status === 409) {
          toast.error('No es posible eliminar el producto porque se encuentra en uno o más carritos de compra')
        } else {
          toast.error(error.message || 'Error al eliminar producto')
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
            Nuevo Producto
          </Button>
        )}
      />
      <CreateProductModal
        open={createModalOpen}
        handleClose={() => setCreateModalOpen(false)}
        onProductCreated={fetchData}
      />
      {productToUpdate && (
        <UpdateProductModal
          open={updateModalOpen}
          handleClose={() => setUpdateModalOpen(false)}
          product={productToUpdate}
          onProductUpdated={fetchData}
        />
      )}
      <ConfirmationDialog
        title='Eliminar producto'
        text='¿Está seguro que desea eliminar este producto?'
        open={confirmOpen}
        handleClose={() => setConfirmOpen(false)}
        handleAgree={handleConfirmDelete}
      />
    </>
  )
}

export default MyProductsTable
