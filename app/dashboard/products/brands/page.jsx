// components/BrandsList.js
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
  Link
} from "@nextui-org/react";
import {
  IconDownload,
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash
} from "@tabler/icons-react";
import { useState, useMemo, useCallback } from "react";
import useBrands from '@/app/hooks/useBrands'; // Hook que obtiene las marcas
import { useRouter } from "next/navigation";
import api from '@/app/axios';

export default function BrandsList() {
  const { brands, loading, error, fetchBrands } = useBrands();
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [brandToDelete, setBrandToDelete] = useState(null);

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  const handleDeleteClick = useCallback((brand) => {
    setBrandToDelete(brand);
    onOpen();
  }, [onOpen]);

  const handleDeleteBrand = useCallback(async () => {
    if (!brandToDelete) return;

    try {
      await api.delete(`/brands/${brandToDelete.id}/`);
      fetchBrands();
      onClose();
    } catch (error) {
      console.error("Error al eliminar marca:", error);
    }
  }, [brandToDelete, fetchBrands, onClose]);

  const columns = [
    { key: 'id', label: '#', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'description', label: 'Descripción', sortable: true },
    { key: 'actions', label: 'Acciones', sortable: false },
  ];

  const filteredBrands = useMemo(() => {
    let filtered = [...(brands || [])];

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(brand =>
        brand.name.toLowerCase().includes(query) ||
        (brand.description && brand.description.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [brands, searchQuery]);

  const totalItems = filteredBrands.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const currentItems = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return filteredBrands.slice(startIdx, endIdx);
  }, [filteredBrands, page, rowsPerPage]);

  const handlePageChangeFunc = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const renderActions = useCallback((brand) => (
    <div className="flex gap-1">
      <Tooltip content="Editar">
        <Button
          variant="light"
          className="rounded-md"
          isIconOnly
          color="warning"
          onPress={() => router.push(`/dashboard/brands/edit/${brand.id}`)}
          aria-label={`Editar marca ${brand.name}`}
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
          onPress={() => handleDeleteClick(brand)}
          aria-label={`Eliminar marca ${brand.name}`}
        >
          <IconTrash className="h-5" />
        </Button>
      </Tooltip>
    </div>
  ), [handleDeleteClick, router]);

  const rows = useMemo(() => (
    currentItems.map(brand => ({
      id: brand.id,
      name: brand.name,
      description: brand.description,
      actions: renderActions(brand),
    }))
  ), [currentItems, renderActions]);

  const renderHeader = useCallback((column) => {
    return (
      <div className="flex items-center">
        <span>{column.label}</span>
      </div>
    );
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      {/* Header del listado de marcas */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Marcas</p>
        <div className="flex flex-wrap gap-2">
          <Tooltip content="Exportar marcas">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconDownload className="h-4 mr-1" />
              Exportar
            </Button>
          </Tooltip>
          <Tooltip content="Listar Categorías">
            <Link href="/dashboard/products/categories">
              <Button className="rounded-md bg-black text-white">
                Categorías
              </Button>
            </Link>
          </Tooltip>
          <Tooltip content="Listar SubCategorías">
            <Link href="/dashboard/products/subcategories">
              <Button className="rounded-md bg-black text-white">
                SubCategorías
              </Button>
            </Link>
          </Tooltip>
          <Tooltip content="Listar Productos">
            <Link href="/dashboard/products">
              <Button className="rounded-md bg-black text-white">
                Productos
              </Button>
            </Link>
          </Tooltip>
          <Tooltip content="Agregar nueva marca">
            <Link href="/dashboard/brands/create">
              <Button className="rounded-md bg-black text-white">
                <IconPlus className="h-4 mr-1" />
                Nueva Marca
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        <Input
          placeholder="Buscar marcas"
          startContent={<IconSearch className="h-4" />}
          radius="none"
          variant="underlined"
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={() => {
            setSearchQuery('');
            setPage(1);
          }}
          className="w-full md:w-1/3"
          aria-label="Buscar marcas"
          isClearable={true}
        />
      </div>

      {/* Tabla de marcas */}
      <div className="overflow-x-auto border rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-6">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-6">
            {error}
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center p-6">
            No hay marcas para mostrar.
          </div>
        ) : (
          <Table
            aria-label="Marcas"
            className="border-none min-w-full"
            shadow="none"
            isCompact
            removeWrapper
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.key}
                  className="bg-white text-bold border-b-1"
                  isSortable={column.sortable}
                >
                  {renderHeader(column)}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={rows}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell className="min-w-[80px] sm:min-w-[100px]">
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
      {!loading && !error && currentItems.length !== 0 && (
        <div className='flex flex-col sm:flex-row items-center justify-between mt-4'>
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {currentItems.length} de {totalItems} marcas
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

      {/* Modal de Confirmación de Eliminación */}
      <Modal isOpen={isOpen} onOpenChange={onClose} aria-labelledby="modal-title" placement="top-center">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Confirmar Eliminación</ModalHeader>
              <ModalBody>
                <p>
                  ¿Estás seguro de que deseas eliminar la marca <strong>{brandToDelete?.name}</strong>? Esta acción no se puede deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  disabled={false}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleDeleteBrand}
                  disabled={false}
                >
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
