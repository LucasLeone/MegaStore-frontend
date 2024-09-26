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
import { IconPlus, IconArrowLeft } from "@tabler/icons-react";
import { useState, useCallback } from "react";
import api from "@/app/axios";
import { useRouter } from "next/navigation";
import useCategories from "@/app/hooks/useCategories";

export default function CreateSubcategoryPage() {
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);

  const router = useRouter();

  const isValidName = (name) => {
    return name.trim().length > 0;
  };

  const handleCreateSubcategory = useCallback(async () => {
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

    if (description.length > 128) {
      setError("La descripción no puede exceder los 128 caracteres.");
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
      categoryId: category,
    };

    try {
      await api.post("/subcategories", subcategoryData);

      router.push("/dashboard/products/subcategories");
    } catch (error) {
      console.error("Error al crear la subcategoría:", error);
      if (error.response && error.response.data) {
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al crear la categoría.");
      }
    } finally {
      setLoading(false);
    }
  }, [name, description, category, router]);

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
        <p className="text-2xl font-bold">Crear nueva Subcategoría</p>
      </div>
      {error && <Code color="danger" className="text-wrap">{error}</Code>}

      <div className="space-y-4 mt-4">
        <Input
          label="Nombre"
          placeholder="Ingrese el nombre de la categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          variant="underlined"
          type="text"
          aria-label="Nombre de la Categoría"
          isRequired
        />
        <Textarea
          label="Descripción"
          placeholder="Ingrese una descripción de la categoría (Opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          variant="underlined"
          aria-label="Descripción de la Categoría"
        />
        <Autocomplete
          label="Categoría"
          placeholder="Buscar categoría"
          value={category}
          onSelectionChange={(value) => setCategory(value)}
          variant="underlined"
          aria-label="Categoría"
          isRequired
        >
          {categories.map((category) => (
            <AutocompleteItem key={category.id} value={category.id}>
              {category.name}
            </AutocompleteItem>
          ))}
        </Autocomplete>
      </div>

      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleCreateSubcategory}
          isDisabled={loading}
          fullWidth
        >
          {loading ? <Spinner size="sm" /> : <><IconPlus className="h-4 mr-1" /> Crear Categoría</>}
        </Button>
      </div>
    </div>
  );
}