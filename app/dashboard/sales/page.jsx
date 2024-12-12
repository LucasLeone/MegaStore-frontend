"use client";

import { useState, useMemo, useCallback } from "react";
import useSales from "@/app/hooks/useSales";
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { IconDots } from "@tabler/icons-react";
import api from "@/app/axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

// Mapa de traducción de estados
const statusMap = {
  IN_PROCESS: "En Proceso",
  SENT: "Enviado",
  COMPLETED: "Completado",
  CANCELED: "Cancelado",
  // Agrega más estados si es necesario
};

// Función para obtener el texto del estado en español
const getStatusText = (status) => {
  return statusMap[status] || status; // Retorna el estado original si no está en el mapa
};

export default function SalesPage() {
  const { sales, loading, error, fetchSales: refetch } = useSales();
  const [currentPage, setCurrentPage] = useState(1);
  const salesPerPage = 5; // Puedes ajustar este valor según tus necesidades

  const [selectedSale, setSelectedSale] = useState(null);

  // Control del modal para ver detalles de la venta
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Calcular las ventas a mostrar en la página actual
  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = useMemo(() => sales.slice(indexOfFirstSale, indexOfLastSale), [sales, indexOfFirstSale, indexOfLastSale]);

  // Manejar el cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Función para abrir el modal con los detalles de la venta seleccionada
  const handleViewDetails = useCallback((sale) => {
    setSelectedSale(sale);
    onOpen();
  }, [onOpen]);

  const markAsSent = useCallback(async (saleId) => {
    try {
      await api.post(`/sales/${saleId}/sent`, null, {
        headers: {
          "Authorization": `Bearer ${Cookies.get("access_token")}`,
        }
      });
      refetch();
      toast.success("Venta marcada como enviada correctamente.");
    } catch (error) {
      console.error(`Error al marcar la venta ${saleId} como enviada:`, error);
    }
  }, [refetch]);

  // Función para marcar la venta como completada
  const markAsCompleted = useCallback(async (saleId) => {
    try {
      await api.post(`/sales/${saleId}/completed`, null, {
        headers: {
          "Authorization": `Bearer ${Cookies.get("access_token")}`,
        }
      });
      refetch();
      toast.success("Venta marcada como completada correctamente.");
    } catch (error) {
      console.error(`Error al marcar la venta ${saleId} como completada:`, error);
    }
  }, [refetch]);

  // Función para marcar la venta como cancelada
  const markAsCanceled = useCallback(async (saleId) => {
    try {
      await api.post(`/sales/${saleId}/canceled`, null, {
        headers: {
          "Authorization": `Bearer ${Cookies.get("access_token")}`,
        }
      });
      refetch();
      toast.success("Venta marcada como cancelada correctamente.");
    } catch (error) {
      console.error(`Error al marcar la venta ${saleId} como cancelada:`, error);
    }
  }, [refetch]);

  // Definir las columnas de la tabla
  const columns = [
    { key: 'id', label: '#' },
    { key: 'saleDate', label: 'Fecha' },
    { key: 'user', label: 'Usuario' },
    { key: 'paymentMethod', label: 'Método de Pago' },
    { key: 'totalAmount', label: 'Total' },
    { key: 'state', label: 'Estado' },
    { key: 'actions', label: 'Acciones' },
  ];

  // Procesar las ventas para la tabla con traducción de estados
  // Procesar las ventas para la tabla con traducción de estados y disabledKeys
  const rows = useMemo(
    () =>
      currentSales.map((sale) => {
        // Determinar qué acciones deben estar deshabilitadas
        const disabledKeys = [];
        if (sale.status !== "IN_PROCESS") disabledKeys.push("mark-sent");
        if (sale.status !== "SENT") disabledKeys.push("mark-completed");
        if (sale.status === "COMPLETED") disabledKeys.push("mark-canceled");
        if (sale.status === "CANCELED") disabledKeys.push("mark-canceled");

        return {
          id: sale.id,
          saleDate: new Date(sale.saleDate).toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          user: `${sale.user.first_name} ${sale.user.last_name}`,
          paymentMethod: sale.paymentMethod,
          totalAmount: `$${sale.totalAmount.toLocaleString("es-AR")}`,
          state: getStatusText(sale.status), // Traducción del estado
          actions: (
            <div className="flex gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="light" isIconOnly>
                    <IconDots className="h-5" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Opciones de la Venta"
                  disabledKeys={disabledKeys} // Pasar las claves deshabilitadas
                >
                  <DropdownItem
                    onPress={() => handleViewDetails(sale)}
                    aria-label={`Ver detalles de la venta ${sale.id}`}
                    key="view-details"
                  >
                    Ver Detalles
                  </DropdownItem>
                  <DropdownItem
                    key="mark-sent"
                    onPress={() => markAsSent(sale.id)}
                  >
                    Marcar como enviado
                  </DropdownItem>
                  <DropdownItem
                    key="mark-completed"
                    onPress={() => markAsCompleted(sale.id)}
                  >
                    Marcar como completado
                  </DropdownItem>
                  <DropdownItem
                    key="mark-canceled"
                    onPress={() => markAsCanceled(sale.id)}
                  >
                    Marcar como cancelado
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          ),
        };
      }),
    [currentSales, handleViewDetails, markAsSent, markAsCompleted, markAsCanceled]
  );


  // Renderizar el encabezado de la tabla
  const renderHeader = useCallback((column) => (
    <div className="flex items-center">
      <span>{column.label}</span>
    </div>
  ), []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">

      {/* Título de la Página */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Ventas</p>
        {/* Puedes agregar botones adicionales aquí si es necesario */}
      </div>

      {/* Tabla de Ventas */}
      <div className="overflow-x-auto border rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-6">
            <Spinner size="lg">Cargando...</Spinner>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-6">
            {error}
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center p-6">
            No hay ventas para mostrar.
          </div>
        ) : (
          <Table
            aria-label="Tabla de Ventas"
            className="min-w-full"
            shadow="none"
            isCompact
            removeWrapper
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key} className="bg-white text-bold border-b-1">
                  {renderHeader(column)}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={rows}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>
                      {item[columnKey]}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Paginación */}
      {!loading && !error && sales.length > salesPerPage && (
        <div className='flex justify-center mt-4'>
          <Pagination
            total={Math.ceil(sales.length / salesPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </div>
      )}

      {/* Modal para Mostrar Detalles de la Venta */}
      <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="text-xl font-semibold">
                Detalles de la Venta #{selectedSale?.id}
              </ModalHeader>
              <ModalBody>
                {selectedSale ? (
                  <div className="space-y-4">
                    <div>
                      <strong>Fecha: </strong>
                      {new Date(selectedSale.saleDate).toLocaleString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </div>
                    <div>
                      <strong>Usuario:</strong> {`${selectedSale.user.first_name} ${selectedSale.user.last_name}`}
                    </div>
                    <div>
                      <strong>Email:</strong> {selectedSale.user.email}
                    </div>
                    <div>
                      <strong>Teléfono:</strong> {selectedSale.user.phone_number}
                    </div>
                    <div>
                      <strong>Nombre completo:</strong> {selectedSale.fullName}
                    </div>
                    <div>
                      <strong>Dirección:</strong> {`${selectedSale.address}, ${selectedSale.city}, ${selectedSale.postalCode}, ${selectedSale.country}`}
                    </div>
                    <div>
                      <strong>Método de Pago:</strong> {selectedSale.paymentMethod}
                    </div>
                    <div>
                      <strong>Método de Envio:</strong> {selectedSale.shippingMethod}
                    </div>
                    <div>
                      <strong>Costo del Envio:</strong> ${selectedSale.shippingCost.toLocaleString('es-AR')}
                    </div>
                    <div>
                      <strong>Total:</strong> ${selectedSale.totalAmount.toLocaleString('es-AR')}
                    </div>
                    <div>
                      <strong>Estado:</strong> {getStatusText(selectedSale.status)}
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold">Detalles de la Venta:</h3>
                      <Table aria-label="Detalles de la venta" className="min-w-full" shadow="none" isCompact>
                        <TableHeader>
                          <TableColumn>Producto</TableColumn>
                          <TableColumn>Color</TableColumn>
                          <TableColumn>Tamaño</TableColumn>
                          <TableColumn>Cantidad</TableColumn>
                          <TableColumn>Precio Unitario</TableColumn>
                          <TableColumn>Subtotal</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {selectedSale.saleDetails.map(detail => (
                            <TableRow key={detail.id}>
                              <TableCell>{detail.variant.product.name}</TableCell>
                              <TableCell>{detail.variant.color}</TableCell>
                              <TableCell>{detail.variant.size}</TableCell>
                              <TableCell>{detail.quantity}</TableCell>
                              <TableCell>${detail.unitPrice.toLocaleString('es-AR')}</TableCell>
                              <TableCell>${detail.subtotal.toLocaleString('es-AR')}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <Spinner>Cargando detalles de la venta...</Spinner>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
