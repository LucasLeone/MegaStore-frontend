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
import { IconEdit, IconArrowLeft } from "@tabler/icons-react";
import { useState, useCallback, useEffect } from "react";
import api from "@/app/axios";
import { useRouter, useParams } from "next/navigation";
import useCategories from "@/app/hooks/useCategories";
import useSubcategories from "@/app/hooks/useSubcategories";
import useBrands from "@/app/hooks/useBrands";
import Cookies from "js-cookie";
import useProduct from "@/app/hooks/useProduct";

export default function UpdateProductPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [brand, setBrand] = useState(null);

  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { subcategories, loading: subcategoriesLoading, error: subcategoriesError } = useSubcategories(category);
  const { brands, loading: brandsLoading, error: brandsError } = useBrands();

  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const { product, loading: loadingProduct, error: errorProduct } = useProduct(productId);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || "");
      setPrice(product.price.toString());
      setCategory(product.category.id);
      setSubcategory(product.subcategory.id);
      setBrand(product.brand.id);
    }
  }, [product]);

  useEffect(() => {
    if (errorProduct) {
      setError(errorProduct);
    }
  }, [errorProduct]);

  useEffect(() => {
    setSubcategory(null);
  }, [category]);

  const isValidPrice = (price) => {
    return /^\d+(\.\d{1,2})?$/.test(price) && parseFloat(price) > 0;
  };

  const handleUpdateProduct = useCallback(async () => {
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
      setError("El nombre del producto no puede tener más de 32 caracteres.");
      setLoading(false);
      return;
    }

    if (description && description.length > 128) {
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
      await api.put(`/products/${productId}`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      router.push("/dashboard/products");
    } catch (err) {
      console.error("Error al actualizar producto:", err);
      if (err.response && err.response.data) {
        const apiErrors = Array.isArray(err.response.data.message)
          ? err.response.data.message.join(", ")
          : err.response.data.message;
        setError(apiErrors);
      } else {
        setError("Error al actualizar el producto.");
      }
    } finally {
      setLoading(false);
    }
  }, [name, price, category, subcategory, brand, description, router, productId]);

  if (loadingProduct || categoriesLoading || subcategoriesLoading || brandsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (categoriesError || subcategoriesError || brandsError) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-[92vw]">
        <Code color="danger" className="text-wrap">
          {categoriesError || subcategoriesError || brandsError}
        </Code>
      </div>
    );
  }

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
        <p className="text-2xl font-bold">Actualizar Producto</p>
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
          inputMode="decimal"
          pattern="\d+(\.\d{1,2})?"
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
          maxLength={128}
        />
        <div className="flex flex-col md:flex-row md:gap-4">
          <div className="flex-1 space-y-2">
            <Autocomplete
              aria-label="Categoría del Producto"
              label="Categoría"
              placeholder="Seleccione una categoría"
              onSelectionChange={(value) => setCategory(value)}
              variant="underlined"
              selectedKey={category ? category.toString() : ""}
              isRequired
              value={category}
              isClearable
            >
              {categories.map((cat) => (
                <AutocompleteItem key={cat.id} value={cat.id}>
                  {cat.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>
          </div>

          <div className="flex-1 space-y-2">
            <Autocomplete
              aria-label="Subcategoría del Producto"
              label="Subcategoría"
              placeholder={category ? "Seleccione una Subcategoría" : "Seleccione una categoría primero"}
              onSelectionChange={(value) => setSubcategory(value)}
              variant="underlined"
              selectedKey={subcategory ? subcategory.toString() : ""}
              isRequired
              isDisabled={!category}
              value={subcategory}
              isClearable
            >
              {subcategories.map((subcat) => (
                <AutocompleteItem key={subcat.id} value={subcat.id}>
                  {subcat.name}
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
              selectedKey={brand ? brand.toString() : ""}
              isRequired
              value={brand}
              isClearable
            >
              {brands.map((br) => (
                <AutocompleteItem key={br.id} value={br.id}>
                  {br.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleUpdateProduct}
          isDisabled={loading}
          fullWidth
        >
          {loading ? <Spinner size="sm" /> : <><IconEdit className="h-4" /> Actualizar Producto</>}
        </Button>
      </div>
    </div>
  );
}
