'use client'

import React, { useState, useEffect, useMemo } from 'react'

import type {
  MRT_ColumnDef,
  MRT_PaginationState,
  MRT_SortingState,
  MRT_Row,
  MRT_ColumnFiltersState
} from 'material-react-table'
import { MaterialReactTable } from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'
import { Box, Button, IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import { toast } from 'react-toastify'

import { getShippingCostsSearch, deleteShippingCost } from '../../services/ShippingCostService'
import ConfirmationDialog from '../../components/ConfirmationDialog'
import CreateShippingCostModal from './CreateShippingCostModal'
import UpdateShippingCostModal from './UpdateShippingCostModal'

interface ShippingCost {
  id: number
  vehicleTypeId: number
  vehicleName: string
  municipalityId: number
  municipalityName: string
  cost: number
}

const ShippingCostsTable: React.FC = () => {
  const [data, setData] = useState<ShippingCost[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])

  // Estados para confirmación de eliminación
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [shippingCostToDelete, setShippingCostToDelete] = useState<ShippingCost | null>(null)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [shippingCostToUpdate, setShippingCostToUpdate] = useState<ShippingCost | null>(null)

  // Mapeo para la API: convierte el accessorKey de la tabla al nombre de propiedad esperado
  const columnMapping: { [key: string]: string } = {
    id: 'Id',
    vehicleName: 'VehicleName',
    municipalityName: 'MunicipalityName',
    cost: 'Cost'
  }

  const columns = useMemo<MRT_ColumnDef<ShippingCost>[]>(
    () => [
      {
        accessorKey: 'vehicleName',
        header: 'Tipo de Vehículo',
        enableEditing: false,
        filterVariant: 'text'
      },
      {
        accessorKey: 'municipalityName',
        header: 'Municipio',
        enableEditing: false,
        filterVariant: 'text'
      },
      {
        accessorKey: 'cost',
        header: 'Costo',
        enableEditing: false,
        Cell: ({ cell }) => `$${cell.getValue<number>().toFixed(2)}`,
        filterVariant: 'range',
        filterFn: 'betweenInclusive'
      },
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
      // Process column filters to match API requirements
      let costMin: number | undefined = undefined
      let costMax: number | undefined = undefined
      let ids: number[] | undefined = undefined
      const municipalitiesIds: number[] | undefined = undefined
      const vehicleTypesIds: number[] | undefined = undefined

      // Process column filters
      columnFilters.forEach(filter => {
        if (filter.id === 'cost') {
          // Handle range filter for cost
          const rangeValues = filter.value as [number?, number?]

          if (rangeValues[0] !== undefined) costMin = rangeValues[0]
          if (rangeValues[1] !== undefined) costMax = rangeValues[1]
        } else if (filter.id === 'id' && filter.value) {
          // Handle ID filtering
          ids = Array.isArray(filter.value) ? filter.value : [Number(filter.value)]
        } else if (filter.id === 'municipalityName' && filter.value) {
          // This is simplified - in reality, you might need a separate endpoint
          // to convert municipality names to IDs
          console.log('Filtering by municipality name is not directly supported')
        } else if (filter.id === 'vehicleName' && filter.value) {
          // This is simplified - in reality, you might need a separate endpoint
          // to convert vehicle type names to IDs
          console.log('Filtering by vehicle name is not directly supported')
        }
      })

      const filters: Record<string, any> = {
        SortBy: sorting.length > 0 ? columnMapping[sorting[0].id] || 'Cost' : undefined,
        IsDescending: sorting.length > 0 ? sorting[0].desc : undefined,
        Page: pagination.pageIndex + 1,
        PageSize: pagination.pageSize,
        Ids: ids || undefined,
        MunicipalitiesIds: municipalitiesIds || undefined,
        VehicleTypesIds: vehicleTypesIds || undefined,
        CostMin: costMin || undefined,
        CostMax: costMax || undefined
      }

      console.log('API request filters:', JSON.stringify(filters))

      const response = await getShippingCostsSearch(filters)

      if (!response || !Array.isArray(response.data)) {
        throw new Error('La API no devolvió datos válidos')
      }

      setData(response.data)
      setTotalCount(response.totalCount ?? 0)
    } catch (error) {
      console.error('Error al obtener costos de envío:', error)
      setData([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination, sorting, globalFilter, columnFilters])

  // Función para abrir confirmación al eliminar
  const handleOpenDelete = (row: MRT_Row<ShippingCost>) => {
    setShippingCostToDelete(row.original)
    setConfirmOpen(true)
  }

  // Función para abrir ventana de edición
  const handleOpenUpdate = (row: MRT_Row<ShippingCost>) => {
    setShippingCostToUpdate(row.original)
    setUpdateModalOpen(true)
  }

  // Función para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (shippingCostToDelete) {
      try {
        await deleteShippingCost(shippingCostToDelete.id)
        toast.success('Costo de envío eliminado correctamente')
        setConfirmOpen(false)
        setShippingCostToDelete(null)
        fetchData()
      } catch (error: any) {
        console.error('Error al eliminar costo de envío:', error)
        toast.error('Error al eliminar costo de envío')
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
          globalFilter,
          columnFilters
        }}
        manualPagination
        manualSorting
        manualFiltering
        enableGlobalFilter
        enableColumnFilters
        enableDensityToggle={false}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onGlobalFilterChange={setGlobalFilter}
        onColumnFiltersChange={setColumnFilters}
        rowCount={totalCount}
        renderTopToolbarCustomActions={() => (
          <Button variant='contained' onClick={() => setCreateModalOpen(true)}>
            Nuevo Costo de Envío
          </Button>
        )}
        localization={MRT_Localization_ES}
      />
      <CreateShippingCostModal
        open={createModalOpen}
        handleClose={() => setCreateModalOpen(false)}
        onShippingCostCreated={fetchData}
      />
      {shippingCostToUpdate && (
        <UpdateShippingCostModal
          open={updateModalOpen}
          handleClose={() => setUpdateModalOpen(false)}
          shippingCost={shippingCostToUpdate}
          onShippingCostUpdated={fetchData}
        />
      )}
      <ConfirmationDialog
        title='Eliminar costo de envío'
        text='¿Está seguro que desea eliminar este costo de envío?'
        open={confirmOpen}
        handleClose={() => setConfirmOpen(false)}
        handleAgree={handleConfirmDelete}
      />
    </>
  )
}

export default ShippingCostsTable
