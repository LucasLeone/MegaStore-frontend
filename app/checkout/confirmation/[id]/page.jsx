"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/app/axios';
import Cookies from 'js-cookie';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
} from '@nextui-org/react';

export default function ConfirmationPage() {
  const { id } = useParams(); // Obtener el ID de la venta desde la URL
  const router = useRouter();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSale = async () => {
      setLoading(true);
      const token = Cookies.get('access_token');

      try {
        const response = await api.get(`/sales/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setSale(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener la venta:', err);
        setError('No se pudo obtener la información de la venta.');
        setLoading(false);
      }
    };

    fetchSale();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner>Cargando confirmación...</Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 container mx-auto">
        <p color="error">{error}</p>
        <Button onClick={() => router.push('/')}>Volver al Inicio</Button>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="p-4 container mx-auto">
        <p>No se encontró la venta.</p>
        <Button onClick={() => router.push('/')}>Volver al Inicio</Button>
      </div>
    );
  }

  const saleDetails = sale.saleDetails.map(detail => ({
    product: detail.variant.product.name,
    size: detail.variant.size,
    color: detail.variant.color,
    price: parseFloat(detail.unitPrice).toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
    quantity: detail.quantity,
    subtotal: (detail.unitPrice * detail.quantity).toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
  }));

  const total = parseFloat(sale.totalAmount).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  return (
    <div className='p-4 container mx-auto'>
      <p className='text-2xl mb-4 font-bold'>Confirmación de Pedido</p>
      <Card>
        <CardHeader>
        <p className='text-xl font-semibold'>Detalles de la Compra</p>
        </CardHeader>
        <CardBody>
          <Table
            aria-label="Detalles de la venta"
            css={{
              height: "auto",
              minWidth: "100%",
            }}
          >
            <TableHeader>
              <TableColumn>Producto</TableColumn>
              <TableColumn>Talle</TableColumn>
              <TableColumn>Color</TableColumn>
              <TableColumn>Precio</TableColumn>
              <TableColumn>Cantidad</TableColumn>
              <TableColumn>Subtotal</TableColumn>
            </TableHeader>
            <TableBody>
              {saleDetails.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.product}</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{item.color}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.subtotal}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end items-center space-x-4">
            <p className='text-xl font-semibold'>Total: {total}</p>
          </div>

          {/* Información de Envío */}
          <div className="mt-6">
            <p className='text-xl font-semibold'>Información de Envío</p>
            <p><strong>Nombre Completo:</strong> {sale.fullName}</p>
            <p><strong>Dirección:</strong> {sale.address}</p>
            <p><strong>Ciudad:</strong> {sale.city}</p>
            <p><strong>Provincia:</strong> {sale.state}</p>
            <p><strong>Código Postal:</strong> {sale.postalCode}</p>
            <p><strong>País:</strong> {sale.country}</p>
          </div>
        </CardBody>
        <CardFooter>
          <Button color="primary" onClick={() => router.push('/')}>
            Volver al Inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
