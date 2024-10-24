// pages/cart.js (o donde esté tu componente CartPage)
"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
} from '@nextui-org/react';
import { IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import QuantitySelector from '../components/QuantitySelector';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const router = useRouter();

  const fetchCart = useCallback(() => {
    setLoading(true);
    const token = Cookies.get('access_token');

    api.get('/carts/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        setCart(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error al obtener el carrito:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleDelete = useCallback((variantId) => {
    const token = Cookies.get('access_token');
    api.delete(`/carts/items/${variantId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(() => {
        fetchCart();
      })
      .catch(error => {
        console.error('Error al eliminar el ítem:', error);
      });
  }, [fetchCart]);

  const handleQuantityChange = useCallback((variantId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItemId(variantId);
    const token = Cookies.get('access_token');
    api.put(`/carts/items/${variantId}/quantity/${newQuantity}`, null, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(() => {
        fetchCart();
        setUpdatingItemId(null);
      })
      .catch(error => {
        console.error('Error al actualizar la cantidad:', error);
        setUpdatingItemId(null);
      });
  }, [fetchCart]);

  const columns = useMemo(() => [
    { key: 'product', label: 'Producto' },
    { key: 'price', label: 'Precio' },
    { key: 'quantity', label: 'Cantidad' },
    { key: 'subtotal', label: 'Subtotal' },
    { key: 'actions', label: 'Acciones' },
  ], []);

  const rows = useMemo(() => (
    cart ? cart.cartItems.map(item => ({
      product: item.variant.product.name,
      price: parseFloat(item.productPrice).toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
      quantity: (
        <QuantitySelector
          quantity={item.quantity}
          onDecrement={() => handleQuantityChange(item.variant.id, item.quantity - 1)}
          onIncrement={() => handleQuantityChange(item.variant.id, item.quantity + 1)}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value)) {
              handleQuantityChange(item.variant.id, value);
            }
          }}
          disabled={updatingItemId === item.variant.id}
        />
      ),
      subtotal: parseFloat(item.subtotal).toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
      actions: (
        <Button
          onClick={() => handleDelete(item.variant.id)}
          isIconOnly
          variant='light'
          color='danger'
        >
          <IconTrash className='w-5' />
        </Button>
      ),
    })) : []
  ), [cart, handleDelete, handleQuantityChange, updatingItemId]);

  const total = useMemo(() => {
    if (!cart || !cart.cartItems) return 0;
    return cart.cartItems.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);
  }, [cart]);

  const formattedTotal = useMemo(() => {
    return total.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
  }, [total]);

  const renderHeader = useCallback((column) => (
    <div className="flex items-center">
      <span>{column.label}</span>
    </div>
  ), []);

  const renderCell = useCallback((item, columnKey) => (
    item[columnKey]
  ), []);

  const handleCheckout = () => {
    router.push('/checkout'); // Redirigir a la página de checkout
  };

  return (
    <div className='p-4 container mx-auto'>
      <p className='text-2xl mb-2 font-bold'>Tu carrito</p>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Spinner>Cargando carrito...</Spinner>
        </div>
      ) : (
        cart && cart.cartItems && cart.cartItems.length > 0 ? (
          <>
            <Table
              aria-label="Carrito de Compras"
              css={{
                height: "auto",
                minWidth: "100%",
              }}
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
                  <TableRow key={item.product}>
                    {(columnKey) => (
                      <TableCell className="min-w-[80px] sm:min-w-[100px]">
                        {renderCell(item, columnKey)}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-end items-center space-x-4">
              <p className='text-xl font-semibold'>Total: {formattedTotal}</p>
              <Button color="primary" onClick={handleCheckout}>
                Continuar compra
              </Button>
            </div>
          </>
        ) : (
          <p>El carrito está vacío.</p>
        )
      )}
    </div>
  );
}
