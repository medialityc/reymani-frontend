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
import MonetizationOn from '@mui/icons-material/MonetizationOn'

import { toast } from 'react-toastify'

import { getVehicleTypesSearch, deleteVehicleType } from '../../services/VehicleTypeService'
import ConfirmationDialog from '../../components/ConfirmationDialog'
import CreateVehicleTypeModal from './CreateVehicleTypeModal'
import UpdateVehicleTypeModal from './UpdateVehicleTypeModal'
import ImagesCell from '../../components/ImagesCell'
import ShippingCostsDetailModal from './ShippingCostsDetailModal'

interface ShippingCost {
  id: number
  municipalityId: number
  municipalityName: string
  cost: number
}

interface VehicleType {
  id: number
  name: string
  logo: string
  totalCapacity: number
  isActive: boolean
  shippingCosts: ShippingCost[]
}

const VehiclesTypesTable: React.FC = () => {
  const [data, setData] = useState<VehicleType[]>([])
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
  const [vehicleTypeToDelete, setVehicleTypeToDelete] = useState<VehicleType | null>(null)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [vehicleTypeToUpdate, setVehicleTypeToUpdate] = useState<VehicleType | null>(null)

  const [shippingCostsModalOpen, setShippingCostsModalOpen] = useState(false)
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | null>(null)

  // Mapeo para la API: convierte el accessorKey de la tabla al nombre de propiedad esperado
  const columnMapping: { [key: string]: string } = {
    id: 'Id',
    name: 'Name',
    logo: 'Logo',
    totalCapacity: 'TotalCapacity',
    isActive: 'IsActive'
  }

  const columns = useMemo<MRT_ColumnDef<VehicleType>[]>(
    () => [
      {
        accessorKey: 'logo',
        header: 'Logo',
        size: 80,
        Cell: ({ row }) => {
          const images = row.original.logo ? [row.original.logo] : []

          return <ImagesCell images={images} alt={`${row.original.name}`} />
        },
        enableEditing: false,
        enableColumnFilter: false
      },
      {
        accessorKey: 'name',
        header: 'Nombre',
        muiEditTextFieldProps: { required: true },
        filterVariant: 'text' // Especificar que es un filtro de texto
      },
      {
        accessorKey: 'totalCapacity',
        header: 'Capacidad Total',
        muiEditTextFieldProps: { type: 'number', required: true },
        filterVariant: 'range', // Range filter for capacity
        filterFn: 'betweenInclusive'
      },
      {
        accessorKey: 'isActive',
        header: 'Activo',
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Sí' : 'No'),
        enableEditing: false,
        filterVariant: 'select',
        filterSelectOptions: [
          { text: 'Todos', value: '' },
          { text: 'Activos', value: 'true' },
          { text: 'Inactivos', value: 'false' }
        ]
      },
      {
        header: 'Acciones',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip title='Ver costos de envío'>
              <IconButton onClick={() => handleOpenShippingCosts(row)}>
                <MonetizationOn />
              </IconButton>
            </Tooltip>
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
      // Parse column filters to match API requirements
      let capacityMin: number | undefined = undefined
      let capacityMax: number | undefined = undefined
      let isActive: boolean | undefined = undefined
      let ids: number[] | undefined = undefined
      let names: string[] | undefined = undefined

      // Process column filters
      columnFilters.forEach(filter => {
        if (filter.id === 'totalCapacity') {
          // Handle range filter for capacity
          const rangeValues = filter.value as [number?, number?]

          if (rangeValues[0] !== undefined) capacityMin = rangeValues[0]
          if (rangeValues[1] !== undefined) capacityMax = rangeValues[1]
        } else if (filter.id === 'isActive') {
          // Convert string to boolean for isActive filter
          const value = filter.value as string

          if (value === 'true') isActive = true
          if (value === 'false') isActive = false
        } else if (filter.id === 'id' && filter.value) {
          // Handle ID filtering
          ids = Array.isArray(filter.value) ? filter.value : [Number(filter.value)]
        } else if (filter.id === 'name' && filter.value) {
          // Corregir el filtrado por nombre
          const nameValue = filter.value as string

          // La API espera un array de strings para Names
          names = [nameValue]
          console.log('Filtering by name:', nameValue, 'names array:', names)
        }
      })

      const filters: Record<string, any> = {
        Search: globalFilter || undefined,
        SortBy: sorting.length > 0 ? columnMapping[sorting[0].id] || 'Name' : undefined,
        IsDescending: sorting.length > 0 ? sorting[0].desc : undefined,
        Page: pagination.pageIndex + 1,
        PageSize: pagination.pageSize,
        Ids: ids || undefined,
        Names: names || undefined, // Asegurarse de que es 'Names' con N mayúscula
        CapacityMax: capacityMax || undefined,
        CapacityMin: capacityMin || undefined,
        IsActive: isActive
      }

      // Para debugging - ver qué se está enviando a la API
      console.log('API request filters:', JSON.stringify(filters))

      const response = await getVehicleTypesSearch(filters)

      if (!response || !Array.isArray(response.data)) {
        throw new Error('La API no devolvió datos válidos')
      }

      setData(response.data)
      setTotalCount(response.totalCount ?? 0)
    } catch (error) {
      console.error('Error al obtener tipos de vehículos:', error)
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
  const handleOpenDelete = (row: MRT_Row<VehicleType>) => {
    setVehicleTypeToDelete(row.original)
    setConfirmOpen(true)
  }

  // Función para abrir ventana de edición
  const handleOpenUpdate = (row: MRT_Row<VehicleType>) => {
    setVehicleTypeToUpdate(row.original)
    setUpdateModalOpen(true)
  }

  // Función para abrir modal de costos de envío
  const handleOpenShippingCosts = (row: MRT_Row<VehicleType>) => {
    setSelectedVehicleType(row.original)
    setShippingCostsModalOpen(true)
  }

  // Función para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (vehicleTypeToDelete) {
      try {
        await deleteVehicleType(vehicleTypeToDelete.id)
        toast.success('Tipo de vehículo eliminado correctamente')
        setConfirmOpen(false)
        setVehicleTypeToDelete(null)
        fetchData()
      } catch (error: any) {
        console.error('Error al eliminar tipo de vehículo:', error)

        // Improved error detection for 409 status
        if (error.status === 409 || error.response?.status === 409) {
          toast.error('No se puede eliminar el tipo de vehículo porque está en uso por uno o más vehículos')
        } else {
          toast.error('Error al eliminar tipo de vehículo')
        }
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
            Nuevo Tipo de Vehículo
          </Button>
        )}
        localization={MRT_Localization_ES}
      />
      <CreateVehicleTypeModal
        open={createModalOpen}
        handleClose={() => setCreateModalOpen(false)}
        onVehicleTypeCreated={fetchData}
      />
      {vehicleTypeToUpdate && (
        <UpdateVehicleTypeModal
          open={updateModalOpen}
          handleClose={() => setUpdateModalOpen(false)}
          vehicleType={vehicleTypeToUpdate}
          onVehicleTypeUpdated={fetchData}
        />
      )}
      <ConfirmationDialog
        title='Eliminar tipo de vehículo'
        text='¿Está seguro que desea eliminar este tipo de vehículo?'
        open={confirmOpen}
        handleClose={() => setConfirmOpen(false)}
        handleAgree={handleConfirmDelete}
      />
      {selectedVehicleType && (
        <ShippingCostsDetailModal
          open={shippingCostsModalOpen}
          handleClose={() => setShippingCostsModalOpen(false)}
          vehicleTypeName={selectedVehicleType.name}
          shippingCosts={selectedVehicleType.shippingCosts}
        />
      )}
    </>
  )
}

export default VehiclesTypesTable
