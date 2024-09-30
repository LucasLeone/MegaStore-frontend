"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
  Autocomplete,
  AutocompleteItem,
  Link,
  Tooltip,
  Textarea
} from "@nextui-org/react";
import { IconPlus, IconArrowLeft } from "@tabler/icons-react";
import { useState, useCallback } from "react";
import api from "@/app/axios";
import { useRouter } from "next/navigation";
import useCategories from "@/app/hooks/useCategories";
import useSubcategories from "@/app/hooks/useSubcategories";
import useBrands from "@/app/hooks/useBrands";
import Cookies from "js-cookie";

export default function CreateProductPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [brand, setBrand] = useState(null);

  const { categories } = useCategories();
  const { subcategories } = useSubcategories();
  const { brands } = useBrands();

  const router = useRouter();

  const isValidPrice = (price) => {
    return /^\d+(\.\d{1,2})?$/.test(price) && parseFloat(price) > 0;
  };

  const handleCreateProduct = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!name || !price || !category || !subcategory || !brand) {
      setError("Por favor, completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    if (!isValidPrice(price)) {
      setError("El precio debe ser un número positivo con hasta dos decimales.");
      setLoading(false);
      return;
    }

    if (name.length < 2) {
      setError("El nombre del producto debe tener al menos 2 caracteres.");
      setLoading(false);
      return;
    }

    if (name.length > 32) {
      setError("El nombre del producto no puede tener más de 50 caracteres.");
      setLoading(false);
      return;
    }

    if (description.length > 128) {
      setError("La descripción del producto no puede tener más de 128 caracteres.");
      setLoading(false);
      return;
    }

    const productData = {
      name,
      description,
      price: parseFloat(price).toFixed(2),
      categoryId: category,
      subcategoryId: subcategory,
      brandId: brand,
    };

    const token = Cookies.get("access_token");

    try {
      await api.post("/products", productData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error al crear producto:", error);
      if (error.response && error.response.data) {
        const apiErrors = Object.values(error.response.data.message);
        setError(apiErrors);
      } else {
        setError("Error al crear el producto.");
      }
    } finally {
      setLoading(false);
    }
  }, [name, price, category, subcategory, brand, description, router]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      <div className="flex items-center mb-4 gap-1">
        <Link href="/dashboard/products">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Crear nuevo Producto</p>
      </div>
      {error && <Code color="danger" className="text-wrap">{error}</Code>}

      <div className="space-y-4 mt-4">
        <Input
          label="Nombre"
          placeholder="Ingrese el nombre del producto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          variant="underlined"
          aria-label="Nombre del Producto"
          isRequired
        />
        <Input
          label="Precio"
          placeholder="Ingrese el precio (Ej: 4500.00)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          fullWidth
          variant="underlined"
          type="number"
          step="0.01"
          min="0"
          aria-label="Precio"
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">$</span>
            </div>
          }
          isRequired
        />
        <Textarea
          label="Descripción"
          placeholder="Ingrese una descripción del producto (máximo 128 caracteres)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          variant="underlined"
          aria-label="Descripción del Producto"
        />
        <div className="flex flex-col md:flex-row md:gap-4">
          <div className="flex-1 space-y-2">
            <Autocomplete
              aria-label="Categoría del Producto"
              label="Categoría"
              placeholder="Seleccione una categoría"
              onSelectionChange={(value) => setCategory(value)}
              variant="underlined"
              isRequired
            >
              {categories.map((category) => (
                <AutocompleteItem key={category.id} value={category.id}>
                  {category.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>
          </div>
          <div className="flex-1 space-y-2">
            <Autocomplete
              aria-label="Subcategoría del Producto"
              label="Subcategoría"
              placeholder="Seleccione una Subcategoría"
              onSelectionChange={(value) => setSubcategory(value)}
              variant="underlined"
              isRequired
            >
              {subcategories.map((subcategory) => (
                <AutocompleteItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>
          </div>
          <div className="flex-1 space-y-2">
            <Autocomplete
              aria-label="Marca del Producto"
              label="Marca"
              placeholder="Seleccione una marca"
              onSelectionChange={(value) => setBrand(value)}
              variant="underlined"
              isRequired
            >
              {brands.map((brand) => (
                <AutocompleteItem key={brand.id} value={brand.id}>
                  {brand.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleCreateProduct}
          isDisabled={loading}
          fullWidth
        >
          {loading ? <Spinner size="sm" /> : <><IconPlus className="h-4" /> Crear Producto</>}
        </Button>
      </div>
    </div>
  );
}