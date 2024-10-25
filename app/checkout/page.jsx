"use client";

import React, { useEffect, useState, useCallback } from 'react';
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
  Input,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

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

  const handleShippingChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentChange = (e) => {
    setPaymentInfo({
      ...paymentInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleConfirmPurchase = () => {
    const token = Cookies.get('access_token');

    const saleDetails = cart.cartItems.map(item => ({
      variantId: item.variant.id,
      quantity: item.quantity,
    }));

    const userId = JSON.parse(Cookies.get("user")).id;

    const saleData = {
      userId: userId,
      paymentMethod: 'Tarjeta',
      saleDetails: saleDetails,
      shippingInfo: shippingInfo,
    };

    api.post('/sales', saleData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        console.log('Venta creada:', response.data);
        const saleId = response.data.id; // Asegúrate de que la respuesta incluye el ID de la venta
        router.push(`/checkout/confirmation/${saleId}`);
      })
      .catch(error => {
        console.error('Error al crear la venta:', error);
        if (error.response && error.response.data && error.response.data.message) {
          alert(`Error: ${error.response.data.message}`);
        } else {
          alert('Ocurrió un error al procesar tu compra. Por favor, intenta nuevamente.');
        }
      });
  };

  const columns = [
    { key: 'product', label: 'Producto' },
    { key: "size", label: "Talle" },
    { key: "color", label: "Color" },
    { key: 'price', label: 'Precio' },
    { key: 'quantity', label: 'Cantidad' },
    { key: 'subtotal', label: 'Subtotal' },
  ];

  const rows = cart ? cart.cartItems.map(item => ({
    product: item.variant.product.name,
    size: item.variant.size,
    color: item.variant.color,
    price: parseFloat(item.productPrice).toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
    quantity: item.quantity,
    subtotal: parseFloat(item.subtotal).toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
  })) : [];

  const total = cart ? parseFloat(cart.total).toLocaleString("es-AR", { style: "currency", currency: "ARS" }) : '0';

  const isShippingInfoComplete = Object.values(shippingInfo).every(value => value.trim() !== '');
  const isPaymentInfoComplete = Object.values(paymentInfo).every(value => value.trim() !== '');

  const canConfirmPurchase = isShippingInfoComplete && isPaymentInfoComplete;

  return (
    <div className='p-4 container mx-auto'>
      <p className='text-2xl mb-2 font-bold'>Checkout</p>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Spinner>Cargando carrito...</Spinner>
        </div>
      ) : (
        cart && cart.cartItems && cart.cartItems.length > 0 ? (
          <>
            <Table
              aria-label="Resumen de Compra"
              css={{
                height: "auto",
                minWidth: "100%",
              }}
            >
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn key={column.key}>
                    {column.label}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody items={rows}>
                {(item) => (
                  <TableRow key={item.product}>
                    {(columnKey) => (
                      <TableCell>
                        {item[columnKey]}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-end items-center space-x-4">
              <p className='text-xl font-semibold'>Total: {total}</p>
            </div>

            {/* Formulario de Envío */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Información de Envío</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre Completo"
                  name="fullName"
                  value={shippingInfo.fullName}
                  onChange={handleShippingChange}
                  required
                />
                <Input
                  label="Dirección"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  required
                />
                <Input
                  label="Ciudad"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleShippingChange}
                  required
                />
                <Input
                  label="Código Postal"
                  name="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={handleShippingChange}
                  required
                />
                <Input
                  label="País"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleShippingChange}
                  required
                />
              </div>
            </div>

            {/* Formulario de Pago */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Método de Pago</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Número de Tarjeta"
                  name="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={handlePaymentChange}
                  required
                />
                <Input
                  label="Nombre en la Tarjeta"
                  name="cardName"
                  value={paymentInfo.cardName}
                  onChange={handlePaymentChange}
                  required
                />
                <Input
                  label="Fecha de Expiración"
                  name="expiryDate"
                  value={paymentInfo.expiryDate}
                  onChange={handlePaymentChange}
                  placeholder="MM/AA"
                  required
                />
                <Input
                  label="CVV"
                  name="cvv"
                  value={paymentInfo.cvv}
                  onChange={handlePaymentChange}
                  required
                />
              </div>
            </div>

            {/* Botón para Confirmar la Compra */}
            <div className="mt-6 flex justify-end">
              <Button color="primary" onClick={handleConfirmPurchase} isDisabled={!canConfirmPurchase}>
                Confirmar Compra
              </Button>
            </div>
          </>
        ) : (
          <p>No hay productos en el carrito.</p>
        )
      )}
    </div>
  );
}
