"use client";

import {
  Button,
  Input,
  Spinner,
  Code,
  Tooltip,
} from "@nextui-org/react";
import { IconPlus, IconArrowLeft, IconX } from "@tabler/icons-react"; // Importa IconX
import { useState, useCallback } from "react";
import api from "@/app/axios";
import { useRouter, useParams } from "next/navigation";
import useProduct from "@/app/hooks/useProduct";
import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";

export default function CreateVariantPage() {
  const router = useRouter();
  const params = useParams();
  const { productId } = params;

  const { product, loading: productLoading, error: productError } = useProduct(productId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const isValidStock = (stock) => {
    const num = Number(stock);
    return Number.isInteger(num) && num >= 0;
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleCreateVariant = useCallback(async () => {
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
      productId: Number(productId),
      color,
      size,
      stock: parseInt(stock, 10),
      image: null,
    };

    const token = Cookies.get("access_token");

    try {
      // if (image) {
      //   variantData.image = image; LUEGO SE VA A AGREGAR
      // }

      await api.post("/variants", variantData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      router.push(`/dashboard/products/`);
    } catch (error) {
      console.error("Error al crear variante:", error);
      if (error.response && error.response.data) {
        const apiErrors = Object.values(error.response.data.message);
        setError(apiErrors);
      } else {
        setError("Error al crear la variante.");
      }
    } finally {
      setLoading(false);
    }
  }, [productId, color, size, stock, router]);

  if (productLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (productError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Code color="danger">Error al cargar los detalles del producto: {productError}</Code>
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
        <p className="text-2xl font-bold">Crear nueva Variante para {product ? product.name : ""}</p>
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
                // size="xs"
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
          onPress={handleCreateVariant}
          isDisabled={loading}
          fullWidth
        >
          {loading ? <Spinner size="sm" /> : <><IconPlus className="h-4" /> Crear Variante</>}
        </Button>
      </div>
    </div>
  );
}
