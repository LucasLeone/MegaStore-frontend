// components/CategoriesList.js
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
} from "@nextui-org/react";
import {
  IconDownload,
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { useState, useMemo, useCallback } from "react";
import useCategories from '@/app/hooks/useCategories';
import { useRouter } from "next/navigation";
import api from '@/app/axios';

export default function CategoriesList() {
  const { categories, loading, error, fetchCategories } = useCategories();
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  const handleDeleteClick = useCallback((category) => {
    setCategoryToDelete(category);
    onOpen();
  }, [onOpen]);

  const handleDeleteCategory = useCallback(async () => {
    if (!categoryToDelete) return;

    try {
      await api.delete(`/categories/${categoryToDelete.id}`);
      fetchCategories();
      onClose();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  }, [categoryToDelete, fetchCategories, onClose]);

  const columns = [
    { key: 'id', label: '#', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'actions', label: 'Acciones', sortable: false },
  ];

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const query = searchQuery.toLowerCase().trim();
    return categories.filter(category =>
      category.name.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  const sortedCategories = useMemo(() => {
    return filteredCategories;
  }, [filteredCategories]);

  const totalItems = sortedCategories.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const currentItems = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return sortedCategories.slice(startIdx, endIdx);
  }, [sortedCategories, page, rowsPerPage]);

  const handlePageChangeFunc = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const renderActions = useCallback((category) => (
    <div className="flex gap-1">
      <Tooltip content="Editar">
        <Button
          variant="light"
          className="rounded-md"
          isIconOnly
          color="warning"
          onPress={() => router.push(`/dashboard/categories/edit/${category.id}`)}
          aria-label={`Editar categoría ${category.name}`}
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
          onPress={() => handleDeleteClick(category)}
          aria-label={`Eliminar categoría ${category.name}`}
        >
          <IconTrash className="h-5" />
        </Button>
      </Tooltip>
    </div>
  ), [handleDeleteClick, router]);

  const rows = useMemo(() => (
    currentItems.map(category => ({
      id: category.id,
      name: category.name,
      actions: renderActions(category),
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
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Categorías</p>
        <div className="flex flex-wrap gap-2">
          <Tooltip content="Exportar categorías">
            <Button variant="bordered" className="rounded-md border-1.5">
              <IconDownload className="h-4 mr-1" />
              Exportar
            </Button>
          </Tooltip>
          <Tooltip content="Listar Productos">
            <Link href="/dashboard/products">
              <Button className="rounded-md bg-black text-white">
                Productos
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
          <Tooltip content="Listar Marcas">
            <Link href="/dashboard/products/brands">
              <Button className="rounded-md bg-black text-white">
                Marcas
              </Button>
            </Link>
          </Tooltip>
          <Tooltip content="Agregar nueva categoría">
            <Link href="/dashboard/categories/create">
              <Button className="rounded-md bg-black text-white">
                <IconPlus className="h-4 mr-1" />
                Nueva Categoría
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        <Input
          placeholder="Buscar categorías"
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
          aria-label="Buscar categorías"
          isClearable={true}
        />
      </div>

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
            No hay categorías para mostrar.
          </div>
        ) : (
          <Table
            aria-label="Categorías"
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

      {!loading && !error && currentItems.length !== 0 && (
        <div className='flex flex-col sm:flex-row items-center justify-between mt-4'>
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {currentItems.length} de {totalItems} categorías
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

      <Modal isOpen={isOpen} onOpenChange={onClose} aria-labelledby="modal-title" placement="top-center">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Confirmar Eliminación</ModalHeader>
              <ModalBody>
                <p>
                  ¿Estás seguro de que deseas eliminar la categoría <strong>{categoryToDelete?.name}</strong>?
                  Esta acción no se puede deshacer.
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
                  onPress={handleDeleteCategory}
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
