"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
  Textarea,
  Link,
  Tooltip,
  Autocomplete,
  AutocompleteItem
} from "@nextui-org/react";
import { IconEdit, IconArrowLeft } from "@tabler/icons-react";
import { useState, useCallback, useEffect } from "react";
import api from "@/app/axios";
import { useRouter, useParams } from "next/navigation";
import useCategories from "@/app/hooks/useCategories";
import Cookies from "js-cookie";
import useSubcategory from "@/app/hooks/useSubcategory";

export default function EditSubcategoryPage() {
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);

  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const { subcategory, loading: initialLoading, error: fetchError } = useSubcategory(id);

  useEffect(() => {
    if (subcategory) {
      setName(subcategory.name);
      setDescription(subcategory.description || "");
      setCategory(subcategory.categoryId);
    }
  }, [subcategory]);

  useEffect(() => {
    if (fetchError) {
      setError(fetchError);
    }
  }, [fetchError]);

  const isValidName = (name) => {
    return name.trim().length > 0;
  };

  const handleUpdateSubcategory = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!name) {
      setError("Por favor, completa el campo de nombre.");
      setLoading(false);
      return;
    }

    if (!isValidName(name)) {
      setError("El nombre no puede estar vacío.");
      setLoading(false);
      return;
    }

    if (name.length > 30) {
      setError("El nombre no puede exceder los 30 caracteres.");
      setLoading(false);
      return;
    }

    if (description.length > 255) {
      setError("La descripción no puede exceder los 255 caracteres.");
      setLoading(false);
      return;
    }

    if (!category) {
      setError("Por favor, selecciona una categoría.");
      setLoading(false);
      return;
    }

    const subcategoryData = {
      name: name.trim(),
      description: description.trim(),
      categoryId: category
    };

    const token = Cookies.get("access_token");

    try {
      await api.put(`/subcategories/${id}`, subcategoryData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      router.push("/dashboard/products/subcategories");
    } catch (error) {
      console.error("Error al actualizar la subcategoría:", error);
      if (error.response && error.response.data) {
        const apiErrors = Object.values(error.response.data.message);
        setError(apiErrors.join(", "));
      } else {
        setError("Error al actualizar la subcategoría.");
      }
    } finally {
      setLoading(false);
    }
  }, [id, name, description, category, router]);

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      <div className="flex items-center mb-4 gap-1">
        <Link href="/dashboard/products/subcategories">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Editar Subcategoría - #{id}</p>
      </div>
      {error && <Code color="danger" className="text-wrap">{error}</Code>}

      <div className="space-y-4 mt-4">
        <Input
          label="Nombre"
          placeholder="Ingrese el nombre de la subcategoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          variant="underlined"
          type="text"
          aria-label="Nombre de la Subcategoría"
          isRequired
        />
        <Textarea
          label="Descripción"
          placeholder="Ingrese una descripción de la subcategoría (Opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          variant="underlined"
          aria-label="Descripción de la Subcategoría"
        />
        <Autocomplete
          label="Categoría"
          placeholder="Buscar categoría"
          value={category}
          onSelectionChange={(value) => setCategory(value)}
          selectedKey={category ? category.toString() : null}
          variant="underlined"
          aria-label="Categoría"
          isRequired
        >
          {categories.map((categoryItem) => (
            <AutocompleteItem key={categoryItem.id} value={categoryItem.id}>
              {categoryItem.name}
            </AutocompleteItem>
          ))}
        </Autocomplete>
      </div>

      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleUpdateSubcategory}
          isDisabled={loading}
          fullWidth
        >
          {loading ? <Spinner size="sm" /> : <><IconEdit className="h-4 mr-1" /> Actualizar Subcategoría</>}
        </Button>
      </div>
    </div>
  );
}
