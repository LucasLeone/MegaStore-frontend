"use client";

import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Pagination,
  Spinner,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@nextui-org/react";
import {
  IconSearch,
  IconEdit,
  IconTrash,
  IconPlus,
  IconFilter,
  IconHome,
  IconPhone, // Asegúrate de importar el icono de teléfono
} from "@tabler/icons-react";
import { useState, useMemo, useCallback } from "react";
import useUsers from "@/app/hooks/useUsers";
import { useRouter } from "next/navigation";
import api from "@/app/axios";
import Cookies from "js-cookie";

export default function UsersList() {
  const { users, loading: usersLoading, error: usersError, fetchUsers } = useUsers();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);
  const [filterRole, setFilterRole] = useState(null);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const rowsPerPage = 10;

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  const handleDeleteClick = useCallback((user) => {
    setUserToDelete(user);
    onOpen();
  }, [onOpen]);

  const handleDeleteUser = useCallback(async () => {
    if (!userToDelete) return;

    const token = Cookies.get("access_token");
    try {
      await api.delete(`/users/${userToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
      onClose();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  }, [userToDelete, fetchUsers, onClose]);

  const handleFilterRole = useCallback((key) => {
    if (key === "none") {
      setFilterRole(null);
    } else {
      setFilterRole(key);
    }
    setPage(1);
  }, []);

  const columns = [
    { key: "id", label: "#" },
    { key: "firstName", label: "Nombre" },
    { key: "lastName", label: "Apellido" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Teléfono" }, // Nueva columna para Teléfono
    { key: "address", label: "Dirección" },    // Nueva columna para Dirección
    { key: "roles", label: "Rol" },
    { key: "actions", label: "Acciones" },
  ];

  const processedUsers = useMemo(() => {
    return users.map((user) => {
      const roleNames = user.roles.map((role) => {
        if (role.name === "USER") {
          return "Usuario";
        } else if (role.name === "ADMIN") {
          return "Admin";
        } else {
          return role.name;
        }
      });
      // Formatear la dirección
      const address = user.address
        ? `${user.address.street} ${user.address.number}${user.address.floor ? `, Piso ${user.address.floor}` : ""
        }${user.address.apartment ? `, Depto ${user.address.apartment}` : ""}, ${user.address.city}, ${user.address.postal_code}, ${user.address.country}`
        : "N/A";
      return {
        ...user,
        firstName: user.first_name,
        lastName: user.last_name,
        phoneNumber: user.phone_number,    // Mapeo del número de teléfono
        address: address,                  // Mapeo de la dirección formateada
        roles: roleNames.join(", "),
        roleList: roleNames,
      };
    });
  }, [users]);

  const filteredUsers = useMemo(() => {
    let filtered = [...processedUsers];

    if (filterRole) {
      filtered = filtered.filter((user) => user.roleList.includes(filterRole));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (user) =>
          (user.firstName && user.firstName.toLowerCase().includes(query)) ||
          (user.lastName && user.lastName.toLowerCase().includes(query)) ||
          (user.email && user.email.toLowerCase().includes(query)) ||
          (user.roles && user.roles.toLowerCase().includes(query)) ||
          (user.phoneNumber && user.phoneNumber.toLowerCase().includes(query)) ||
          (user.address && user.address.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [processedUsers, searchQuery, filterRole]);

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const currentItems = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return filteredUsers.slice(startIdx, endIdx);
  }, [filteredUsers, page, rowsPerPage]);

  const handlePageChangeFunc = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const renderActions = useCallback(
    (user) => (
      <div className="flex gap-1">
        <Tooltip content="Editar">
          <Button
            variant="light"
            className="rounded-md"
            isIconOnly
            color="warning"
            onPress={() => router.push(`/dashboard/users/edit/${user.id}`)}
            aria-label={`Editar usuario ${user.firstName} ${user.lastName}`}
          >
            <IconEdit className="h-5" />
          </Button>
        </Tooltip>
        <Tooltip content="Eliminar">
          <Button
            variant="light"
            className="rounded-md"
            isIconOnly
            color="danger"
            onPress={() => handleDeleteClick(user)}
            aria-label={`Eliminar usuario ${user.firstName} ${user.lastName}`}
          >
            <IconTrash className="h-5" />
          </Button>
        </Tooltip>
      </div>
    ),
    [handleDeleteClick, router]
  );

  const rows = useMemo(
    () =>
      currentItems.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber, // Nueva fila para Teléfono
        address: user.address,         // Nueva fila para Dirección
        roles: user.roles,
        actions: renderActions(user),
      })),
    [currentItems, renderActions]
  );

  const renderHeader = useCallback((column) => {
    return (
      <div className="flex items-center">
        <span>{column.label}</span>
      </div>
    );
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Usuarios</p>

        <div className="flex flex-wrap gap-2">
          <Tooltip content="Agregar nuevo usuario">
            <Link href="/dashboard/users/create">
              <Button className="rounded-md bg-black text-white">
                <IconPlus className="h-4 mr-1" />
                Nuevo Usuario
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <Input
          placeholder="Buscar usuarios"
          startContent={<IconSearch className="h-4" />}
          radius="none"
          variant="underlined"
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={() => {
            setSearchQuery("");
            setPage(1);
          }}
          className="w-full md:w-1/3"
          aria-label="Buscar usuarios"
          isClearable={true}
        />

        <div className="flex gap-2 flex-wrap">
          <Tooltip content="Ver eliminados">
            <Link href="/dashboard/products/categories/deleted">
              <Button className="rounded-md bg-black text-white">
                Eliminados
              </Button>
            </Link>
          </Tooltip>
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                className={`rounded-md border-1.5 ${filterRole ? "bg-gray-200" : ""}`}
                aria-label="Filtros de Rol"
              >
                <IconFilter className="h-4 mr-1" />
                {filterRole ? filterRole : "Rol"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Filtros de Rol" onAction={handleFilterRole}>
              <DropdownSection>
                <DropdownItem key="Usuario">Usuario</DropdownItem>
                <DropdownItem key="Admin">Admin</DropdownItem>
              </DropdownSection>
              <DropdownItem key="none" className="border-t-1 rounded-t-none">
                Quitar Filtro de Rol
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-md">
        {usersLoading ? (
          <div className="flex justify-center items-center p-6">
            <Spinner size="lg" />
          </div>
        ) : usersError ? (
          <div className="text-red-500 text-center p-6">{usersError}</div>
        ) : currentItems.length === 0 ? (
          <div className="text-center p-6">No hay usuarios para mostrar.</div>
        ) : (
          <Table
            aria-label="Usuarios"
            className="border-none min-w-full"
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
                  {(columnKey) => <TableCell>{item[columnKey]}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {!usersLoading && !usersError && currentItems.length !== 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {currentItems.length} de {totalItems} usuarios
          </p>
          <Pagination
            total={totalPages}
            initialPage={page}
            page={page}
            onChange={handlePageChangeFunc}
            size="sm"
            showShadow={true}
            color="primary"
          />
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        aria-labelledby="modal-title"
        placement="top-center"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Confirmar Eliminación</ModalHeader>
              <ModalBody>
                <p>
                  ¿Estás seguro de que deseas eliminar al usuario{" "}
                  <strong>
                    {userToDelete?.firstName} {userToDelete?.lastName}
                  </strong>
                  ? Esta acción no se puede deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose} disabled={false}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleDeleteUser} disabled={false}>
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
