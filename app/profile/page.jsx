"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Button,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import Cookies from "js-cookie";
import api from "@/app/axios";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userError, setUserError] = useState(null);

  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5; // Puedes ajustar este valor según tus necesidades

  const token = Cookies.get("access_token");

  // Estados para el modal
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Primer useEffect para obtener el usuario
  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get("/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        setIsLoadingUser(false);
      } catch (error) {
        console.error("Error al obtener el usuario:", error);
        setUserError("No se pudo obtener la información del usuario.");
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [token, router]);

  // Segundo useEffect para obtener las órdenes una vez que el usuario está disponible
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.id) {
        return;
      }

      try {
        const response = await api.get(`/sales/${user.id}/my-sales`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data); // Cambiado de response.data.orders a response.data
        setIsLoadingOrders(false);
      } catch (error) {
        console.error("Error al obtener las órdenes:", error);
        setOrdersError("No se pudieron obtener las órdenes.");
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user, token]);

  // Calcular las órdenes a mostrar en la página actual
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Manejar el cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Función para abrir el modal con los detalles de la orden seleccionada
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    onOpen();
  };

  return (
    <div className="p-4 container mx-auto">
      {/* Modal para mostrar detalles de la orden */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Detalles de la Orden #{selectedOrder?.id}
              </ModalHeader>
              <ModalBody>
                {selectedOrder ? (
                  <>
                    <p>
                      <strong>Fecha:</strong>{" "}
                      {new Date(selectedOrder.saleDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Total:</strong> $
                      {selectedOrder.totalAmount.toLocaleString()}
                    </p>
                    <p>
                      <strong>Metodo de pago:</strong> {selectedOrder.paymentMethod}
                    </p>
                    <Divider className="my-2" />
                    <h3 className="text-lg font-semibold">Detalles de la Venta:</h3>
                    <Table aria-label="Detalles de la venta">
                      <TableHeader>
                        <TableColumn>Producto</TableColumn>
                        <TableColumn>Color</TableColumn>
                        <TableColumn>Tamaño</TableColumn>
                        <TableColumn>Cantidad</TableColumn>
                        <TableColumn>Precio Unitario</TableColumn>
                        <TableColumn>Subtotal</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.saleDetails.map((detail) => (
                          <TableRow key={detail.id}>
                            <TableCell>{detail.variant.product.name}</TableCell>
                            <TableCell>{detail.variant.color}</TableCell>
                            <TableCell>{detail.variant.size}</TableCell>
                            <TableCell>{detail.quantity}</TableCell>
                            <TableCell>
                              ${detail.unitPrice.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ${detail.subtotal.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                ) : (
                  <Spinner>Cargando detalles de la orden...</Spinner>
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

      {/* Tarjeta de Perfil */}
      <Card className="p-2">
        <CardHeader>
          <p className="text-xl font-semibold">Mi Perfil</p>
        </CardHeader>
        <Divider />
        <CardBody>
          {isLoadingUser ? (
            <div className="flex justify-center items-center">
              <Spinner>Cargando perfil...</Spinner>
            </div>
          ) : userError ? (
            <div className="text-center text-red-500">{userError}</div>
          ) : (
            <div className="space-y-2">
              <p>
                <strong>Nombre:</strong> {user.first_name} {user.last_name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Teléfono:</strong> {user.phone_number}
              </p>
              <p>
                <strong>Dirección:</strong>{" "}
                {`${user.address.street} ${user.address.number}${
                  user.address.floor ? `, Piso: ${user.address.floor}` : ""
                }${
                  user.address.apartment
                    ? `, Depto: ${user.address.apartment}`
                    : ""
                }, ${user.address.city}, ${user.address.postal_code}, ${user.address.country}`}
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Tarjeta de Órdenes */}
      <Card className="mt-6 p-2">
        <CardHeader>
          <p className="text-xl font-semibold">Mis Órdenes</p>
        </CardHeader>
        <Divider />
        <CardBody>
          {isLoadingOrders ? (
            <div className="flex justify-center items-center">
              <Spinner>Cargando órdenes...</Spinner>
            </div>
          ) : ordersError ? (
            <div className="text-center text-red-500">{ordersError}</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-500">No tienes órdenes.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table aria-label="Tabla de órdenes">
                  <TableHeader>
                    <TableColumn>ID de Orden</TableColumn>
                    <TableColumn>Fecha</TableColumn>
                    <TableColumn>Total</TableColumn>
                    <TableColumn>Acciones</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>
                          {new Date(order.saleDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          ${order.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            color="primary"
                            onPress={() => handleViewDetails(order)}
                          >
                            Ver Detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Paginación */}
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(orders.length / ordersPerPage)}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
