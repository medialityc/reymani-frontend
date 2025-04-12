'use client'

import React, { useState, useEffect, useMemo } from 'react'

import type { MRT_ColumnDef, MRT_PaginationState, MRT_SortingState, MRT_Row } from 'material-react-table'
import { MaterialReactTable } from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'
import { Box, Button, IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { toast } from 'react-toastify'

import { getVehiclesByCourierId, deleteVehicle } from '../../services/VehicleService'
import ConfirmationDialog from '../../components/ConfirmationDialog'
import CreateVehicleModal from './CreateVehicleModal'
import UpdateVehicleModal from './UpdateVehicleModal'
import ImagesCell from '../../components/ImagesCell'

interface Vehicle {
  id: number
  userId: number
  name: string
  picture: string
  description: string
  vehicleTypeId: number
  vehicleTypeName: string
  isAvailable: boolean | string
  isActive: boolean | string
}

interface VehiclesTableProps {
  courierId: number
  courierName?: string
}

const VehiclesTable: React.FC<VehiclesTableProps> = ({ courierId }) => {
  const [data, setData] = useState<Vehicle[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const [sorting, setSorting] = useState<MRT_SortingState>([])

  // Estados para confirmación de eliminación
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [vehicleToUpdate, setVehicleToUpdate] = useState<Vehicle | null>(null)

  const columns = useMemo<MRT_ColumnDef<Vehicle>[]>(
    () => [
      {
        accessorKey: 'picture',
        header: 'Imagen',
        size: 80,
        Cell: ({ row }) => {
          const images = row.original.picture ? [row.original.picture] : []

          return <ImagesCell images={images} alt={row.original.name} />
        },
        enableEditing: false
      },
      {
        accessorKey: 'name',
        header: 'Nombre',
        muiEditTextFieldProps: { required: true }
      },
      {
        accessorKey: 'description',
        header: 'Descripción',
        muiEditTextFieldProps: { multiline: true, rows: 2 }
      },
      {
        accessorKey: 'vehicleTypeName',
        header: 'Tipo de Vehículo',
        enableEditing: false
      },
      {
        accessorKey: 'isAvailable',
        header: 'Disponible',
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Sí' : 'No'),
        enableEditing: false
      },
      {
        accessorKey: 'isActive',
        header: 'Activo',
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Sí' : 'No'),
        enableEditing: false
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
    if (!courierId) return

    setIsLoading(true)

    try {
      const response = await getVehiclesByCourierId(courierId)

      if (!response || !Array.isArray(response.data)) {
        throw new Error('La API no devolvió datos válidos')
      }

      // Para depuración: imprime en la consola para verificar cómo vienen los datos
      console.log('Vehículos obtenidos:', response.data)

      setData(response.data)
      setTotalCount(response.totalCount ?? 0)
    } catch (error) {
      console.error('Error al obtener vehículos del mensajero:', error)
      setData([])
      setTotalCount(0)
      toast.error('Error al cargar la lista de vehículos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [courierId])

  // Nueva función para abrir confirmación al eliminar
  const handleOpenDelete = (row: MRT_Row<Vehicle>) => {
    setVehicleToDelete(row.original)
    setConfirmOpen(true)
  }

  // Función para abrir ventana de edición
  const handleOpenUpdate = (row: MRT_Row<Vehicle>) => {
    setVehicleToUpdate(row.original)
    setUpdateModalOpen(true)
  }

  // Función para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (vehicleToDelete) {
      try {
        await deleteVehicle(vehicleToDelete.id)
        toast.success('Vehículo eliminado correctamente')
        setConfirmOpen(false)
        setVehicleToDelete(null)
        fetchData()
      } catch (error) {
        console.error('Error al eliminar vehículo:', error)
        toast.error('Error al eliminar vehículo')
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
          sorting
        }}
        enableGlobalFilter
        enableDensityToggle={false}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        rowCount={totalCount}
        renderTopToolbarCustomActions={() => (
          <Button variant='contained' onClick={() => setCreateModalOpen(true)}>
            Nuevo Vehículo
          </Button>
        )}
        localization={MRT_Localization_ES}
      />
      {/* Modales para crear y actualizar vehículo */}
      <CreateVehicleModal
        open={createModalOpen}
        handleClose={() => setCreateModalOpen(false)}
        courierId={courierId}
        onVehicleCreated={fetchData}
      />
      {vehicleToUpdate && (
        <UpdateVehicleModal
          open={updateModalOpen}
          handleClose={() => setUpdateModalOpen(false)}
          vehicle={vehicleToUpdate}
          onVehicleUpdated={fetchData}
        />
      )}
      {/* Confirmación para eliminar vehículo */}
      <ConfirmationDialog
        title='Eliminar vehículo'
        text='¿Está seguro que desea eliminar este vehículo?'
        open={confirmOpen}
        handleClose={() => setConfirmOpen(false)}
        handleAgree={handleConfirmDelete}
      />
    </>
  )
}

export default VehiclesTable
