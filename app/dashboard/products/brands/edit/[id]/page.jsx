"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
  Textarea,
  Link,
  Tooltip
} from "@nextui-org/react";
import { IconEdit, IconArrowLeft } from "@tabler/icons-react";
import { useState, useCallback, useEffect } from "react";
import api from "@/app/axios";
import { useRouter, useParams } from "next/navigation";

export default function EditBrandPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const isValidName = (name) => {
    return name.trim().length > 0;
  };

  useEffect(() => {
    const fetchBrand = async () => {
      setInitialLoading(true);
      setError(null);
      try {
        const response = await api.get(`/brands/${id}`);
        setName(response.data.name);
        setDescription(response.data.description || "");
      } catch (error) {
        console.error("Error al cargar la marca:", error);
        setError("Error al cargar la marca.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchBrand();
    } else {
      setError("ID de marca no proporcionado.");
      setInitialLoading(false);
    }
  }, [id]);

  const handleUpdateBrand = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Validaciones
    if (!name) {
      setError("Por favor, completa el campo de nombre.");
      setLoading(false);
      return;
    }

    if (!isValidName(name)) {
      setError("El nombre de la marca no puede estar vacío.");
      setLoading(false);
      return;
    }

    if (name.length > 30) {
      setError("El nombre de la marca no puede exceder los 30 caracteres.");
      setLoading(false);
      return;
    }

    if (description.length > 255) {
      setError("La descripción no puede exceder los 255 caracteres.");
      setLoading(false);
      return;
    }

    const brandData = {
      name: name.trim(),
      description: description.trim(),
    };

    try {
      await api.put(`/brands/${id}`, brandData);

      router.push("/dashboard/products/brands");
    } catch (error) {
      console.error("Error al actualizar la marca:", error);
      if (error.response && error.response.data) {
        const apiErrors = Object.values(error.response.data).flat();
        setError(apiErrors.join(" "));
      } else {
        setError("Error al actualizar la marca.");
      }
    } finally {
      setLoading(false);
    }
  }, [id, name, description, router]);

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
        <Link href="/dashboard/products/brands">
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Editar Marca - #{id}</p>
      </div>
      {error && <Code color="danger" className="text-wrap">{error}</Code>}

      <div className="space-y-4 mt-4">
        <Input
          label="Nombre"
          placeholder="Ingrese el nombre de la marca"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          variant="underlined"
          type="text"
          aria-label="Nombre de la Marca"
          isRequired
        />
        <Textarea
          label="Descripción"
          placeholder="Ingrese una descripción de la marca (Opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          variant="underlined"
          aria-label="Descripción de la Marca"
        />
      </div>

      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleUpdateBrand}
          isDisabled={loading}
          fullWidth
        >
          {loading ? <Spinner size="sm" /> : <><IconEdit className="h-4 mr-1" /> Actualizar Marca</>}
        </Button>
      </div>
    </div>
  );
}