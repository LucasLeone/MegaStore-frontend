"use client";

import React, { useEffect, useState } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

export default function CartPage() {
  const [cart, setCart] = useState(null);

  useEffect(() => {
    const token = Cookies.get('access_token');

    api.get('/carts/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then(response => {
      setCart(response.data);
    })
    .catch(error => {
      console.error('Error al obtener el carrito:', error);
    });
  }, []);

  if (!cart) {
    return <div>Cargando carrito...</div>;
  }

  return (
    <div>
      <h1>Carrito</h1>
      {cart.cartItems && cart.cartItems.length > 0 ? (
        cart.cartItems.map(item => (
          <div key={item.variantId}>
            <p>{item.variant.product.name} - Cantidad: {item.quantity}</p>
          </div>
        ))
      ) : (
        <p>El carrito está vacío.</p>
      )}
    </div>
  );
}
