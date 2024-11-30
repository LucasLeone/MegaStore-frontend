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
  Accordion,
  AccordionItem,
  Card,
  Image
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { IconPaypal } from '@tabler/icons-react'; // Asegúrate de tener un icono adecuado o usa una imagen

export default function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('standard');

  const [activePaymentAccordionKey, setActivePaymentAccordionKey] = useState(null);
  const [activeShippingAccordionKey, setActiveShippingAccordionKey] = useState(null);

  const router = useRouter();

  const shippingMethods = [
    { key: 'standard', label: 'Estándar', cost: 500, deliveryTime: '3-5 días' },
    { key: 'express', label: 'Express', cost: 1000, deliveryTime: '1-2 días' },
    { key: 'moto', label: 'Moto', cost: 1500, deliveryTime: 'Mismo día' },
  ];

  const paymentMethods = [
    { key: 'paypal', label: 'PayPal' },
    { key: 'credit_card', label: 'Tarjeta de Crédito' },
  ];

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
        toast.error('Error al cargar el carrito.');
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

    if (!token) {
      toast.error('No estás autenticado. Por favor, inicia sesión.');
      return;
    }

    // Determinar el método de pago
    let paymentMethod = 'Tarjeta'; // Valor por defecto
    if (selectedPaymentMethod === 'paypal') {
      paymentMethod = 'PayPal';
    }

    // Obtener detalles del método de envío
    const shippingMethod = shippingMethods.find(method => method.key === selectedShippingMethod);

    if (!shippingMethod) {
      toast.error('Método de envío no válido.');
      return;
    }

    const saleDetails = cart.cartItems.map(item => ({
      variantId: item.variant.id,
      quantity: item.quantity,
    }));

    const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
    const userId = user ? user.id : null;

    if (!userId) {
      toast.error('No se pudo obtener la información del usuario.');
      return;
    }

    const saleData = {
      userId: userId,
      paymentMethod: paymentMethod,
      saleDetails: saleDetails,
      shippingCost: shippingMethod.cost,
      shippingInfo: shippingInfo,
      shippingMethod: shippingMethod.key,
    };

    api.post('/sales', saleData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        console.log('Venta creada:', response.data);
        const saleId = response.data.id; // Asegúrate de que la respuesta incluye el ID de la venta
        toast.success('Compra realizada exitosamente.');
        router.push(`/checkout/confirmation/${saleId}`);
      })
      .catch(error => {
        console.error('Error al crear la venta:', error);
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(`Error: ${error.response.data.message}`);
        } else {
          toast.error('Ocurrió un error al procesar tu compra. Por favor, intenta nuevamente.');
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

  const shippingCost = cart ? shippingMethods.find(method => method.key === selectedShippingMethod).cost : 0;
  const shippingCostFormatted = parseFloat(shippingCost).toLocaleString("es-AR", { style: "currency", currency: "ARS" });
  const total = cart ? (parseFloat(cart.total) + shippingCost).toLocaleString("es-AR", { style: "currency", currency: "ARS" }) : '0';

  const isShippingInfoComplete = Object.values(shippingInfo).every(value => value.trim() !== '');
  const isPaymentInfoComplete = selectedPaymentMethod === 'paypal' || Object.values(paymentInfo).every(value => value.trim() !== '');

  const canConfirmPurchase = isShippingInfoComplete && isPaymentInfoComplete && selectedShippingMethod;

  return (
    <div className='p-4 container mx-auto'>
      <Toaster />
      <p className='text-2xl mb-2 font-bold'>Checkout</p>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Spinner>Cargando carrito...</Spinner>
        </div>
      ) : (
        cart && cart.cartItems && cart.cartItems.length > 0 ? (
          <>
            {/* Resumen de Compra */}
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
                  <TableRow key={`${item.product}-${item.size}-${item.color}`}>
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
              <p className='text-xl font-semibold'>Total Productos: {parseFloat(cart.total).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</p>
            </div>

            {/* Selección de Métodos de Pago */}
            <p className="mt-6 font-bold text-xl">Método de Pago</p>
            <Accordion disableChevronRotation type="single" collapsible>
              {paymentMethods.map(method => (
                <AccordionItem
                  key={method.key}
                  title={method.label}
                  isExpanded={selectedPaymentMethod === method.key}
                  onPress={() => setSelectedPaymentMethod(method.key)}
                >
                  {method.key === 'paypal' ? (
                    <div className="mt-4">
                      <Button
                        color="primary"
                        onClick={handleConfirmPurchase}
                      >
                        Pagar con PayPal
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Número de Tarjeta"
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={handlePaymentChange}
                        required
                        placeholder="1234 5678 9012 3456"
                      />
                      <Input
                        label="Nombre en la Tarjeta"
                        name="cardName"
                        value={paymentInfo.cardName}
                        onChange={handlePaymentChange}
                        required
                        placeholder="Juan Pérez"
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
                        placeholder="123"
                        type="password"
                      />
                      <div className="mt-4 flex justify-end">
                        <Button
                          color="primary"
                          onClick={handleConfirmPurchase}
                          isDisabled={!canConfirmPurchase}
                        >
                          Confirmar Compra
                        </Button>
                      </div>
                    </div>
                  )}
                </AccordionItem>
              ))}
            </Accordion>

            {/* Selección de Métodos de Envío */}
            <p className="mt-6 font-bold text-xl">Método de Envio</p>
            <Accordion disableChevronRotation type="single" collapsible>
              {shippingMethods.map(method => (
                <AccordionItem
                  key={method.key}
                  title={`${method.label} - ${method.deliveryTime}`}
                  isExpanded={selectedShippingMethod === method.key}
                  onPress={() => setSelectedShippingMethod(method.key)}
                >
                  <p>Costo: {parseFloat(method.cost).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</p>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Resumen de la Orden */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Resumen de la Orden</h2>
              <Card variant="bordered" className="p-4">
                <div className="flex justify-between mb-2">
                  <span>Productos:</span>
                  <span>{parseFloat(cart.total).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Método de Envío ({shippingMethods.find(m => m.key === selectedShippingMethod).label}):</span>
                  <span>{shippingCostFormatted}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Método de Pago:</span>
                  <span>{paymentMethods.find(m => m.key === selectedPaymentMethod).label}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{total}</span>
                </div>
              </Card>
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
                  placeholder="Juan Pérez"
                />
                <Input
                  label="Dirección"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  required
                  placeholder="Calle Falsa 123"
                />
                <Input
                  label="Ciudad"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleShippingChange}
                  required
                  placeholder="Buenos Aires"
                />
                <Input
                  label="Provincia"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleShippingChange}
                  required
                  placeholder="Buenos Aires"
                />
                <Input
                  label="Código Postal"
                  name="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={handleShippingChange}
                  required
                  placeholder="C1000AAA"
                />
                <Input
                  label="País"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleShippingChange}
                  required
                  placeholder="Argentina"
                />
              </div>
            </div>
          </>
        ) : (
          <p>No hay productos en el carrito.</p>
        )
      )}
    </div>
  );
}
