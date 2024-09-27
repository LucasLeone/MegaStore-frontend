"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
  Tooltip,
} from "@nextui-org/react";
import { IconArrowLeft, IconX, IconEdit } from "@tabler/icons-react";
import { useState, useCallback, useEffect } from "react";
import api from "@/app/axios";
import { useRouter, useParams } from "next/navigation";
import useVariant from "@/app/hooks/useVariant";
import useProduct from "@/app/hooks/useProduct";
import Link from "next/link";
import Image from "next/image";

export default function EditVariantPage() {
  const router = useRouter();
  const params = useParams();
  const { variantId } = params;
  const { productId } = params;

  const { product, loading: productLoading, error: productError } = useProduct(productId);

  const { variant, loading: variantLoading, error: variantError } = useVariant(variantId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (variant) {
      setColor(variant.color);
      setSize(variant.size);
      setStock(variant.stock.toString());
      if (variant.imageUrl) {
        setImagePreview(variant.imageUrl);
      }
    }
  }, [variant]);

  const isValidStock = (stock) => {
    const num = Number(stock);
    return Number.isInteger(num) && num >= 0;
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleUpdateVariant = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!color || !size || stock === "") {
      setError("Por favor, completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    if (!isValidStock(stock)) {
      setError("El stock debe ser un número entero no negativo.");
      setLoading(false);
      return;
    }

    const variantData = {
      color,
      size,
      stock: parseInt(stock, 10),
    };

    try {
      // Manejo de la imagen si se ha cambiado
      if (image) {
        const formData = new FormData();
        formData.append("color", color);
        formData.append("size", size);
        formData.append("stock", stock);
        formData.append("image", image);

        await api.put(`/variants/${variantId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.put(`/variants/${variantId}`, variantData);
      }

      router.push(`/dashboard/products/`); // O donde desees redirigir
    } catch (error) {
      console.error("Error al actualizar la variante:", error);
      if (error.response && error.response.data) {
        const apiErrors = Object.values(error.response.data.message);
        setError(apiErrors.join(", "));
      } else {
        setError("Error al actualizar la variante.");
      }
    } finally {
      setLoading(false);
    }
  }, [variantId, color, size, stock, image, router]);

  if (variantLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (variantError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Code color="danger">Error al cargar los detalles de la variante: {variantError}</Code>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[92vw]">
      <div className="flex items-center mb-4 gap-1">
        <Link href={`/dashboard/products`}>
          <Tooltip content="Volver" placement="bottom">
            <Button variant="light" size="sm" isIconOnly>
              <IconArrowLeft className="h-4" />
            </Button>
          </Tooltip>
        </Link>
        <p className="text-2xl font-bold">Editar Variante para {product ? product.name : ""}</p>
      </div>
      {error && <Code color="danger" className="text-wrap">{error}</Code>}

      <div className="space-y-4 mt-4">
        <Input
          label="Color"
          placeholder="Ingrese el color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          fullWidth
          variant="underlined"
          aria-label="Color de la Variante"
          isRequired
        />
        <Input
          label="Talla"
          placeholder="Ingrese la talla (Ej: S, M, L, XL)"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          fullWidth
          variant="underlined"
          aria-label="Talla de la Variante"
          isRequired
        />
        <Input
          label="Stock"
          placeholder="Ingrese el stock disponible"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          fullWidth
          variant="underlined"
          type="number"
          min="0"
          aria-label="Stock de la Variante"
          isRequired
        />
        <div className="">
          <label className="text-xs ps-1 text-gray-600">Imagen (Opcional)</label>
          <Input
            type="file"
            fullWidth
            variant="underlined"
            aria-label="Imagen de la Variante"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
                setImage(file);
                setImagePreview(URL.createObjectURL(file));
              }
            }}
          />
          {imagePreview && (
            <div className="mt-2 relative inline-block">
              <Image
                src={imagePreview}
                alt="Previsualización de la Imagen"
                className="object-cover rounded"
                width={128}
                height={128}
              />
              <Button
                color="error"
                className="p-0 m-0 absolute top-0 right-0"
                onPress={handleRemoveImage}
                aria-label="Eliminar imagen"
                variant="light"
                isIconOnly
              >
                <IconX size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="rounded-md bg-black text-white"
          onPress={handleUpdateVariant}
          isDisabled={loading}
          fullWidth
        >
          {loading ? <Spinner size="sm" /> : <><IconEdit className="h-4 mr-1" /> Actualizar Variante</>}
        </Button>
      </div>
    </div>
  );
}
