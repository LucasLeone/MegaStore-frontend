// pages/product/[id].js

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Button,
  Spinner,
  Select,
  SelectItem,
  Input,
  Skeleton,
} from "@nextui-org/react";
import useProduct from "@/app/hooks/useProduct";
import useVariants from "@/app/hooks/useVariants";
import api from "@/app/axios";
import Cookies from 'js-cookie';
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const router = useRouter();
  const productId = usePathname().split("/").pop();
  const { product, loading: isLoadingProduct, error: productError } = useProduct(productId);
  const { variants, loading: isLoadingVariants, error: variantsError } = useVariants(productId);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const handleVariantChange = (value) => {
    setSelectedVariantId(value);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!selectedVariantId) {
      alert("Por favor, selecciona una variante.");
      return;
    }

    const token = Cookies.get('access_token');
    try {
      await api.post(`/carts/items/${selectedVariantId}/quantity/${quantity}`, null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Producto agregado al carrito.");
      router.push("/cart");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Ocurrió un error al agregar el producto al carrito.");
    }
  };

  if (isLoadingProduct || isLoadingVariants) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner>Cargando...</Spinner>
      </div>
    );
  }

  if (productError || variantsError) {
    return (
      <div className="text-center text-red-500">
        {productError || variantsError}
      </div>
    );
  }

  const selectedVariant = variants.find(
    (variant) => variant.id === parseInt(selectedVariantId)
  );

  return (
    <div className="p-4 container mx-auto">
      <Card className="w-full p-4">
        <CardHeader className="flex flex-col items-start">
          <h1 className="text-2xl font-bold">{product?.name}</h1>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <Skeleton>
                <Image
                  alt={product?.name}
                  // src={product?.imageUrl || "/placeholder-image.png"}
                  width="100%"
                  height={400}
                  className="object-cover"
                />
              </Skeleton>
            </div>
            <div className="md:w-1/2 md:pl-8">
              <div className="text-2xl font-semibold mb-4">
                ${product?.price.toLocaleString()}
              </div>
              <div className="mb-2">
                <strong>Marca:</strong> {product?.brand.name}
              </div>
              <div className="mb-2">
                <strong>Categoría:</strong> {product?.category.name}
              </div>
              <div className="mb-4">
                <strong>Subcategoría:</strong> {product?.subcategory.name}
              </div>
              <div className="mb-4">
                <Select
                  label="Selecciona una variante"
                  placeholder="Elige una variante"
                  selectedKeys={selectedVariantId ? [selectedVariantId] : []}
                  onSelectionChange={(keys) => handleVariantChange(Array.from(keys)[0])}
                >
                  {variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id.toString()}>
                      {`#${variant.id} - Color: ${variant.color}, Talla: ${variant.size}, Stock: ${variant.stock}`}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              {selectedVariant && (
                <div className="mb-4">
                  <Input
                    label="Cantidad"
                    type="number"
                    min={1}
                    max={selectedVariant.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(selectedVariant.stock, Math.max(1, parseInt(e.target.value))))}
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Stock disponible: {selectedVariant.stock}
                  </div>
                </div>
              )}
              <Button
                color="primary"
                isDisabled={!selectedVariantId}
                onPress={handleAddToCart}
              >
                Agregar al Carrito
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
