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
  DropdownSection,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from "@nextui-org/react";
import {
  IconDownload,
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconFilter
} from "@tabler/icons-react";
import { useState, useMemo, useCallback } from "react";
import useSubcategories from '@/app/hooks/useSubcategories';
import useCategories from '@/app/hooks/useCategories';
import { useRouter } from "next/navigation";
import api from '@/app/axios';

export default function SubcategoriesList() {
  const { subcategories, loading, error, fetchSubcategories } = useSubcategories();
  const { categories, loading: loadingCategories, error: errorCategories } = useCategories();
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [subcategoryToDelete, setSubcategoryToDelete] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  const handleFilterCategoryChange = useCallback((key) => {
    if (key === "none") {
      setFilterCategory(null);
    } else {
      setFilterCategory(parseInt(key, 10));
    }
    setPage(1);
  }, []);

  const handleDeleteClick = useCallback((subcategory) => {
    setSubcategoryToDelete(subcategory);
    onOpen();
  }, [onOpen]);

  const handleDeleteSubcategory = useCallback(async () => {
    if (!subcategoryToDelete) return;

    try {
      await api.delete(`/subcategories/${subcategoryToDelete.id}`);
      fetchSubcategories();
      onClose();
    } catch (error) {
      console.error("Error al eliminar subcategoría:", error);
    }
  }, [subcategoryToDelete, fetchSubcategories, onClose]);

  const columns = [
    { key: 'id', label: '#', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'categoryName', label: 'Categoría', sortable: true },
    { key: 'description', label: 'Descripción', sortable: false },
    { key: 'actions', label: 'Acciones', sortable: false },
  ];

  const categoryMap = useMemo(() => {
    const map = {};
    (categories || []).forEach(cat => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  const filteredSubcategories = useMemo(() => {
    let filtered = [...(subcategories || [])];

    if (filterCategory) {
      filtered = filtered.filter(sub => sub.categoryId === filterCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(subcategory =>
        subcategory.name.toLowerCase().includes(query) ||
        (subcategory.categoryId && categoryMap[subcategory.categoryId]?.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [subcategories, filterCategory, searchQuery, categoryMap]);

  const sortedSubcategories = useMemo(() => {
    return filteredSubcategories;
  }, [filteredSubcategories]);

  const totalItems = sortedSubcategories.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const currentItems = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return sortedSubcategories.slice(startIdx, endIdx);
  }, [sortedSubcategories, page, rowsPerPage]);

  const handlePageChangeFunc = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const renderActions = useCallback((subcategory) => (
    <div className="flex gap-1">
      <Tooltip content="Editar">
        <Button
          variant="light"
          className="rounded-md"
          isIconOnly
          color="warning"
          onPress={() => router.push(`/dashboard/products/subcategories/edit/${subcategory.id}`)}
          aria-label={`Editar subcategoría ${subcategory.name}`}
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
          onPress={() => handleDeleteClick(subcategory)}
          aria-label={`Eliminar subcategoría ${subcategory.name}`}
        >
          <IconTrash className="h-5" />
        </Button>
      </Tooltip>
    </div>
  ), [handleDeleteClick, router]);

  const rows = useMemo(() => (
    currentItems.map(subcategory => ({
      id: subcategory.id,
      name: subcategory.name,
      categoryName: categoryMap[subcategory.categoryId] || "Sin categoría",
      description: subcategory.description,
      actions: renderActions(subcategory),
    }))
  ), [currentItems, categoryMap, renderActions]);

  const renderHeader = useCallback((column) => {
    return (
      <div className="flex items-center">
        <span>{column.label}</span>
      </div>
    );
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      {/* Header del listado de subcategorías */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">SubCategorías</p>
        <div className="flex flex-wrap gap-2">
          <Tooltip content="Listar Categorías">
            <Link href="/dashboard/products/categories">
              <Button className="rounded-md bg-black text-white">
                Categorías
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
          <Tooltip content="Listar Marcas">
            <Link href="/dashboard/products/brands">
              <Button className="rounded-md bg-black text-white">
                Marcas
              </Button>
            </Link>
          </Tooltip>
          <Tooltip content="Agregar nueva subcategoría">
            <Link href="/dashboard/products/subcategories/create">
              <Button className="rounded-md bg-black text-white">
                <IconPlus className="h-4 mr-1" />
                Nueva SubCategoría
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Barra de búsqueda y filtro de categoría */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        <Input
          placeholder="Buscar subcategorías"
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
          aria-label="Buscar subcategorías"
          isClearable={true}
        />
        <div className="flex space-x-4">
          {/* Filtro de Categoría */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                className={`rounded-md border-1.5 ${filterCategory ? 'bg-gray-200' : ''}`}
                aria-label="Filtros de Categoría"
              >
                <IconFilter className="h-4 mr-1" />
                {filterCategory
                  ? `${(categories || []).find(item => item.id === filterCategory)?.name || "Categoría"}`
                  : "Categoría"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Filtros de Categoría" onAction={handleFilterCategoryChange}>
              <DropdownSection className="max-h-60 overflow-y-auto">
                {(categories || []).map(item => (
                  <DropdownItem key={item.id} value={item.id}>
                    {item.name}
                  </DropdownItem>
                ))}
              </DropdownSection>
              <DropdownItem key="none-category" value="none" className="border-t-1 rounded-t-none">
                Quitar Filtro de Categoría
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Tabla de subcategorías */}
      <div className="overflow-x-auto border rounded-md">
        {loading || loadingCategories ? (
          <div className="flex justify-center items-center p-6">
            <Spinner size="lg" />
          </div>
        ) : error || errorCategories ? (
          <div className="text-red-500 text-center p-6">
            {error || errorCategories}
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center p-6">
            No hay subcategorías para mostrar.
          </div>
        ) : (
          <Table
            aria-label="SubCategorías"
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
            Mostrando {currentItems.length} de {totalItems} subcategorías
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
                  ¿Estás seguro de que deseas eliminar la subcategoría <strong>{subcategoryToDelete?.name}</strong>?
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
                  onPress={handleDeleteSubcategory}
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
