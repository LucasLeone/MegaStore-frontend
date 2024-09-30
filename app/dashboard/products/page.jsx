"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
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
  DropdownSection
} from "@nextui-org/react";
import {
  IconDownload,
  IconPlus,
  IconSearch,
  IconFilter,
  IconEdit,
  IconTrash,
  IconChevronDown
} from "@tabler/icons-react";
import { useState, useMemo, useCallback } from "react";
import useProducts from '@/app/hooks/useProducts';
import useVariants from '@/app/hooks/useVariants';
import useBrands from "@/app/hooks/useBrands";
import useCategories from "@/app/hooks/useCategories";
import useSubcategories from "@/app/hooks/useSubcategories";
import { useRouter } from "next/navigation";
import api from '@/app/axios';
import VariantsTable from "@/app/components/VariantsTable";
import Cookies from "js-cookie";

export default function ProductsList() {
  const { products, loading: productsLoading, error: productsError, fetchProducts } = useProducts();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { subcategories, loading: subcategoriesLoading, error: subcategoriesError } = useSubcategories();
  const { brands, loading: brandsLoading, error: brandsError } = useBrands();
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductName, setSelectedProductName] = useState("");
  const { variants, loading: variantsLoading, error: variantsError, fetchVariants } = useVariants(selectedProductId);

  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterSubcategory, setFilterSubcategory] = useState(null);
  const [filterBrand, setFilterBrand] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [isVariantsModalOpen, setIsVariantsModalOpen] = useState(false);

  const { isOpen: isVariantDeleteOpen, onOpen: onVariantDeleteOpen, onClose: onVariantDeleteClose } = useDisclosure();
  const [variantToDelete, setVariantToDelete] = useState(null);

  const loading = productsLoading || categoriesLoading || subcategoriesLoading || brandsLoading;
  const error = productsError || categoriesError || subcategoriesError || brandsError;

  const handleFilterCategory = useCallback((key) => {
    if (key === "none") {
      setFilterCategory(null);
    } else {
      setFilterCategory(parseInt(key, 10));
    }
    setPage(1);
  }, []);

  const handleFilterSubcategory = useCallback((key) => {
    if (key === "none") {
      setFilterSubcategory(null);
    } else {
      setFilterSubcategory(parseInt(key, 10));
    }
    setPage(1);
  }, []);

  const handleFilterBrand = useCallback((key) => {
    if (key === "none") {
      setFilterBrand(null);
    } else {
      setFilterBrand(parseInt(key, 10));
    }
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  const handleDeleteClick = useCallback((product) => {
    setProductToDelete(product);
    onOpen();
  }, [onOpen]);

  const handleDeleteProduct = useCallback(async () => {
    if (!productToDelete) return;

    const token = Cookies.get("access_token");
    try {
      await api.delete(`/products/${productToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      fetchProducts();
      onClose();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  }, [productToDelete, fetchProducts, onClose]);

  const handleViewClick = useCallback((product) => {
    setSelectedProductId(product.id);
    setSelectedProductName(product.name);
    setIsVariantsModalOpen(true);
  }, []);

  const handleDeleteVariantClick = useCallback((variant) => {
    setVariantToDelete(variant);
    onVariantDeleteOpen();
  }, [onVariantDeleteOpen]);

  const handleDeleteVariant = useCallback(async () => {
    if (!variantToDelete) return;

    const token = Cookies.get("access_token");
    try {
      await api.delete(`/variants/${variantToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      fetchVariants();
      onVariantDeleteClose();
    } catch (error) {
      console.error("Error al eliminar variante:", error);
    }
  }, [variantToDelete, fetchVariants, onVariantDeleteClose]);

  const handleEditVariantClick = useCallback((variant) => {
    router.push(`/dashboard/products/variants/${selectedProductId}/edit/${variant.id}`);
  }, [router, selectedProductId]);

  const columns = [
    { key: 'id', label: '#' },
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
    { key: 'price', label: 'Precio' },
    { key: 'category', label: 'Categoría' },
    { key: 'subcategory', label: 'SubCategoría' },
    { key: 'brand', label: 'Marca' },
    { key: 'actions', label: 'Acciones' },
  ];

  const processedProducts = useMemo(() => {
    return products.map(product => {
      const category = categories.find(cat => cat.id === product.categoryId);
      const subcategory = subcategories.find(sub => sub.id === product.subcategoryId);
      const brand = brands.find(br => br.id === product.brandId);
      return {
        ...product,
        category: category ? category.name : "Sin categoría",
        subcategory: subcategory ? subcategory.name : "Sin subcategoría",
        brand: brand ? brand.name : "Sin marca",
      };
    });
  }, [products, categories, subcategories, brands]);

  const filteredProducts = useMemo(() => {
    let filtered = [...processedProducts];

    if (filterCategory) {
      filtered = filtered.filter(product => product.categoryId === filterCategory);
    }

    if (filterSubcategory) {
      filtered = filtered.filter(product => product.subcategoryId === filterSubcategory);
    }

    if (filterBrand) {
      filtered = filtered.filter(product => product.brandId === filterBrand);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        (product.name && product.name.toLowerCase().includes(query)) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query)) ||
        (product.brand && product.brand.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [processedProducts, filterCategory, filterSubcategory, filterBrand, searchQuery]);

  const sortedProducts = useMemo(() => {
    return filteredProducts;
  }, [filteredProducts]);

  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const currentItems = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return sortedProducts.slice(startIdx, endIdx);
  }, [sortedProducts, page, rowsPerPage]);

  const handlePageChangeFunc = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const renderActions = useCallback((product) => (
    <div className="flex gap-1">
      <Tooltip content="Variantes">
        <Button
          variant="light"
          className="rounded-md"
          isIconOnly
          color="primary"
          onPress={() => handleViewClick(product)}
          aria-label={`Ver variantes de ${product.name}`}
        >
          <IconChevronDown className="h-5" />
        </Button>
      </Tooltip>
      <Tooltip content="Editar">
        <Button
          variant="light"
          className="rounded-md"
          isIconOnly
          color="warning"
          onPress={() => router.push(`/dashboard/products/edit/${product.id}`)}
          aria-label={`Editar producto ${product.name}`}
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
          onPress={() => handleDeleteClick(product)}
          aria-label={`Eliminar producto ${product.name}`}
        >
          <IconTrash className="h-5" />
        </Button>
      </Tooltip>
    </div>
  ), [handleDeleteClick, handleViewClick, router]);

  const rows = useMemo(() => (
    currentItems.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: `${parseFloat(product.price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      actions: renderActions(product),
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

      {/* Sección de Título y Botones */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Productos</p>
        <div className="flex flex-wrap gap-2">
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
          <Tooltip content="Listar Marcas">
            <Link href="/dashboard/products/brands">
              <Button className="rounded-md bg-black text-white">
                Marcas
              </Button>
            </Link>
          </Tooltip>
          <Tooltip content="Agregar nuevo producto">
            <Link href="/dashboard/products/create">
              <Button className="rounded-md bg-black text-white">
                <IconPlus className="h-4 mr-1" />
                Nuevo Producto
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Sección de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        <Input
          placeholder="Buscar productos"
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
          aria-label="Buscar productos"
          isClearable={true}
        />
        <div className="flex gap-2 flex-wrap">
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
                  ? `${categories.find(item => item.id === filterCategory)?.name || "Categoría"}`
                  : "Categoría"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Filtros de Categoría" onAction={handleFilterCategory}>
              <DropdownSection className="max-h-60 overflow-y-auto">
                {categories.map(item => (
                  <DropdownItem key={item.id} value={item.id}>
                    {item.name}
                  </DropdownItem>
                ))}
              </DropdownSection>
              <DropdownItem key="none" value="none" className="border-t-1 rounded-t-none">
                Quitar Filtro de Categoría
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* Filtro de SubCategoría */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                className={`rounded-md border-1.5 ${filterSubcategory ? 'bg-gray-200' : ''}`}
                aria-label="Filtros de SubCategoría"
              >
                <IconFilter className="h-4 mr-1" />
                {filterSubcategory
                  ? `${subcategories.find(item => item.id === filterSubcategory)?.name || "SubCategoría"}`
                  : "SubCategoría"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Filtros de SubCategoría" onAction={handleFilterSubcategory}>
              <DropdownSection className="max-h-60 overflow-y-auto">
                {subcategories.map(item => (
                  <DropdownItem key={item.id} value={item.id}>
                    {item.name}
                  </DropdownItem>
                ))}
              </DropdownSection>
              <DropdownItem key="none" value="none" className="border-t-1 rounded-t-none">
                Quitar Filtro de SubCategoría
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* Filtro de Marca */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                className={`rounded-md border-1.5 ${filterBrand ? 'bg-gray-200' : ''}`}
                aria-label="Filtros de Marca"
              >
                <IconFilter className="h-4 mr-1" />
                {filterBrand
                  ? `${brands.find(item => item.id === filterBrand)?.name || "Marca"}`
                  : "Marca"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Filtros de Marca" onAction={handleFilterBrand}>
              <DropdownSection className="max-h-60 overflow-y-auto">
                {brands.map(item => (
                  <DropdownItem key={item.id} value={item.id}>
                    {item.name}
                  </DropdownItem>
                ))}
              </DropdownSection>
              <DropdownItem key="none" value="none" className="border-t-1 rounded-t-none">
                Quitar Filtro de Marca
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Tabla de Productos */}
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
            No hay productos para mostrar.
          </div>
        ) : (
          <Table
            aria-label="Productos"
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

      {/* Paginación */}
      {!loading && !error && currentItems.length !== 0 && (
        <div className='flex flex-col sm:flex-row items-center justify-between mt-4'>
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Mostrando {currentItems.length} de {totalItems} productos
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

      {/* Modal para Confirmar Eliminación de Producto */}
      <Modal isOpen={isOpen} onOpenChange={onClose} aria-labelledby="modal-title" placement="top-center">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Confirmar Eliminación</ModalHeader>
              <ModalBody>
                <p>
                  ¿Estás seguro de que deseas eliminar el producto <strong>{productToDelete?.name}</strong>?
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
                  onPress={handleDeleteProduct}
                  disabled={false}
                >
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para Confirmar Eliminación de Variante */}
      <Modal isOpen={isVariantDeleteOpen} onOpenChange={onVariantDeleteClose} aria-labelledby="modal-title" placement="top-center">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Confirmar Eliminación de Variante</ModalHeader>
              <ModalBody>
                <p>
                  ¿Estás seguro de que deseas eliminar la variante de color <strong>{variantToDelete?.color}</strong> y talle <strong>{variantToDelete?.size}</strong>?
                  Esta acción no se puede deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onVariantDeleteClose}
                  disabled={false}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleDeleteVariant}
                  disabled={false}
                >
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para Mostrar Variantes */}
      <Modal
        isOpen={isVariantsModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProductId(null);
            setSelectedProductName("");
          }
          setIsVariantsModalOpen(open);
        }}
        aria-labelledby="variants-modal-title"
        placement="center"
        size="2xl"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex justify-between">
                <div className="content-center">
                  Variantes de <strong>{selectedProductName}</strong>
                </div>
                <div className="me-4">
                  <Tooltip content="Agregar una nueva variante">
                    <Link href={`/dashboard/products/variants/${selectedProductId}/create`}>
                      <Button className="rounded-md bg-black text-white">
                        <IconPlus className="h-4 mr-1" />
                        Nueva Variante
                      </Button>
                    </Link>
                  </Tooltip>
                </div>
              </ModalHeader>
              <ModalBody>
                {variantsLoading ? (
                  <div className="flex justify-center items-center p-6">
                    <Spinner size="lg" />
                  </div>
                ) : variantsError ? (
                  <div className="text-red-500 text-center p-6">
                    {variantsError}
                  </div>
                ) : (
                  <VariantsTable
                    variants={variants}
                    loading={variantsLoading}
                    error={variantsError}
                    productName={selectedProductName}
                    onDeleteVariant={handleDeleteVariantClick}
                    onEditVariant={handleEditVariantClick}
                  />
                )}
              </ModalBody>
              <ModalFooter className="me-4">
                <Button
                  onPress={() => setIsVariantsModalOpen(false)}
                  className="rounded-md bg-black text-white"
                >
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
