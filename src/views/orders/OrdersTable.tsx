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
import { Box, IconButton, Tooltip } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'

import { toast } from 'react-toastify'

import type { Order } from '../../services/OrderService'
import {
  getOrdersSearch,
  getOrderById,
  OrderStatus,
  PaymentMethod,
  getOrderStatusText,
  getPaymentMethodText,
  completeOrder,
  cancelOrder
} from '../../services/OrderService'
import OrderItemsModal from './OrderItemsModal'
import AssignCourierModal from './AssignCourierModal'
import ConfirmationDialog from '../../components/ConfirmationDialog'

const OrdersTable: React.FC = () => {
  const [data, setData] = useState<Order[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])

  // Estado para el modal de detalles de orden
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Estado para el modal de asignar mensajero
  const [assignCourierModalOpen, setAssignCourierModalOpen] = useState(false)
  const [orderIdToAssign, setOrderIdToAssign] = useState<number | null>(null)

  // Estados para los diálogos de confirmación
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [orderToAction, setOrderToAction] = useState<number | null>(null)

  // Mapeo para la API: convierte el accessorKey de la tabla al nombre de propiedad esperado
  const columnMapping: { [key: string]: string } = {
    id: 'Id',
    status: 'Status',
    paymentMethod: 'PaymentMethod',
    customerId: 'CustomerId',
    courierId: 'CourierId'
  }

  const columns = useMemo<MRT_ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'status',
        header: 'Estado',
        Cell: ({ row }) => getOrderStatusText(row.original.status),
        filterVariant: 'select',
        filterSelectOptions: [
          { text: 'En proceso', value: OrderStatus.InProcess.toString() },
          { text: 'En preparación', value: OrderStatus.InPreparation.toString() },
          { text: 'En recogida', value: OrderStatus.InPickup.toString() },
          { text: 'En camino', value: OrderStatus.OnTheWay.toString() },
          { text: 'Entregado', value: OrderStatus.Delivered.toString() },
          { text: 'Completado', value: OrderStatus.Completed.toString() },
          { text: 'Cancelado', value: OrderStatus.Cancelled.toString() }
        ]
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Método de Pago',
        Cell: ({ row }) => getPaymentMethodText(row.original.paymentMethod),
        filterVariant: 'select',
        filterSelectOptions: [
          { text: 'Transferencia', value: PaymentMethod.Transfer.toString() },
          { text: 'Efectivo', value: PaymentMethod.Cash.toString() }
        ]
      },
      {
        accessorKey: 'customerName',
        header: 'Nombre Cliente',
        Cell: ({ row }) => `${row.original.customer.firstName} ${row.original.customer.lastName}`,
        enableColumnFilter: false
      },
      {
        accessorKey: 'customerPhone',
        header: 'Número Cliente',
        Cell: ({ row }) => row.original.customer.phone,
        enableColumnFilter: false
      },
      {
        accessorKey: 'customerAddress',
        header: 'Dirección Cliente',
        Cell: ({ row }) => `${row.original.customerAddress.address}, ${row.original.customerAddress.municipalityName}`,
        enableColumnFilter: false
      },
      {
        accessorKey: 'courierName',
        header: 'Nombre Mensajero',
        Cell: ({ row }) =>
          row.original.courier ? `${row.original.courier.firstName} ${row.original.courier.lastName}` : 'No Asignado',
        enableColumnFilter: false
      },
      {
        accessorKey: 'courierPhone',
        header: 'Número Mensajero',
        Cell: ({ row }) => (row.original.courier ? row.original.courier.phone : 'N/A'),
        enableColumnFilter: false
      },
      {
        accessorKey: 'shippingCost',
        header: 'Costo de Envío',
        Cell: ({ row }) => `$${row.original.shippingCost.toFixed(2)}`,
        enableColumnFilter: false
      },
      {
        accessorKey: 'totalProductsCost',
        header: 'Costo Total Productos',
        Cell: ({ row }) => `$${row.original.totalProductsCost.toFixed(2)}`,
        enableColumnFilter: false
      },
      {
        header: 'Acciones',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip title='Ver detalles'>
              <IconButton onClick={() => handleOpenDetails(row)}>
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            {/* Solo mostrar el botón de asignar mensajero cuando el estado es "En proceso" */}
            {row.original.status === OrderStatus.InProcess && (
              <Tooltip title='Asignar mensajero'>
                <IconButton
                  onClick={() => handleOpenAssignCourier(row.original.id)}
                  color='primary'
                  disabled={actionLoading}
                >
                  <PersonAddIcon />
                </IconButton>
              </Tooltip>
            )}
            {/* Botón de completar orden (solo para órdenes en estado "Entregado") */}
            {row.original.status === OrderStatus.Delivered && (
              <Tooltip title='Completar orden'>
                <IconButton
                  onClick={() => handleCompleteOrder(row.original.id)}
                  color='success'
                  disabled={actionLoading}
                >
                  <CheckCircleIcon />
                </IconButton>
              </Tooltip>
            )}
            {/* Botón de cancelar orden (para todas las órdenes excepto completadas y canceladas) */}
            {row.original.status !== OrderStatus.Completed && row.original.status !== OrderStatus.Cancelled && (
              <Tooltip title='Cancelar orden'>
                <IconButton onClick={() => handleCancelOrder(row.original.id)} color='error' disabled={actionLoading}>
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )
      }
    ],
    [actionLoading]
  )

  // Función para obtener datos de la API
  const fetchData = async () => {
    setIsLoading(true)

    try {
      // Procesar filtros de la columna
      let statusValues: OrderStatus[] | undefined = undefined
      let paymentMethodValues: PaymentMethod[] | undefined = undefined
      let ids: number[] | undefined = undefined

      // Procesar filtros de columna
      columnFilters.forEach(filter => {
        if (filter.id === 'status' && filter.value !== undefined) {
          // Manejo del filtro de estados
          const statusValue = filter.value as string

          statusValues = [parseInt(statusValue, 10) as OrderStatus]
        } else if (filter.id === 'paymentMethod' && filter.value !== undefined) {
          // Manejo del filtro de método de pago
          const paymentValue = filter.value as string

          paymentMethodValues = [parseInt(paymentValue, 10) as PaymentMethod]
        } else if (filter.id === 'id' && filter.value) {
          // Manejo de filtrado por ID
          ids = Array.isArray(filter.value) ? filter.value : [Number(filter.value)]
        }
      })

      const filters: Record<string, any> = {
        Search: globalFilter || undefined,
        SortBy: sorting.length > 0 ? columnMapping[sorting[0].id] || 'Id' : undefined,
        IsDescending: sorting.length > 0 ? sorting[0].desc : undefined,
        Page: pagination.pageIndex + 1,
        PageSize: pagination.pageSize,
        Ids: ids || undefined,
        Status: statusValues || undefined,
        PaymentMethod: paymentMethodValues || undefined
      }

      // Para debugging - ver qué se está enviando a la API
      console.log('API request filters:', JSON.stringify(filters))

      const response = await getOrdersSearch(filters)

      if (!response || !Array.isArray(response.data)) {
        throw new Error('La API no devolvió datos válidos')
      }

      setData(response.data)
      setTotalCount(response.totalCount ?? 0)
    } catch (error) {
      console.error('Error al obtener órdenes:', error)
      toast.error('Error al cargar las órdenes')
      setData([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination, sorting, globalFilter, columnFilters])

  // Función para abrir modal de detalles
  const handleOpenDetails = async (row: MRT_Row<Order>) => {
    try {
      // Intentamos obtener los datos detallados de la orden
      const orderDetails = await getOrderById(row.original.id)

      if (orderDetails) {
        setSelectedOrder(orderDetails)
        setDetailsModalOpen(true)
      } else {
        toast.error('No se pudieron cargar los detalles de la orden')
      }
    } catch (error) {
      console.error('Error al obtener detalles de la orden:', error)
      toast.error('Error al cargar los detalles de la orden')
    }
  }

  // Función para abrir modal de asignar mensajero
  const handleOpenAssignCourier = (orderId: number) => {
    setOrderIdToAssign(orderId)
    setAssignCourierModalOpen(true)
  }

  // Función para manejar cuando se asigna un mensajero
  const handleCourierAssigned = () => {
    fetchData() // Recargar datos para mostrar el mensajero asignado
  }

  // Función para abrir confirmación para completar orden
  const handleCompleteOrder = (orderId: number) => {
    setOrderToAction(orderId)
    setCompleteConfirmOpen(true)
  }

  // Función para abrir confirmación para cancelar orden
  const handleCancelOrder = (orderId: number) => {
    setOrderToAction(orderId)
    setCancelConfirmOpen(true)
  }

  // Función para confirmar completar orden
  const handleConfirmComplete = async () => {
    if (!orderToAction) return

    setActionLoading(true)

    try {
      await completeOrder(orderToAction)
      toast.success('Orden marcada como completada correctamente')
      fetchData() // Recargar los datos
    } catch (error) {
      console.error('Error al completar la orden:', error)
      toast.error('Error al completar la orden')
    } finally {
      setActionLoading(false)
      setCompleteConfirmOpen(false)
      setOrderToAction(null)
    }
  }

  // Función para confirmar cancelar orden
  const handleConfirmCancel = async () => {
    if (!orderToAction) return

    setActionLoading(true)

    try {
      await cancelOrder(orderToAction)
      toast.success('Orden cancelada correctamente')
      fetchData() // Recargar los datos
    } catch (error) {
      console.error('Error al cancelar la orden:', error)
      toast.error('Error al cancelar la orden')
    } finally {
      setActionLoading(false)
      setCancelConfirmOpen(false)
      setOrderToAction(null)
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
        localization={MRT_Localization_ES}
      />
      {selectedOrder && (
        <OrderItemsModal open={detailsModalOpen} handleClose={() => setDetailsModalOpen(false)} order={selectedOrder} />
      )}
      {orderIdToAssign && (
        <AssignCourierModal
          open={assignCourierModalOpen}
          handleClose={() => setAssignCourierModalOpen(false)}
          orderId={orderIdToAssign}
          onCourierAssigned={handleCourierAssigned}
        />
      )}
      <ConfirmationDialog
        title='Completar orden'
        text='¿Está seguro que desea marcar esta orden como completada?'
        open={completeConfirmOpen}
        handleClose={() => {
          setCompleteConfirmOpen(false)
          setOrderToAction(null)
        }}
        handleAgree={handleConfirmComplete}
      />
      <ConfirmationDialog
        title='Cancelar orden'
        text='¿Está seguro que desea cancelar esta orden? Esta acción no se puede deshacer.'
        open={cancelConfirmOpen}
        handleClose={() => {
          setCancelConfirmOpen(false)
          setOrderToAction(null)
        }}
        handleAgree={handleConfirmCancel}
      />
    </>
  )
}

export default OrdersTable
