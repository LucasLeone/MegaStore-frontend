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
  Input,
  useDisclosure,
} from "@nextui-org/react";
import Cookies from "js-cookie";
import api from "@/app/axios";
import { IconPencil } from "@tabler/icons-react";

// Mapa de traducción de estados
const statusMap = {
  IN_PROCESS: "En Proceso",
  SENT: "Enviado",
  COMPLETED: "Completado",
  CANCELED: "Cancelado",
};

// Función para obtener el texto del estado en español
const getStatusText = (status) => {
  return statusMap[status] || status;
};

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

  // Estados para el modal de ver detalles de la orden
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Estados para el modal de edición de perfil
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Estados para el formulario de edición
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

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
        // Prellenar los campos del formulario de edición
        setFirstName(response.data.first_name);
        setLastName(response.data.last_name);
        setPhoneNumber(response.data.phone_number);
        setStreet(response.data.address.street);
        setNumber(response.data.address.number);
        setFloor(response.data.address.floor || "");
        setApartment(response.data.address.apartment || "");
        setCity(response.data.address.city);
        setPostalCode(response.data.address.postal_code);
        setCountry(response.data.address.country);
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

  // Función para manejar la actualización del perfil
  const handleUpdateProfile = async () => {
    setEditLoading(true);
    setEditError(null);

    // Preparar el cuerpo de la solicitud
    const updateData = {
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      address: {
        id: user.address.id, // Asegurarse de incluir el ID de la dirección existente
        street,
        number,
        floor: floor || null,
        apartment: apartment || null,
        city,
        postal_code: postalCode,
        country,
      },
    };

    try {
      const response = await api.put("/users/me", updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      // Actualizar el estado del usuario con los nuevos datos
      setUser(response.data);
      // Cerrar el modal de edición
      onEditOpenChange(false);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      setEditError("No se pudo actualizar el perfil. Por favor, intenta de nuevo.");
    } finally {
      setEditLoading(false);
    }
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
                      <strong>Total:</strong> ${selectedOrder.totalAmount.toLocaleString()}
                    </p>
                    <p>
                      <strong>Método de Pago:</strong> {selectedOrder.paymentMethod}
                    </p>
                    <p>
                      <strong>Estado:</strong> {getStatusText(selectedOrder.status)}
                    </p>
                    <p>
                      <strong>Nombre Completo:</strong> {selectedOrder.fullName}
                    </p>
                    <p>
                      <strong>Dirección de Envío:</strong>{" "}
                      {`${selectedOrder.address}, ${selectedOrder.city}, ${selectedOrder.state}, ${selectedOrder.postalCode}, ${selectedOrder.country}`}
                    </p>
                    <p>
                      <strong>Método de Envío:</strong> {selectedOrder.shippingMethod} - ${selectedOrder.shippingCost.toLocaleString()}
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
                            <TableCell>${detail.unitPrice.toLocaleString()}</TableCell>
                            <TableCell>${detail.subtotal.toLocaleString()}</TableCell>
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

      {/* Modal para editar el perfil */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-xl font-semibold">
                Editar Perfil
              </ModalHeader>
              <ModalBody>
                {editError && (
                  <div className="text-red-500 mb-2">{editError}</div>
                )}
                <div className="space-y-4">
                  {/* Nombre */}
                  <div className="flex flex-col">
                    <label className="font-medium">Nombre</label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Nombre"
                    />
                  </div>
                  {/* Apellido */}
                  <div className="flex flex-col">
                    <label className="font-medium">Apellido</label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Apellido"
                    />
                  </div>
                  {/* Teléfono */}
                  <div className="flex flex-col">
                    <label className="font-medium">Teléfono</label>
                    <Input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Teléfono"
                    />
                  </div>
                  {/* Dirección */}
                  <div className="flex space-x-4">
                    <div className="flex flex-col w-1/2">
                      <label className="font-medium">Calle</label>
                      <Input
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Calle"
                      />
                    </div>
                    <div className="flex flex-col w-1/2">
                      <label className="font-medium">Número</label>
                      <Input
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="Número"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex flex-col w-1/2">
                      <label className="font-medium">Piso</label>
                      <Input
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                        placeholder="Piso (opcional)"
                      />
                    </div>
                    <div className="flex flex-col w-1/2">
                      <label className="font-medium">Departamento</label>
                      <Input
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder="Departamento (opcional)"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium">Ciudad</label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ciudad"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex flex-col w-1/2">
                      <label className="font-medium">Código Postal</label>
                      <Input
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Código Postal"
                      />
                    </div>
                    <div className="flex flex-col w-1/2">
                      <label className="font-medium">País</label>
                      <Input
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="País"
                      />
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="secondary"
                  variant="light"
                  onPress={onClose}
                  disabled={editLoading}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleUpdateProfile}
                  disabled={editLoading}
                >
                  {editLoading ? <Spinner size="sm" /> : "Guardar Cambios"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Tarjeta de Perfil */}
      <Card className="p-2">
        <CardHeader className="flex justify-between">
          <p className="text-xl font-semibold">Mi Perfil</p>
          <Button color="primary" onPress={onEditOpen}>
            <IconPencil className="h-4 mr-1" />
            Editar
          </Button>
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
                {`${user.address.street} ${user.address.number}${user.address.floor ? `, Piso: ${user.address.floor}` : ""
                  }${user.address.apartment
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
                    <TableColumn>Método de Envio</TableColumn>
                    <TableColumn>Método de Pago</TableColumn>
                    <TableColumn>Estado</TableColumn>
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
                        <TableCell>{order.shippingMethod.charAt(0).toUpperCase() + order.shippingMethod.slice(1)} - ${order.shippingCost.toLocaleString()}</TableCell>
                        <TableCell>{order.paymentMethod}</TableCell>
                        <TableCell>{getStatusText(order.status)}</TableCell>
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
