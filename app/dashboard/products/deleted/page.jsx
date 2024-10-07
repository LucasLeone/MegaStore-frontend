"use client";

import {
  Button,
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
  IconChevronDown,
  IconRefresh
} from "@tabler/icons-react";
import { useState, useMemo, useCallback } from "react";
import useProductsDeleted from '@/app/hooks/useProductsDeleted';
import useVariants from '@/app/hooks/useVariants';
import useBrands from "@/app/hooks/useBrands";
import useCategories from "@/app/hooks/useCategories";
import useSubcategories from "@/app/hooks/useSubcategories";
import { useRouter } from "next/navigation";
import api from '@/app/axios';
import VariantsTable from "@/app/components/VariantsTable";
import Cookies from "js-cookie";

export default function DeletedProductsList() {
  const { productsDeleted: products, loading: productsLoading, error: productsError, fetchProductsDeleted } = useProductsDeleted();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { subcategories, loading: subcategoriesLoading, error: subcategoriesError } = useSubcategories();
  const { brands, loading: brandsLoading, error: brandsError } = useBrands();
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductName, setSelectedProductName] = useState("");
  const { variants, loading: variantsLoading, error: variantsError, fetchVariants } = useVariants(selectedProductId);

  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const [productToRestore, setProductToRestore] = useState(null);

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [isVariantsModalOpen, setIsVariantsModalOpen] = useState(false);

  const { isOpen: isVariantDeleteOpen, onOpen: onVariantDeleteOpen, onClose: onVariantDeleteClose } = useDisclosure();
  const [variantToDelete, setVariantToDelete] = useState(null);

  const loading = productsLoading || categoriesLoading || subcategoriesLoading || brandsLoading;
  const error = productsError || categoriesError || subcategoriesError || brandsError;

  const handleRecoverClick = useCallback((product) => {
    setProductToRestore(product);
    onOpen();
  }, [onOpen]);

  const handleRestoreProduct = useCallback(async () => {
    if (!productToRestore) return;

    const token = Cookies.get("access_token");
    try {
      await api.post(`/products/${productToRestore.id}/restore`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      fetchProductsDeleted();
      onClose();
    } catch (error) {
      console.error("Error al recuperar producto:", error);
    }
  }, [productToRestore, fetchProductsDeleted, onClose]);

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

  const totalItems = processedProducts.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const currentItems = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    return processedProducts.slice(startIdx, endIdx);
  }, [processedProducts, page, rowsPerPage]);

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
      <Tooltip content="Recuperar Producto">
        <Button
          variant="light"
          className="rounded-md"
          isIconOnly
          color="success"
          onPress={() => handleRecoverClick(product)}
          aria-label={`Recuperar producto ${product.name}`}
        >
          <IconRefresh className="h-5" />
        </Button>
      </Tooltip>
    </div>
  ), [handleViewClick, handleRecoverClick]);

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

      {/* Sección de Título */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <p className="text-2xl font-bold mb-4 md:mb-0">Productos Eliminados</p>
        <div className="flex flex-wrap gap-2">
          <Tooltip content="Volver a Productos">
            <Link href="/dashboard/products">
              <Button className="rounded-md bg-black text-white">
                Volver a Productos
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Tabla de Productos Eliminados */}
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
            No hay productos eliminados para mostrar.
          </div>
        ) : (
          <Table
            aria-label="Productos Eliminados"
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
            Mostrando {currentItems.length} de {totalItems} productos eliminados
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

      {/* Modal para Confirmar Recuperación de Producto */}
      <Modal isOpen={isOpen} onOpenChange={onClose} aria-labelledby="modal-title" placement="top-center">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Confirmar Recuperación</ModalHeader>
              <ModalBody>
                <p>
                  ¿Estás seguro de que deseas recuperar el producto <strong>{productToRestore?.name}</strong>?
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
                  onPress={handleRestoreProduct}
                  disabled={false}
                >
                  Recuperar
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
