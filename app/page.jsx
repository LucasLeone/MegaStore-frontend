"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Image,
  Input,
  Button,
  Skeleton,
  Spinner,
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  ModalFooter,
  useDisclosure,
  Autocomplete,
  AutocompleteItem
} from "@nextui-org/react";
import useProducts from "@/app/hooks/useProducts";
import useBrands from "@/app//hooks/useBrands";
import useCategories from "@/app//hooks/useCategories";
import useSubcategories from "@/app//hooks/useSubcategories";
import { IconFilter } from "@tabler/icons-react";

export default function Home() {
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(search);

  const { brands, isLoading: isLoadingBrands } = useBrands();
  const { categories, isLoading: isLoadingCategories } = useCategories();
  const { subcategories, isLoading: isLoadingSubcategories } = useSubcategories();

  const router = useRouter();

  const [selectedBrandTemp, setSelectedBrandTemp] = useState(null);
  const [selectedCategoryTemp, setSelectedCategoryTemp] = useState(null);
  const [selectedSubcategoryTemp, setSelectedSubcategoryTemp] = useState(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const appliedFilters = useMemo(() => {
    const newFilters = { ...filters };

    if (debouncedSearchQuery) {
      newFilters.search = debouncedSearchQuery;
    }

    return newFilters;
  }, [filters, debouncedSearchQuery]);

  const { products, loading: isLoadingProducts, error } = useProducts(appliedFilters);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const clearFilters = () => {
    setSelectedBrandTemp(null);
    setSelectedCategoryTemp(null);
    setSelectedSubcategoryTemp(null);
    setFilters({});
  }

  const applyFilters = () => {
    const newFilters = {};

    if (selectedBrandTemp) {
      newFilters.brandId = selectedBrandTemp;
    }

    if (selectedCategoryTemp) {
      newFilters.categoryId = selectedCategoryTemp;
    }

    if (selectedSubcategoryTemp) {
      newFilters.subcategoryId = selectedSubcategoryTemp;
    }

    console.log(newFilters);

    setFilters(newFilters);
    onOpenChange();
  };

  return (
    <div className="p-4 container mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
        <Input
          isClearable
          onClear={() => setSearch("")}
          variant="underlined"
          placeholder="Buscar producto"
          value={search}
          onChange={handleSearchChange}
          aria-label="Buscar producto"
          className="w-full md:w-1/2"
        />

        <Button
          variant="bordered"
          className="rounded-md border-1.5"
          aria-label="Abrir filtros"
          onPress={onOpen}
        >
          <IconFilter className="w-4" />
          Filtros
        </Button>
      </div>

      {/* Lista de Productos */}
      <div>
        {isLoadingProducts ? (
          <div className="flex justify-center items-center">
            <Spinner>Cargando...</Spinner>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500">No se encontraron productos.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="h-full">
                <CardHeader className="flex justify-between items-center">
                  <div className="font-bold text-lg">{product.name}</div>
                  <div className="text-gray-700">${product.price.toLocaleString()}</div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <Skeleton>
                    <Image
                      alt={product.name}
                      width="100%"
                      height={200}
                    />
                  </Skeleton>
                </CardBody>
                <Divider />
                <CardFooter>
                  <div className="flex flex-col space-y-1">
                    <div className="text-sm text-primary">
                      <strong>Marca:</strong> {product.brand.name}
                    </div>
                    <div className="text-sm text-primary">
                      <strong>Categoría:</strong> {product.category.name}
                    </div>
                    <div className="text-sm text-primary">
                      <strong>Subcategoría:</strong> {product.subcategory.name}
                    </div>
                    <Button
                      auto
                      flat
                      color="secondary"
                      size="sm"
                      onPress={() => router.push(`/products/${product.id}`)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Filtros */}
      <Modal isOpen={isOpen} onClose={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Filtros</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-2">
                  {/* Autocomplete de Marca */}
                  <Autocomplete
                    label="Marca"
                    placeholder="Todas las marcas"
                    aria-label="Marca"
                    value={selectedBrandTemp}
                    onSelectionChange={(value) => setSelectedBrandTemp(value)}
                    onClear={() => setSelectedBrandTemp(null)}
                    isLoading={isLoadingBrands}
                    isClearable
                    selectedKey={selectedBrandTemp}
                  >
                    {brands.map((brand) => (
                      <AutocompleteItem key={brand.id} value={brand.name}>
                        {brand.name}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>

                  {/* Autocomplete de Categoría */}
                  <Autocomplete
                    label="Categoría"
                    placeholder="Todas las categorías"
                    aria-label="Categoría"
                    value={selectedCategoryTemp}
                    onSelectionChange={(value) => setSelectedCategoryTemp(value)}
                    onClear={() => setSelectedCategoryTemp(null)}
                    isLoading={isLoadingCategories}
                    isClearable
                    selectedKey={selectedCategoryTemp}
                  >
                    {categories.map((category) => (
                      <AutocompleteItem key={category.id} value={category.name}>
                        {category.name}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>

                  {/* Autocomplete de Subcategoría */}
                  <Autocomplete
                    label="Subcategoría"
                    placeholder="Todas las subcategorías"
                    aria-label="Subcategoría"
                    value={selectedSubcategoryTemp}
                    onSelectionChange={(value) => setSelectedSubcategoryTemp(value)}
                    onClear={() => setSelectedSubcategoryTemp(null)}
                    isLoading={isLoadingSubcategories}
                    isClearable
                    selectedKey={selectedSubcategoryTemp}
                  >
                    {subcategories.map((subcategory) => (
                      <AutocompleteItem key={subcategory.id} value={subcategory.name}>
                        {subcategory.name}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button color="warning" onPress={clearFilters}>
                  Limpiar filtros
                </Button>
                <Button color="primary" onPress={applyFilters}>
                  Aplicar filtros
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
